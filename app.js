const CATEGORIES = [
  { name: "Food & dining", color: "#e79a67", background: "#fcf0e7", icon: "✳" },
  { name: "Transport", color: "#7188a6", background: "#edf1f6", icon: "↗" },
  { name: "Home", color: "#74a184", background: "#edf4ef", icon: "⌂" },
  { name: "Shopping", color: "#ae9bc8", background: "#f2eff7", icon: "◇" },
  { name: "Health", color: "#d47c74", background: "#f9efed", icon: "+" },
  { name: "Other", color: "#b0a16c", background: "#f6f3e8", icon: "·" },
];

const STORAGE_KEY = "somera-expense-tracker-v1";
const PHP = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });
const today = new Date();
const dateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return dateString(date);
};
const initialState = () => ({
  transactions: [
    { id: "demo-1", merchant: "Sunday market", amount: 420, date: daysAgo(1), category: "Food & dining", paymentMethod: "Cash", recurring: false },
    { id: "demo-2", merchant: "City ride", amount: 165, date: daysAgo(2), category: "Transport", paymentMethod: "E-wallet", recurring: false },
    { id: "demo-3", merchant: "Fresh finds", amount: 890, date: daysAgo(3), category: "Food & dining", paymentMethod: "Debit card", recurring: false },
    { id: "demo-4", merchant: "Home supplies", amount: 675, date: daysAgo(5), category: "Home", paymentMethod: "Credit card", recurring: false },
    { id: "demo-5", merchant: "Coffee break", amount: 145, date: daysAgo(6), category: "Food & dining", paymentMethod: "Cash", recurring: false },
    { id: "demo-6", merchant: "Book corner", amount: 380, date: daysAgo(8), category: "Shopping", paymentMethod: "Debit card", recurring: false },
  ],
  budgets: {
    "Food & dining": 8000,
    Transport: 3500,
    Home: 5000,
    Shopping: 4000,
    Health: 2500,
    Other: 2000,
  },
});

let storageAvailable = true;
let state;
try {
  const saved = localStorage.getItem(STORAGE_KEY);
  state = saved ? JSON.parse(saved) : initialState();
  if (!state || !Array.isArray(state.transactions) || !state.budgets || typeof state.budgets !== "object") {
    throw new Error("Saved expense data has an unexpected format.");
  }
} catch (error) {
  state = initialState();
  storageAvailable = false;
  console.error("Somera could not read saved browser data.", error);
}

const $ = (selector) => document.querySelector(selector);
const categoryByName = (name) => CATEGORIES.find((category) => category.name === name) || CATEGORIES[CATEGORIES.length - 1];
const currency = (amount) => PHP.format(Number(amount) || 0);
const safeDate = (value) => {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric" }).format(date);
};
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[character]));
const currentMonthTransactions = () => state.transactions.filter((transaction) => transaction.date.slice(0, 7) === dateString(today).slice(0, 7));
const sortedTransactions = () => [...state.transactions].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

function persist() {
  if (!storageAvailable) return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    storageAvailable = false;
    console.error("Somera could not save data in this browser.", error);
    return false;
  }
}

function setFeedback(element, message, isError = false) {
  element.textContent = message;
  element.classList.toggle("is-error", isError);
}

function renderSummary() {
  const monthTransactions = currentMonthTransactions();
  const monthSpent = monthTransactions.reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const totalBudget = Object.values(state.budgets).reduce((sum, value) => sum + Number(value), 0);
  $("#monthly-spending").textContent = currency(monthSpent);
  $("#remaining-budget").textContent = currency(totalBudget - monthSpent);
  $("#transaction-count").textContent = String(monthTransactions.length);
  $("#budget-footnote").textContent = totalBudget > 0 ? `of ${currency(totalBudget)} monthly limits` : "Set a budget to get started";
}

function renderCategoryBreakdown() {
  const monthTransactions = currentMonthTransactions();
  const totals = CATEGORIES.map((category) => ({
    ...category,
    total: monthTransactions.filter((transaction) => transaction.category === category.name).reduce((sum, transaction) => sum + Number(transaction.amount), 0),
  })).filter((category) => category.total > 0).sort((a, b) => b.total - a.total);
  const max = Math.max(...totals.map((category) => category.total), 1);
  $("#category-breakdown").innerHTML = totals.length
    ? totals.slice(0, 5).map((category) => `<div class="category-line" style="--category-color:${category.color}"><span class="category-name"><i class="category-dot" aria-hidden="true"></i>${escapeHTML(category.name)}</span><span class="progress-track" aria-hidden="true"><span class="progress-fill" style="display:block;width:${Math.max(3, (category.total / max) * 100)}%"></span></span><span class="category-amount">${currency(category.total)}</span></div>`).join("")
    : '<p class="page-intro">Your category totals will show up here as you log expenses.</p>';
}

function renderRecentTransactions() {
  const entries = sortedTransactions().slice(0, 4);
  $("#recent-transactions").innerHTML = entries.length
    ? entries.map((transaction) => {
      const category = categoryByName(transaction.category);
      return `<div class="recent-item"><span class="merchant-icon" style="--icon-bg:${category.background};--icon-color:${category.color}" aria-hidden="true">${category.icon}</span><span><span class="recent-merchant">${escapeHTML(transaction.merchant)}</span><span class="recent-category">${escapeHTML(transaction.category)} · ${safeDate(transaction.date)}</span></span><span class="recent-amount">−${currency(transaction.amount)}</span></div>`;
    }).join("")
    : '<p class="page-intro">Nothing logged yet. Add an expense to see it here.</p>';
}

function renderActivity() {
  const query = $("#transaction-search").value.trim().toLocaleLowerCase();
  const category = $("#category-filter").value;
  const entries = sortedTransactions().filter((transaction) => (
    transaction.merchant.toLocaleLowerCase().includes(query)
    && (category === "all" || transaction.category === category)
  ));
  $("#activity-result-count").textContent = `${entries.length} ${entries.length === 1 ? "expense" : "expenses"}`;
  $("#transaction-rows").innerHTML = entries.map((transaction) => (
    `<tr><td>${escapeHTML(transaction.merchant)}</td><td>${escapeHTML(transaction.category)}</td><td>${safeDate(transaction.date)}</td><td class="amount-cell">−${currency(transaction.amount)}</td></tr>`
  )).join("");
  $("#empty-activity").hidden = entries.length > 0;
  $(".table-scroll").hidden = entries.length === 0;
}

function renderBudgets() {
  const monthTransactions = currentMonthTransactions();
  const totalBudget = Object.values(state.budgets).reduce((sum, value) => sum + Number(value), 0);
  $("#total-budget").textContent = currency(totalBudget);
  $("#budget-overview-caption").textContent = totalBudget > 0
    ? `${currency(monthTransactions.reduce((sum, transaction) => sum + Number(transaction.amount), 0))} spent so far. Your plan is only a guide.`
    : "Add category limits below to create a monthly guide.";
  $("#budget-cards").innerHTML = CATEGORIES.map((category) => {
    const limit = Number(state.budgets[category.name]) || 0;
    const spent = monthTransactions.filter((transaction) => transaction.category === category.name).reduce((sum, transaction) => sum + Number(transaction.amount), 0);
    const progress = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
    const remaining = limit - spent;
    const status = limit <= 0 ? "No limit set" : remaining >= 0 ? `${currency(remaining)} left` : `${currency(Math.abs(remaining))} over`;
    return `<article class="budget-card"><div class="budget-card-top"><span class="budget-card-name"><span class="budget-card-icon" style="--icon-bg:${category.background};--icon-color:${category.color}" aria-hidden="true">${category.icon}</span>${escapeHTML(category.name)}</span></div><p class="budget-spent">${currency(spent)}</p><p class="budget-limit">of ${limit > 0 ? currency(limit) : "no limit"}</p><div class="progress-track" role="progressbar" aria-label="${escapeHTML(category.name)} budget used" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(progress)}"><span class="progress-fill" style="display:block;width:${progress}%;--category-color:${category.color}"></span></div><div class="budget-card-foot"><span>${status}</span><span class="${remaining < 0 ? "over-budget" : ""}">${limit > 0 ? `${Math.round((spent / limit) * 100)}%` : "—"}</span></div></article>`;
  }).join("");
}

function renderAll() {
  renderSummary();
  renderCategoryBreakdown();
  renderRecentTransactions();
  renderActivity();
  renderBudgets();
}

function populateCategorySelects() {
  const options = CATEGORIES.map((category) => `<option value="${escapeHTML(category.name)}">${escapeHTML(category.name)}</option>`).join("");
  $("#expense-category").innerHTML = `<option value="" disabled selected>Choose a category</option>${options}`;
  $("#category-filter").insertAdjacentHTML("beforeend", options);
  $("#budget-category").innerHTML = options;
}

function showView(viewName, updateHistory = true) {
  const view = document.querySelector(`[data-page="${viewName}"]`);
  if (!view) return;
  document.querySelectorAll(".view").forEach((section) => {
    const isVisible = section === view;
    section.hidden = !isVisible;
    section.classList.toggle("is-visible", isVisible);
  });
  document.querySelectorAll(".nav-link").forEach((link) => {
    const isActive = link.dataset.view === viewName;
    link.classList.toggle("is-active", isActive);
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  if (updateHistory && location.hash !== `#${viewName}`) history.pushState({ view: viewName }, "", `#${viewName}`);
  if (viewName === "activity") renderActivity();
  if (viewName === "budgets") renderBudgets();
  view.querySelector("h1")?.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll("[data-view]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showView(link.dataset.view);
  });
});
window.addEventListener("popstate", () => showView(location.hash.slice(1) || "overview", false));

populateCategorySelects();
$("#today-label").textContent = new Intl.DateTimeFormat("en-PH", { weekday: "long", month: "long", day: "numeric" }).format(today).toUpperCase();
$("#expense-date").value = dateString(today);
$("#transaction-search").addEventListener("input", renderActivity);
$("#category-filter").addEventListener("change", renderActivity);
$("#expense-form").addEventListener("reset", () => {
  window.setTimeout(() => {
    $("#expense-date").value = dateString(today);
    setFeedback($("#form-feedback"), "");
  }, 0);
});
$("#expense-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const amount = Number(data.get("amount"));
  const date = String(data.get("date"));
  if (!Number.isFinite(amount) || amount <= 0 || amount > 10000000 || date > dateString(today)) {
    setFeedback($("#form-feedback"), "Enter a positive amount and a date that is today or earlier.", true);
    return;
  }
  const transaction = {
    id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    merchant: String(data.get("merchant")).trim(),
    amount: Math.round(amount * 100) / 100,
    date,
    category: String(data.get("category")),
    paymentMethod: String(data.get("paymentMethod")),
    recurring: data.get("recurring") === "on",
  };
  if (!transaction.merchant || !CATEGORIES.some((category) => category.name === transaction.category)) {
    setFeedback($("#form-feedback"), "Check the merchant and category, then try again.", true);
    return;
  }
  state.transactions.push(transaction);
  const saved = persist();
  renderAll();
  $("#merchant").value = "";
  $("#amount").value = "";
  $("#expense-category").value = "";
  $("#payment-method").value = "Cash";
  $("#recurring").checked = false;
  $("#expense-date").value = dateString(today);
  const feedback = saved ? "Expense saved on this device." : "Expense added for this session, but this browser couldn't save it. Check your browser storage settings.";
  setFeedback($("#form-feedback"), feedback, !saved);
  form.querySelector("#merchant").focus();
});

$("#budget-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const category = String(data.get("category"));
  const limit = Number(data.get("budget"));
  if (!CATEGORIES.some((entry) => entry.name === category) || !Number.isFinite(limit) || limit < 0 || limit > 10000000) {
    setFeedback($("#budget-feedback"), "Choose a category and enter a non-negative limit.", true);
    return;
  }
  state.budgets[category] = Math.round(limit * 100) / 100;
  const saved = persist();
  renderAll();
  setFeedback($("#budget-feedback"), saved ? `${category} limit updated.` : "Limit updated for this session, but this browser couldn't save it.", !saved);
});

$("#clear-data").addEventListener("click", () => {
  if (!window.confirm("Clear all locally saved expenses and reset the example budgets? This cannot be undone.")) return;
  state = initialState();
  const saved = persist();
  renderAll();
  setFeedback($("#clear-feedback"), saved ? "Demo data cleared and example data restored." : "Example data restored for this session, but this browser couldn't save it.", !saved);
});

if (!storageAvailable) {
  setFeedback($("#form-feedback"), "Browser storage is unavailable. Changes will last only for this session.", true);
}
renderAll();
const initialView = location.hash.slice(1);
showView(document.querySelector(`[data-page="${initialView}"]`) ? initialView : "overview", false);
