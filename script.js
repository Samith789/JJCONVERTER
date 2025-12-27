// script.js - Main functionality for JJConverter

document.addEventListener('DOMContentLoaded', function() {
    console.log('JJConverter loaded!');
    
    // Initialize
    initFileUpload();
    initToolSelection();
    initProgressListener();
});

let selectedFile = null;
let currentTool = 'pdf-to-word';

function initFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const uploadBox = document.getElementById('uploadBox');
    
    if (!fileInput || !uploadBox) return;
    
    // File input change
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });
    
    // Drag and drop
    uploadBox.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.currentTarget.style.borderColor = '#4a6fa5';
        e.currentTarget.style.background = '#f0f4ff';
    });
    
    uploadBox.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.currentTarget.style.borderColor = '#ddd';
        e.currentTarget.style.background = 'white';
    });
    
    uploadBox.addEventListener('drop', function(e) {
        e.preventDefault();
        e.currentTarget.style.borderColor = '#ddd';
        e.currentTarget.style.background = 'white';
        
        if (e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    });
}

function initToolSelection() {
    document.querySelectorAll('.tool-card').forEach(card => {
        card.addEventListener('click', function() {
            // Get tool name from data attribute or text
            const tool = this.getAttribute('data-tool') || 
                        this.querySelector('.tool-title').textContent
                            .toLowerCase()
                            .replace(/\s+/g, '-')
                            .replace('pdf-to-word-(ocr)', 'pdf-to-word-ocr');
            
            selectTool(tool);
        });
    });
}

function initProgressListener() {
    window.addEventListener('api-progress', function(e) {
        updateProgress(e.detail.message, e.detail.percent);
    });
}

function handleFileSelect(file) {
    // Validate file
    if (!validateFile(file)) {
        return;
    }
    
    selectedFile = file;
    
    // Update UI to show selected file
    document.getElementById('uploadBox').innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <i class="fas fa-check-circle" style="font-size: 50px; color: #28a745; margin-bottom: 15px;"></i>
            <h3 style="color: #2c3e50;">File Selected</h3>
            <p><strong>${file.name}</strong></p>
            <p>Size: ${formatFileSize(file.size)}</p>
            <div style="margin-top: 25px;">
                <button onclick="startRealConversion()" class="upload-btn">
                    <i class="fas fa-sync-alt"></i> Convert Now
                </button>
                <button onclick="cancelSelection()" style="background: #6c757d; color: white; border: none; padding: 12px 24px; border-radius: 8px; margin-left: 10px; cursor: pointer;">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </div>
    `;
}

function validateFile(file) {
    // Check file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
        alert('File is too large! Maximum size is 100MB.');
        return false;
    }
    
    // Check file type
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png'];
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedExtensions.includes(fileExt)) {
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
    
    // Highlight selected tool
    document.querySelectorAll('.tool-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
    
    // If file already selected, show convert button
    if (selectedFile) {
        alert(`Tool selected: ${tool.replace(/-/g, ' ').toUpperCase()}\n\nClick "Convert Now" to start conversion.`);
    } else {
        alert(`Selected: ${tool.replace(/-/g, ' ').toUpperCase()}\n\nPlease select a file to convert.`);
        document.getElementById('fileInput').click();
    }
}

async function startRealConversion() {
    if (!selectedFile) {
        alert('Please select a file first!');
        return;
    }
    
    // Show conversion modal
    showConversionModal();
    
    // Update modal text
    document.getElementById('selectedTool').innerHTML = `
        <strong>Converting:</strong> ${selectedFile.name}<br>
        <strong>Tool:</strong> ${currentTool.replace(/-/g, ' ').toUpperCase()}
    `;
    
    try {
        // Use the API for real conversion
        const result = await window.JJConverterAPI.convertFile(selectedFile, currentTool);
        
        if (result.success) {
            // Show download button
            const downloadBtn = document.getElementById('downloadBtn');
            downloadBtn.style.display = 'block';
            downloadBtn.setAttribute('data-url', result.downloadUrl);
            downloadBtn.setAttribute('data-filename', result.fileName);
            downloadBtn.setAttribute('data-is-demo', result.isDemo);
            
            // Update progress message
            if (result.isDemo) {
                document.getElementById('progressText').innerHTML = `
                    Demo conversion complete!<br>
                    <small style="color: #ff7b54;">
                        ⚠️ Add API key for real conversion with exact formatting
                    </small>
                `;
            } else {
                document.getElementById('progressText').textContent = 'Real conversion complete!';
            }
            
        } else {
            document.getElementById('progressText').textContent = `Error: ${result.error}`;
        }
        
    } catch (error) {
        document.getElementById('progressText').textContent = `Conversion failed: ${error.message}`;
    }
}

function showConversionModal() {
    document.getElementById('conversionModal').style.display = 'flex';
    document.getElementById('progress').style.width = '0%';
    document.getElementById('downloadBtn').style.display = 'none';
    document.getElementById('progressText').textContent = 'Starting conversion...';
    
    // Start progress animation
    simulateProgress();
}

function simulateProgress() {
    let progress = 0;
    const interval = setInterval(() => {
        progress += 1;
        document.getElementById('progress').style.width = progress + '%';
        
        if (progress >= 100) {
            clearInterval(interval);
        }
    }, 50);
}

function updateProgress(message, percent) {
    document.getElementById('progressText').textContent = message;
    document.getElementById('progress').style.width = percent + '%';
}

function downloadFile() {
    const btn = document.getElementById('downloadBtn');
    const url = btn.getAttribute('data-url');
    const filename = btn.getAttribute('data-filename');
    const isDemo = btn.getAttribute('data-is-demo') === 'true';
    
    if (url.startsWith('blob:') || url.startsWith('data:')) {
        // Local blob or data URL
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else if (url.startsWith('http')) {
        // External URL from API
        window.open(url, '_blank');
    } else {
        // Fallback
        alert('Downloading: ' + filename);
    }
    
    // Show message if demo
    if (isDemo) {
        setTimeout(() => {
            showUpgradeMessage();
        }, 1000);
    }
    
    closeModal();
}

function showUpgradeMessage() {
    const message = `
        ⚠️ DEMO VERSION
        
        You downloaded a demo file.
        
        For REAL conversion with:
        ✅ Exact formatting preserved
        ✅ Tables converted perfectly  
        ✅ Fonts and styles kept
        ✅ Images included
        ✅ Layout maintained
        
        Get FREE API key (500 conversions/month):
        1. Go to: https://pdf.co/register
        2. Sign up for free
        3. Get API key
        4. Paste in api.js file
        
        Need help? Email: JJconverter@gmail.com
    `;
    
    alert(message);
}

function cancelSelection() {
    selectedFile = null;
    resetUploadBox();
}

function resetUploadBox() {
    document.getElementById('uploadBox').innerHTML = `
        <div class="upload-icon">
            <i class="fas fa-cloud-upload-alt"></i>
        </div>
        <h2>Select Your PDF File</h2>
        <p class="upload-text">Drag & drop your file here or click to browse</p>
        <button class="upload-btn" onclick="document.getElementById('fileInput').click()">
            <i class="fas fa-folder-open"></i> Choose File
        </button>
        <p class="file-size-note">Maximum file size: 100 MB</p>
        <input type="file" id="fileInput" style="display: none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png">
    `;
    
    // Reinitialize
    initFileUpload();
}

function closeModal() {
    document.getElementById('conversionModal').style.display = 'none';
}
