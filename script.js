// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const toolsGrid = document.getElementById('toolsGrid');
const toolCategoryBtns = document.querySelectorAll('.tool-category-btn');
const downloadModal = document.getElementById('downloadModal');
const modalClose = document.getElementById('modalClose');
const downloadBtn = document.getElementById('downloadBtn');
const convertAnotherBtn = document.getElementById('convertAnotherBtn');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');

// Tool data for filtering
const toolCards = document.querySelectorAll('.tool-card');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

// Initialize website
function initializeWebsite() {
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Setup tool filtering
    setupToolFiltering();
    
    // Setup file upload
    setupFileUpload();
    
    // Setup modal
    setupModal();
    
    // Setup smooth scrolling
    setupSmoothScrolling();
}

// Tool filtering by category
function setupToolFiltering() {
    toolCategoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active button
            toolCategoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.getAttribute('data-category');
            
            // Filter tools
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
        });
    });
}

// File upload functionality
function setupFileUpload() {
    // Main upload area
    if (uploadArea) {
        uploadArea.addEventListener('click', () => fileInput.click());
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
    
    // Individual tool file inputs
    document.querySelectorAll('.tool-file-input').forEach(input => {
        input.addEventListener('change', function() {
            if (this.files.length) {
                const fileName = this.files[0].name;
                const label = this.nextElementSibling;
                label.innerHTML = `<i class="fas fa-file"></i> ${fileName}`;
                label.style.backgroundColor = '#e8f5e9';
                label.style.borderColor = '#4caf50';
            }
        });
    });
}

// Handle file upload
function handleFileUpload(file) {
    if (file) {
        const fileSize = (file.size / (1024 * 1024)).toFixed(2);
        
        if (fileSize > 50) {
            alert('File size exceeds 50MB limit. Please choose a smaller file.');
            return;
        }
        
        // Show processing animation
        showProgress();
        
        // Simulate file processing (replace with actual API call)
        setTimeout(() => {
            hideProgress();
            showDownloadModal(file.name);
        }, 2000);
    }
}

// Convert file function (to be replaced with actual backend integration)
function convertFile(toolType) {
    const inputId = `${toolType}Input`;
    const fileInput = document.getElementById(inputId);
    
    if (!fileInput || !fileInput.files.length) {
        alert('Please select a file first.');
        return;
    }
    
    const file = fileInput.files[0];
    const fileSize = (file.size / (1024 * 1024)).toFixed(2);
    
    if (fileSize > 50) {
        alert('File size exceeds 50MB limit. Please choose a smaller file.');
        return;
    }
    
    // Show processing animation
    showProgress();
    
    // Simulate conversion process (replace with actual API call)
    setTimeout(() => {
        hideProgress();
        
        // Determine output file extension based on tool type
        let outputExt = '.pdf';
        if (toolType === 'pdfToWord') outputExt = '.docx';
        if (toolType === 'pdfToPpt') outputExt = '.pptx';
        if (toolType === 'pdfToExcel') outputExt = '.xlsx';
        
        const originalName = file.name.replace(/\.[^/.]+$/, "");
        const outputFileName = `${originalName}_converted${outputExt}`;
        
        showDownloadModal(outputFileName);
    }, 2500);
}

// Show progress animation
function showProgress() {
    progressContainer.style.display = 'block';
}

// Hide progress animation
function hideProgress() {
    progressContainer.style.display = 'none';
}

// Show download modal
function showDownloadModal(fileName) {
    document.getElementById('convertedFileName').textContent = fileName;
    downloadModal.style.display = 'flex';
}

// Setup modal functionality
function setupModal() {
    // Close modal
    modalClose.addEventListener('click', () => {
        downloadModal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    downloadModal.addEventListener('click', (e) => {
        if (e.target === downloadModal) {
            downloadModal.style.display = 'none';
        }
    });
    
    // Download button
    downloadBtn.addEventListener('click', () => {
        // In a real application, this would download the actual converted file
        // For demo purposes, we'll create a dummy download
        const fileName = document.getElementById('convertedFileName').textContent;
        const dummyContent = 'This is a demo file. In a real application, this would be your converted document.';
        const blob = new Blob([dummyContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Close modal after download
        setTimeout(() => {
            downloadModal.style.display = 'none';
        }, 1000);
    });
    
    // Convert another button
    convertAnotherBtn.addEventListener('click', () => {
        downloadModal.style.display = 'none';
        
        // Reset all file inputs
        document.querySelectorAll('.tool-file-input').forEach(input => {
            input.value = '';
            const label = input.nextElementSibling;
            label.innerHTML = '<i class="fas fa-upload"></i> Select file';
            label.style.backgroundColor = '#f8f9fa';
            label.style.borderColor = '#ddd';
        });
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

// Mobile menu toggle (to be implemented in next version)
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
}

// Add event listener for mobile menu button
document.querySelector('.mobile-menu-btn')?.addEventListener('click', toggleMobileMenu);

// Language selector functionality (to be implemented in next version)
document.querySelector('.language-selector')?.addEventListener('click', function() {
    alert('Language selection will be implemented in the next version.');
});

// SEO optimization - Update page title based on tool
function updatePageTitle(toolName) {
    document.title = `${toolName} | JJConverter - Free Online PDF Tools`;
}

// Initialize tooltips (to be implemented with a proper library)
function initTooltips() {
    // This would initialize tooltips for better UX
}

// Handle browser resize
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        const navMenu = document.querySelector('.nav-menu');
        navMenu.style.display = 'flex';
    }
});

// Sample function to show how backend integration would work
function uploadToBackend(file, toolType) {
    /*
    // This is where you would integrate with your actual backend
    // Example using Fetch API:
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tool', toolType);
    
    fetch('/api/convert', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show download link
            showDownloadModal(data.downloadUrl, data.fileName);
        } else {
            alert('Conversion failed: ' + data.message);
        }
        hideProgress();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred during conversion.');
        hideProgress();
    });
    */
}
