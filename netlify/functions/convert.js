// netlify/functions/convert.js
// Serverless function for file conversion

const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
    
    try {
        const { fileUrl, fromFormat, toFormat, apiKey } = JSON.parse(event.body);
        
        // Validate API key (you can store this in environment variables)
        const validApiKey = process.env.PDFCO_API_KEY || 'demo';
        
        if (apiKey !== validApiKey && apiKey !== 'demo') {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Invalid API key' })
            };
        }
        
        // Use PDF.co API for conversion
        const conversionMap = {
            'pdf-to-word': 'https://api.pdf.co/v1/pdf/convert/to/doc',
            'pdf-to-excel': 'https://api.pdf.co/v1/pdf/convert/to/xls',
            'word-to-pdf': 'https://api.pdf.co/v1/word/convert/to/pdf',
            'jpg-to-pdf': 'https://api.pdf.co/v1/image/convert/to/pdf'
        };
        
        const apiUrl = conversionMap[`${fromFormat}-to-${toFormat}`] || 
                      'https://api.pdf.co/v1/pdf/convert';
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.PDFCO_API_KEY || 'demo'
            },
            body: JSON.stringify({
                url: fileUrl,
                async: false,
                name: `converted-${Date.now()}.${toFormat}`
            })
        });
        
        const data = await response.json();
        
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
        
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Conversion failed',
                message: error.message 
            })
        };
    }
};
