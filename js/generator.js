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
            
            switch (field.type) {
                case 'email':
                    return `
    <div class="form-group">
        <label for="${fieldId}">${fieldLabel}</label>
        <input 
            type="email" 
            id="${fieldId}" 
            name="${field.name}" 
            placeholder="Enter your email"
            value="${field.value || ''}"
            required>
    </div>`;
                
                case 'url':
                    return `
    <div class="form-group">
        <label for="${fieldId}">${fieldLabel}</label>
        <input 
            type="url" 
            id="${fieldId}" 
            name="${field.name}" 
            placeholder="https://example.com"
            value="${field.value || ''}"
            required>
    </div>`;
                
                case 'date':
                    return `
    <div class="form-group">
        <label for="${fieldId}">${fieldLabel}</label>
        <input 
            type="date" 
            id="${fieldId}" 
            name="${field.name}" 
            value="${field.value || ''}"
            required>
    </div>`;
                
                case 'number':
                    return `
    <div class="form-group">
        <label for="${fieldId}">${fieldLabel}</label>
        <input 
            type="number" 
            id="${fieldId}" 
            name="${field.name}" 
            value="${field.value || ''}"
            required>
    </div>`;
                
                default: // text
                    return `
    <div class="form-group">
        <label for="${fieldId}">${fieldLabel}</label>
        <input 
            type="text" 
            id="${fieldId}" 
            name="${field.name}" 
            placeholder="Enter your response"
            value="${field.value || ''}"
            required>
    </div>`;
            }
        }).join('\n');
        
        // Create complete HTML document
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${formTitle}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <form id="customForm" action="${formActionUrl}" method="POST">
            <div class="form-header">
                <h1>${formTitle}</h1>
                <p class="form-description">Please fill out the form below.</p>
            </div>
            
            <div class="form-fields">
${fieldsHTML}
            </div>
            
            <div class="form-footer">
                <button type="submit" class="submit-button">Submit</button>
            </div>
        </form>
        
        <div id="success-message" class="success-message" style="display: none;">
            <div class="success-icon">✓</div>
            <h2>Thank You!</h2>
            <p>Your response has been submitted successfully.</p>
        </div>
    </div>
    
    <script src="script.js"></script>
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
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            // Create FormData object
            const formData = new FormData(form);
            
            // Submit the form using fetch
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                mode: 'no-cors' // Required for Google Forms
            });
            
            // Show success message
            form.style.display = 'none';
            successMessage.style.display = 'block';
            
            // Optional: Reset form
            form.reset();
            
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('There was an error submitting the form. Please try again.');
        }
    });
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
        return {
            html: this.generateHTML(formData, formTitle, themeColor),
            css: this.generateCSS(themeColor),
            js: this.generateJS()
        };
    }
} 