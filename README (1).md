# QuizHub — Interactive Quiz Platform

> A lightweight, zero-dependency quiz platform built entirely with vanilla HTML, CSS, and JavaScript — no frameworks, no build tools, no backend required.

---

## Live Demo

Open `index.html` directly in any modern browser. No installation needed.

---

## Overview

QuizHub is a role-based quiz platform that allows teachers to create and publish quizzes, and students to take them and receive instant feedback. All data is persisted client-side using the browser's `localStorage` API.

This project demonstrates that complex, polished web applications can be built without relying on modern JavaScript frameworks — just clean, well-structured vanilla code.

---

## User Flow

```mermaid
flowchart TD
    A([🌐 Open index.html]) --> B{Who are you?}

    B --> |Student| C[Enter Your Name]
    B --> |Teacher| D[Enter Admin Password]

    C --> E{Quiz Available?}
    E --> |No| F[⚠️ Ask your teacher to publish a quiz]
    E --> |Yes| G[Start Quiz]

    G --> H[View Question]
    H --> I[Select an Answer]
    I --> J{Correct?}
    J --> |Yes ✓| K[Score +1 · Show green feedback]
    J --> |No ✗| L[Show correct answer highlighted]
    K --> M{More Questions?}
    L --> M
    M --> |Yes| H
    M --> |No| N[🏆 Result Screen]
    N --> O[(Save to localStorage)]
    O --> P([Back to Home])

    D --> Q{Password OK?}
    Q --> |Wrong| R[❌ Show error]
    Q --> |Correct| S[Teacher Dashboard]

    S --> T[Create Quiz Tab]
    S --> U[Student Results Tab]

    T --> V[Set Title]
    V --> W[Add Questions + Options]
    W --> X[Mark Correct Answers]
    X --> Y[(Save Quiz to localStorage)]

    U --> Z[View Name · Score · % · Date]
```

---

## Features

### Student Experience
- Enter name to begin — no account creation required
- Answer multiple-choice questions one at a time
- Instant visual feedback per question (correct answer highlighted)
- Final score screen with percentage and personalized message
- Results automatically saved for the teacher to review

### Teacher / Admin Dashboard
- Password-protected access
- **Quiz Builder** — set a quiz title, add unlimited questions, define 4 options per question, and mark the correct answer via radio button
- **Live validation** — catches empty fields before saving
- **Student Results** — view a full table of every student's name, score, percentage badge, and submission date
- Clear all results with one click

---

## Role Access

| Role    | Access         | Credential              |
|---------|----------------|-------------------------|
| Student | Quiz only      | Name entry              |
| Teacher | Full dashboard | Password: `admin123`    |

---

## Tech Stack

```mermaid
graph LR
    A[👤 User] --> B[index.html]
    B --> C[style.css]
    B --> D[script.js]
    D --> E[(localStorage)]
    E --> D

    style A fill:#7c3aed,color:#fff,stroke:none
    style B fill:#4f46e5,color:#fff,stroke:none
    style C fill:#0ea5e9,color:#fff,stroke:none
    style D fill:#f59e0b,color:#fff,stroke:none
    style E fill:#16a34a,color:#fff,stroke:none
```

| Layer        | Technology                                          |
|--------------|-----------------------------------------------------|
| Markup       | HTML5 (semantic)                                    |
| Styling      | CSS3 (Flexbox, transitions, animations, responsive) |
| Logic        | Vanilla JavaScript (ES6+)                           |
| Persistence  | Browser `localStorage`                              |
| Dependencies | **None**                                            |

---

## Project Structure

```
quizhub/
├── index.html   # All markup — screens, quiz UI, teacher dashboard
├── style.css    # Full design system — layout, components, badges, responsive
└── script.js    # All application logic — routing, quiz engine, results
```

---

## Application Architecture

```mermaid
flowchart LR
    subgraph HTML["📄 index.html — Screens"]
        S1[Role Selection]
        S2[Student Login]
        S3[Teacher Login]
        S4[Quiz Screen]
        S5[Result Screen]
        S6[Teacher Dashboard]
    end

    subgraph JS["⚙️ script.js — Logic Modules"]
        L1[Screen Router\nshowScreen]
        L2[Student Engine\nstartQuiz · nextQuestion]
        L3[Quiz Builder\naddQuestion · saveQuiz]
        L4[Results Renderer\nrenderResults]
        L5[LocalStorage Layer\ngetSavedQuiz · saveResult]
    end

    subgraph DB["💾 localStorage"]
        D1[quiz]
        D2[quiz_results]
    end

    S1 --> L1
    L1 --> S2 & S3 & S4 & S5 & S6
    S2 --> L2
    L2 --> L5
    S6 --> L3 & L4
    L3 --> L5
    L4 --> L5
    L5 --> D1 & D2
```

---

## Score Grading Logic

```mermaid
flowchart TD
    A([Quiz Finished]) --> B{Score %?}
    B --> |≥ 80%| C[🏆 Excellent!\nGreen badge]
    B --> |50–79%| D[👍 Good effort\nYellow badge]
    B --> |< 50%| E[📚 Keep practicing\nRed badge]
    C & D & E --> F[(Saved to localStorage\nwith name + date)]
```

---

## Key Engineering Decisions

- **Screen routing without a router** — Each "page" is a hidden `div`. A single `showScreen(id)` function toggles CSS classes with a fade-in animation, simulating SPA navigation.
- **Component-style question builder** — Questions are dynamically generated DOM nodes, each self-contained with its own input references and radio group name-spacing.
- **Stateless quiz engine** — Quiz state (current question, score, student name) lives in module-level variables and resets cleanly on `restartApp()`, avoiding stale state bugs.
- **XSS prevention** — All user-provided text is passed through `escapeHtml()` before rendering into the DOM.
- **LocalStorage as a simple data layer** — Quiz data and results are JSON-serialized objects. The schema is minimal and flat — no migrations needed.

---

## Data Schema

```mermaid
erDiagram
    QUIZ {
        string title
        array questions
    }
    QUESTION {
        string question
        array options
        number correct
    }
    RESULT {
        string name
        number score
        number total
        string date
    }

    QUIZ ||--o{ QUESTION : contains
    QUIZ ||--o{ RESULT : generates
```

---

## Getting Started

```bash
# No setup required — just open the file
open index.html
```

Or drag `index.html` into any browser window.

---

## Possible Extensions

- [ ] Timer per question or per quiz
- [ ] Multiple quiz support (quiz bank)
- [ ] Export results to CSV
- [ ] Randomized question order
- [ ] Backend integration (Node.js + PostgreSQL) for multi-device persistence
- [ ] JWT-based auth to replace the static password

---

## Author

Built with care using nothing but the fundamentals — because great software doesn't always need a framework.
