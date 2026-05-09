<h1 align="center">
  <img src="https://img.shields.io/badge/FontScan-v1.0-e8a833?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwYTA5MDYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNNCAyMGg0bDEwLTEwLTQtNEw0IDE2di00Ii8+PHBhdGggZD0ibTE0IDYgNC00IDQgNGMtLjUuNS0xLjUuNS0yIDBsLTItMmMtLjUtLjUtLjUtMS41IDAtMnoiLz48L3N2Zz4=" alt="FontScan">
  <br/>
  Font Extractor — FontScan
</h1>

<p align="center">
  <strong>Extract text from any image and identify font traits — entirely in your browser.</strong><br/>
  No server. No uploads. No tracking. Just paste, drop, and read.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Built%20with-Astro%206-ff5d01?style=flat-square&logo=astro" alt="Astro">
  <img src="https://img.shields.io/badge/OCR-Tesseract.js%207-4285f4?style=flat-square" alt="Tesseract.js">
  <img src="https://img.shields.io/badge/Processing-100%25%20Local-22c55e?style=flat-square" alt="Local">
  <img src="https://img.shields.io/badge/License-MIT-a855f7?style=flat-square" alt="MIT">
  <img src="https://img.shields.io/badge/Node.js-%3E%3D22.12-339933?style=flat-square&logo=node.js" alt="Node">
</p>

---

## 📖 What is Font Extractor?

**Font Extractor (FontScan)** is a privacy-first, browser-only tool that lets you:

1. 🖼️ **Upload an image** (or paste a direct image URL)
2. 🔍 **Run OCR** powered by [Tesseract.js](https://tesseract.projectnaptha.com/) to extract all readable text
3. 🎨 **Analyse font traits** — weight, contrast, density, background tone, and style hints — using heuristic canvas analysis
4. 📋 **Copy or download** the extracted text instantly

Everything happens on-device. Your images and text never leave your machine.

---

## ✨ Features

| Feature | Detail |
|---|---|
| 🖼️ **Image Input** | Drag & drop, file browse, or paste an image URL |
| 📝 **OCR Extraction** | Powered by Tesseract.js v7 — supports English text detection |
| 🎨 **Font Trait Analysis** | Heuristic analysis of weight, contrast, density, and style |
| 🔒 **Privacy-First** | 100% client-side — zero server, zero tracking, zero uploads |
| ⚡ **Real-Time Progress** | Live progress bar and status labels during OCR |
| 📋 **Copy & Download** | One-click copy to clipboard or download as `.txt` |
| 🌐 **URL Support** | Load any publicly accessible image via URL (CORS proxy included) |
| 📱 **Responsive** | Works seamlessly on desktop and mobile browsers |
| 🎞️ **Animated UI** | Smooth fade-up animations, a scrolling type strip, and hover effects |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Astro 6](https://astro.build) — static-first, zero JS by default |
| **OCR Engine** | [Tesseract.js 7](https://github.com/naptha/tesseract.js) — WASM-based OCR |
| **Font Analysis** | Custom canvas heuristics (vanilla JS) |
| **Styling** | Vanilla CSS — custom design tokens, dark mode, glassmorphism |
| **Typography** | Google Fonts: DM Sans, DM Serif Display, DM Mono |
| **Deployment** | Static build — deployable to any static host (Netlify, Vercel, GitHub Pages) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js `>= 22.12.0`
- npm (bundled with Node)

### Installation

```bash
# Clone the repository
git clone https://github.com/Aditya-singh095/FONTEXTRACTOR.git

# Navigate into the project
cd FONTEXTRACTOR/font-extractor

# Install dependencies
npm install
```

### Development

```bash
npm run dev
# Opens at http://localhost:4321
```

### Production Build

```bash
npm run build
# Output goes to ./dist/
```

### Preview Production Build

```bash
npm run preview
```

---

## 📁 Project Structure

```
font-extractor/
├── public/                  # Static assets
├── src/
│   ├── layouts/
│   │   └── Layout.astro     # Base HTML shell, design tokens, global styles
│   ├── pages/
│   │   └── index.astro      # Main application page (UI + inline styles)
│   └── scripts/
│       └── extractor.js     # OCR logic, drag & drop, font trait analysis
├── astro.config.mjs         # Astro configuration
├── package.json
└── tsconfig.json
```

---

## 🔬 How Font Trait Analysis Works

FontScan doesn't read embedded font metadata — that information is typically stripped from rasterized images. Instead, it uses **canvas pixel analysis** to derive heuristic font traits:

1. The image is scaled down and drawn onto an off-screen `<canvas>`.
2. Every pixel's luminance is computed using the standard formula:  
   `L = 0.299R + 0.587G + 0.114B`
3. The ratio of dark vs. light pixels determines:
   - **Background tone** — light, dark, or mixed
   - **Text density** — sparse, moderate, or dense
   - **Contrast level** — high or low–medium
   - **Likely font weight** — bold/heavy or regular/light
   - **Style hint** — display/decorative or body/reading

For accurate font identification, the tool also links you to [Google Fonts](https://fonts.google.com) and [WhatTheFont](https://www.myfonts.com/WhatTheFont/).

---

## 🧞 All Commands

| Command | Action |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start local dev server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview production build locally |
| `npm run astro ...` | Run Astro CLI commands |
| `npm run astro -- --help` | Get Astro CLI help |

---

## 🔒 Privacy

FontScan is designed with **privacy by design**:

- ✅ All OCR processing happens in the browser via WebAssembly
- ✅ No image data is sent to any server
- ✅ No cookies, no analytics, no telemetry
- ✅ Works fully offline after the initial Tesseract WASM load

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to open an issue or submit a pull request.

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.  
See [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with ❤️ using <a href="https://astro.build">Astro</a> · OCR by <a href="https://github.com/naptha/tesseract.js">Tesseract.js</a> · All processing is local.
</p>
