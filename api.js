// api.js - REAL PDF Conversion API for JJConverter
// PASTE YOUR API KEYS BELOW ↓

class JJConverterAPI {
    constructor() {
        // ==============================================
        // 🔑 PASTE YOUR PDF.CO API KEY HERE (REPLACE THE YELLOW TEXT)
        // ==============================================
        this.pdfcoApiKey = 'javedjabbar691@gmail.com_drSzluoAM1B4wOlAfgUUKLDYdj2QA80xavkzh7JbrcMSKS0HcRUOZ6ghoLYorztT';
        // Example: this.pdfcoApiKey = 'sk_abc123def456ghi789jkl012';
        
        // ==============================================
        // 🔑 (OPTIONAL) PASTE CLOUDCONVERT KEY HERE
        // ==============================================
        this.cloudConvertKey = '███PASTE_YOUR_CLOUDCONVERT_KEY_HERE███';
        // Leave as is if you don't have it
        
        // Demo key for testing (limited)
        this.demoKey = 'demo';
    }
    
    // Main conversion function
    async convertFile(file, tool) {
        console.log(`Converting ${file.name} using ${tool}`);
        
        try {
            this.updateProgress('Starting conversion...', 10);
            
            // Upload file
            this.updateProgress('Uploading file...', 20);
            const uploadResult = await this.uploadFile(file);
            
            if (!uploadResult.success) {
                return {
                    success: false,
                    error: uploadResult.error,
                    isDemo: true
                };
            }
            
            // Convert based on tool
            this.updateProgress('Processing conversion...', 40);
            let result;
            
            switch(tool) {
                case 'pdf-to-word':
                case 'pdf-to-word-ocr':
                    result = await this.convertPDFtoWord(uploadResult.fileUrl, file.name, tool);
                    break;
                case 'pdf-to-excel':
                    result = await this.convertPDFtoExcel(uploadResult.fileUrl, file.name);
                    break;
                case 'word-to-pdf':
                    result = await this.convertWordToPDF(uploadResult.fileUrl, file.name);
                    break;
                case 'jpg-to-pdf':
                case 'png-to-pdf':
                    result = await this.convertImageToPDF(uploadResult.fileUrl, file.name);
                    break;
                case 'pdf-to-jpg':
                    result = await this.convertPDFtoJPG(uploadResult.fileUrl, file.name);
                    break;
                case 'merge-pdf':
                    result = await this.mergePDFs([uploadResult.fileUrl]);
                    break;
                case 'split-pdf':
                case 'compress-pdf':
                case 'organize-pdf':
                case 'protect-pdf':
                case 'unlock-pdf':
                    result = await this.createDemoFile(file.name, tool);
                    break;
                default:
                    result = await this.convertPDFtoWord(uploadResult.fileUrl, file.name, tool);
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
    
    // REAL PDF to Word Conversion
    async convertPDFtoWord(pdfUrl, originalFileName, tool) {
        try {
            // Use REAL API key or demo
            const apiKey = this.pdfcoApiKey || this.demoKey;
            const enableOCR = tool === 'pdf-to-word-ocr';
            
            const apiUrl = 'https://api.pdf.co/v1/pdf/convert/to/doc';
            
            const requestData = {
                url: pdfUrl,
                async: false,
                name: `converted-${Date.now()}.docx`,
                enableOCR: enableOCR,
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
                console.log('PDF.co API error:', data.message);
                return this.createDemoFile(originalFileName, 'word');
            }
            
            return {
                url: data.url,
                fileName: data.name || 'converted.docx',
                fileSize: data.fileSize,
                pageCount: data.pageCount,
                isDemo: false,
                message: 'Real conversion successful!'
            };
            
        } catch (error) {
            console.log('PDF.co failed:', error.message);
            return this.createDemoFile(originalFileName, 'word');
        }
    }
    
    // PDF to Excel
    async convertPDFtoExcel(pdfUrl, originalFileName) {
        try {
            const apiKey = this.pdfcoApiKey || this.demoKey;
            
            const apiUrl = 'https://api.pdf.co/v1/pdf/convert/to/xls';
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey
                },
                body: JSON.stringify({
                    url: pdfUrl,
                    async: false,
                    name: `converted-${Date.now()}.xlsx`
                })
            });
            
            const data = await response.json();
            
            if (data.error) {
                return this.createDemoFile(originalFileName, 'excel');
            }
            
            return {
                url: data.url,
                fileName: data.name || 'converted.xlsx',
                isDemo: false
            };
            
        } catch (error) {
            return this.createDemoFile(originalFileName, 'excel');
        }
    }
    
    // Word to PDF
    async convertWordToPDF(docUrl, originalFileName) {
        try {
            const apiKey = this.pdfcoApiKey || this.demoKey;
            
            const apiUrl = 'https://api.pdf.co/v1/word/convert/to/pdf';
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey
                },
                body: JSON.stringify({
                    url: docUrl,
                    async: false,
                    name: `converted-${Date.now()}.pdf`
                })
            });
            
            const data = await response.json();
            
            if (data.error) {
                return this.createDemoFile(originalFileName, 'pdf');
            }
            
            return {
                url: data.url,
                fileName: data.name || 'converted.pdf',
                isDemo: false
            };
            
        } catch (error) {
            return this.createDemoFile(originalFileName, 'pdf');
        }
    }
    
    // Image to PDF
    async convertImageToPDF(imageUrl, originalFileName) {
        try {
            const apiKey = this.pdfcoApiKey || this.demoKey;
            
            const apiUrl = 'https://api.pdf.co/v1/image/convert/to/pdf';
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey
                },
                body: JSON.stringify({
                    url: imageUrl,
                    async: false,
                    name: `converted-${Date.now()}.pdf`,
                    margin: '10px',
                    orientation: 'portrait',
                    paperSize: 'Letter'
                })
            });
            
            const data = await response.json();
            
            if (data.error) {
                return this.createDemoFile(originalFileName, 'pdf');
            }
            
            return {
                url: data.url,
                fileName: data.name || 'converted.pdf',
                isDemo: false
            };
            
        } catch (error) {
            return this.createDemoFile(originalFileName, 'pdf');
        }
    }
    
    // PDF to JPG
    async convertPDFtoJPG(pdfUrl, originalFileName) {
        try {
            const apiKey = this.pdfcoApiKey || this.demoKey;
            
            const apiUrl = 'https://api.pdf.co/v1/pdf/convert/to/jpg';
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey
                },
                body: JSON.stringify({
                    url: pdfUrl,
                    async: false,
                    name: `converted-${Date.now()}.jpg`
                })
            });
            
            const data = await response.json();
            
            if (data.error) {
                return this.createDemoFile(originalFileName, 'jpg');
            }
            
            return {
                url: data.url,
                fileName: data.name || 'converted.jpg',
                isDemo: false
            };
            
        } catch (error) {
            return this.createDemoFile(originalFileName, 'jpg');
        }
    }
    
    // Merge PDFs
    async mergePDFs(pdfUrls) {
        return {
            url: '#',
            fileName: 'merged.pdf',
            isDemo: true,
            message: 'Merge PDF feature requires premium API'
        };
    }
    
    // Upload file
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
    
    // Create demo files
    createDemoFile(originalFileName, type) {
        const formats = {
            'word': { ext: 'doc', mime: 'application/msword', name: 'Word' },
            'excel': { ext: 'xlsx', mime: 'application/vnd.ms-excel', name: 'Excel' },
            'pdf': { ext: 'pdf', mime: 'application/pdf', name: 'PDF' },
            'jpg': { ext: 'jpg', mime: 'image/jpeg', name: 'JPG' }
        };
        
        const format = formats[type] || formats.word;
        const date = new Date().toLocaleString();
        
        let content = '';
        if (type === 'word') {
            content = `
                <html>
                <head><title>JJConverter Demo</title></head>
                <body style="font-family: Arial; padding: 40px;">
                    <h1 style="color: #4a6fa5;">JJConverter - Demo Conversion</h1>
                    <p><strong>Original File:</strong> ${originalFileName}</p>
                    <p><strong>Converted to:</strong> ${format.name}</p>
                    <p><strong>Date:</strong> ${date}</p>
                    <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-left: 4px solid #ff7b54;">
                        <h3 style="color: #ff7b54;">⚠️ This is a DEMO file</h3>
                        <p>For <strong>REAL conversion with exact formatting</strong>:</p>
                        <p>1. Get FREE API key from <a href="https://pdf.co">PDF.co</a></p>
                        <p>2. Paste it in api.js file</p>
                        <p>3. Real conversion preserves: Tables, Fonts, Layout, Images</p>
                    </div>
                    <p style="color: #666; margin-top: 40px;">Need help? Email: JJconverter@gmail.com</p>
                </body>
                </html>
            `;
        } else {
            content = `JJConverter Demo\nOriginal: ${originalFileName}\nType: ${format.name}\nDate: ${date}\n\nAdd API key for real conversion\nEmail: JJconverter@gmail.com`;
        }
        
        const blob = new Blob([content], { type: format.mime });
        const url = URL.createObjectURL(blob);
        
        return {
            url: url,
            fileName: `demo-${originalFileName.replace(/\.[^/.]+$/, '')}.${format.ext}`,
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

// Make available globally
window.JJConverterAPI = new JJConverterAPI();
