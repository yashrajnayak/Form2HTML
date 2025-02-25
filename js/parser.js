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
                // Try to extract form ID from the HTML directly
                const fbzxInput = doc.querySelector('input[name="fbzx"]');
                if (fbzxInput && fbzxInput.value) {
                    formId = fbzxInput.value;
                } else {
                    // Try to find form ID in script tags
                    const scripts = doc.querySelectorAll('script');
                    for (const script of scripts) {
                        const content = script.textContent;
                        const formIdMatch = content.match(/["']?([0-9A-Za-z_-]{25,}?)["']?/);
                        if (formIdMatch && formIdMatch[1]) {
                            formId = formIdMatch[1];
                            break;
                        }
                    }
                }
                
                if (!formId) {
                    throw new Error('Could not extract form ID from the HTML source.');
                }
            }

            // Extract form action URL
            const formActionUrl = `https://docs.google.com/forms/d/e/${formId}/formResponse`;
            
            // Extract form title
            const formTitle = doc.querySelector('title')?.textContent || 
                             doc.querySelector('meta[property="og:title"]')?.content ||
                             doc.querySelector('div[role="heading"]')?.textContent || 
                             doc.querySelector('.freebirdFormviewerViewHeaderTitle')?.textContent ||
                             'Google Form';
            
            // Extract form fields
            const fields = [];
            
            // Try multiple selectors for question containers
            const selectors = [
                '.Qr7Oae[role="listitem"]',                // Common container
                '.freebirdFormviewerViewNumberedItemContainer', // Older forms
                '.freebirdFormviewerViewItemsItemItem',    // Another common container
                '.freebirdFormviewerComponentsQuestionBaseRoot', // Base question root
                '[data-params]',                          // Elements with data-params
                '.freebirdFormviewerViewItemsItemItemHeader' // Question headers
            ];
            
            let questionContainers = [];
            for (const selector of selectors) {
                const containers = doc.querySelectorAll(selector);
                if (containers.length > 0) {
                    questionContainers = containers;
                    break;
                }
            }
            
            // Process each question container
            questionContainers.forEach(container => {
                // Try multiple selectors for question labels
                const labelSelectors = [
                    '[role="heading"]',
                    '.freebirdFormviewerComponentsQuestionBaseHeader',
                    '.freebirdFormviewerComponentsQuestionTextTitle',
                    '.freebirdFormviewerViewItemsItemItemTitle',
                    '.freebirdFormviewerViewItemsItemItemHeader'
                ];
                
                let questionLabel = '';
                for (const selector of labelSelectors) {
                    const labelElement = container.querySelector(selector);
                    if (labelElement) {
                        questionLabel = labelElement.textContent.trim();
                        if (questionLabel) break;
                    }
                }
                
                // If still no label, try to get it from the container itself
                if (!questionLabel) {
                    questionLabel = container.textContent.trim().split('\n')[0] || '';
                }
                
                // Find input fields within this question container
                const inputs = container.querySelectorAll('input, textarea, select');
                
                if (inputs.length === 0) {
                    // If no inputs found directly, try to find them through data attributes
                    const dataParams = container.getAttribute('data-params');
                    if (dataParams) {
                        try {
                            // Extract field ID and possibly other data
                            const matches = dataParams.match(/"([0-9]+)","([^"]+)"/);
                            if (matches && matches.length >= 3) {
                                const fieldId = matches[1];
                                const fieldLabel = matches[2] || questionLabel;
                                
                                fields.push({
                                    id: fieldId,
                                    name: `entry.${fieldId}`,
                                    value: '',
                                    label: fieldLabel,
                                    type: 'text',
                                    required: container.textContent.includes('*') || container.querySelector('.freebirdFormviewerViewItemsItemRequiredAsterisk') !== null
                                });
                            }
                        } catch (e) {
                            console.error('Error parsing data-params:', e);
                        }
                    }
                    return; // Skip to next container
                }
                
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
                                          container.querySelector('.vnumgf') !== null ||
                                          container.querySelector('.freebirdFormviewerViewItemsItemRequiredAsterisk') !== null ||
                                          container.textContent.includes('*');
                        
                        // Check if this is a radio button or checkbox
                        const isMultipleChoice = type === 'radio' || type === 'checkbox';
                        
                        // For radio buttons and checkboxes, we need to extract all options
                        let options = [];
                        if (isMultipleChoice) {
                            const radioGroup = container.querySelectorAll(`input[name="${name}"]`);
                            radioGroup.forEach(radio => {
                                // Try multiple selectors for option labels
                                const optionLabelSelectors = [
                                    '.aDTYNe',
                                    '.docssharedWizToggleLabeledLabelText',
                                    '.freebirdFormviewerComponentsQuestionRadioLabel',
                                    '.freebirdFormviewerComponentsQuestionCheckboxLabel'
                                ];
                                
                                let optionLabel = '';
                                for (const selector of optionLabelSelectors) {
                                    const labelElement = radio.parentElement?.querySelector(selector);
                                    if (labelElement) {
                                        optionLabel = labelElement.textContent.trim();
                                        if (optionLabel) break;
                                    }
                                }
                                
                                // If still no label, try to get it from the parent element
                                if (!optionLabel) {
                                    optionLabel = radio.parentElement?.textContent?.trim() || '';
                                }
                                
                                const optionValue = radio.value || '';
                                if (optionLabel && optionValue) {
                                    options.push({ label: optionLabel, value: optionValue });
                                }
                            });
                        }
                        
                        // Only add the field if we haven't already added it
                        const existingField = fields.find(f => f.name === name);
                        if (!existingField) {
                            fields.push({
                                id: fieldId,
                                name: name,
                                value: value,
                                label: questionLabel,
                                type: type,
                                required: isRequired,
                                options: options.length > 0 ? options : undefined
                            });
                        } else if (options.length > 0 && !existingField.options) {
                            // Update existing field with options if they were found
                            existingField.options = options;
                        }
                    }
                });
            });

            // If no fields were found using the above methods, try a more aggressive approach
            if (fields.length === 0) {
                // Look for any elements that might contain field information
                const scripts = doc.querySelectorAll('script');
                for (const script of scripts) {
                    const content = script.textContent;
                    // Look for patterns like [null,null,"Entry 1",null,null,null,null,null,null,[]]
                    const fieldMatches = content.match(/\[null,null,"([^"]+)",null,null,null,null,null,null,\[\]\]/g);
                    if (fieldMatches) {
                        fieldMatches.forEach((match, index) => {
                            const labelMatch = match.match(/"([^"]+)"/);
                            if (labelMatch && labelMatch[1]) {
                                fields.push({
                                    id: `generated_${index}`,
                                    name: `entry.generated_${index}`,
                                    value: '',
                                    label: labelMatch[1],
                                    type: 'text',
                                    required: false
                                });
                            }
                        });
                    }
                }
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