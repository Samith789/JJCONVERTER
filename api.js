// api.js - Real Conversion API Integration

class JJConverterAPI {
    constructor() {
        // Choose ONE of these APIs (I recommend PDF.co for beginners)
        this.apiConfig = {
            // Option 1: PDF.co API (500 free conversions/month)
            pdfco: {
                apiKey: 'demo', // Replace with your actual key
                endpoint: 'https://api.pdf.co/v1/pdf/convert/to/doc'
            },
            
            // Option 2: CloudConvert (25 free conversions/month)
            cloudconvert: {
                apiKey: 'demo',
                endpoint: 'https://api.cloudconvert.com/v2/convert'
            },
            
            // Option 3: FreeConvert API
            freeconvert: {
                apiKey: 'demo',
                endpoint: 'https://api.freeconvert.com/v1/convert'
            }
        };
    }

    // Main conversion function
    async convertFile(file, fromFormat, toFormat) {
        console.log(`Converting ${file.name} from ${fromFormat} to ${toFormat}`);
        
        try {
            // For DEMO - shows how it works
            if (file.size > 10 * 1024 * 1024) { // 10MB
                return {
                    success: false,
                    error: 'File too large for demo. Sign up for API for larger files.'
                };
            }

            // Show progress
            this.showProgress('Uploading to server...', 25);
            
            // Upload file first
            const uploadResult = await this.uploadFile(file);
            
            if (!uploadResult.success) {
                return uploadResult;
            }
            
            this.showProgress('Converting file...', 50);
            
            // Call the conversion API
            const conversionResult = await this.callConversionAPI(
                uploadResult.fileUrl,
                fromFormat,
                toFormat
            );
            
            this.showProgress('Finalizing...', 75);
            
            return conversionResult;
            
        } catch (error) {
            return {
                success: false,
                error: `Conversion failed: ${error.message}`
            };
        }
    }

    // Upload file to temporary storage
    async uploadFile(file) {
        try {
            // Using FreeImageHost API for demo (free temporary storage)
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch('https://freeimage.host/api/1/upload', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                return {
                    success: true,
                    fileUrl: data.image.url
                };
            } else {
                // Fallback to base64 for small files
                return await this.convertToBase64(file);
            }
            
        } catch (error) {
            // Local fallback for demo
            return await this.convertToBase64(file);
        }
    }

    // Convert file to base64 (for demo)
    convertToBase64(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve({
                    success: true,
                    fileUrl: reader.result,
                    isBase64: true
                });
            };
            reader.readAsDataURL(file);
        });
    }

    // Call actual conversion API
    async callConversionAPI(fileUrl, fromFormat, toFormat) {
        // DEMO MODE - Remove this in production
        if (window.location.hostname === 'localhost' || 
            window.location.hostname.includes('github.io') ||
            window.location.hostname.includes('netlify.app')) {
            
            return this.demoConversion(fileUrl, fromFormat, toFormat);
        }
        
        // REAL API CALL - Choose one service below
        
        // Option 1: PDF.co API (Recommended for beginners)
        return await this.usePDFCoAPI(fileUrl, fromFormat, toFormat);
        
        // Option 2: CloudConvert API
        // return await this.useCloudConvertAPI(fileUrl, fromFormat, toFormat);
        
        // Option 3: FreeConvert API
        // return await this.useFreeConvertAPI(fileUrl, fromFormat, toFormat);
    }

    // DEMO Conversion (shows UI flow)
    demoConversion(fileUrl, fromFormat, toFormat) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const demoFiles = {
                    'pdf-to-word': 'converted-demo.docx',
                    'word-to-pdf': 'converted-demo.pdf',
                    'pdf-to-excel': 'converted-demo.xlsx',
                    'pdf-to-jpg': 'converted-demo.jpg',
                    'merge-pdf': 'merged-demo.pdf'
                };
                
                const fileName = demoFiles[`${fromFormat}-to-${toFormat}`] || 'converted-file';
                
                resolve({
                    success: true,
                    downloadUrl: `#demo-${fileName}`,
                    fileName: fileName,
                    message: 'Demo conversion successful! Sign up for API for real conversion.',
                    isDemo: true
                });
            }, 2000);
        });
    }

    // REAL API: PDF.co Integration
    async usePDFCoAPI(fileUrl, fromFormat, toFormat) {
        // Sign up at: https://pdf.co/register
        // Get free API key (500 conversions/month free)
        
        const apiKey = 'YOUR_PDF_CO_API_KEY'; // Replace with actual key
        
        const formats = {
            'pdf-to-word': 'pdfconvert/to/doc',
            'pdf-to-excel': 'pdfconvert/to/xlsx',
            'pdf-to-ppt': 'pdfconvert/to/ppt',
            'word-to-pdf': 'word/convert/to/pdf',
            'jpg-to-pdf': 'image/convert/to/pdf'
        };
        
        const endpoint = formats[`${fromFormat}-to-${toFormat}`] || 'pdf/convert';
        
        const response = await fetch(`https://api.pdf.co/v1/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            },
            body: JSON.stringify({
                url: fileUrl,
                async: false,
                name: `converted-${Date.now()}`
            })
        });
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.message);
        }
        
        return {
            success: true,
            downloadUrl: data.url,
            fileName: data.name
        };
    }

    // REAL API: CloudConvert Integration
    async useCloudConvertAPI(fileUrl, fromFormat, toFormat) {
        // Sign up at: https://cloudconvert.com/signup
        // Get API key from dashboard
        
        const apiKey = 'YOUR_CLOUDCONVERT_API_KEY';
        
        // First create job
        const jobResponse = await fetch('https://api.cloudconvert.com/v2/jobs', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tasks: {
                    'import-file': {
                        operation: 'import/url',
                        url: fileUrl
                    },
                    'convert-task': {
                        operation: 'convert',
                        input: ['import-file'],
                        output_format: toFormat
                    },
                    'export-task': {
                        operation: 'export/url',
                        input: ['convert-task']
                    }
                }
            })
        });
        
        const jobData = await jobResponse.json();
        
        // Wait for conversion
        await this.waitForJobCompletion(jobData.data.id, apiKey);
        
        return {
            success: true,
            downloadUrl: jobData.data.tasks['export-task'].result.files[0].url,
            fileName: `converted.${toFormat}`
        };
    }

    // Helper: Show progress
    showProgress(message, percent) {
        const progressEvent = new CustomEvent('conversion-progress', {
            detail: { message, percent }
        });
        window.dispatchEvent(progressEvent);
    }

    // Helper: Wait for job completion
    async waitForJobCompletion(jobId, apiKey, maxAttempts = 30) {
        for (let i = 0; i < maxAttempts; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const response = await fetch(`https://api.cloudconvert.com/v2/jobs/${jobId}`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            });
            
            const data = await response.json();
            
            if (data.data.status === 'finished') {
                return true;
            } else if (data.data.status === 'error') {
                throw new Error('Conversion failed');
            }
            
            this.showProgress(`Processing... (${i+1}/${maxAttempts})`, 50 + (i * 2));
        }
        
        throw new Error('Conversion timeout');
    }
}

// Initialize API
window.JJConverterAPI = new JJConverterAPI();
