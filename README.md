# Google Form to HTML Converter

A simple, browser-based tool that converts Google Form prefill URLs into custom HTML forms with matching CSS and JavaScript. Perfect for embedding forms in your own website while maintaining the Google Forms backend.

![Google Form to HTML Converter](https://i.imgur.com/JQGkDJZ.png)

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

1. **Get a Google Form Prefill URL**:
   - Create a Google Form
   - Click the three dots menu (⋮) in the top right
   - Select "Get pre-filled link"
   - Fill in some example values
   - Click "Get Link"
   - Copy the generated URL

2. **Convert the Form**:
   - Paste the prefill URL into the converter
   - Optionally customize the form title and theme color
   - Click "Convert Form"

### Method 2: Using the HTML Source (Recommended for better field labels)

1. **Get the HTML Source of your Google Form**:
   - Open your Google Form in the browser
   - Right-click anywhere on the page and select "View Page Source"
   - Press Ctrl+A (or Cmd+A on Mac) to select all the HTML
   - Copy the entire HTML (Ctrl+C or Cmd+C)

2. **Convert the Form**:
   - Switch to the "HTML Source" tab in the converter
   - Paste the copied HTML into the text area
   - Optionally customize the form title and theme color
   - Click "Convert Form"

3. **Use the Generated Code**:
   - Preview the form to ensure it looks correct
   - Copy the HTML, CSS, and JavaScript code
   - Integrate the code into your website

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

## Limitations

- Only supports basic field types (text, email, number, date, URL)
- Does not support complex Google Form features like:
  - File uploads
  - Grid questions
  - Multiple choice questions (these would need custom handling)
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

## Credits

Created by [Your Name] - inspired by the GitTogethers project. 