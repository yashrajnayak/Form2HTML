/**
 * Form Code Generator
 * Generates HTML, CSS, and JavaScript code for custom forms
 * based on parsed Google Form data
 */

class FormGenerator {
    /**
     * Generate HTML code for the form
     * @param {Object} formData - The parsed form data
     * @param {string} formTitle - The form title
     * @param {string} themeColor - The theme color
     * @returns {string} The generated HTML code
     */
    static generateHTML(formData, formTitle, themeColor) {
        const { formActionUrl, fields } = formData;
        
        // Create form fields HTML
        const fieldsHTML = fields.map(field => {
            const fieldId = `field-${field.id}`;
            const fieldLabel = field.label || this.generateFieldLabel(field);
            const isRequired = field.required !== false;
            const requiredAttr = isRequired ? 'required aria-required="true"' : '';
            
            // Handle different field types
            if (field.options && field.options.length > 0) {
                // Multiple choice field (radio buttons or checkboxes)
                const inputType = field.type === 'checkbox' ? 'checkbox' : 'radio';
                const fieldsetName = `fieldset-${field.id}`;
                const optionsHTML = field.options.map((option, index) => {
                    return `
            <div class="form-check">
                <input 
                    type="${inputType}" 
                    id="${fieldId}-option-${index}" 
                    name="${field.name}" 
                    value="${option.value}"
                    class="form-check-input"
                    ${field.value === option.value ? 'checked' : ''}
                    ${requiredAttr}>
                <label class="form-check-label" for="${fieldId}-option-${index}">
                    ${option.label}
                </label>
            </div>`;
                }).join('\n');
                
                return `
    <fieldset class="form-group" id="${fieldsetName}">
        <legend>${fieldLabel}${isRequired ? ' <span class="required" aria-hidden="true">*</span>' : ''}</legend>
        <div class="options-container" role="group" aria-labelledby="${fieldsetName}-legend">
${optionsHTML}
        </div>
    </fieldset>`;
            }
            
            switch (field.type) {
                case 'email':
                    return `
    <div class="form-group">
        <label for="${fieldId}">${fieldLabel}${isRequired ? ' <span class="required" aria-hidden="true">*</span>' : ''}</label>
        <input 
            type="email" 
            id="${fieldId}" 
            name="${field.name}" 
            placeholder="Enter your email"
            value="${field.value || ''}"
            autocomplete="email"
            ${requiredAttr}>
        <div class="form-text" id="${fieldId}-help">Please enter a valid email address</div>
    </div>`;
                
                case 'url':
                    return `
    <div class="form-group">
        <label for="${fieldId}">${fieldLabel}${isRequired ? ' <span class="required" aria-hidden="true">*</span>' : ''}</label>
        <input 
            type="url" 
            id="${fieldId}" 
            name="${field.name}" 
            placeholder="https://example.com"
            value="${field.value || ''}"
            autocomplete="url"
            aria-describedby="${fieldId}-help"
            ${requiredAttr}>
        <div class="form-text" id="${fieldId}-help">Please enter a valid URL starting with http:// or https://</div>
    </div>`;
                
                case 'date':
                    return `
    <div class="form-group">
        <label for="${fieldId}">${fieldLabel}${isRequired ? ' <span class="required" aria-hidden="true">*</span>' : ''}</label>
        <input 
            type="date" 
            id="${fieldId}" 
            name="${field.name}" 
            value="${field.value || ''}"
            ${requiredAttr}>
    </div>`;
                
                case 'number':
                    return `
    <div class="form-group">
        <label for="${fieldId}">${fieldLabel}${isRequired ? ' <span class="required" aria-hidden="true">*</span>' : ''}</label>
        <input 
            type="number" 
            id="${fieldId}" 
            name="${field.name}" 
            value="${field.value || ''}"
            ${requiredAttr}>
    </div>`;
                
                case 'textarea':
                    return `
    <div class="form-group">
        <label for="${fieldId}">${fieldLabel}${isRequired ? ' <span class="required" aria-hidden="true">*</span>' : ''}</label>
        <textarea 
            id="${fieldId}" 
            name="${field.name}" 
            placeholder="Enter your response"
            rows="4"
            ${requiredAttr}>${field.value || ''}</textarea>
    </div>`;
                
                default: // text
                    return `
    <div class="form-group">
        <label for="${fieldId}">${fieldLabel}${isRequired ? ' <span class="required" aria-hidden="true">*</span>' : ''}</label>
        <input 
            type="text" 
            id="${fieldId}" 
            name="${field.name}" 
            placeholder="Enter your response"
            value="${field.value || ''}"
            ${requiredAttr}>
    </div>`;
            }
        }).join('\n');
        
        // Generate CSS
        const cssCode = this.generateCSS(themeColor);
        
        // Create complete HTML document
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${formTitle}</title>
    <meta name="description" content="${formTitle} - Custom form that submits to Google Forms">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <!-- jQuery and jQuery Form Plugin for reliable form submission -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js" integrity="sha512-v2CJ7UaYy4JwqLDIrZUI/4hqeoQieOmAZNXBeQyjo21dadnwR+8ZaIJVT8EE2iyI61OV8e6M8PP2/4hpQINQ/g==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.form/4.3.0/jquery.form.min.js" integrity="sha512-YUkaLm+KJ5lQXDBdqBqk7EVhJAdxRnVdT2vtCzwPHSweCzyMgYV/tgGF4/dCyqtCC2eCphz0lRQgatGVdfR0ww==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <style>
${cssCode}
    </style>
</head>
<body>
    <div class="container">
        <form id="customForm" action="${formActionUrl}" method="POST" novalidate>
            <header class="form-header">
                <h1>${formTitle}</h1>
                <p class="form-description">Please fill out the form below.</p>
            </header>
            
            <div class="form-fields" role="group">
${fieldsHTML}
            </div>
            
            <footer class="form-footer">
                <button type="submit" class="submit-button">Submit</button>
            </footer>
            
            <!-- Hidden fields required by Google Forms -->
            <input type="hidden" name="fvv" value="1">
            <input type="hidden" name="fbzx" value="-1234567890">
            <input type="hidden" name="pageHistory" value="0">
            <input type="hidden" name="draftResponse" value="[]">
        </form>
        
        <div id="success-message" class="success-message" style="display: none;" role="alert" aria-live="assertive">
            <div class="success-icon" aria-hidden="true">✓</div>
            <h2>Thank You!</h2>
            <p>Your response has been submitted successfully.</p>
        </div>
    </div>
    
    <script>
    // Form submission script will be added separately
    </script>
</body>
</html>`;
    }

    /**
     * Generate CSS code for the form
     * @param {string} themeColor - The theme color
     * @returns {string} The generated CSS code
     */
    static generateCSS(themeColor) {
        // Convert hex to RGB for rgba values
        const hexToRgb = hex => {
            const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : { r: 0, g: 0, b: 0 };
        };
        
        const rgb = hexToRgb(themeColor);
        const rgbString = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
        
        return `:root {
    --primary-color: ${themeColor};
    --primary-rgb: ${rgbString};
    --text-color: #202124;
    --light-text: #5F6368;
    --border-color: #DADCE0;
    --background-color: #F8F9FA;
    --card-background: #FFFFFF;
    --error-color: #EA4335;
    --success-color: #34A853;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Roboto', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: var(--background-color);
    color: var(--text-color);
    line-height: 1.5;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem 1rem;
}

.container {
    width: 100%;
    max-width: 600px;
    background-color: var(--card-background);
    border-radius: 8px;
    box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15);
    overflow: hidden;
}

form {
    display: flex;
    flex-direction: column;
}

.form-header {
    padding: 2rem 2rem 1.5rem;
    border-top: 10px solid var(--primary-color);
}

.form-header h1 {
    font-size: 1.75rem;
    font-weight: 500;
    color: var(--text-color);
    margin-bottom: 0.5rem;
}

.form-description {
    color: var(--light-text);
    font-size: 0.875rem;
}

.form-fields {
    padding: 1.5rem 2rem;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: var(--text-color);
}

.form-group input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.2s;
}

.form-group input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.2);
}

.form-group textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.2s;
    resize: vertical;
    min-height: 100px;
}

.form-group textarea:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.2);
}

.options-container {
    margin-top: 0.5rem;
}

.form-check {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
}

.form-check-input {
    margin-right: 0.5rem;
    width: 18px;
    height: 18px;
    cursor: pointer;
}

.form-check-input:checked {
    accent-color: var(--primary-color);
}

.form-check-label {
    font-size: 0.875rem;
    cursor: pointer;
}

.required {
    color: var(--error-color);
}

.form-footer {
    padding: 1.5rem 2rem 2rem;
    display: flex;
    justify-content: flex-end;
}

.submit-button {
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.75rem 2rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s, box-shadow 0.2s;
}

.submit-button:hover {
    box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15);
}

.success-message {
    padding: 3rem 2rem;
    text-align: center;
}

.success-icon {
    width: 64px;
    height: 64px;
    background-color: var(--success-color);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    margin: 0 auto 1.5rem;
}

.success-message h2 {
    font-size: 1.5rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
}

.success-message p {
    color: var(--light-text);
}

@media (max-width: 768px) {
    .form-header,
    .form-fields,
    .form-footer {
        padding-left: 1.5rem;
        padding-right: 1.5rem;
    }
    
    .form-header h1 {
        font-size: 1.5rem;
    }
}`;
    }

    /**
     * Generate JavaScript code for the form
     * @returns {string} The generated JavaScript code
     */
    static generateJS() {
        return `document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('customForm');
    const successMessage = document.getElementById('success-message');
    
    if (!form || !successMessage) {
        console.error('Required form elements not found');
        return;
    }
    
    // Function to show the success message
    const showSuccessMessage = () => {
        form.style.display = 'none';
        successMessage.style.display = 'block';
        
        // Scroll to success message
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Reset form
        form.reset();
    };
    
    // Check if jQuery and jQuery Form plugin are available
    const hasJQuery = typeof jQuery !== 'undefined';
    const hasJQueryForm = hasJQuery && typeof jQuery.fn.ajaxSubmit !== 'undefined';
    
    if (hasJQuery && hasJQueryForm) {
        // Use jQuery Form plugin for submission (most reliable method)
        jQuery(form).on('submit', function(e) {
            e.preventDefault();
            
            // Show loading state
            const submitButton = form.querySelector('.submit-button');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Submitting...';
            submitButton.disabled = true;
            
            // Use jQuery Form plugin for submission
            jQuery(this).ajaxSubmit({
                url: form.action,
                type: 'POST',
                dataType: 'xml',
                success: function(response) {
                    showSuccessMessage();
                    console.log('Form submitted successfully');
                },
                error: function(xhr, status, error) {
                    // Even on error, we'll show success message
                    // Google Forms often returns error status even when submission is successful
                    showSuccessMessage();
                    console.log('Form submission completed with status:', status);
                },
                complete: function() {
                    // Reset button state
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                }
            });
        });
    } else {
        // Fallback for browsers without jQuery or jQuery Form plugin
        console.warn('jQuery Form plugin not available, using native form submission');
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Show loading state
            const submitButton = form.querySelector('.submit-button');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Submitting...';
            submitButton.disabled = true;
            
            try {
                // Create FormData object
                const formData = new FormData(form);
                
                // Create a hidden iframe for submission (to handle cross-origin issues)
                const iframe = document.createElement('iframe');
                iframe.name = 'hidden-form-iframe';
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
                
                // Set form target to the iframe
                form.target = 'hidden-form-iframe';
                
                // Submit the form to the iframe
                form.submit();
                
                // Show success message after a short delay
                setTimeout(() => {
                    showSuccessMessage();
                    
                    // Clean up
                    setTimeout(() => {
                        document.body.removeChild(iframe);
                    }, 1000);
                }, 1500);
                
            } catch (error) {
                console.error('Error submitting form:', error);
                
                // Even on error, we'll show success message
                showSuccessMessage();
            } finally {
                // Reset button state
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        });
    }
});`;
    }

    /**
     * Generate a field label based on the field data
     * @param {Object} field - The field data
     * @returns {string} The generated field label
     */
    static generateFieldLabel(field) {
        // Extract field name from the ID
        const idParts = field.id.split('_');
        
        // Try to create a readable label
        if (field.value && field.value.length > 0) {
            // Use the value as a hint for the label if it's not too long
            if (field.value.length < 20) {
                return this.formatLabel(field.value);
            }
        }
        
        // Default label based on field ID
        return `Field ${field.id}`;
    }

    /**
     * Format a label string by capitalizing and improving readability
     * @param {string} label - The label to format
     * @returns {string} The formatted label
     */
    static formatLabel(label) {
        return label
            .replace(/([A-Z])/g, ' $1') // Add space before capital letters
            .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
            .trim();
    }

    /**
     * Generate a complete form package with HTML, CSS, and JS
     * @param {Object} formData - The parsed form data
     * @param {string} formTitle - The form title
     * @param {string} themeColor - The theme color
     * @returns {Object} Object containing HTML, CSS, and JS code
     */
    static generateFormPackage(formData, formTitle, themeColor) {
        // Generate HTML with CSS included
        const htmlWithCss = this.generateHTML(formData, formTitle, themeColor);
        
        // Generate JavaScript separately
        const jsCode = this.generateJS();
        
        // Create complete HTML with CSS and JS included
        const completeHtml = htmlWithCss.replace('<script>\n    // Form submission script will be added separately\n    </script>', 
                                               `<script>\n${jsCode}\n    </script>`);
        
        return {
            html: completeHtml,
            css: this.generateCSS(themeColor),
            js: jsCode
        };
    }
} 