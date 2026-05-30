# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Blueprint Pecuária** is a single-file, static HTML5 interactive educational guide about Brazilian cattle ranching (*pecuária de corte*). All content is in Brazilian Portuguese. The entire application lives in `index.html` — there is no build step, no package manager, and no backend.

The file is ~87 MB because all images are base64-encoded inline; do not be alarmed by its size.

## Running Locally

Open `index.html` directly in a browser, or serve it with any HTTP server:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

There are no dependencies to install, no build commands, and no tests.

## Architecture

The entire codebase is a single `index.html` with three embedded layers:

**CSS** (`<style>` block, ~520 lines) — uses CSS custom properties for the design system:
- `--teal: #1a4d5c` / `--teal-light: #2a6b7d` — primary brand color
- `--green: #4a9b6f` — accent
- `--gold: #c9a961` — highlight
- `--bg: #f5f5f5` / `--text: #2c3e50` — base surface/text
- Mobile breakpoint at `768px`; responsive grids use `repeat(auto-fit, ...)`

**Content** (HTML body) — 15 sequential sections identified by `#s1` through `#s15`, covering topics from Brazil's cattle industry overview through genetics, reproductive biotechnology, and production systems. Sections alternate backgrounds via `.section-alt`. A fixed `<nav>` links to each section anchor.

**JavaScript** (`<script>` block, ~60 lines) — four functions, no frameworks:
- `toggleMenu()` — mobile hamburger nav
- `openModal(el)` / `closeModal(event)` — image lightbox
- `toggleExpandable(header)` — collapsible content blocks
- `scrollToTop()` — scroll-to-top button (appears after 300 px of scroll)

All images are `<img>` tags with `data:image/...;base64,...` `src` values — editing them means replacing the base64 string.

## Content Structure

| ID | Topic |
|----|-------|
| `#s1` | Cover / A Nova Pecuária de Corte |
| `#s2` | O Protagonismo do Brasil |
| `#s3` | O Ciclo de Produção da Carne |
| `#s4` | O Rei dos Trópicos: *Bos indicus* |
| `#s5` | O Desafio da Termorregulação |
| `#s6` | Matriz Diagnóstica: Genética e Aptidão |
| `#s7` | O Motor da Heterose |
| `#s8` | A Evolução da Seleção Genética |
| `#s9` | A Bússola das DEPs |
| `#s10` | Os Bastidores do Sêmen |
| `#s11` | A Escada da Biotecnologia Reprodutiva |
| `#s12` | Sincronizando a Natureza |
| `#s13` | O Abismo da Eficiência Reprodutiva |
| `#s14` | O Espectro de Intensificação dos Sistemas |
| `#s15` | O Salto de Performance |

## Key Conventions

- **Single-file discipline**: keep everything in `index.html`; do not introduce external CSS files, JS files, or a build pipeline unless explicitly asked.
- **No framework dependencies**: changes must remain vanilla HTML/CSS/JS.
- **Expandable blocks**: use `<div class="expandable-header" onclick="toggleExpandable(this)">` pattern — the function toggles an `active` class and slides the sibling `.expandable-content` element.
- **Image embedding**: new images must be base64-encoded and inlined; do not reference external URLs.
- **Section pattern**: each new section should follow the `<section id="sN" class="section">` (or `section-alt`) structure with a matching `<a href="#sN">` entry in the nav.
