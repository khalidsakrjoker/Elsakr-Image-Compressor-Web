/**
 * Elsakr Image Compressor - Web Version
 * 100% Client-Side Image Compression
 * Uses Canvas API for image processing
 */

class ImageCompressor {
    constructor() {
        this.images = [];
        this.quality = 80;
        this.convertToWebp = false;
        
        this.initElements();
        this.bindEvents();
    }
    
    initElements() {
        this.dropZone = document.getElementById('dropZone');
        this.fileInput = document.getElementById('fileInput');
        this.qualitySlider = document.getElementById('qualitySlider');
        this.qualityValue = document.getElementById('qualityValue');
        this.convertWebpCheck = document.getElementById('convertWebp');
        this.resultsSection = document.getElementById('resultsSection');
        this.imageList = document.getElementById('imageList');
        this.clearAllBtn = document.getElementById('clearAll');
        this.downloadAllBtn = document.getElementById('downloadAll');
        this.totalOriginal = document.getElementById('totalOriginal');
        this.totalCompressed = document.getElementById('totalCompressed');
        this.totalSaved = document.getElementById('totalSaved');
    }
    
    bindEvents() {
        // Drop zone events
        this.dropZone.addEventListener('click', () => this.fileInput.click());
        this.dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.dropZone.addEventListener('dragleave', () => this.dropZone.classList.remove('dragover'));
        this.dropZone.addEventListener('drop', (e) => this.handleDrop(e));
        
        // File input
        this.fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));
        
        // Quality slider
        this.qualitySlider.addEventListener('input', (e) => {
            this.quality = parseInt(e.target.value);
            this.qualityValue.textContent = `${this.quality}%`;
        });
        
        // Convert to WebP
        this.convertWebpCheck.addEventListener('change', (e) => {
            this.convertToWebp = e.target.checked;
        });
        
        // Clear all
        this.clearAllBtn.addEventListener('click', () => this.clearAll());
        
        // Download all
        this.downloadAllBtn.addEventListener('click', () => this.downloadAll());
    }
    
    handleDragOver(e) {
        e.preventDefault();
        this.dropZone.classList.add('dragover');
    }
    
    handleDrop(e) {
        e.preventDefault();
        this.dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        this.handleFiles(files);
    }
    
    handleFiles(files) {
        const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
        
        for (const file of files) {
            if (validTypes.includes(file.type)) {
                this.compressImage(file);
            }
        }
    }
    
    async compressImage(file) {
        const id = Date.now() + Math.random().toString(36).substr(2, 9);
        
        // Create image entry
        const imageData = {
            id,
            name: file.name,
            originalSize: file.size,
            compressedSize: 0,
            originalBlob: file,
            compressedBlob: null,
            preview: null
        };
        
        this.images.push(imageData);
        this.renderImageItem(imageData);
        this.showResults();
        
        try {
            // Load image
            const img = await this.loadImage(file);
            
            // Create canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Draw image
            ctx.drawImage(img, 0, 0);
            
            // Determine output format and quality
            let outputType = file.type;
            let quality = this.quality / 100;
            
            if (this.convertToWebp) {
                outputType = 'image/webp';
            }
            
            // For PNG, we can't really compress with canvas quality
            // So we convert to a lossy format for better compression
            if (file.type === 'image/png' && !this.convertToWebp) {
                // PNG compression via color reduction simulation
                // Canvas doesn't support true PNG quantization, so we use WebP internally
                // But output as PNG for better compatibility
                
                // First compress as WebP
                const webpBlob = await this.canvasToBlob(canvas, 'image/webp', quality);
                
                // If WebP is smaller, use it; otherwise use original PNG approach
                if (webpBlob.size < file.size * 0.9) {
                    // Convert WebP back through canvas to get "optimized" PNG
                    const webpImg = await this.loadImage(webpBlob);
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(webpImg, 0, 0);
                }
                
                // Output as PNG
                const blob = await this.canvasToBlob(canvas, 'image/png', 1);
                imageData.compressedBlob = blob;
            } else {
                // JPEG or WebP - direct quality compression
                const blob = await this.canvasToBlob(canvas, outputType, quality);
                imageData.compressedBlob = blob;
            }
            
            // Update sizes
            imageData.compressedSize = imageData.compressedBlob.size;
            imageData.preview = URL.createObjectURL(imageData.compressedBlob);
            
            // Update UI
            this.updateImageItem(imageData);
            this.updateStats();
            
        } catch (error) {
            console.error('Error compressing image:', error);
            this.removeImage(id);
        }
    }
    
    loadImage(source) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            
            if (source instanceof Blob) {
                img.src = URL.createObjectURL(source);
            } else {
                img.src = source;
            }
        });
    }
    
    canvasToBlob(canvas, type, quality) {
        return new Promise((resolve) => {
            canvas.toBlob(resolve, type, quality);
        });
    }
    
    renderImageItem(imageData) {
        const item = document.createElement('div');
        item.className = 'image-item flex flex-wrap sm:flex-nowrap items-center gap-4 p-3 sm:p-4 bg-dark-card rounded-xl border border-slate-800 hover:border-blue-500 transition-all';
        item.id = `image-${imageData.id}`;
        
        item.innerHTML = `
            <img class="image-preview w-12 h-12 rounded-lg object-cover bg-dark-input flex-shrink-0" src="" alt="${imageData.name}">
            <div class="image-info flex-1 min-w-0 w-full sm:w-auto">
                <div class="image-name text-sm font-medium truncate">${imageData.name}</div>
                <div class="image-sizes flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span class="original-size">${this.formatSize(imageData.originalSize)}</span>
                    <span class="text-blue-400">→</span>
                    <span class="compressed-size">Compressing...</span>
                </div>
                <div class="image-progress h-1 bg-dark-input rounded mt-2 overflow-hidden">
                    <div class="image-progress-bar h-full bg-blue-500 rounded transition-all" style="width: 50%"></div>
                </div>
            </div>
            <div class="image-savings text-sm font-bold text-emerald-400 min-w-[50px] text-right">...</div>
            <div class="image-actions flex gap-2 flex-shrink-0">
                <button class="image-btn download w-9 h-9 flex items-center justify-center rounded-lg bg-dark-input text-slate-400 hover:bg-blue-500 hover:text-white transition-all disabled:opacity-50" title="Download" disabled>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                </button>
                <button class="image-btn remove w-9 h-9 flex items-center justify-center rounded-lg bg-dark-input text-slate-400 hover:bg-red-500 hover:text-white transition-all" title="Remove">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        `;
        
        // Create preview from original
        const reader = new FileReader();
        reader.onload = (e) => {
            item.querySelector('.image-preview').src = e.target.result;
        };
        reader.readAsDataURL(imageData.originalBlob);
        
        // Bind remove button
        item.querySelector('.remove').addEventListener('click', () => {
            this.removeImage(imageData.id);
        });
        
        this.imageList.appendChild(item);
    }
    
    updateImageItem(imageData) {
        const item = document.getElementById(`image-${imageData.id}`);
        if (!item) return;
        
        const savings = ((imageData.originalSize - imageData.compressedSize) / imageData.originalSize) * 100;
        
        // Update preview with compressed version
        if (imageData.preview) {
            item.querySelector('.image-preview').src = imageData.preview;
        }
        
        // Update sizes
        item.querySelector('.compressed-size').textContent = this.formatSize(imageData.compressedSize);
        
        // Update savings
        const savingsEl = item.querySelector('.image-savings');
        if (savings > 0) {
            savingsEl.textContent = `-${savings.toFixed(0)}%`;
            savingsEl.style.color = 'var(--success)';
        } else {
            savingsEl.textContent = '0%';
            savingsEl.style.color = 'var(--text-muted)';
        }
        
        // Hide progress, show complete
        item.querySelector('.image-progress').style.display = 'none';
        
        // Enable download button
        const downloadBtn = item.querySelector('.download');
        downloadBtn.disabled = false;
        downloadBtn.addEventListener('click', () => {
            this.downloadSingle(imageData);
        });
        
        // Update filename if converted to WebP
        if (this.convertToWebp && !imageData.name.endsWith('.webp')) {
            const newName = imageData.name.replace(/\.[^.]+$/, '.webp');
            imageData.name = newName;
            item.querySelector('.image-name').textContent = newName;
        }
    }
    
    removeImage(id) {
        const index = this.images.findIndex(img => img.id === id);
        if (index > -1) {
            // Revoke object URLs
            if (this.images[index].preview) {
                URL.revokeObjectURL(this.images[index].preview);
            }
            this.images.splice(index, 1);
        }
        
        const item = document.getElementById(`image-${id}`);
        if (item) {
            item.remove();
        }
        
        this.updateStats();
        
        if (this.images.length === 0) {
            this.hideResults();
        }
    }
    
    clearAll() {
        // Revoke all object URLs
        this.images.forEach(img => {
            if (img.preview) {
                URL.revokeObjectURL(img.preview);
            }
        });
        
        this.images = [];
        this.imageList.innerHTML = '';
        this.hideResults();
        this.updateStats();
    }
    
    showResults() {
        this.resultsSection.classList.remove('hidden');
    }
    
    hideResults() {
        this.resultsSection.classList.add('hidden');
    }
    
    updateStats() {
        const totalOrig = this.images.reduce((sum, img) => sum + img.originalSize, 0);
        const totalComp = this.images.reduce((sum, img) => sum + (img.compressedSize || 0), 0);
        const savings = totalOrig > 0 ? ((totalOrig - totalComp) / totalOrig) * 100 : 0;
        
        this.totalOriginal.textContent = this.formatSize(totalOrig);
        this.totalCompressed.textContent = this.formatSize(totalComp);
        this.totalSaved.textContent = `${savings.toFixed(0)}%`;
    }
    
    formatSize(bytes) {
        if (bytes === 0) return '0 KB';
        
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return `${size.toFixed(1)} ${units[unitIndex]}`;
    }
    
    downloadSingle(imageData) {
        if (!imageData.compressedBlob) return;
        
        const filename = this.convertToWebp && !imageData.name.endsWith('.webp')
            ? imageData.name.replace(/\.[^.]+$/, '.webp')
            : imageData.name.replace(/\.([^.]+)$/, '_compressed.$1');
        
        saveAs(imageData.compressedBlob, filename);
    }
    
    async downloadAll() {
        if (this.images.length === 0) return;
        
        const zip = new JSZip();
        
        for (const imageData of this.images) {
            if (imageData.compressedBlob) {
                const filename = this.convertToWebp && !imageData.name.endsWith('.webp')
                    ? imageData.name.replace(/\.[^.]+$/, '.webp')
                    : imageData.name.replace(/\.([^.]+)$/, '_compressed.$1');
                
                zip.file(filename, imageData.compressedBlob);
            }
        }
        
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, 'compressed_images.zip');
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    new ImageCompressor();
});
