const cart = new Map();
const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 });
const cartCount = document.querySelector("#cart-count");
const cartToggle = document.querySelector("#cart-toggle");
const cartDrawer = document.querySelector("#cart-drawer");
const cartItems = document.querySelector("#cart-items");
const cartTotal = document.querySelector("#cart-total");

function renderCart() {
  if (!cartCount || !cartItems || !cartTotal) return;

  const items = [...cart.values()];
  const count = items.reduce((total, item) => total + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartCount.textContent = `(${count})`;
  cartItems.innerHTML = items.length
    ? items.map(({ name, price, quantity }) => `<li>${name} × ${quantity} — ${peso.format(price * quantity)}</li>`).join("")
    : "<li>Nothing here just yet.</li>";
  cartTotal.textContent = `Demo total: ${peso.format(total)}`;
}

document.querySelectorAll(".add-to-cart").forEach((button) => {
  button.addEventListener("click", () => {
    const { name, price } = button.dataset;
    if (!name || !Number.isFinite(Number(price))) {
      console.error("This product could not be added because its details are missing.");
      return;
    }

    const existingItem = cart.get(name);
    cart.set(name, { name, price: Number(price), quantity: (existingItem?.quantity || 0) + 1 });
    renderCart();
    button.textContent = "Added — add another?";
    window.setTimeout(() => {
      button.textContent = `Add to bag — ${peso.format(Number(price))}`;
    }, 1200);
  });
});

cartToggle?.addEventListener("click", () => {
  const isOpen = cartToggle.getAttribute("aria-expanded") === "true";
  cartToggle.setAttribute("aria-expanded", String(!isOpen));
  cartDrawer.hidden = isOpen;
});

const bloomTabs = [...document.querySelectorAll("[data-bloom-tab]")];
const bloomView = document.querySelector("#bloom-view");
const bloomPanel = document.querySelector("#bloom-panel");

const bloomViews = {
  today: `
    <h2 class="bloom-welcome">Good morning, grower.</h2>
    <p class="bloom-subtitle">A few gentle reminders for today.</p>
    <div class="plant-highlight"><img src="https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&amp;fit=crop&amp;w=500&amp;q=80" alt="Green leaves catching the sunlight"><div><p>YOUR SUNSHINE FRIEND</p><h3>Monstera</h3><span>Bright, indirect light · Water weekly</span></div></div>
    <div class="care-list"><h3>A little care for today</h3><label class="care-task"><input type="checkbox"><span>Check if the Monstera's soil feels dry</span></label><label class="care-task"><input type="checkbox"><span>Turn the Pothos toward the window</span></label></div>`,
  plants: `
    <h2 class="bloom-welcome">Meet your leafy crew.</h2>
    <p class="bloom-subtitle">Everybody grows at their own pace.</p>
    <div class="bloom-plant-list">
      <article class="bloom-plant-card"><h3>Monstera</h3><p>Bright, indirect light<br>Water when the top soil is dry<br>Last watered: Monday</p></article>
      <article class="bloom-plant-card"><h3>Golden Pothos</h3><p>Easygoing, low light<br>Water about once a week<br>Last watered: Tuesday</p></article>
      <article class="bloom-plant-card"><h3>Little Fern</h3><p>Likes a humid corner<br>Keep the soil lightly moist<br>Last watered: Wednesday</p></article>
    </div>`,
  notes: `
    <h2 class="bloom-welcome">A note to slow down.</h2>
    <p class="bloom-subtitle">Little observations from the windowsill.</p>
    <div class="bloom-note"><strong>Thursday · A new leaf!</strong>The Monstera has a tiny new leaf unfurling. I moved it a little closer to the morning light and gave it a gentle hello.</div>
    <div class="bloom-note"><strong>Tuesday · A small reminder</strong>Not every day needs a big change. Turning the pots toward the sun was enough for today.</div>`,
};

function selectBloomTab(selectedTab) {
  bloomTabs.forEach((tab) => {
    const selected = tab === selectedTab;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  bloomPanel.setAttribute("aria-labelledby", selectedTab.id);
  bloomView.innerHTML = bloomViews[selectedTab.dataset.bloomTab];
}

bloomTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectBloomTab(tab));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === "Home" ? 0
      : event.key === "End" ? bloomTabs.length - 1
        : (index + (event.key === "ArrowRight" ? 1 : -1) + bloomTabs.length) % bloomTabs.length;
    bloomTabs[nextIndex].focus();
    selectBloomTab(bloomTabs[nextIndex]);
  });
});

bloomView?.addEventListener("change", (event) => {
  if (event.target instanceof HTMLInputElement && event.target.type === "checkbox") {
    event.target.closest(".care-task").classList.toggle("is-done", event.target.checked);
  }
});
