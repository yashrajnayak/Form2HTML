/**
 * Google Form to HTML Converter App
 * Main application logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const formUrlInput = document.getElementById('form-url');
    const formHtmlInput = document.getElementById('form-html');
    const formTitleInput = document.getElementById('form-title');
    const themeColorInput = document.getElementById('theme-color');
    const convertButton = document.getElementById('convert-button');
    const errorMessage = document.getElementById('error-message');
    const codeDisplay = document.getElementById('code-display');
    const copyCodeButton = document.getElementById('copy-code');
    const previewFrame = document.getElementById('preview-frame');
    
    // Tab navigation
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const codeTabButtons = document.querySelectorAll('.code-tab-button');
    const inputTabButtons = document.querySelectorAll('.input-tab-button');
    const inputPanes = document.querySelectorAll('.input-pane');
    
    // Current state
    let currentFormData = null;
    let currentCodeType = 'html';
    let currentInputMethod = 'url';
    let generatedCode = {
        html: '',
        css: '',
        js: ''
    };
    
    // Initialize syntax highlighting
    const highlightCode = (code, type) => {
        if (!code) return '';
        
        // Simple syntax highlighting
        switch (type) {
            case 'html':
                return code
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/(".*?")/g, '<span class="attr-value">$1</span>')
                    .replace(/(&lt;\/?[a-z0-9\-]+(&gt;)?)/gi, '<span class="tag">$1</span>')
                    .replace(/([a-z\-]+)=/gi, '<span class="attr-name">$1</span>=');
            
            case 'css':
                return code
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/([\.\#][a-z0-9\-_]+\s*\{)/gi, '<span class="selector">$1</span>')
                    .replace(/(\{|\})/g, '<span class="selector">$1</span>')
                    .replace(/([a-z\-]+):/gi, '<span class="property">$1</span>:')
                    .replace(/(:[^;]+;)/g, '<span class="value">$1</span>');
            
            case 'js':
                return code
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/(const|let|var|function|return|if|else|try|catch|async|await)/g, '<span class="keyword">$1</span>')
                    .replace(/(".*?")/g, '<span class="string">$1</span>')
                    .replace(/('.*?')/g, '<span class="string">$1</span>')
                    .replace(/(\/\/.*)/g, '<span class="comment">$1</span>');
            
            default:
                return code
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
        }
    };
    
    // Handle tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update active tab pane
            tabPanes.forEach(pane => {
                if (pane.id === `${tabName}-tab`) {
                    pane.classList.add('active');
                } else {
                    pane.classList.remove('active');
                }
            });
            
            // If switching to preview tab, update the preview
            if (tabName === 'preview' && currentFormData) {
                updatePreview();
            }
        });
    });
    
    // Handle input method tab switching
    inputTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const inputMethod = button.getAttribute('data-input');
            
            // Update active input tab button
            inputTabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update active input pane
            inputPanes.forEach(pane => {
                if (pane.id === `${inputMethod}-input`) {
                    pane.classList.add('active');
                } else {
                    pane.classList.remove('active');
                }
            });
            
            // Update current input method
            currentInputMethod = inputMethod;
        });
    });
    
    // Handle code tab switching
    codeTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const codeType = button.getAttribute('data-code');
            
            // Update active code tab button
            codeTabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update code display
            currentCodeType = codeType;
            updateCodeDisplay();
            
            // Update code display class for syntax highlighting
            codeDisplay.className = `code-display ${codeType}-code`;
        });
    });
    
    // Update code display based on current code type
    const updateCodeDisplay = () => {
        codeDisplay.innerHTML = highlightCode(generatedCode[currentCodeType], currentCodeType);
    };
    
    // Update preview iframe
    const updatePreview = () => {
        if (!generatedCode.html) {
            return;
        }
        
        try {
            const previewDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
            previewDoc.open();
            previewDoc.write(generatedCode.html);
            previewDoc.close();
            
            // Add event listener to handle form submission in the iframe
            previewFrame.onload = () => {
                try {
                    const iframeWindow = previewFrame.contentWindow;
                    const previewForm = iframeWindow.document.getElementById('customForm');
                    
                    if (previewForm) {
                        // Override form submission in preview to prevent actual submission
                        previewForm.addEventListener('submit', (e) => {
                            e.preventDefault();
                            
                            // Show success message in preview
                            previewForm.style.display = 'none';
                            const successMessage = iframeWindow.document.getElementById('success-message');
                            if (successMessage) {
                                successMessage.style.display = 'block';
                            }
                            
                            // Log submission data
                            const formData = new FormData(previewForm);
                            console.log('Preview form submission data:', Object.fromEntries(formData.entries()));
                        });
                    }
                } catch (error) {
                    console.error('Error setting up preview form:', error);
                }
            };
        } catch (error) {
            console.error('Error updating preview:', error);
        }
    };
    
    // Handle form conversion
    const convertForm = async () => {
        let formTitle = formTitleInput.value.trim();
        const themeColor = themeColorInput.value;
        
        // Clear previous error
        errorMessage.textContent = '';
        
        try {
            // Parse form data based on input method
            if (currentInputMethod === 'url') {
                const formUrl = formUrlInput.value.trim();
                
                // Validate URL
                if (!FormParser.isValidFormUrl(formUrl)) {
                    throw new Error('Please enter a valid Google Form URL.');
                }
                
                // Parse form URL
                currentFormData = FormParser.parseUrl(formUrl);
                
                // Set default title if not provided
                if (!formTitle) {
                    formTitle = FormParser.extractFormTitle(formUrl);
                    formTitleInput.value = formTitle;
                }
            } else {
                const formHtml = formHtmlInput.value.trim();
                
                if (!formHtml) {
                    throw new Error('Please paste the HTML source of your Google Form.');
                }
                
                // Parse form HTML
                currentFormData = FormParser.parseHtml(formHtml);
                
                // Set default title if not provided
                if (!formTitle) {
                    formTitle = currentFormData.formTitle || 'Custom Form';
                    formTitleInput.value = formTitle;
                }
            }
            
            // Generate HTML with CSS included
            const htmlWithCss = FormGenerator.generateHTML(currentFormData, formTitle, themeColor);
            
            // Generate JavaScript separately
            const jsCode = FormGenerator.generateJS();
            
            // Store generated code
            generatedCode = {
                html: htmlWithCss.replace('<script>\n    // Form submission script will be added separately\n    </script>', 
                                         `<script>\n${jsCode}\n    </script>`),
                css: FormGenerator.generateCSS(themeColor),
                js: jsCode
            };
            
            // Update code display
            updateCodeDisplay();
            
            // Switch to code tab if not already active
            const activeTab = document.querySelector('.tab-button.active');
            if (activeTab.getAttribute('data-tab') !== 'code') {
                document.querySelector('.tab-button[data-tab="code"]').click();
            }
            
            // Enable copy button
            copyCodeButton.disabled = false;
            
        } catch (error) {
            errorMessage.textContent = error.message;
            console.error('Conversion error:', error);
        }
    };
    
    // Handle copy code button
    copyCodeButton.addEventListener('click', () => {
        const codeToCopy = generatedCode[currentCodeType];
        
        navigator.clipboard.writeText(codeToCopy)
            .then(() => {
                // Show copied animation
                copyCodeButton.classList.add('copy-animation');
                copyCodeButton.textContent = '✓ Copied!';
                
                setTimeout(() => {
                    copyCodeButton.classList.remove('copy-animation');
                    copyCodeButton.innerHTML = '<span class="copy-icon">📋</span> Copy Code';
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy code:', err);
                alert('Failed to copy code. Please try again.');
            });
    });
    
    // Handle convert button click
    convertButton.addEventListener('click', convertForm);
    
    // Handle form submission
    document.querySelector('.input-section').addEventListener('submit', (e) => {
        e.preventDefault();
        convertForm();
    });
    
    // Handle Enter key in URL input
    formUrlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            convertForm();
        }
    });
    
    // Handle theme color change
    themeColorInput.addEventListener('change', () => {
        if (currentFormData) {
            const formTitle = formTitleInput.value.trim() || 
                             (currentFormData.formTitle || 
                              (currentFormData.originalUrl ? 
                               FormParser.extractFormTitle(currentFormData.originalUrl) : 
                               'Custom Form'));
            
            generatedCode.css = FormGenerator.generateCSS(themeColorInput.value);
            
            // Update code display if CSS is currently shown
            if (currentCodeType === 'css') {
                updateCodeDisplay();
            }
            
            // Update preview if it's visible
            const activeTab = document.querySelector('.tab-button.active');
            if (activeTab.getAttribute('data-tab') === 'preview') {
                updatePreview();
            }
        }
    });
    
    // Handle form title change
    formTitleInput.addEventListener('change', () => {
        if (currentFormData) {
            const formTitle = formTitleInput.value.trim() || 
                             (currentFormData.formTitle || 
                              (currentFormData.originalUrl ? 
                               FormParser.extractFormTitle(currentFormData.originalUrl) : 
                               'Custom Form'));
            
            generatedCode.html = FormGenerator.generateHTML(currentFormData, formTitle, themeColorInput.value);
            
            // Update code display if HTML is currently shown
            if (currentCodeType === 'html') {
                updateCodeDisplay();
            }
            
            // Update preview if it's visible
            const activeTab = document.querySelector('.tab-button.active');
            if (activeTab.getAttribute('data-tab') === 'preview') {
                updatePreview();
            }
        }
    });
    
    // Check for URL parameter to pre-fill the form URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlParam = urlParams.get('url');
    
    if (urlParam) {
        formUrlInput.value = decodeURIComponent(urlParam);
        // Auto-convert if URL is provided
        setTimeout(convertForm, 500);
    }
}); 