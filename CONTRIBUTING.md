# 🛠️ Contributing to Project Hail

Thank you for your interest in contributing to **Project Hail — Junior Astronaut Mission Trainer**! This document provides clear guidelines for git branches, commit messages, code standards, and Pull Requests (PRs) to keep our team workflow smooth and cohesive.

---

## 📑 Table of Contents

1. [Branching Strategy](#1-branching-strategy)
2. [Commit Message Conventions](#2-commit-message-conventions)
3. [Pull Request (PR) Guidelines](#3-pull-request-pr-guidelines)
4. [Standard Development Workflow](#4-standard-development-workflow)
5. [Code Quality & Testing Standards](#5-code-quality--testing-standards)

---

## 1. Branching Strategy

We follow a structured Git feature-branch workflow.

### 1.1. Core Branches
- `main`: Production-ready, stable releases and live demo builds. Protected; direct commits are prohibited.
- `dev`: Integration branch where all completed features and fixes converge.

### 1.2. Branch Naming Rules
Always create your working branch from `dev`. Use lowercase letters, numbers, and hyphens (`-`).

Format:
```text
<type>/<scope-or-ticket>-<short-description>
```

| Type | Purpose | Example |
|---|---|---|
| `feat/` | A new feature, system, or UI component | `feat/cockpit-hotspots`<br>`feat/nasa-donki-mapper` |
| `fix/` | A bug fix or unexpected issue correction | `fix/water-recycler-leak`<br>`fix/rover-end-day-hang` |
| `balance/` | Gameplay, equation, or resource tuning | `balance/o2-consumption-rates` |
| `docs/` | Documentation changes (README, guides, GDD) | `docs/add-contributing-guide` |
| `refactor/` | Code refactoring without behavioral changes | `refactor/end-day-resolver` |
| `perf/` | Performance optimizations | `perf/canvas-render-loop` |
| `test/` | Adding or updating unit/integration tests | `test/event-graph-prng` |
| `chore/` | Tooling, build scripts, dependencies, config | `chore/upgrade-vite-6` |

---

## 2. Commit Message Conventions

We strictly follow the [Conventional Commits v1.0.0](https://www.conventionalcommits.org/) specification. This ensures automated changelog generation, clean git histories, and clear communication.

### 2.1. Format

```text
<type>(<scope>): <short description in imperative mood>

[optional body explaining WHY and WHAT changed]

[optional footer(s) such as Closes #123 or BREAKING CHANGE]
```

### 2.2. Commit Types

| Type | Description |
|---|---|
| `feat` | Introduces a new feature or functionality |
| `fix` | Fixes a bug |
| `balance` | Adjusts game economy, NASA data scaling, or resource numbers |
| `docs` | Documentation only changes |
| `style` | Code formatting, missing semicolons, whitespace (no code change) |
| `refactor` | Code restructuring without adding features or fixing bugs |
| `perf` | Changes that improve runtime or memory performance |
| `test` | Adding missing tests or correcting existing tests |
| `chore` | Build process, auxiliary tools, package updates |
| `revert` | Reverts a previous commit |

### 2.3. Project Hail Scopes
Use one of our recognized module scopes to clarify where the change occurred:
- `engine`: Core deterministic game engine and state machine
- `resolver`: End-Day processing order and logic
- `events`: Event scheduler, graph, and conditional event pool
- `nasa`: NASA DONKI pipeline, data mapping, and solar timeline
- `ui`: General UI, layouts, styles, themes
- `cockpit`: 2D Outpost cockpit view and interactive hotspots
- `crew`: Astronaut roster, health, and assignment system
- `rover`: Exploration expeditions, rover mechanics, and map
- `audio`: Sound effects, music, and Web Audio manager
- `deps`: Dependencies and package management

### 2.4. Examples

#### ✅ Good Examples:
```text
feat(rover): add battery drain check during shadowed region expedition
fix(resolver): prevent negative oxygen values when generator is broken
balance(nasa): calibrate solar flare radiation tier multipliers
docs(readme): add React 19 architecture diagram and installation steps
refactor(engine): migrate daily state reducer to pure functional actions
```

#### ❌ Bad Examples:
```text
fixed bug               # No type, scope, or clear description
feat: update stuff      # Too vague
WIP                     # Never commit WIP to shared branches
Added new button!       # Not using imperative mood ("Add", not "Added")
```

---

## 3. Pull Request (PR) Guidelines

### 3.1. PR Title Format
Follow the commit format for the PR title:
```text
<type>(<scope>): <Brief summary of what this PR introduces>
```
*Example:* `feat(cockpit): implement interactive module warning indicators`

### 3.2. PR Checklist Before Submitting
Make sure you have:
- [ ] Branched off the latest `dev` branch.
- [ ] Followed the React 19 & TypeScript clean coding standards.
- [ ] Run `npm run lint` and resolved all warnings/errors.
- [ ] Run `npm test` and ensured all engine tests pass.
- [ ] Checked that UI changes work on 16:9 ratio and responsive screens.
- [ ] Kept the headless engine completely decoupled from React DOM components.

### 3.3. PR Description Template
When creating a PR on GitHub, use the following template:

```markdown
## 📌 Description
<!-- Provide a concise summary of the changes and motivation behind them. -->

## 🎯 Type of Change
- [ ] 🚀 New feature (non-breaking change which adds functionality)
- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ⚖️ Balance/Game design adjustment
- [ ] ♻️ Refactoring / Performance improvement
- [ ] 📝 Documentation update

## 🧪 How Has This Been Tested?
- [ ] Engine Unit Tests (`npm test`)
- [ ] Manual test in Cockpit / Dev UI
- [ ] Tested with historical NASA DONKI dataset

## 📸 Screenshots / Video (if applicable)
<!-- Attach screenshots or GIFs for UI/UX changes -->

## 🔗 Related Issues / Discussions
Closes #<issue_number>
```

### 3.4. Code Review & Merging Policy
- At least **1 peer review approval** is required before merging into `dev`.
- Prefer **Squash and Merge** or **Rebase and Merge** to keep the commit tree linear and readable.
- Delete your branch after merging to keep the repository clean.

---

## 4. Standard Development Workflow

Here is the step-by-step workflow for implementing a task:

```bash
# 1. Ensure you have the latest code from dev
git checkout dev
git pull origin dev

# 2. Create a new branch for your task
git checkout -b feat/crew-assignment-validation

# 3. Work on your code, run tests continuously
npm test

# 4. Stage your changes and commit with conventional commit message
git add .
git commit -m "feat(crew): validate single daily assignment per astronaut"

# 5. Push your branch to the remote repository
git push -u origin feat/crew-assignment-validation

# 6. Open a Pull Request on GitHub against dev
```

---

## 5. Code Quality & Testing Standards

### 5.1. React 19 Guidelines
- Prefer React 19 hooks (`useActionState`, `useOptimistic`, `useTransition`) for asynchronous player interactions and state updates.
- Keep UI components presentational; delegate game rules and mutations to engine action dispatchers.
- Memoize heavy 2D canvas calculations appropriately.

### 5.2. Headless Engine & Determinism
- **Pure Functions**: The `End-Day Resolver` must remain 100% deterministic given the same `(InitialState, PlayerActions, Seed, NASAData)`.
- **No Math.random()**: Always use the project's seeded PRNG utility for random events so missions can be deterministically replayed or debugged.
- **Zero React Imports in `src/core/`**: Core engine files must never import React or browser-specific window/document objects.

---

*Thank you for helping build Project Hail and inspiring the next generation of space explorers!* 🚀✨

