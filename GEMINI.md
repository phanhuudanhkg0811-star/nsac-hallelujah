# JUNIOR ASTRONAUT MISSION TRAINER (NASA SPACE APPS 2026)

## 1. Project Overview & Inspiration
* **Event**: 2026 NASA Space Apps Challenge - "Build a Junior Astronaut Mission Trainer".
* **Format**: Web Game Simulator (Single Page Application, responsive desktop & mobile).
* **Reference**: Turn-based survival management from *60 Parsecs!* (Robot Gentleman).
* **Scope**:
  * **INCLUDE**: Station operations, turn-based Sol management, resource trade-offs, radio comms, cargo resupply, Moon/Mars arcs.
  * **EXCLUDE**: 3D scavenge/pickup mini-game (100% excluded).
* **Team Roles**:
  * **Web Developer**: Project Lead for web architecture (Vite + React + TypeScript + TailwindCSS + Zustand). Project is specifically tailored to be an exceptional portfolio/CV piece.
  * **Artist**: Custom 2D art (astronaut portraits, window surfaces, station icons).
  * **User**: Art integration, asset optimization (WebP/SVG, spritesheets, CSS layout).
  * **Antigravity**: System architect, NASA STEM math models, TypeScript engine design, code optimization.

---

## 2. Technical & Architecture Rules
* **Clean Decoupled Architecture**:
  * Core Simulation Engine (`src/engine/`) must be **Pure TypeScript**, strictly independent of React DOM and UI libraries, fully unit-testable.
  * State management via **Zustand** with persistent storage support (`LocalStorage` / `IndexedDB`).
* **Performance Budget**:
  * Lightweight bundle: < 2.5 MB compressed.
  * First Contentful Paint: < 2.0s.
  * Target: Steady 60 FPS across desktop and mobile browsers.
* **Data-Driven Design**:
  * Scenarios, event decision trees, astronaut attributes, and equipment upgrade costs must be strictly defined in `src/data/*.json`. No hardcoded gameplay logic in UI components.
* **Asset & Visual Polish**:
  * All custom art must be optimized as **WebP** or **SVG**.
  * Use CSS Glassmorphism & SVG Vector gauges for the cockpit HUD.
  * Canvas 2D / PixiJS used strictly for lightweight background atmosphere (dust particles, day/night lighting outside the observation window).

---

## 3. NASA STEM Scientific Rules
* **Life Support (ECLSS)**: Physically grounded mass balance (O2 ~0.84 kg/person/day, water ~2.5 L/person/day with 85-93% recycling via WRS).
* **Radio Latency (Ground Control / CAPCOM)**:
  * Moon Arc: ~1.3s delay each way (near real-time assistance).
  * Mars Arc: 4 to 24-minute delay each way (autonomous survival required during emergencies).
* **Resupply Logistics**: Cargo landers take realistic transit times (Moon: 3-5 Sols; Mars: 15-30 Sols) with strict mass/payload budgets.
* **Planetary Arcs**:
  * *Moon (Artemis)*: 14-day lunar night (power crisis), abrasive regolith dust, thermal extremes.
  * *Mars (Ares)*: Global dust storms (solar choke), MOXIE atmospheric O2 extraction, soil perchlorate decontamination.

---

## 4. Legal & Intellectual Property Rules
* Zero copyrighted assets, audio, binary decompilations, or trademarks from *60 Parsecs!* or *Robot Gentleman*.
* 100% custom-created art/audio or NASA Public Domain assets.
