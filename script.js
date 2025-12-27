// script.js - Main website functionality

document.addEventListener('DOMContentLoaded', function() {
    // File upload handling
    const fileInput = document.getElementById('fileInput');
    const uploadBox = document.getElementById('uploadBox');
    
    // Tool selection
    const toolCards = document.querySelectorAll('.tool-card');
    toolCards.forEach(card => {
        card.addEventListener('click', function() {
            const tool = this.getAttribute('data-tool') || 
                        this.querySelector('.tool-title').textContent.toLowerCase().replace(/\s+/g, '-');
            selectTool(tool);
        });
    });
    
    // Drag and drop
    uploadBox.addEventListener('dragover', handleDragOver);
    uploadBox.addEventListener('dragleave', handleDragLeave);
    uploadBox.addEventListener('drop', handleDrop);
    
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Progress listener
    window.addEventListener('conversion-progress', function(e) {
        updateProgress(e.detail.message, e.detail.percent);
    });
});

let selectedFile = null;
let currentTool = 'pdf-to-word';

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.borderColor = '#f40f3e';
    e.currentTarget.style.background = '#fff5f5';
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.borderColor = '#ddd';
    e.currentTarget.style.background = 'white';
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
    
    e.currentTarget.style.borderColor = '#ddd';
    e.currentTarget.style.background = 'white';
}

function handleFileSelect(e) {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
}

function handleFile(file) {
    // Validate file
    if (!validateFile(file)) {
        return;
    }
    
    selectedFile = file;
    
    // Show file info
    document.getElementById('uploadBox').innerHTML = `
        <div style="text-align: center;">
            <i class="fas fa-file" style="font-size: 50px; color: #f40f3e; margin-bottom: 20px;"></i>
            <h3>${file.name}</h3>
            <p>Size: ${formatFileSize(file.size)}</p>
            <button onclick="startRealConversion()" class="upload-btn" style="margin-top: 20px;">
                <i class="fas fa-sync-alt"></i> Convert Now
            </button>
            <button onclick="cancelSelection()" style="background: #666; color: white; border: none; padding: 10px 20px; border-radius: 5px; margin-left: 10px; cursor: pointer;">
                <i class="fas fa-times"></i> Cancel
            </button>
        </div>
    `;
}

function validateFile(file) {
    const maxSize = 100 * 1024 * 1024; // 100MB
    
    if (file.size > maxSize) {
        alert('File is too large! Maximum size is 100MB.');
        return false;
    }
    
    // Check file extension
    const allowedExtensions = /(\.pdf|\.doc|\.docx|\.xls|\.xlsx|\.ppt|\.pptx|\.jpg|\.jpeg|\.png)$/i;
    if (!allowedExtensions.exec(file.name)) {
        alert('Please upload a valid file (PDF, Word, Excel, PowerPoint, or Image).');
        return false;
    }
    
    return true;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function selectTool(tool) {
    currentTool = tool;
    
    // Update UI
    toolCards = document.querySelectorAll('.tool-card');
    toolCards.forEach(card => card.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    
    // Show upload prompt
    alert(`Selected: ${tool.replace(/-/g, ' ').toUpperCase()}\n\nPlease select a file to convert.`);
    document.getElementById('fileInput').click();
}

async function startRealConversion() {
    if (!selectedFile) {
        alert('Please select a file first!');
        return;
    }
    
    // Parse format from tool name
    const [fromFormat, toFormat] = currentTool.split('-to-');
    
    if (!fromFormat || !toFormat) {
        alert('Invalid tool selection');
        return;
    }
    
    // Show conversion modal
    showConversionModal();
    
    try {
        // Use the API
        const result = await window.JJConverterAPI.convertFile(
            selectedFile,
            fromFormat,
            toFormat
        );
        
        if (result.success) {
            if (result.isDemo) {
                // Demo mode
                document.getElementById('progressText').innerHTML = `
                    ${result.message}<br><br>
                    <small>For real conversion, sign up at:</small><br>
                    <a href="https://pdf.co/register" target="_blank" style="color: #f40f3e;">PDF.co (500 free/month)</a> or 
                    <a href="https://cloudconvert.com/signup" target="_blank" style="color: #f40f3e;">CloudConvert (25 free/month)</a>
                `;
            }
            
            // Show download button
            document.getElementById('downloadBtn').style.display = 'block';
            document.getElementById('downloadBtn').setAttribute('data-url', result.downloadUrl);
            document.getElementById('downloadBtn').setAttribute('data-filename', result.fileName || 'converted-file');
            
        } else {
            document.getElementById('progressText').textContent = `Error: ${result.error}`;
        }
        
    } catch (error) {
        document.getElementById('progressText').textContent = `Conversion failed: ${error.message}`;
    }
}

function showConversionModal() {
    document.getElementById('conversionModal').style.display = 'flex';
    document.getElementById('selectedTool').textContent = 
        `Converting ${selectedFile.name} using ${currentTool.replace(/-/g, ' ').toUpperCase()}`;
    
    // Reset progress
    updateProgress('Starting conversion...', 0);
}

function updateProgress(message, percent) {
    document.getElementById('progressText').textContent = message;
    document.getElementById('progress').style.width = percent + '%';
}

function downloadConvertedFile() {
    const btn = document.getElementById('downloadBtn');
    const url = btn.getAttribute('data-url');
    const filename = btn.getAttribute('data-filename');
    
    if (url.startsWith('#demo-')) {
        // Demo download - create dummy file
        const content = 'This is a demo converted file.\n\nFor real conversion, sign up for an API key.\n\nJJConverter - Free PDF Tools';
        const blob = new Blob([content], { type: 'text/plain' });
        const demoUrl = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = demoUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(demoUrl);
    } else {
        // Real download
        window.open(url, '_blank');
    }
    
    // Show thank you message
    setTimeout(() => {
        alert('Thank you for using JJConverter!\n\nConsider supporting us by:\n1. Sharing with friends\n2. Disabling ad blocker\n3. Trying premium features');
    }, 1000);
}

function cancelSelection() {
    selectedFile = null;
    document.getElementById('uploadBox').innerHTML = `
        <div class="upload-icon">
            <i class="fas fa-cloud-upload-alt"></i>
        </div>
        <h2>Select PDF file</h2>
        <p class="upload-text">or drag and drop here</p>
        <button class="upload-btn" onclick="document.getElementById('fileInput').click()">
            <i class="fas fa-folder-open"></i> Choose File
        </button>
        <p style="margin-top: 15px; color: #999; font-size: 14px;">Maximum file size 100 MB</p>
        <input type="file" id="fileInput" style="display: none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png">
    `;
    
    // Re-attach event listeners
    const newFileInput = document.getElementById('fileInput');
    newFileInput.addEventListener('change', handleFileSelect);
}
