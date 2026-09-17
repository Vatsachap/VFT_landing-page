(function () {
  "use strict";

  // Paste your live Razorpay key id here to make the pay button go live.
  const RAZORPAY_KEY = "";

  const PLANS = [
    {
      slot: "CHECK-IN PHOTO",
      video: "assets/videos/plan-accountability.mp4",
      title: "Accountability plan",
      INR: [2399, 6477],
      USD: [28, 76],
      items: [
        "Regular customised workouts",
        "Form reviews on your video",
        "Nutrition targets, veg or non-veg",
        "Direct line to your coach"
      ]
    },
    {
      slot: "LIFTING PHOTO",
      video: "assets/videos/plan-powerbuilding.mp4",
      title: "Power building",
      INR: [2799, 7557],
      USD: [32, 86],
      items: [
        "Strength and hypertrophy in one block",
        "Squat, bench, deadlift progressions",
        "Accessory work that fills the gaps",
        "Peaking and deload cycles"
      ]
    }
  ];

  const state = { currency: "INR", term: 1, selectedPlan: 0, paying: false };

  const el = {
    currencyToggle: document.getElementById("currency-toggle"),
    termToggle: document.getElementById("term-toggle"),
    plansGrid: document.getElementById("plans-grid"),
    checkoutPlans: document.getElementById("checkout-plans"),
    summaryTitle: document.getElementById("summary-title"),
    summaryPrice: document.getElementById("summary-price"),
    payBtn: document.getElementById("pay-btn")
  };

  function money(n) {
    const sym = state.currency === "USD" ? "$" : "₹";
    return sym + n.toLocaleString("en-US");
  }

  function pricedPlans() {
    const termIndex = state.term === 3 ? 1 : 0;
    const per = state.term === 3 ? "for 3 months" : "per month";
    return PLANS.map((p) => {
      const amount = p[state.currency][termIndex];
      return {
        ...p,
        price: money(amount),
        per,
        amountPaise: amount * 100
      };
    });
  }

  function render() {
    const priced = pricedPlans();
    const selected = priced[state.selectedPlan] || priced[0];

    // Currency / term segmented controls
    el.currencyToggle.querySelectorAll("button").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.currency === state.currency);
    });
    el.termToggle.querySelectorAll("button").forEach((btn) => {
      btn.classList.toggle("is-active", Number(btn.dataset.term) === state.term);
    });

    // Plans grid
    el.plansGrid.innerHTML = priced.map((p) => `
      <article class="plan-card">
        <div class="plan-media">
          <video src="${p.video}" autoplay muted loop playsinline></video>
        </div>
        <h3 class="plan-title">${p.title}</h3>
        <div class="plan-price-row">
          <span class="plan-price">${p.price}</span>
          <span class="plan-per">${p.per}</span>
        </div>
        <ul class="plan-features">
          ${p.items.map((it) => `<li>${it}</li>`).join("")}
        </ul>
      </article>
    `).join("");

    // Checkout plan rows
    el.checkoutPlans.innerHTML = priced.map((p, i) => `
      <button type="button" class="checkout-plan-row${i === state.selectedPlan ? " is-selected" : ""}" data-plan-index="${i}">
        <span class="row-meta">
          <span class="row-title">${p.title}</span>
          <span class="row-per">${p.per}</span>
        </span>
        <span class="row-price">${p.price}</span>
      </button>
    `).join("");
    el.checkoutPlans.querySelectorAll(".checkout-plan-row").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.selectedPlan = Number(btn.dataset.planIndex);
        state.paying = false;
        render();
      });
    });

    // Summary
    el.summaryTitle.textContent = selected.title;
    el.summaryPrice.textContent = selected.price;
    el.payBtn.textContent = state.paying ? "Razorpay key needed" : "Pay with Razorpay";
    el.payBtn.onclick = () => pay(selected);
  }

  function pay(plan) {
    if (!RAZORPAY_KEY || !window.Razorpay) {
      state.paying = true;
      render();
      return;
    }
    new window.Razorpay({
      key: RAZORPAY_KEY,
      amount: plan.amountPaise,
      currency: state.currency,
      name: "VFT — Vatsa's Fitness Team",
      description: plan.title,
      theme: { color: "#E8E4DA" }
    }).open();
  }

  el.currencyToggle.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-currency]");
    if (!btn) return;
    state.currency = btn.dataset.currency;
    state.paying = false;
    render();
  });

  el.termToggle.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-term]");
    if (!btn) return;
    state.term = Number(btn.dataset.term);
    state.paying = false;
    render();
  });

  render();

  // Instagram embeds load asynchronously; process once the script is ready.
  function processInstagramEmbeds() {
    if (window.instgrm && window.instgrm.Embeds) {
      window.instgrm.Embeds.process();
    } else {
      setTimeout(processInstagramEmbeds, 300);
    }
  }
  processInstagramEmbeds();
})();
