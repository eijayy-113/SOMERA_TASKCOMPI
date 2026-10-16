# Somera — spend with clarity

A responsive, privacy-first expense tracker prototype for the SOMERA_FINALS project. It helps people record day-to-day expenses, review category totals, and set flexible monthly spending guideposts.

## Run the prototype

Open `index.html` in a modern browser. No build step, account, bank connection, or package installation is required.

## Connected views

- **Overview:** Monthly spend, budget remaining, category breakdown, and recent activity.
- **Activity:** Search and filter expenses by merchant and category.
- **Add an expense:** Accessible form for merchant, amount, date, category, payment method, and an optional recurring reminder.
- **Budgets:** Review category limits and adjust a monthly limit.
- **Help & privacy:** Prototype guidance, a privacy explanation, and a control to clear locally saved demo data.

Navigation works between all five views. Expense and budget updates are saved in this browser's local storage. The sample data is fictional and stays on the device. The recurring checkbox is a tracking note only; the prototype does not schedule payments.

## Privacy and limitations

Somera is a student prototype, not a bank, payment product, or financial adviser. It does not connect to financial accounts or transmit entries to a server. Clearing browser storage removes local changes and restores the fictional examples. The prototype uses local files only and does not load third-party scripts, fonts, or stylesheets.

## Project files

- `index.html` — semantic application structure and five connected views.
- `styles.css` — responsive layout, accessible focus states, and reduced-motion support.
- `app.js` — navigation, validation, expense and budget calculations, and local storage.
