# 🗜️ Elsakr Image Compressor - Web Version

> Compress images online, 100% locally in your browser. Your images never leave your device.

🔗 **Live Demo:** [https://khalidsakrjoker.github.io/Elsakr-Image-Compressor-Web/](https://khalidsakrjoker.github.io/Elsakr-Image-Compressor-Web/)

## ✨ Features

- 🖼️ **Supported Formats**: PNG, JPEG, WebP
- 📦 **Batch Compression**: Process multiple images at once
- 🎚️ **Quality Control**: Adjust compression level (1-100%)
- 🔄 **Convert to WebP**: Optional conversion for best compression
- 🔒 **100% Local**: Your images never leave your browser
- 📊 **Statistics**: See before/after sizes and savings
- 📥 **Download All**: Get all compressed images as ZIP
- 🌙 **Premium Dark UI**: Beautiful modern interface

## 📸 Screenshot

![Elsakr Image Compressor Web](assets/Screenshot.png)

## 🚀 Usage

1. Drag & drop images or click to browse
2. Adjust quality slider (lower = smaller file)
3. Optionally enable "Convert to WebP" for best compression
4. Download individual images or all as ZIP

## 🔧 How It Works

This tool uses the HTML5 Canvas API to compress images entirely in your browser:

- **JPEG/WebP**: Quality-based compression using `canvas.toBlob()`
- **PNG**: Converted through WebP pipeline for lossy compression effect
- No server upload, no API calls, completely private

## 📁 Files

- `index.html` - Main HTML structure
- `style.css` - Premium dark theme styles
- `script.js` - Compression logic using Canvas API
- `assets/` - Logo and favicon

## 🌐 Deployment

This is a static website. Deploy to GitHub Pages:

1. Create a new repository
2. Push all files
3. Enable GitHub Pages in Settings → Pages
4. Select `main` branch as source

## 🔗 Links

- [Desktop Version](https://github.com/khalidsakrjoker/Elsakr-Image-Compressor)
- [Elsakr Website](https://elsakr.company)
- [All Free Tools](https://elsakr.company/#free-tools)

---

Made with ❤️ by [Elsakr](https://elsakr.company)
