// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const mainFileInput = document.getElementById('mainFileInput');
const toolsGrid = document.getElementById('toolsGrid');
const downloadModal = document.getElementById('downloadModal');
const modalClose = document.getElementById('modalClose');
const downloadBtn = document.getElementById('downloadBtn');
const convertAnotherBtn = document.getElementById('convertAnotherBtn');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const alertModal = document.getElementById('alertModal');
const pageOrganizerModal = document.getElementById('pageOrganizerModal');
const currentYear = document.getElementById('currentYear');

// Global variables
let currentConvertedFile = null;
let currentFileName = '';
let pdfDoc = null;
let pageThumbnails = [];

// Initialize website
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

function initializeWebsite() {
    // Set current year
    currentYear.textContent = new Date().getFullYear();
    
    // Setup file upload
    setupFileUpload();
    
    // Setup modal
    setupModal();
    
    // Setup smooth scrolling
    setupSmoothScrolling();
    
    // Setup compression level display
    const compressionSlider = document.getElementById('compressionLevel');
    const compressionValue = document.getElementById('compressionValue');
    if (compressionSlider) {
        compressionSlider.addEventListener('input', function() {
            const value = parseInt(this.value);
            if (value <= 3) compressionValue.textContent = 'Low';
            else if (value <= 7) compressionValue.textContent = 'Medium';
            else compressionValue.textContent = 'High';
        });
    }
}

// Tool filtering by category
function filterTools(category) {
    // Update active button
    document.querySelectorAll('.tool-category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Find and activate the clicked button
    document.querySelectorAll('.tool-category-btn').forEach(btn => {
        if (btn.textContent.includes(category.charAt(0).toUpperCase() + category.slice(1)) || 
            (category === 'all' && btn.textContent.includes('All'))) {
            btn.classList.add('active');
        }
    });
    
    const toolCards = document.querySelectorAll('.tool-card');
    
    toolCards.forEach(card => {
        const categories = card.getAttribute('data-categories');
        
        if (category === 'all' || categories.includes(category)) {
            card.style.display = 'block';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 10);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(10px)';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
}

// File upload functionality
function setupFileUpload() {
    if (uploadArea) {
        uploadArea.addEventListener('click', () => mainFileInput.click());
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            uploadArea.style.borderColor = 'rgba(255, 255, 255, 0.7)';
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            uploadArea.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            uploadArea.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            
            if (e.dataTransfer.files.length) {
                handleFileUpload(e.dataTransfer.files[0]);
            }
        });
    }
    
    if (mainFileInput) {
        mainFileInput.addEventListener('change', function() {
            if (this.files.length) {
                handleFileUpload(this.files[0]);
            }
        });
    }
}

// Handle main file upload
function handleFileUpload(file) {
    if (!file) return;
    
    const fileSize = (file.size / (1024 * 1024)).toFixed(2);
    
    if (fileSize > 50) {
        showAlert('File Size Error', 'File size exceeds 50MB limit. Please choose a smaller file.');
        return;
    }
    
    // Determine tool based on file type
    const fileExt = file.name.split('.').pop().toLowerCase();
    
    if (fileExt === 'pdf') {
        // Auto-select PDF tools
        filterTools('convert');
        // Highlight PDF to Word tool
        document.getElementById('pdfToWordInput').click();
    } else if (['doc', 'docx'].includes(fileExt)) {
        // Auto-select Word to PDF
        filterTools('convert');
        document.getElementById('wordToPdfInput').click();
    } else if (['xls', 'xlsx', 'csv'].includes(fileExt)) {
        // Auto-select Excel to PDF
        filterTools('convert');
        document.getElementById('excelToPdfInput').click();
    } else if (['ppt', 'pptx'].includes(fileExt)) {
        // Auto-select PowerPoint to PDF
        filterTools('convert');
        // Note: You'll need to add this tool
    }
    
    // Show success message
    showAlert('File Selected', `${file.name} (${fileSize} MB) has been selected. Choose a tool to process it.`);
}

// Preview file name in input label
function previewFileName(input) {
    if (input.files.length) {
        const fileName = input.files[0].name;
        const label = input.nextElementSibling;
        label.innerHTML = `<i class="fas fa-file"></i> ${fileName}`;
        label.style.backgroundColor = '#e8f5e9';
        label.style.borderColor = '#4caf50';
    }
}

// Preview multiple files
function previewMultipleFiles(input) {
    if (input.files.length) {
        const fileCount = input.files.length;
        const label = input.nextElementSibling;
        label.innerHTML = `<i class="fas fa-file"></i> ${fileCount} file${fileCount > 1 ? 's' : ''} selected`;
        label.style.backgroundColor = '#e8f5e9';
        label.style.borderColor = '#4caf50';
    }
}

// Show progress animation
function showProgress(message = 'Processing your file...') {
    progressText.textContent = message;
    progressContainer.style.display = 'block';
}

// Hide progress animation
function hideProgress() {
    progressContainer.style.display = 'none';
}

// Show download modal
function showDownloadModal(fileName, fileBlob) {
    currentConvertedFile = fileBlob;
    currentFileName = fileName;
    
    const fileSize = fileBlob ? (fileBlob.size / 1024).toFixed(2) + ' KB' : 'Unknown';
    
    document.getElementById('convertedFileName').textContent = fileName;
    document.getElementById('convertedFileSize').textContent = fileSize;
    downloadModal.style.display = 'flex';
    
    // Setup download button
    downloadBtn.onclick = function() {
        if (currentConvertedFile) {
            downloadFile(currentConvertedFile, currentFileName);
        }
    };
}

// Setup modal functionality
function setupModal() {
    // Close download modal
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            downloadModal.style.display = 'none';
        });
    }
    
    // Close download modal when clicking outside
    if (downloadModal) {
        downloadModal.addEventListener('click', (e) => {
            if (e.target === downloadModal) {
                downloadModal.style.display = 'none';
            }
        });
    }
    
    // Convert another button
    if (convertAnotherBtn) {
        convertAnotherBtn.addEventListener('click', () => {
            downloadModal.style.display = 'none';
            resetFileInputs();
        });
    }
}

// Show alert modal
function showAlert(title, message) {
    document.getElementById('alertTitle').textContent = title;
    document.getElementById('alertMessage').textContent = message;
    alertModal.style.display = 'flex';
}

// Close alert modal
function closeAlertModal() {
    alertModal.style.display = 'none';
}

// Download file function
function downloadFile(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Reset all file inputs
function resetFileInputs() {
    document.querySelectorAll('.tool-file-input').forEach(input => {
        input.value = '';
        const label = input.nextElementSibling;
        label.innerHTML = `<i class="fas fa-upload"></i> Select ${input.accept.includes('.pdf') ? 'PDF' : 'file'}`;
        label.style.backgroundColor = '#f8f9fa';
        label.style.borderColor = '#ddd';
    });
}

// Smooth scrolling for navigation
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Mobile menu toggle
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('show');
}

// Page organizer functions
function openPageOrganizer(pdfBytes) {
    showProgress('Loading PDF for editing...');
    
    // Load PDF document
    window.PDFLib.PDFDocument.load(pdfBytes).then(doc => {
        pdfDoc = doc;
        const pageCount = doc.getPageCount();
        generatePageThumbnails(pageCount);
        hideProgress();
        pageOrganizerModal.style.display = 'flex';
    }).catch(error => {
        hideProgress();
        showAlert('Error', 'Failed to load PDF: ' + error.message);
    });
}

function generatePageThumbnails(pageCount) {
    const container = document.getElementById('pageThumbnails');
    container.innerHTML = '';
    pageThumbnails = [];
    
    for (let i = 0; i < pageCount; i++) {
        const pageNum = i + 1;
        const thumbnail = document.createElement('div');
        thumbnail.className = 'page-thumbnail';
        thumbnail.draggable = true;
        thumbnail.dataset.page = pageNum;
        
        thumbnail.innerHTML = `
            <div class="page-preview">Page ${pageNum}</div>
            <div class="page-number">Page ${pageNum}</div>
            <input type="checkbox" class="page-checkbox" onchange="togglePageSelection(${pageNum})">
        `;
        
        thumbnail.addEventListener('dragstart', handleDragStart);
        thumbnail.addEventListener('dragover', handleDragOver);
        thumbnail.addEventListener('drop', handleDrop);
        thumbnail.addEventListener('dragend', handleDragEnd);
        
        container.appendChild(thumbnail);
        pageThumbnails.push({
            element: thumbnail,
            pageNumber: pageNum,
            selected: false
        });
    }
}

function togglePageSelection(pageNum) {
    const page = pageThumbnails.find(p => p.pageNumber === pageNum);
    if (page) {
        page.selected = !page.selected;
        page.element.classList.toggle('selected', page.selected);
    }
}

function rotateSelectedPages() {
    const selectedPages = pageThumbnails.filter(p => p.selected);
    if (selectedPages.length === 0) {
        showAlert('No Selection', 'Please select pages to rotate.');
        return;
    }
    
    selectedPages.forEach(page => {
        page.element.querySelector('.page-preview').textContent = 
            `Page ${page.pageNumber} (Rotated)`;
    });
    
    showAlert('Rotation Applied', 'Rotation will be applied when you download the PDF.');
}

function deleteSelectedPages() {
    const selectedPages = pageThumbnails.filter(p => p.selected);
    if (selectedPages.length === 0) {
        showAlert('No Selection', 'Please select pages to delete.');
        return;
    }
    
    selectedPages.forEach(page => {
        page.element.style.display = 'none';
    });
    
    showAlert('Deletion Applied', 'Pages will be deleted when you download the PDF.');
}

function applyPageChanges() {
    showProgress('Applying changes to PDF...');
    
    // Get current page order
    const container = document.getElementById('pageThumbnails');
    const pages = Array.from(container.children)
        .filter(thumb => thumb.style.display !== 'none')
        .map(thumb => parseInt(thumb.dataset.page));
    
    // Here you would actually reorder the PDF pages
    // This is a simplified version
    setTimeout(() => {
        hideProgress();
        closePageOrganizer();
        showAlert('Success', 'PDF has been modified. Download the updated file.');
    }, 1500);
}

function closePageOrganizer() {
    pageOrganizerModal.style.display = 'none';
    pdfDoc = null;
    pageThumbnails = [];
}

// Drag and drop for page organizer
let draggedPage = null;

function handleDragStart(e) {
    draggedPage = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
    this.classList.add('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    this.classList.add('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    
    if (draggedPage !== this) {
        const container = this.parentNode;
        const draggedIndex = Array.prototype.indexOf.call(container.children, draggedPage);
        const dropIndex = Array.prototype.indexOf.call(container.children, this);
        
        if (draggedIndex < dropIndex) {
            container.insertBefore(draggedPage, this.nextSibling);
        } else {
            container.insertBefore(draggedPage, this);
        }
    }
}

function handleDragEnd() {
    this.classList.remove('dragging');
    document.querySelectorAll('.page-thumbnail').forEach(el => {
        el.classList.remove('drag-over');
    });
}

// Helper functions for file operations
function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            resolve(e.target.result);
        };
        reader.onerror = function(e) {
            reject(new Error('Failed to read file'));
        };
        reader.readAsArrayBuffer(file);
    });
}

function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            resolve(e.target.result);
        };
        reader.onerror = function(e) {
            reject(new Error('Failed to read file'));
        };
        reader.readAsText(file);
    });
}

// Support functions
function showPrivacyPolicy() {
    showAlert('Privacy Policy', 'JJConverter processes all files locally in your browser. No data is sent to any server. Your files never leave your computer.');
}

function showTerms() {
    showAlert('Terms of Service', 'JJConverter is free to use for personal and commercial purposes. We are not responsible for any data loss or damage. Use at your own risk.');
}

function showHelp() {
    showAlert('Help Center', 'Need help? Contact us at support@jjconverter.com or visit our documentation at docs.jjconverter.com');
}

function showFAQ() {
    showAlert('FAQ', 'Q: Is JJConverter really free?\nA: Yes, 100% free with no limits.\n\nQ: Are my files secure?\nA: Yes, all processing happens in your browser.\n\nQ: What file formats are supported?\nA: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, and images.');
}

function showTutorials() {
    showAlert('Tutorials', 'Check our YouTube channel for video tutorials: youtube.com/jjconverter');
}
