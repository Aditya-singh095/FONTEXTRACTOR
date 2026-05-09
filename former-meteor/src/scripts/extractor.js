/* extractor.js — Font Text Extractor client logic
 * Uses Tesseract.js loaded via CDN for OCR.
 * Font trait analysis is heuristic (stroke analysis on canvas).
 */

// ── Load Tesseract from CDN ──────────────────────────────────────
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
document.head.appendChild(script);

// ── DOM References ───────────────────────────────────────────────
const uploadZone   = document.getElementById('upload-zone');
const fileInput    = document.getElementById('file-input');
const browseBtn    = document.getElementById('browse-btn');
const urlInput     = document.getElementById('url-input');
const urlBtn       = document.getElementById('url-btn');
const previewArea  = document.getElementById('preview-area');
const previewImg   = document.getElementById('preview-img');
const clearBtn     = document.getElementById('clear-btn');
const extractBtn   = document.getElementById('extract-btn');
const progressWrap = document.getElementById('progress-wrap');
const progressFill = document.getElementById('progress-fill');
const progressLabel= document.getElementById('progress-label');

const emptyState      = document.getElementById('empty-state');
const resultsContent  = document.getElementById('results-content');
const errorState      = document.getElementById('error-state');
const errorMsg        = document.getElementById('error-msg');
const retryBtn        = document.getElementById('retry-btn');
const panelActions    = document.getElementById('panel-actions');
const fontTraits      = document.getElementById('font-traits');
const extractedText   = document.getElementById('extracted-text');
const wordCount       = document.getElementById('word-count');
const confidenceFill  = document.getElementById('confidence-fill');
const confidenceVal   = document.getElementById('confidence-val');
const copyBtn         = document.getElementById('copy-btn');
const downloadBtn     = document.getElementById('download-btn');

let currentImageSrc = null;
let lastExtractedText = '';

// ── State Helpers ────────────────────────────────────────────────
function showPreview(src) {
  previewImg.src = src;
  previewArea.style.display = 'block';
  extractBtn.disabled = false;
  currentImageSrc = src;
}

function clearImage() {
  previewImg.src = '';
  previewArea.style.display = 'none';
  extractBtn.disabled = true;
  currentImageSrc = null;
  fileInput.value = '';
  urlInput.value = '';
  showEmpty();
}

function showEmpty() {
  emptyState.style.display = 'flex';
  resultsContent.style.display = 'none';
  errorState.style.display = 'none';
  panelActions.style.display = 'none';
}

function showResults() {
  emptyState.style.display = 'none';
  resultsContent.style.display = 'flex';
  errorState.style.display = 'none';
  panelActions.style.display = 'flex';
}

function showError(msg) {
  emptyState.style.display = 'none';
  resultsContent.style.display = 'none';
  errorState.style.display = 'flex';
  panelActions.style.display = 'none';
  errorMsg.textContent = msg;
}

function setProgress(pct, label) {
  progressFill.style.width = pct + '%';
  progressLabel.textContent = label;
}

// ── Drag & Drop ──────────────────────────────────────────────────
uploadZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadZone.classList.add('drag-over');
});
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) loadFile(file);
});
uploadZone.addEventListener('click', (e) => {
  if (e.target !== browseBtn) fileInput.click();
});
browseBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  fileInput.click();
});
fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) loadFile(fileInput.files[0]);
});

// ── URL Load ─────────────────────────────────────────────────────
urlBtn.addEventListener('click', () => {
  const url = urlInput.value.trim();
  if (!url) return;
  // Use a CORS proxy for cross-origin images
  const proxied = `https://corsproxy.io/?${encodeURIComponent(url)}`;
  showPreview(proxied);
});
urlInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') urlBtn.click();
});

// ── File Reader ──────────────────────────────────────────────────
function loadFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => showPreview(e.target.result);
  reader.readAsDataURL(file);
}

// ── Clear ────────────────────────────────────────────────────────
clearBtn.addEventListener('click', clearImage);
retryBtn.addEventListener('click', () => extractBtn.click());

// ── Extract ──────────────────────────────────────────────────────
extractBtn.addEventListener('click', async () => {
  if (!currentImageSrc || typeof Tesseract === 'undefined') {
    showError('Tesseract is still loading. Please wait a moment and try again.');
    return;
  }
  extractBtn.disabled = true;
  progressWrap.style.display = 'flex';
  setProgress(5, 'Initializing OCR engine…');

  try {
    const result = await Tesseract.recognize(currentImageSrc, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          setProgress(Math.round(m.progress * 90) + 5, `Recognizing text… ${Math.round(m.progress * 100)}%`);
        } else if (m.status === 'loading tesseract core') {
          setProgress(10, 'Loading Tesseract core…');
        } else if (m.status === 'initializing api') {
          setProgress(20, 'Initializing API…');
        } else if (m.status === 'loading language traineddata') {
          setProgress(35, 'Loading language model…');
        } else if (m.status === 'initialized api') {
          setProgress(50, 'Ready — starting recognition…');
        }
      },
    });

    setProgress(100, 'Complete!');

    const text = result.data.text.trim();
    const confidence = Math.round(result.data.confidence);
    lastExtractedText = text;

    // Display text
    if (text) {
      extractedText.textContent = text;
    } else {
      extractedText.textContent = '(No text detected — try a clearer image with more contrast)';
    }

    // Word count
    const words = text.split(/\s+/).filter(Boolean).length;
    const chars = text.length;
    wordCount.textContent = `${words} words · ${chars} chars`;

    // Confidence bar
    confidenceFill.style.width = confidence + '%';
    confidenceVal.textContent = confidence + '%';

    // Font trait analysis
    const traits = await analyzeImageFontTraits(currentImageSrc);
    renderFontTraits(traits);

    setTimeout(() => {
      progressWrap.style.display = 'none';
      showResults();
    }, 600);

  } catch (err) {
    console.error(err);
    progressWrap.style.display = 'none';
    showError('OCR failed: ' + (err.message || 'Unknown error. Please try a different image.'));
  } finally {
    extractBtn.disabled = false;
  }
});

// ── Font Trait Analysis (heuristic via canvas) ───────────────────
async function analyzeImageFontTraits(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, 400 / Math.max(img.width, img.height));
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Measure darkness (contrast) — dark text on light = high contrast
        let darkPixels = 0, lightPixels = 0;
        for (let i = 0; i < data.length; i += 4) {
          const lum = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
          if (lum < 80) darkPixels++;
          else if (lum > 180) lightPixels++;
        }
        const total = (data.length / 4);
        const darkRatio = darkPixels / total;
        const lightRatio = lightPixels / total;

        const isLight = lightRatio > 0.5;
        const isDark  = darkRatio > 0.35;

        // Derive heuristic traits
        const traits = {
          'Background':   isLight ? 'Light' : isDark ? 'Dark' : 'Mixed/Complex',
          'Text Density': darkRatio < 0.05 ? 'Sparse' : darkRatio < 0.2 ? 'Moderate' : 'Dense',
          'Contrast':     Math.abs(darkRatio - lightRatio) > 0.3 ? 'High' : 'Low–Medium',
          'Likely Weight': darkRatio > 0.15 ? 'Bold / Heavy' : 'Regular / Light',
          'Style Hint':   darkRatio > 0.22 ? 'Display / Decorative' : 'Body / Reading',
          'Search Tip':   'Try fonts.google.com or myfonts.com/WhatTheFont',
        };
        resolve(traits);
      } catch {
        resolve({ 'Note': 'Font trait analysis unavailable for this image' });
      }
    };
    img.onerror = () => resolve({ 'Note': 'Could not analyse font traits (CORS or load error)' });
    img.src = src;
  });
}

function renderFontTraits(traits) {
  fontTraits.innerHTML = '';
  for (const [key, val] of Object.entries(traits)) {
    const chip = document.createElement('div');
    chip.className = 'trait-chip';
    chip.innerHTML = `<span class="chip-key">${key}</span>${val}`;
    fontTraits.appendChild(chip);
  }
}

// ── Copy & Download ──────────────────────────────────────────────
copyBtn.addEventListener('click', async () => {
  if (!lastExtractedText) return;
  await navigator.clipboard.writeText(lastExtractedText);
  const orig = copyBtn.textContent;
  copyBtn.textContent = 'Copied!';
  copyBtn.style.color = 'var(--amber)';
  setTimeout(() => {
    copyBtn.textContent = orig;
    copyBtn.style.color = '';
  }, 1800);
});

downloadBtn.addEventListener('click', () => {
  if (!lastExtractedText) return;
  const blob = new Blob([lastExtractedText], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'extracted-text.txt';
  a.click();
  URL.revokeObjectURL(a.href);
});
