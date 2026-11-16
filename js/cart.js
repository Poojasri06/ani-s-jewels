/* Shared cart (localStorage) + drawer UI */
(function () {
  const KEY = "anis_cart_v1";
  const inr = n => "₹" + Number(n).toLocaleString("en-IN");
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const save = c => { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {} };
  let cart = load();

  const find = id => window.PRODUCTS.find(p => p.id === id);
  const lines = () => Object.keys(cart).map(id => ({ p: find(id), q: cart[id] })).filter(l => l.p);
  const subtotal = () => lines().reduce((s, l) => s + l.p.price * l.q, 0);
  const count = () => lines().reduce((s, l) => s + l.q, 0);
  const shipping = () => (subtotal() === 0 || subtotal() >= SITE.freeShippingAbove) ? 0 : SITE.shippingFee;

  function render() {
    document.querySelectorAll("[data-cart-count]").forEach(e => { e.textContent = count(); e.hidden = count() === 0; });
    const box = document.getElementById("cartLines"); if (!box) return;
    const ls = lines();
    box.innerHTML = ls.length ? ls.map(({ p, q }) => `
      <div class="cl"><img src="${p.img}" alt="${p.name}">
        <div><h4>${p.name}</h4><span>${inr(p.price)}</span>
          <div class="qty"><button data-dec="${p.id}" aria-label="Less">−</button><b>${q}</b><button data-inc="${p.id}" aria-label="More">+</button></div></div>
        <button class="rm" data-rm="${p.id}" aria-label="Remove">✕</button></div>`).join("")
      : `<p class="empty">Your jewellery box is empty ✿<br><a href="index.html#shop" data-close>Discover the collection</a></p>`;
    const st = document.getElementById("cartSub"); if (st) st.textContent = inr(subtotal());
    const nb = document.getElementById("cartNote");
    if (nb) { const left = SITE.freeShippingAbove - subtotal(); nb.textContent = subtotal() === 0 ? "" : left > 0 ? `Add ${inr(left)} more for free shipping` : "You’ve unlocked free shipping ✨"; }
    const go = document.getElementById("goCheckout"); if (go) go.classList.toggle("disabled", !ls.length);
  }
  const api = {
    add(id, n = 1) { cart[id] = (cart[id] || 0) + n; save(cart); render(); api.open(); },
    set(id, n) { if (n <= 0) delete cart[id]; else cart[id] = n; save(cart); render(); },
    clear() { cart = {}; save(cart); render(); },
    lines, subtotal, shipping, count, inr,
    open() { document.body.classList.add("cart-open"); },
    close() { document.body.classList.remove("cart-open"); }
  };
  window.Cart = api;

  document.addEventListener("click", e => {
    const t = e.target.closest("button,a"); if (!t) return;
    if (t.dataset.add) api.add(t.dataset.add);
    if (t.dataset.inc) api.set(t.dataset.inc, cart[t.dataset.inc] + 1);
    if (t.dataset.dec) api.set(t.dataset.dec, cart[t.dataset.dec] - 1);
    if (t.dataset.rm) api.set(t.dataset.rm, 0);
    if (t.hasAttribute("data-open-cart")) api.open();
    if (t.hasAttribute("data-close")) api.close();
    if (t.id === "goCheckout" && t.classList.contains("disabled")) e.preventDefault();
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape") api.close(); });
  document.addEventListener("DOMContentLoaded", render);
})();
