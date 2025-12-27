// api.js - REAL PDF Conversion API for JJConverter
// Paste your API keys in the section below

class JJConverterAPI {
    constructor() {
        // ================================
        // PASTE YOUR PDF.CO API KEY HERE ↓
        // ================================
        this.pdfcoApiKey = 'PASTE_YOUR_PDF_CO_API_KEY_HERE';  // ← REPLACE THIS
        
        // ================================
        // PASTE YOUR CLOUDCONVERT KEY HERE ↓ (Optional)
        // ================================
        this.cloudConvertKey = 'PASTE_YOUR_CLOUDCONVERT_KEY_HERE';  // ← REPLACE THIS (optional)
        
        // Backup demo key (works for testing)
        this.demoKey = 'demo'; // Limited demo key
    }
    
    // Main conversion function
    async convertFile(file, tool) {
        console.log(`Converting ${file.name} using ${tool}`);
        
        try {
            // Show progress
            this.updateProgress('Starting conversion...', 10);
            
            // Step 1: Upload file
            this.updateProgress('Uploading file...', 20);
            const uploadResult = await this.uploadFile(file);
            
            if (!uploadResult.success) {
                return {
                    success: false,
                    error: uploadResult.error,
                    isDemo: true
                };
            }
            
            // Step 2: Convert based on tool
            this.updateProgress('Processing conversion...', 40);
            let result;
            
            if (tool === 'pdf-to-word') {
                result = await this.convertPDFtoWord(uploadResult.fileUrl, file.name);
            } else if (tool === 'pdf-to-word-ocr') {
                result = await this.convertPDFtoWordOCR(uploadResult.fileUrl, file.name);
            } else if (tool === 'pdf-to-excel') {
                result = await this.convertPDFtoExcel(uploadResult.fileUrl, file.name);
            } else if (tool === 'word-to-pdf') {
                result = await this.convertWordToPDF(uploadResult.fileUrl, file.name);
            } else if (tool === 'jpg-to-pdf') {
                result = await this.convertImageToPDF(uploadResult.fileUrl, file.name);
            } else if (tool === 'merge-pdf') {
                result = await this.mergePDFs([uploadResult.fileUrl]);
            } else {
                // Default conversion
                result = await this.convertPDFtoWord(uploadResult.fileUrl, file.name);
            }
            
            this.updateProgress('Finalizing...', 80);
            
            return {
                success: true,
                downloadUrl: result.url,
                fileName: result.fileName,
                fileSize: result.fileSize,
                isDemo: result.isDemo || false,
                message: result.message || 'Conversion successful!'
            };
            
        } catch (error) {
            console.error('Conversion error:', error);
            return {
                success: false,
                error: error.message,
                isDemo: true
            };
        }
    }
    
    // REAL PDF to Word Conversion using PDF.co API
    async convertPDFtoWord(pdfUrl, originalFileName) {
        try {
            // Use your REAL API key
            const apiKey = this.pdfcoApiKey || this.demoKey;
            
            const apiUrl = 'https://api.pdf.co/v1/pdf/convert/to/doc';
            
            const requestData = {
                url: pdfUrl,
                async: false,
                name: `converted-${Date.now()}.docx`,
                enableOCR: false, // Set to true for scanned PDFs
                keepOriginalLayout: true,
                wordOptions: {
                    outputFormat: 'docx',
                    enableBookmarks: true,
                    enableHyperlinks: true,
                    keepImages: true,
                    keepTables: true
                }
            };
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey
                },
                body: JSON.stringify(requestData)
            });
            
            const data = await response.json();
            
            if (data.error) {
                console.log('PDF.co API error, using demo mode:', data.message);
                // Fallback to demo
                return this.createDemoWordFile(originalFileName);
            }
            
            return {
                url: data.url,
                fileName: data.name || 'converted.docx',
                fileSize: data.fileSize,
                pageCount: data.pageCount,
                isDemo: false
            };
            
        } catch (error) {
            console.log('PDF.co failed, using demo:', error.message);
            return this.createDemoWordFile(originalFileName);
        }
    }
    
    // PDF to Word with OCR (for scanned PDFs)
    async convertPDFtoWordOCR(pdfUrl, originalFileName) {
        try {
            const apiKey = this.pdfcoApiKey || this.demoKey;
            
            const apiUrl = 'https://api.pdf.co/v1/pdf/convert/to/doc';
            
            const requestData = {
                url: pdfUrl,
                async: false,
                name: `converted-ocr-${Date.now()}.docx`,
                enableOCR: true, // OCR enabled for scanned PDFs
                keepOriginalLayout: true,
                wordOptions: {
                    outputFormat: 'docx',
                    enableBookmarks: true,
                    enableHyperlinks: true
                }
            };
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey
                },
                body: JSON.stringify(requestData)
            });
            
            const data = await response.json();
            
            if (data.error) {
                return this.createDemoWordFile(originalFileName);
            }
            
            return {
                url: data.url,
                fileName: data.name || 'converted-ocr.docx',
                fileSize: data.fileSize,
                isDemo: false
            };
            
        } catch (error) {
            return this.createDemoWordFile(originalFileName);
        }
    }
    
    // PDF to Excel
    async convertPDFtoExcel(pdfUrl, originalFileName) {
        try {
            const apiKey = this.pdfcoApiKey || this.demoKey;
            
            const apiUrl = 'https://api.pdf.co/v1/pdf/convert/to/xls';
            
            const requestData = {
                url: pdfUrl,
                async: false,
                name: `converted-${Date.now()}.xlsx`
            };
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey
                },
                body: JSON.stringify(requestData)
            });
            
            const data = await response.json();
            
            if (data.error) {
                return this.createDemoExcelFile(originalFileName);
            }
            
            return {
                url: data.url,
                fileName: data.name || 'converted.xlsx',
                isDemo: false
            };
            
        } catch (error) {
            return this.createDemoExcelFile(originalFileName);
        }
    }
    
    // Word to PDF
    async convertWordToPDF(docUrl, originalFileName) {
        try {
            const apiKey = this.pdfcoApiKey || this.demoKey;
            
            const apiUrl = 'https://api.pdf.co/v1/word/convert/to/pdf';
            
            const requestData = {
                url: docUrl,
                async: false,
                name: `converted-${Date.now()}.pdf`
            };
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey
                },
                body: JSON.stringify(requestData)
            });
            
            const data = await response.json();
            
            if (data.error) {
                return this.createDemoPDFFile(originalFileName);
            }
            
            return {
                url: data.url,
                fileName: data.name || 'converted.pdf',
                isDemo: false
            };
            
        } catch (error) {
            return this.createDemoPDFFile(originalFileName);
        }
    }
    
    // JPG to PDF
    async convertImageToPDF(imageUrl, originalFileName) {
        try {
            const apiKey = this.pdfcoApiKey || this.demoKey;
            
            const apiUrl = 'https://api.pdf.co/v1/image/convert/to/pdf';
            
            const requestData = {
                url: imageUrl,
                async: false,
                name: `converted-${Date.now()}.pdf`,
                margin: '10px',
                orientation: 'portrait',
                paperSize: 'Letter'
            };
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey
                },
                body: JSON.stringify(requestData)
            });
            
            const data = await response.json();
            
            if (data.error) {
                return this.createDemoPDFFile(originalFileName);
            }
            
            return {
                url: data.url,
                fileName: data.name || 'converted.pdf',
                isDemo: false
            };
            
        } catch (error) {
            return this.createDemoPDFFile(originalFileName);
        }
    }
    
    // Merge PDFs (simplified for demo)
    async mergePDFs(pdfUrls) {
        // This is a simplified version
        return {
            url: '#',
            fileName: 'merged.pdf',
            isDemo: true,
            message: 'Merge feature requires premium API'
        };
    }
    
    // Upload file (simplified)
    async uploadFile(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve({
                    success: true,
                    fileUrl: reader.result
                });
            };
            reader.onerror = () => {
                resolve({
                    success: false,
                    error: 'File upload failed'
                });
            };
            reader.readAsDataURL(file);
        });
    }
    
    // Create demo files for testing
    createDemoWordFile(originalFileName) {
        const content = `
            <html>
            <head><title>Demo Word File</title></head>
            <body>
                <h1>JJConverter - Demo Conversion</h1>
                <p>Original: ${originalFileName}</p>
                <p>Converted to: Word Document</p>
                <p>Date: ${new Date().toLocaleString()}</p>
                <p style="color: red;">⚠️ DEMO FILE - Add API key for real conversion</p>
                <p>Get API key from <a href="https://pdf.co">PDF.co</a></p>
            </body>
            </html>
        `;
        
        const blob = new Blob([content], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        
        return {
            url: url,
            fileName: `demo-${originalFileName.replace('.pdf', '')}.doc`,
            isDemo: true,
            message: 'Demo file - Add API key for real conversion'
        };
    }
    
    createDemoExcelFile(originalFileName) {
        const content = "Original,Converted,Date\n" +
                       `${originalFileName},Excel,${new Date().toLocaleString()}\n` +
                       "Get real API key from PDF.co for actual conversion";
        
        const blob = new Blob([content], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        
        return {
            url: url,
            fileName: `demo-${originalFileName.replace('.pdf', '')}.xlsx`,
            isDemo: true,
            message: 'Demo file - Add API key for real conversion'
        };
    }
    
    createDemoPDFFile(originalFileName) {
        const content = `
            <html>
            <body>
                <h1>JJConverter Demo</h1>
                <p>This is a demo PDF file.</p>
                <p>For real conversion, add API key.</p>
            </body>
            </html>
        `;
        
        const blob = new Blob([content], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        return {
            url: url,
            fileName: `demo-${originalFileName.replace('.pdf', '')}.pdf`,
            isDemo: true,
            message: 'Demo file - Add API key for real conversion'
        };
    }
    
    // Progress update
    updateProgress(message, percent) {
        const event = new CustomEvent('api-progress', {
            detail: { message, percent }
        });
        window.dispatchEvent(event);
    }
}

// Initialize and make available globally
window.JJConverterAPI = new JJConverterAPI();
