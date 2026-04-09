# Prompts.md — Week 2: Cash Flow Tracker

## How I used AI in this project

I used Claude (claude.ai) as a learning assistant while building this project.

Instead of asking it to generate full code, I focused more on understanding concepts first.
I would ask for explanations, try writing the code myself, and then use AI to fix mistakes or clarify things I didn’t understand.

This helped me actually learn how the app works instead of just copying code.

---

## Prompts I used

### Understanding the project

* "Explain simply what I need to build for a Salary & Expense Tracker"
* "Before writing code, explain how the whole app should work and why"

### Level 1 — Core JavaScript Logic

* "Let us start Level 1 step by step. Here's my HTML — what needs fixing?"
* "Explain DOM manipulation and event listeners in this context"
* "Why do inputs return strings and how does parseFloat fix it?"
* "Now help me build the logic step by step"

### Level 2 — localStorage, Delete, Chart

* "Explain all Level 2 concepts before coding"
* "How does localStorage work practically?"
* "How does the delete button know which item to remove?"
* "How does Chart.js update data and why destroy the old chart?"
* "Now add Level 2 features step by step"

### Level 3 — PDF, Currency Converter, Budget Alert

* "Explain Level 3 concepts before writing code"
* "What is fetch() and what does asynchronous mean in simple terms?"
* "Guide me through adding these features step by step"

### Debugging

* "PDF downloads but doesn't open properly — what could be wrong?"
* "₹ symbol shows incorrectly in PDF — how to fix it?"
* "Currency converter always throws error — how to debug it?"

### General

* "Is it okay to submit AI-assisted code if I understand it fully?"
* "Help me structure this Prompts.md file"

---

## What I actually learned

* How JavaScript interacts with the DOM to update UI dynamically
* Why `parseFloat()` is important when working with user input
* How event listeners connect user actions to logic
* How `localStorage` helps persist data across refreshes
* How arrays and objects are used to manage structured data
* How `splice()` removes items based on index
* How Chart.js works and how to update charts properly
* How `fetch()` works and what asynchronous behavior means
* How jsPDF generates downloadable files in the browser
* The difference between storing raw data (INR) vs displaying converted values
* Integrated the Frankfurter API for real-time currency conversion and handled JSON response formatting in JavaScript
---

## Note

All features in this project were built step by step with understanding.

I made mistakes during the process (especially with API calls and PDF export),
but fixed them by debugging and learning why the issues occurred.

I can confidently explain and modify any part of this project.
