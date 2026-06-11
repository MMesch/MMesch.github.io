---
title: "Obspy in the Browser: Seismic Analysis with WebAssembly"
labels:
  - webassembly
  - seismology
  - obspy
  - python
  - open-source
description: |
    We made Obspy—the popular seismic Python toolkit—run entirely in the browser using WebAssembly and emscripten-forge. No installation, no server, no backend.
    The content of this post was also presented at EGU 2026.
---

At [EGU 2026](https://www.egu26.eu/) in Vienna, we presented a project that brings seismic data analysis directly into the browser: [Obspy](https://github.com/obspy/obspy), the go-to Python toolkit for seismology, running on WebAssembly without any server backend.

This work is the result of a collaboration with colleagues from QuantStack and the Obspy community. The abstract is [published here](https://meetingorganizer.copernicus.org/EGU26/EGU26-18563.html).

## Why This Matters

Installing Obspy and its scientific Python dependencies from scratch can be painful — compiled extensions, platform-specific binaries, conda environments. Getting students or collaborators set up can take an afternoon.

WebAssembly + [emscripten-forge](https://github.com/emscripten-forge/emscripten-forge) eliminates all of that. The entire stack — Python, NumPy, SciPy, Matplotlib, Obspy — compiles to WebAssembly and runs in the browser sandbox. No pip install. No conda environment. Just a URL.

Some implications beyond convenience are:

- **Education**: Students open a browser tab and start analyzing seismic data. No IT support needed.
- **Reproducibility**: A WebAssembly bundle is a stable web standard. An analysis that works today will work in ten years.
- **Field work**: Engineers on remote sites access powerful tools on a tablet.
- **Scalability**: Static websites scale infinitely. Serve once, serve everyone.

## Two Demo Apps

We built two demonstrations, both open source:

### pyjs-obspy

A minimal [single-page app](https://github.com/MMesch/pyjs-obspy) that fetches seismic data from the [EPOS-France](https://www.epos-france.fr/) FDSN service and plots it using Matplotlib — all in the browser. It's built with [Pyjs](https://github.com/emscripten-forge/pyjs), a tool that compiles Python environments to WebAssembly and generates a JavaScript runtime to execute them. This allows embedding Python-capabilities directly in a website.

Try it at [mmesch.github.io/pyjs-obspy](https://mmesch.github.io/pyjs-obspy/).

### JupyterLite + Obspy

A [full JupyterLab environment](https://github.com/jupyterlite-obspy) running in the browser with Obspy pre-installed. Open notebooks, write Python, run Obspy commands — no server involved, this is hosted on GitHub pages and anyone can reproduce it. [JupyterLite](https://github.com/jupyterlite/jupyterlite) is, a project QuantStack created and maintains, but that is gaining significant traction, especially in the education.

Try it at [mmesch.com/jupyterlite-obspy](https://mmesch.com/jupyterlite-obspy/lab/index.html).

We also have a more elaborate version on [notebook.link](https://notebook.link/@mmesch/seismo), QuantStack's enterprise-ready Jupyter platform, which includes [JupyterGIS](https://github.com/geojupyter/jupytergis) for interactive map visualizations of seismic station data.

## How It Works Under the Hood

The technology stack has three layers:

1. **emscripten-forge**: Compiles C/C++/Fortran extensions (NumPy's BLAS, Obspy's C routines, Matplotlib's renderer) to WebAssembly. It's a conda channel — just like conda-forge, but targeting `wasm32-unknown-emscripten` instead of native architectures.

2. **Pyjs**: A JavaScript runtime that loads the compiled Python environment into the browser. It handles the Python interpreter, package imports, and bridges the gap between Python and the browser's DOM.

3. **JupyterLite**: The Jupyter server reimplemented as a static website. It runs kernels, serves notebooks, and manages the file system — all inside the browser's service worker and WebAssembly runtime.

## Limitations

Running scientific Python in the browser isn't magic. There are real constraints:

- **Single-threaded**: WebAssembly has no shared-memory threads in the browser. Parallelism is limited.
- **Memory**: Browsers impose memory limits on WebAssembly. This is especially limiting on smart phones that protect memory more strictly than Desktop or tablets.
- **Performance**: WebAssembly is fast, but not native. For interactive analysis the overhead is mostly negligible but some functions, e.g. in numpy aren't optimized for WASM execution and therefore much slower. In practice we didn't hit those when using obspy but we also didn't do an exhaustive test yet.
- **Network**: Downloading the environment is ~50-100MB on first visit. Subsequent loads are cached.

These are acceptable for a broad range of seismic analysis — small to medium datasets, exploratory work, education, and even many production scenarios. For production-scale processing, native deployments remain the right choice.

## What's Next

We're actively working on:

- **LLM integration**: Large language models communicating with Obspy directly in the browser, enabling natural-language-driven seismic workflows.
- **Collaborative editing**: Real-time collaborative notebooks via WebRTC, already working in JupyterLite's experimental builds.
- **More packages**: Expanding emscripten-forge to cover more of the scientific Python ecosystem.

All of this is open source under permissive licenses. The demo repos are at [github.com/MMesch/pyjs-obspy](https://github.com/MMesch/pyjs-obspy) and [github.com/jupyterlite-obspy](https://github.com/jupyterlite-obspy). Try them out — it's just a URL.
