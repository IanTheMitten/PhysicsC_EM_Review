# AP Physics C: Electricity & Magnetism — Study Guide

A visual HTML study guide covering the entire AP Physics C: E&M curriculum. Includes all 6 College Board units (Units 8-13) organized into 5 focused chapters with concepts, equations, interactive practice problems, and exam strategy.

**Live site:** [ianthemitten.github.io/PhysicsC_EM_Review](https://ianthemitten.github.io/PhysicsC_EM_Review/)

## Quick Start

```bash
cd "path/to/physicsEM"
python3 -m http.server 8080
```

Then open **http://localhost:8080** in your browser.

Or just double-click `index.html` to open it directly.

## What's Inside

- **5 Study Units** — Electrostatics, Circuits, Magnetism, Electromagnetism, Maxwell's Equations
- **~75 Interactive Practice Questions** — 50 MCQ with instant feedback + 23 FRQ with toggleable solutions
- **59 Key Equations** — Rendered with LaTeX (MathJax 3)
- **Exam Strategy** — Time management, FRQ tips, lab scenarios, common mistakes
- **Dark Mode** — Toggle with the moon icon or press `T`
- **Progress Tracking** — Section checkboxes and practice scores saved to localStorage
- **Keyboard Shortcuts** — Arrow keys navigate, `1`–`5` jump to units, `/` to search

## Structure

```
physicsEM/
├── index.html                    # Home page with unit cards, CB mapping, exam strategy
├── unit1-electrostatics.html     # CB Units 8-10 (15 sections)
├── unit2-circuits.html           # CB Unit 11 (9 sections)
├── unit3-magnetism.html          # CB Unit 12 (6 sections)
├── unit4-electromagnetism.html   # CB Unit 13 (8 sections)
├── unit5-maxwell.html            # Maxwell's equations + EM waves (5 sections)
├── practice/
│   ├── practice-unit1.html       # Electrostatics (12 MCQ + 5 FRQ)
│   ├── practice-unit2.html       # Circuits (10 MCQ + 5 FRQ)
│   ├── practice-unit3.html       # Magnetism (10 MCQ + 5 FRQ)
│   ├── practice-unit4.html       # EM Induction (10 MCQ + 5 FRQ)
│   └── practice-unit5.html       # Maxwell's Equations (8 MCQ + 3 FRQ)
├── css/style.css                 # Glassmorphism theme (CSS custom properties)
├── js/app.js                     # Search, progress, dark mode, keyboard nav, practice controller
└── E&M practice/                 # PDF practice tests (archived reference)
```

## College Board Alignment

| Study Guide | College Board Units | CB Exam Weight |
|---|---|---|
| Unit 1: Electrostatics | Units 8, 9, 10 | 35-60% |
| Unit 2: Electric Circuits | Unit 11 | 15-25% |
| Unit 3: Magnetic Fields | Unit 12 | 10-20% |
| Unit 4: Electromagnetism | Unit 13 | 10-20% |
| Unit 5: Maxwell's Equations | Distributed across 12-13 | Integrated above |

## Tech Stack

- **No build step, no framework** — plain HTML, CSS, and vanilla JS
- **MathJax 3** (`tex-mml-chtml`) for LaTeX equation rendering
- **Glassmorphism** CSS theme with dark mode via `data-theme` attribute
- **localStorage** for progress and practice state persistence