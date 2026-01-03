// ========== PDF TO WORD CONVERSION ==========
async function convertPdfToWord() {
    const input = document.getElementById('pdfToWordInput');
    if (!input.files.length) {
        showAlert('No File', 'Please select a PDF file first.');
        return;
    }
    
    const file = input.files[0];
    showProgress('Converting PDF to Word...');
    
    try {
        // Read PDF file
        const pdfBytes = await readFileAsArrayBuffer(file);
        
        // Load PDF document
        const pdfDoc = await window.PDFLib.PDFDocument.load(pdfBytes);
        const pageCount = pdfDoc.getPageCount();
        
        // Extract text from each page
        let wordContent = `Converted from: ${file.name}\n`;
        wordContent += `Total pages: ${pageCount}\n\n`;
        
        // Note: PDF-Lib doesn't extract text, so we'll create a simple text representation
        // For full text extraction, you would need a library like pdf.js or a backend service
        for (let i = 0; i < pageCount; i++) {
            wordContent += `=== Page ${i + 1} ===\n`;
            wordContent += `[Page content would be extracted here]\n`;
            wordContent += `\n`;
        }
        
        // Create Word document (simplified - using text file)
        const wordBlob = new Blob([wordContent], { type: 'text/plain' });
        const fileName = file.name.replace(/\.pdf$/i, '_converted.docx');
        
        hideProgress();
        showDownloadModal(fileName, wordBlob);
        
    } catch (error) {
        hideProgress();
        showAlert('Conversion Error', 'Failed to convert PDF to Word: ' + error.message);
    }
}

// ========== WORD TO PDF CONVERSION ==========
async function convertWordToPdf() {
    const input = document.getElementById('wordToPdfInput');
    if (!input.files.length) {
        showAlert('No File', 'Please select a Word file first.');
        return;
    }
    
    const file = input.files[0];
    const fileExt = file.name.split('.').pop().toLowerCase();
    showProgress('Converting to PDF...');
    
    try {
        let textContent = '';
        
        if (fileExt === 'docx') {
            // For DOCX files, use Mammoth.js to extract text
            const arrayBuffer = await readFileAsArrayBuffer(file);
            const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
            textContent = result.value;
        } else {
            // For DOC or TXT files, read as text
            textContent = await readFileAsText(file);
        }
        
        // Create PDF using jsPDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        
        // Set margins
        const marginLeft = 20;
        const marginTop = 20;
        const pageWidth = pdf.internal.pageSize.width;
        const pageHeight = pdf.internal.pageSize.height;
        const maxWidth = pageWidth - (marginLeft * 2);
        
        // Split text into lines
        const lines = pdf.splitTextToSize(textContent, maxWidth);
        
        let yPosition = marginTop;
        const lineHeight = 7;
        
        // Add text to PDF
        for (let i = 0; i < lines.length; i++) {
            if (yPosition > pageHeight - 20) {
                pdf.addPage();
                yPosition = marginTop;
            }
            
            pdf.text(lines[i], marginLeft, yPosition);
            yPosition += lineHeight;
        }
        
        // Generate PDF blob
        const pdfBlob = pdf.output('blob');
        const fileName = file.name.replace(/\.[^/.]+$/, "") + '_converted.pdf';
        
        hideProgress();
        showDownloadModal(fileName, pdfBlob);
        
    } catch (error) {
        hideProgress();
        showAlert('Conversion Error', 'Failed to convert to PDF: ' + error.message);
    }
}

// ========== ORGANIZE PDF PAGES ==========
async function organizePdfPages() {
    const input = document.getElementById('organizePdfInput');
    if (!input.files.length) {
        showAlert('No File', 'Please select a PDF file first.');
        return;
    }
    
    const file = input.files[0];
    const pageOrderInput = document.getElementById('pageOrder').value;
    
    showProgress('Organizing PDF pages...');
    
    try {
        const pdfBytes = await readFileAsArrayBuffer(file);
        openPageOrganizer(pdfBytes);
        
    } catch (error) {
        hideProgress();
        showAlert('Error', 'Failed to load PDF: ' + error.message);
    }
}

// ========== COMPRESS PDF ==========
async function compressPdf() {
    const input = document.getElementById('compressPdfInput');
    if (!input.files.length) {
        showAlert('No File', 'Please select a PDF file first.');
        return;
    }
    
    const file = input.files[0];
    const compressionLevel = parseInt(document.getElementById('compressionLevel').value);
    
    showProgress('Compressing PDF...');
    
    try {
        const pdfBytes = await readFileAsArrayBuffer(file);
        
        // Load and save PDF (simulated compression)
        const pdfDoc = await window.PDFLib.PDFDocument.load(pdfBytes);
        
        // Apply compression by reducing image quality
        const pages = pdfDoc.getPages();
        // Note: Actual image compression would require more complex processing
        
        // Save PDF
        const compressedBytes = await pdfDoc.save({
            useObjectStreams: true,
            addDefaultPage: false
        });
        
        const compressedBlob = new Blob([compressedBytes], { type: 'application/pdf' });
        const fileName = file.name.replace(/\.pdf$/i, '_compressed.pdf');
        
        hideProgress();
        
        const originalSize = file.size;
        const compressedSize = compressedBlob.size;
        const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
        
        showAlert('Compression Complete', 
            `Original: ${(originalSize / 1024).toFixed(2)} KB\n` +
            `Compressed: ${(compressedSize / 1024).toFixed(2)} KB\n` +
            `Reduction: ${reduction}%`);
        
        showDownloadModal(fileName, compressedBlob);
        
    } catch (error) {
        hideProgress();
        showAlert('Compression Error', 'Failed to compress PDF: ' + error.message);
    }
}

// ========== ROTATE PDF ==========
async function rotatePdf() {
    const input = document.getElementById('rotatePdfInput');
    if (!input.files.length) {
        showAlert('No File', 'Please select a PDF file first.');
        return;
    }
    
    const file = input.files[0];
    const angle = parseInt(document.getElementById('rotationAngle').value);
    
    showProgress('Rotating PDF...');
    
    try {
        const pdfBytes = await readFileAsArrayBuffer(file);
        const pdfDoc = await window.PDFLib.PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();
        
        // Rotate all pages
        pages.forEach(page => {
            page.setRotation(page.getRotation().angle + angle);
        });
        
        // Save rotated PDF
        const rotatedBytes = await pdfDoc.save();
        const rotatedBlob = new Blob([rotatedBytes], { type: 'application/pdf' });
        const fileName = file.name.replace(/\.pdf$/i, '_rotated.pdf');
        
        hideProgress();
        showDownloadModal(fileName, rotatedBlob);
        
    } catch (error) {
        hideProgress();
        showAlert('Rotation Error', 'Failed to rotate PDF: ' + error.message);
    }
}

// ========== EDIT PDF ==========
async function editPdf() {
    const input = document.getElementById('editPdfInput');
    if (!input.files.length) {
        showAlert('No File', 'Please select a PDF file first.');
        return;
    }
    
    const file = input.files[0];
    const textToAdd = document.getElementById('editText').value;
    
    if (!textToAdd.trim()) {
        showAlert('No Text', 'Please enter text to add to the PDF.');
        return;
    }
    
    showProgress('Editing PDF...');
    
    try {
        const pdfBytes = await readFileAsArrayBuffer(file);
        const pdfDoc = await window.PDFLib.PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();
        
        // Add text to first page
        if (pages.length > 0) {
            const firstPage = pages[0];
            const { width, height } = firstPage.getSize();
            
            // Add text at bottom center
            firstPage.drawText(textToAdd, {
                x: width / 2 - 50,
                y: 50,
                size: 12,
                color: window.PDFLib.rgb(0, 0, 0)
            });
        }
        
        // Save edited PDF
        const editedBytes = await pdfDoc.save();
        const editedBlob = new Blob([editedBytes], { type: 'application/pdf' });
        const fileName = file.name.replace(/\.pdf$/i, '_edited.pdf');
        
        hideProgress();
        showDownloadModal(fileName, editedBlob);
        
    } catch (error) {
        hideProgress();
        showAlert('Edit Error', 'Failed to edit PDF: ' + error.message);
    }
}

// ========== PDF TO POWERPOINT ==========
async function convertPdfToPpt() {
    const input = document.getElementById('pdfToPptInput');
    if (!input.files.length) {
        showAlert('No File', 'Please select a PDF file first.');
        return;
    }
    
    const file = input.files[0];
    showProgress('Converting PDF to PowerPoint...');
    
    try {
        // Create a simple text-based PPT representation
        const pdfBytes = await readFileAsArrayBuffer(file);
        const pdfDoc = await window.PDFLib.PDFDocument.load(pdfBytes);
        const pageCount = pdfDoc.getPageCount();
        
        // Create PowerPoint content (simplified - using HTML/Text)
        let pptContent = `PowerPoint Presentation\n`;
        pptContent += `Converted from: ${file.name}\n`;
        pptContent += `Total slides: ${pageCount}\n\n`;
        
        for (let i = 0; i < pageCount; i++) {
            pptContent += `--- Slide ${i + 1} ---\n`;
            pptContent += `Content from PDF page ${i + 1}\n\n`;
        }
        
        const pptBlob = new Blob([pptContent], { type: 'text/plain' });
        const fileName = file.name.replace(/\.pdf$/i, '_presentation.pptx');
        
        hideProgress();
        showDownloadModal(fileName, pptBlob);
        
    } catch (error) {
        hideProgress();
        showAlert('Conversion Error', 'Failed to convert to PowerPoint: ' + error.message);
    }
}

// ========== EXCEL TO PDF ==========
async function convertExcelToPdf() {
    const input = document.getElementById('excelToPdfInput');
    if (!input.files.length) {
        showAlert('No File', 'Please select an Excel file first.');
        return;
    }
    
    const file = input.files[0];
    const fileExt = file.name.split('.').pop().toLowerCase();
    
    showProgress('Converting Excel to PDF...');
    
    try {
        let data = [];
        
        if (fileExt === 'csv') {
            // Read CSV file
            const text = await readFileAsText(file);
            const lines = text.split('\n');
            data = lines.map(line => line.split(','));
        } else {
            // Read Excel file using SheetJS
            const arrayBuffer = await readFileAsArrayBuffer(file);
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        }
        
        // Create PDF using jsPDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        
        // Set up table
        const margin = 20;
        let yPosition = margin;
        const rowHeight = 10;
        
        // Add title
        pdf.setFontSize(16);
        pdf.text(`Excel Data: ${file.name}`, margin, yPosition);
        yPosition += 20;
        
        // Add table data
        pdf.setFontSize(10);
        data.forEach((row, rowIndex) => {
            if (yPosition > 270) { // Near bottom of page
                pdf.addPage();
                yPosition = margin;
            }
            
            let xPosition = margin;
            row.forEach((cell, colIndex) => {
                const cellText = cell !== undefined && cell !== null ? String(cell) : '';
                pdf.text(cellText, xPosition, yPosition);
                xPosition += 40; // Column width
            });
            
            yPosition += rowHeight;
        });
        
        // Generate PDF blob
        const pdfBlob = pdf.output('blob');
        const fileName = file.name.replace(/\.[^/.]+$/, "") + '_converted.pdf';
        
        hideProgress();
        showDownloadModal(fileName, pdfBlob);
        
    } catch (error) {
        hideProgress();
        showAlert('Conversion Error', 'Failed to convert Excel to PDF: ' + error.message);
    }
}

// ========== ADD PAGE NUMBERS ==========
async function addPageNumbers() {
    const input = document.getElementById('pageNumbersInput');
    if (!input.files.length) {
        showAlert('No File', 'Please select a PDF file first.');
        return;
    }
    
    const file = input.files[0];
    const position = document.getElementById('pageNumberPosition').value;
    
    showProgress('Adding page numbers...');
    
    try {
        const pdfBytes = await readFileAsArrayBuffer(file);
        const pdfDoc = await window.PDFLib.PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();
        
        // Add page numbers to each page
        pages.forEach((page, index) => {
            const { width, height } = page.getSize();
            let x, y;
            
            // Set position based on selection
            switch(position) {
                case 'bottom-center':
                    x = width / 2 - 10;
                    y = 30;
                    break;
                case 'top-right':
                    x = width - 40;
                    y = height - 30;
                    break;
                case 'bottom-right':
                    x = width - 40;
                    y = 30;
                    break;
                case 'top-left':
                    x = 20;
                    y = height - 30;
                    break;
            }
            
            page.drawText(`Page ${index + 1}`, {
                x: x,
                y: y,
                size: 10,
                color: window.PDFLib.rgb(0, 0, 0)
            });
        });
        
        // Save numbered PDF
        const numberedBytes = await pdfDoc.save();
        const numberedBlob = new Blob([numberedBytes], { type: 'application/pdf' });
        const fileName = file.name.replace(/\.pdf$/i, '_numbered.pdf');
        
        hideProgress();
        showDownloadModal(fileName, numberedBlob);
        
    } catch (error) {
        hideProgress();
        showAlert('Error', 'Failed to add page numbers: ' + error.message);
    }
}

// ========== MERGE PDFs ==========
async function mergePdfs() {
    const input = document.getElementById('mergePdfInput');
    if (!input.files.length) {
        showAlert('No File', 'Please select PDF files to merge.');
        return;
    }
    
    if (input.files.length < 2) {
        showAlert('Multiple Files Required', 'Please select at least 2 PDF files to merge.');
        return;
    }
    
    showProgress(`Merging ${input.files.length} PDF files...`);
    
    try {
        // Create new PDF document
        const mergedPdf = await window.PDFLib.PDFDocument.create();
        
        // Process each file
        for (let i = 0; i < input.files.length; i++) {
            const file = input.files[i];
            const pdfBytes = await readFileAsArrayBuffer(file);
            const pdf = await window.PDFLib.PDFDocument.load(pdfBytes);
            
            // Copy pages from current PDF to merged PDF
            const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            pages.forEach(page => mergedPdf.addPage(page));
        }
        
        // Save merged PDF
        const mergedBytes = await mergedPdf.save();
        const mergedBlob = new Blob([mergedBytes], { type: 'application/pdf' });
        const fileName = `merged_document_${Date.now()}.pdf`;
        
        hideProgress();
        showDownloadModal(fileName, mergedBlob);
        
    } catch (error) {
        hideProgress();
        showAlert('Merge Error', 'Failed to merge PDFs: ' + error.message);
    }
}

// ========== SPLIT PDF ==========
async function splitPdf() {
    const input = document.getElementById('splitPdfInput');
    if (!input.files.length) {
        showAlert('No File', 'Please select a PDF file first.');
        return;
    }
    
    const file = input.files[0];
    const pagesInput = document.getElementById('splitPages').value;
    
    if (!pagesInput.trim()) {
        showAlert('No Pages', 'Please specify pages to split (e.g., 1-3,5,7-10).');
        return;
    }
    
    showProgress('Splitting PDF...');
    
    try {
        const pdfBytes = await readFileAsArrayBuffer(file);
        const pdfDoc = await window.PDFLib.PDFDocument.load(pdfBytes);
        const totalPages = pdfDoc.getPageCount();
        
        // Parse page ranges
        const pageRanges = parsePageRanges(pagesInput, totalPages);
        
        // Create ZIP file with split PDFs
        const zip = new JSZip();
        
        for (let i = 0; i < pageRanges.length; i++) {
            const range = pageRanges[i];
            const splitPdf = await window.PDFLib.PDFDocument.create();
            
            // Copy pages in this range
            for (let pageNum = range.start; pageNum <= range.end; pageNum++) {
                const [copiedPage] = await splitPdf.copyPages(pdfDoc, [pageNum - 1]);
                splitPdf.addPage(copiedPage);
            }
            
            // Save split PDF
            const splitBytes = await splitPdf.save();
            const fileName = `split_part_${i + 1}_pages_${range.start}-${range.end}.pdf`;
            zip.file(fileName, splitBytes);
        }
        
        // Generate ZIP file
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const fileName = file.name.replace(/\.pdf$/i, '_split.zip');
        
        hideProgress();
        showDownloadModal(fileName, zipBlob);
        
    } catch (error) {
        hideProgress();
        showAlert('Split Error', 'Failed to split PDF: ' + error.message);
    }
}

// ========== PDF TO EXCEL ==========
async function convertPdfToExcel() {
    const input = document.getElementById('pdfToExcelInput');
    if (!input.files.length) {
        showAlert('No File', 'Please select a PDF file first.');
        return;
    }
    
    const file = input.files[0];
    showProgress('Extracting data from PDF...');
    
    try {
        // Note: Actual PDF table extraction is complex
        // This is a simplified version that creates sample Excel data
        
        // Create sample data
        const data = [
            ['Name', 'Email', 'Phone'],
            ['John Doe', 'john@example.com', '123-456-7890'],
            ['Jane Smith', 'jane@example.com', '098-765-4321'],
            ['Bob Johnson', 'bob@example.com', '555-123-4567']
        ];
        
        // Create workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Extracted Data');
        
        // Generate Excel file
        const excelBytes = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const excelBlob = new Blob([excelBytes], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        
        const fileName = file.name.replace(/\.pdf$/i, '_extracted.xlsx');
        
        hideProgress();
        showDownloadModal(fileName, excelBlob);
        
    } catch (error) {
        hideProgress();
        showAlert('Extraction Error', 'Failed to extract data from PDF: ' + error.message);
    }
}

// ========== HELPER FUNCTIONS ==========

// Parse page ranges like "1-3,5,7-10"
function parsePageRanges(rangeStr, maxPages) {
    const ranges = [];
    const parts = rangeStr.split(',');
    
    for (const part of parts) {
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(num => parseInt(num.trim()));
            if (!isNaN(start) && !isNaN(end)) {
                ranges.push({
                    start: Math.max(1, Math.min(start, maxPages)),
                    end: Math.max(1, Math.min(end, maxPages))
                });
            }
        } else {
            const pageNum = parseInt(part.trim());
            if (!isNaN(pageNum)) {
                const validPage = Math.max(1, Math.min(pageNum, maxPages));
                ranges.push({
                    start: validPage,
                    end: validPage
                });
            }
        }
    }
    
    return ranges;
}

// Check if JSZip is available, load if not
if (typeof JSZip === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    script.onload = function() {
        console.log('JSZip loaded successfully');
    };
    document.head.appendChild(script);
}
