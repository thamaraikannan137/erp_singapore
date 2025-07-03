const fs = require('fs');
const pdf = require('pdf-parse');

async function convertPdfToHtml() {
    try {
        // Read the PDF file
        const dataBuffer = fs.readFileSync('qot1.pdf');
        
        // Parse the PDF
        const data = await pdf(dataBuffer);
        
        // Extract text content
        const text = data.text;
        
        // Create HTML content with proper styling
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PDF to HTML Conversion</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #007bff;
            padding-bottom: 10px;
        }
        .content {
            white-space: pre-wrap;
            font-size: 14px;
            color: #444;
        }
        .page-info {
            background-color: #e9ecef;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 20px;
            font-size: 12px;
            color: #666;
        }
        .metadata {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
            border-left: 4px solid #007bff;
        }
        .metadata h3 {
            margin-top: 0;
            color: #007bff;
        }
        .metadata p {
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>PDF to HTML Conversion</h1>
        
        <div class="page-info">
            <strong>Document Information:</strong><br>
            Pages: ${data.numpages}<br>
            Text Length: ${text.length} characters
        </div>
        
        <div class="metadata">
            <h3>Document Metadata:</h3>
            <p><strong>Info:</strong> ${JSON.stringify(data.info, null, 2)}</p>
            <p><strong>Metadata:</strong> ${JSON.stringify(data.metadata, null, 2)}</p>
        </div>
        
        <div class="content">${text}</div>
    </div>
</body>
</html>`;
        
        // Write HTML to file
        fs.writeFileSync('qot1.html', htmlContent, 'utf8');
        
        console.log('PDF successfully converted to HTML!');
        console.log('Output file: qot1.html');
        console.log(`Pages processed: ${data.numpages}`);
        console.log(`Text length: ${text.length} characters`);
        
    } catch (error) {
        console.error('Error converting PDF to HTML:', error);
    }
}

// Run the conversion
convertPdfToHtml(); 