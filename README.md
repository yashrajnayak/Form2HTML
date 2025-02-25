# Google Form to HTML Converter

A simple, browser-based tool that converts Google Form prefill URLs into custom HTML forms with matching CSS and JavaScript. Perfect for embedding forms in your own website while maintaining the Google Forms backend.

## Features

- 🔄 Convert Google Form prefill URLs to custom HTML forms
- 🎨 Customize form appearance with theme colors
- 📱 Responsive design that works on all devices
- 👁️ Live preview of the generated form
- 📋 Copy HTML, CSS, and JavaScript code with one click
- 🔍 Syntax highlighting for better code readability
- 🚀 No server required - runs entirely in the browser

## How to Use

### Method 1: Using a Google Form Prefill URL

1. Open your Google Form and click the three dots menu (⋮) in the top right
2. Select "Get pre-filled link"
3. Fill in some example values and click "Get Link"
4. Paste the prefill URL into the converter
5. Optionally customize the form title and theme color then click "Convert Form"

### Method 2: Using the HTML Source (Recommended for better field labels)

1. Open your Google Form. Right-click anywhere on the page and select "View Page Source"
2. Copy the entire HTML and paste into the converter
3. Optionally customize the form title and theme color then click "Convert Form"

## Technical Details

### How It Works

1. **Input Processing**: The tool can process either a Google Form prefill URL or the complete HTML source of a form
2. **Data Extraction**: 
   - From URL: Extracts form field IDs and values
   - From HTML: Extracts field IDs, values, and question labels
3. **Field Type Detection**: Automatically detects appropriate input types (text, email, number, etc.)
4. **Code Generation**: Creates clean, semantic HTML with matching CSS and JavaScript
5. **Form Submission**: The generated form submits data directly to Google Forms

### Files Structure

- `index.html` - Main application HTML
- `css/styles.css` - Application styles
- `js/parser.js` - Google Form URL parser
- `js/generator.js` - HTML/CSS/JS code generator
- `js/app.js` - Main application logic

## Form Submission

The generated forms use jQuery and the jQuery Form plugin for reliable submission to Google Forms. This approach has several advantages:

1. **Cross-Origin Support**: Handles the cross-origin submission challenges that often occur with Google Forms
2. **Better Error Handling**: Provides more reliable submission even when Google returns error codes
3. **User Feedback**: Shows loading state and success messages for better user experience

The generated code includes both the jQuery implementation and a fallback using native JavaScript for environments where jQuery isn't available.

### Dependencies

The generated forms include:
- jQuery 3.7.1
- jQuery Form Plugin 4.3.0

These are loaded from CDN in the generated HTML, so no additional setup is required.

## Limitations

- Only supports basic field types (text, email, number, date, URL, textarea)
- Multiple choice questions (radio buttons, checkboxes) are supported but may require additional styling
- Does not support complex Google Form features like:
  - File uploads
  - Grid questions
  - Conditional logic
- Form validation is basic (required fields only)

## Privacy & Security

- All processing happens in your browser - no data is sent to any server
- Your form URLs and data never leave your computer
- The generated forms submit directly to Google's servers, just like the original form

## Development

This project is built with vanilla JavaScript, HTML, and CSS. No build tools or frameworks are required.

To contribute:

1. Fork the repository
2. Make your changes
3. Test locally by opening `index.html` in a browser
4. Submit a pull request

## License

MIT License - feel free to use, modify, and distribute as needed.
