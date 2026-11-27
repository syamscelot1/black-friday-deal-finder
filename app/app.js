// Black Friday Vault — rendering, search, filters, sorting and the detail view.
// One job: take DEALS, the user's filters and the hash route, and paint the page.
// No network calls anywhere: everything shown comes from deals.js.

import { DEALS, CHECKED_NOTE } from "./deals.js";
import { discountPct, amountSaved, money, verdictFor, topDeals } from "./verdict.js";

const grid = document.getElementById("deal-grid");
const countLine = document.getElementById("result-count");
const chipsBox = document.getElementById("category-chips");
const storeSelect = document.getElementById("store-filter");
const minSelect = document.getElementById("min-discount");
const sortSelect = document.getElementById("sort-order");
const searchBox = document.getElementById("search-box");
const listView = document.getElementById("list-view");
const detailView = document.getElementById("detail-view");
const topGrid = document.getElementById("top-grid");

const CATEGORIES = [...new Set(DEALS.map((d) => d.cat))];
const STORES = [...new Set(DEALS.map((d) => d.store))].sort();

const state = { q: "", cat: "All", store: "All", min: 0, sort: "verdict" };

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function storeBadgeClass(store) {
  return "store-" + store.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function cardHtml(d) {
  const v = verdictFor(d);
  const pct = discountPct(d);
  return `<article class="card verdict-${v.level}">
    <div class="card-top"><span class="store-badge ${storeBadgeClass(d.store)}">${escapeHtml(d.store)}</span><span class="cat-tag">${escapeHtml(d.cat)}</span></div>
    <h3 class="card-name"><a href="#/deal/${d.id}">${escapeHtml(d.name)}</a></h3>
    <div class="price-row"><span class="sale">${money(d.sale)}</span><span class="usual">${money(d.usual)}</span><span class="off">−${pct}%</span></div>
    <div class="save-line">You save ${money(amountSaved(d))}</div>
    <div class="verdict"><span class="verdict-dot"></span><strong>${v.label}</strong> — ${escapeHtml(v.short)}</div>
    <p class="why">${escapeHtml(d.why)}</p>
    ${d.note ? `<p class="note">${escapeHtml(d.note)}</p>` : ""}
    <div class="card-meta">Checked ${escapeHtml(d.checked)} · Source: ${escapeHtml(d.srcName)}</div>
    <div class="card-actions">
      <a class="btn-store" href="${escapeHtml(d.url)}" target="_blank" rel="noopener">View at ${escapeHtml(d.store)} →</a>
      <a class="btn-detail" href="#/deal/${d.id}">Details</a>
    </div>
  </article>`;
}

function applyFilters() {
  const q = state.q.trim().toLowerCase();
  let list = DEALS.filter((d) => {
    if (state.cat !== "All" && d.cat !== state.cat) return false;
    if (state.store !== "All" && d.store !== state.store) return false;
    if (discountPct(d) < state.min) return false;
    if (q && !(d.name + " " + d.store + " " + d.cat).toLowerCase().includes(q)) return false;
    return true;
  });
  const by = {
    verdict: (a, b) => verdictFor(a).rank - verdictFor(b).rank || discountPct(b) - discountPct(a),
    discount: (a, b) => discountPct(b) - discountPct(a) || amountSaved(b) - amountSaved(a),
    price: (a, b) => a.sale - b.sale,
    saved: (a, b) => amountSaved(b) - amountSaved(a),
    name: (a, b) => a.name.localeCompare(b.name),
  }[state.sort];
  return list.sort(by);
}

function renderList() {
  const list = applyFilters();
  grid.innerHTML = list.map(cardHtml).join("");
  countLine.textContent = list.length === DEALS.length
    ? `Showing all ${DEALS.length} deals`
    : `Showing ${list.length} of ${DEALS.length} deals`;
  if (list.length === 0) {
    grid.innerHTML = `<p class="empty">No deals match those filters. <button id="clear-filters" type="button">Clear filters</button></p>`;
    document.getElementById("clear-filters").addEventListener("click", resetFilters);
  }
}

function renderTop() {
  topGrid.innerHTML = topDeals(DEALS, 6).map(cardHtml).join("");
}

function detailHtml(d) {
  const v = verdictFor(d);
  const pct = discountPct(d);
  const host = new URL(d.src).hostname.replace(/^www\./, "");
  return `<article class="detail">
    <a class="back" href="#/">← Back to all deals</a>
    <div class="card-top"><span class="store-badge ${storeBadgeClass(d.store)}">${escapeHtml(d.store)}</span><span class="cat-tag">${escapeHtml(d.cat)}</span></div>
    <h2>${escapeHtml(d.name)}</h2>
    <div class="detail-prices">
      <div class="dp"><span class="dp-label">Sale price</span><span class="dp-sale">${money(d.sale)}</span></div>
      <div class="dp"><span class="dp-label">Usual price</span><span class="dp-usual">${money(d.usual)}</span></div>
      <div class="dp"><span class="dp-label">Discount</span><span class="dp-off">−${pct}%</span></div>
      <div class="dp"><span class="dp-label">You save</span><span class="dp-save">${money(amountSaved(d))}</span></div>
    </div>
    <div class="verdict verdict-big"><span class="verdict-dot"></span><strong>${v.label}</strong> — ${escapeHtml(v.short)}</div>
    <h3>Why this is a real deal</h3>
    <p>${escapeHtml(d.why)}</p>
    ${d.note ? `<p class="note">${escapeHtml(d.note)}</p>` : ""}
    <h3>How it was checked</h3>
    <ul class="check-list">
      <li>Price checked: <strong>${escapeHtml(d.checked)}</strong></li>
      <li>Price read in: <a href="${escapeHtml(d.src)}" target="_blank" rel="noopener">${escapeHtml(d.srcName)} (${escapeHtml(host)})</a> — the source names the store and the price it read there.</li>
      <li>Store link: the product page when the research exposed one, otherwise the store's own search for this exact product — never a guessed product URL.</li>
      <li>Discount is computed from the two prices: (${money(d.usual)} − ${money(d.sale)}) ÷ ${money(d.usual)} = ${pct}%.</li>
    </ul>
    <div class="detail-actions">
      <a class="btn-store btn-big" href="${escapeHtml(d.url)}" target="_blank" rel="noopener">View at ${escapeHtml(d.store)} →</a>
      <a class="btn-source" href="${escapeHtml(d.src)}" target="_blank" rel="noopener">Price source: ${escapeHtml(d.srcName)}</a>
    </div>
  </article>`;
}

function renderDetail(id) {
  const d = DEALS.find((x) => x.id === id);
  if (!d) {
    detailView.innerHTML = `<p class="empty">Deal not found. <a href="#/">Back to all deals</a></p>`;
  } else {
    detailView.innerHTML = detailHtml(d);
  }
  listView.hidden = true;
  detailView.hidden = false;
  window.scrollTo(0, 0);
}

function renderRoute() {
  const m = location.hash.match(/^#\/deal\/([\w-]+)$/);
  if (m) {
    renderDetail(m[1]);
  } else {
    detailView.hidden = true;
    listView.hidden = false;
  }
}

function buildChips() {
  chipsBox.innerHTML = ["All", ...CATEGORIES].map((c) =>
    `<button type="button" class="chip${state.cat === c ? " active" : ""}" data-cat="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join("");
  chipsBox.querySelectorAll(".chip").forEach((b) =>
    b.addEventListener("click", () => { state.cat = b.dataset.cat; buildChips(); renderList(); }));
}

function buildStores() {
  storeSelect.innerHTML = `<option value="All">All stores</option>` +
    STORES.map((s) => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join("");
}

function resetFilters() {
  state.q = ""; state.cat = "All"; state.store = "All"; state.min = 0; state.sort = "verdict";
  searchBox.value = ""; storeSelect.value = "All"; minSelect.value = "0"; sortSelect.value = "verdict";
  buildChips(); renderList();
}

// Read initial state from the query string (?q=&cat=&store=&min=&sort=) so a
// filtered view is a real, shareable URL — and so a screenshot can show it.
function readQuery() {
  const p = new URLSearchParams(location.search);
  if (p.get("q")) { state.q = p.get("q"); searchBox.value = state.q; }
  if (p.get("cat") && (p.get("cat") === "All" || CATEGORIES.includes(p.get("cat")))) state.cat = p.get("cat");
  if (p.get("store") && (p.get("store") === "All" || STORES.includes(p.get("store")))) { state.store = p.get("store"); storeSelect.value = state.store; }
  const min = Number(p.get("min"));
  if ([0, 20, 30, 40, 50].includes(min)) { state.min = min; minSelect.value = String(min); }
  if (["verdict", "discount", "price", "saved", "name"].includes(p.get("sort"))) { state.sort = p.get("sort"); sortSelect.value = state.sort; }
}

function renderStats() {
  const avg = Math.round(DEALS.reduce((s, d) => s + discountPct(d), 0) / DEALS.length);
  const saved = DEALS.reduce((s, d) => s + amountSaved(d), 0);
  document.getElementById("stat-deals").textContent = DEALS.length;
  document.getElementById("stat-stores").textContent = STORES.length;
  document.getElementById("stat-cats").textContent = CATEGORIES.length;
  document.getElementById("stat-avg").textContent = avg + "%";
  document.getElementById("stat-saved").textContent = "$" + Math.round(saved).toLocaleString("en-US");
  document.getElementById("checked-note").textContent = CHECKED_NOTE;
}

searchBox.addEventListener("input", () => { state.q = searchBox.value; renderList(); });
storeSelect.addEventListener("change", () => { state.store = storeSelect.value; renderList(); });
minSelect.addEventListener("change", () => { state.min = Number(minSelect.value); renderList(); });
sortSelect.addEventListener("change", () => { state.sort = sortSelect.value; renderList(); });
document.getElementById("reset-filters").addEventListener("click", resetFilters);
window.addEventListener("hashchange", renderRoute);

buildStores();
readQuery();
buildChips();
renderStats();
renderTop();
renderList();
renderRoute();
