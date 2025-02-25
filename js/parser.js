/**
 * Google Form URL Parser
 * Extracts form ID and field data from Google Form prefill URLs
 */

class FormParser {
    /**
     * Parse a Google Form prefill URL
     * @param {string} url - The Google Form prefill URL
     * @returns {Object} Parsed form data
     */
    static parseUrl(url) {
        try {
            // Validate URL format
            if (!url || !url.includes('docs.google.com/forms')) {
                throw new Error('Invalid Google Form URL. Please provide a valid Google Form prefill URL.');
            }

            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/');
            
            // Extract form ID
            let formId = '';
            for (let i = 0; i < pathParts.length; i++) {
                if (pathParts[i] === 'e' && i + 1 < pathParts.length) {
                    formId = pathParts[i + 1];
                    break;
                } else if (pathParts[i] === 'd' && i + 1 < pathParts.length) {
                    formId = pathParts[i + 1];
                    break;
                }
            }

            if (!formId) {
                throw new Error('Could not extract form ID from URL.');
            }

            // Extract form action URL
            const formActionUrl = `https://docs.google.com/forms/d/e/${formId}/formResponse`;
            
            // Parse query parameters to get field entries
            const params = new URLSearchParams(urlObj.search);
            const fields = [];
            
            for (const [key, value] of params.entries()) {
                if (key.startsWith('entry.')) {
                    const fieldId = key.replace('entry.', '');
                    fields.push({
                        id: fieldId,
                        name: key,
                        value: value,
                        type: this.guessFieldType(value)
                    });
                }
            }

            return {
                formId,
                formActionUrl,
                fields,
                originalUrl: url
            };
        } catch (error) {
            throw new Error(`Error parsing form URL: ${error.message}`);
        }
    }

    /**
     * Parse Google Form HTML source
     * @param {string} html - The HTML source of the Google Form
     * @returns {Object} Parsed form data
     */
    static parseHtml(html) {
        try {
            if (!html || !html.includes('docs.google.com/forms')) {
                throw new Error('Invalid Google Form HTML. Please provide the complete HTML source of a Google Form.');
            }

            // Create a DOM parser to parse the HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Extract form ID and action URL
            const formUrl = doc.querySelector('form')?.action || 
                            doc.querySelector('meta[property="og:url"]')?.content ||
                            doc.querySelector('link[rel="canonical"]')?.href;
            
            if (!formUrl) {
                throw new Error('Could not find form URL in the HTML source.');
            }
            
            const urlObj = new URL(formUrl);
            const pathParts = urlObj.pathname.split('/');
            
            // Extract form ID
            let formId = '';
            for (let i = 0; i < pathParts.length; i++) {
                if (pathParts[i] === 'e' && i + 1 < pathParts.length) {
                    formId = pathParts[i + 1];
                    break;
                } else if (pathParts[i] === 'd' && i + 1 < pathParts.length) {
                    formId = pathParts[i + 1];
                    break;
                }
            }

            if (!formId) {
                throw new Error('Could not extract form ID from the HTML source.');
            }

            // Extract form action URL
            const formActionUrl = `https://docs.google.com/forms/d/e/${formId}/formResponse`;
            
            // Extract form title
            const formTitle = doc.querySelector('title')?.textContent || 
                             doc.querySelector('meta[property="og:title"]')?.content ||
                             doc.querySelector('div[role="heading"]')?.textContent || 
                             'Google Form';
            
            // Extract form fields
            const fields = [];
            
            // Find all question containers
            const questionContainers = doc.querySelectorAll('.Qr7Oae[role="listitem"]');
            
            questionContainers.forEach(container => {
                // Extract question title/label
                const questionLabel = container.querySelector('[role="heading"]')?.textContent?.trim() || '';
                
                // Find input fields within this question container
                const inputs = container.querySelectorAll('input, textarea');
                
                inputs.forEach(input => {
                    const name = input.getAttribute('name');
                    if (name && name.startsWith('entry.')) {
                        const fieldId = name.replace('entry.', '');
                        const value = input.value || '';
                        
                        // Determine input type
                        let type = input.type || 'text';
                        if (type === 'text' && value) {
                            type = this.guessFieldType(value);
                        }
                        
                        // Check if this field is required
                        const isRequired = input.hasAttribute('required') || 
                                          container.querySelector('.vnumgf') !== null;
                        
                        // Check if this is a radio button or checkbox
                        const isMultipleChoice = type === 'radio' || type === 'checkbox';
                        
                        // For radio buttons and checkboxes, we need to extract all options
                        let options = [];
                        if (isMultipleChoice) {
                            const radioGroup = container.querySelectorAll(`input[name="${name}"]`);
                            radioGroup.forEach(radio => {
                                const optionLabel = radio.parentElement?.querySelector('.aDTYNe')?.textContent || 
                                                  radio.parentElement?.textContent?.trim() || '';
                                const optionValue = radio.value || '';
                                if (optionLabel && optionValue) {
                                    options.push({ label: optionLabel, value: optionValue });
                                }
                            });
                        }
                        
                        fields.push({
                            id: fieldId,
                            name: name,
                            value: value,
                            label: questionLabel,
                            type: type,
                            required: isRequired,
                            options: options.length > 0 ? options : undefined
                        });
                    }
                });
            });

            // If no fields were found using the above method, try a fallback method
            if (fields.length === 0) {
                // Look for data-params attributes which often contain field information
                const dataParamsElements = doc.querySelectorAll('[data-params]');
                dataParamsElements.forEach(element => {
                    try {
                        const dataParams = element.getAttribute('data-params');
                        if (dataParams) {
                            // Extract field ID and label from data-params
                            const matches = dataParams.match(/"([0-9]+)","([^"]+)"/);
                            if (matches && matches.length >= 3) {
                                const fieldId = matches[1];
                                const fieldLabel = matches[2];
                                
                                fields.push({
                                    id: fieldId,
                                    name: `entry.${fieldId}`,
                                    value: '',
                                    label: fieldLabel,
                                    type: 'text',
                                    required: element.textContent.includes('*')
                                });
                            }
                        }
                    } catch (e) {
                        console.error('Error parsing data-params:', e);
                    }
                });
            }

            return {
                formId,
                formTitle,
                formActionUrl,
                fields,
                originalHtml: html
            };
        } catch (error) {
            throw new Error(`Error parsing form HTML: ${error.message}`);
        }
    }

    /**
     * Guess the field type based on the value
     * @param {string} value - The field value
     * @returns {string} The guessed field type
     */
    static guessFieldType(value) {
        if (!value || value.trim() === '') {
            return 'text'; // Default to text for empty values
        }

        // Check for email format
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return 'email';
        }

        // Check for URL format
        if (/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(value)) {
            return 'url';
        }

        // Check for date format (YYYY-MM-DD)
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return 'date';
        }

        // Check for number format
        if (/^-?\d+(\.\d+)?$/.test(value)) {
            return 'number';
        }

        // Default to text for anything else
        return 'text';
    }

    /**
     * Validate if a URL is a valid Google Form URL
     * @param {string} url - The URL to validate
     * @returns {boolean} Whether the URL is valid
     */
    static isValidFormUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.includes('docs.google.com') && 
                   urlObj.pathname.includes('/forms/') &&
                   (urlObj.pathname.includes('/viewform') || 
                    urlObj.pathname.includes('/formResponse'));
        } catch (error) {
            return false;
        }
    }

    /**
     * Extract form title from URL or path
     * @param {string} url - The Google Form URL
     * @returns {string} The extracted form title or a default title
     */
    static extractFormTitle(url) {
        try {
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/');
            
            // Try to extract a meaningful title from the URL
            for (let i = 0; i < pathParts.length; i++) {
                if (pathParts[i] === 'forms' && i + 2 < pathParts.length) {
                    // If there's a title in the URL, it might be after 'forms'
                    const possibleTitle = pathParts[i + 2];
                    if (possibleTitle && possibleTitle !== 'viewform' && possibleTitle !== 'formResponse') {
                        return this.formatTitle(possibleTitle);
                    }
                }
            }
            
            // If no title found, extract form ID and use it as part of the title
            const formId = this.parseUrl(url).formId;
            return `Google Form ${formId.substring(0, 8)}`;
        } catch (error) {
            return 'Custom Form';
        }
    }

    /**
     * Format a title string by replacing hyphens and underscores with spaces
     * and capitalizing each word
     * @param {string} title - The title to format
     * @returns {string} The formatted title
     */
    static formatTitle(title) {
        return title
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase());
    }
} 