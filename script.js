/* WEAR THE RISE — site script */

const WHATSAPP_NUMBER = '26774396369';
const STORAGE_KEY = 'wtr_cart_v1';

/* ---------- MOBILE NAV ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
  }

  /* Highlight current page */
  const path = location.pathname.split('/').pop() || 'home.html';
  document.querySelectorAll('.nav a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });

  /* Scroll reveal */
  const els = document.querySelectorAll('.fade-in');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));

  /* Cart init */
  renderCart();
  updateCartCount();

  /* Filters (shop) */
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      document.querySelectorAll('.product').forEach(p => {
        p.style.display = (cat === 'all' || p.dataset.category === cat) ? 'flex' : 'none';
      });
    });
  });

  /* Contact form */
  const form = document.querySelector('#contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.querySelector('[name=name]').value;
      const email = form.querySelector('[name=email]').value;
      const message = form.querySelector('[name=message]').value;
      const subject = encodeURIComponent('Wear The Rise — Enquiry from ' + name);
      const body = encodeURIComponent(message + '\n\n— ' + name + ' (' + email + ')');
      window.location.href = 'mailto:info@boseleholdings.co.bw?subject=' + subject + '&body=' + body;
      showToast('Thank you — opening your email app.');
      form.reset();
    });
  }
});

/* ---------- TOAST ---------- */
function showToast(msg) {
  let t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2400);
}

/* ---------- CART ---------- */
function getCart() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveCart(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  updateCartCount();
  renderCart();
}
function addToCart(id, name, price, image) {
  const items = getCart();
  const existing = items.find(i => i.id === id);
  if (existing) existing.qty += 1;
  else items.push({ id, name, price, image, qty: 1 });
  saveCart(items);
  showToast(name + ' added to cart');
  openCart();
}
function removeFromCart(id) {
  saveCart(getCart().filter(i => i.id !== id));
}
function changeQty(id, delta) {
  const items = getCart();
  const it = items.find(i => i.id === id);
  if (!it) return;
  it.qty = Math.max(1, it.qty + delta);
  saveCart(items);
}
function updateCartCount() {
  const count = getCart().reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'inline-block' : 'none';
  });
}
function renderCart() {
  const list = document.querySelector('.cart-items');
  const totalEl = document.querySelector('.cart-total-amount');
  if (!list) return;
  const items = getCart();
  if (items.length === 0) {
    list.innerHTML = '<div class="cart-empty">Your cart is empty.<br>Begin your journey on the Shop page.</div>';
    if (totalEl) totalEl.textContent = 'P 0';
    return;
  }
  list.innerHTML = items.map(i => `
    <div class="cart-item">
      <img src="images/${i.image}" alt="${i.name}">
      <div class="cart-item-info">
        <div class="cart-item-name">${i.name}</div>
        <div class="cart-item-price">P ${i.price.toLocaleString()}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty('${i.id}', -1)">−</button>
          <span>${i.qty}</span>
          <button class="qty-btn" onclick="changeQty('${i.id}', 1)">+</button>
          <button class="cart-remove" onclick="removeFromCart('${i.id}')">remove</button>
        </div>
      </div>
    </div>
  `).join('');
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  if (totalEl) totalEl.textContent = 'P ' + total.toLocaleString();
}
function openCart() {
  document.querySelector('.cart-drawer')?.classList.add('open');
  document.querySelector('.cart-overlay')?.classList.add('show');
}
function closeCart() {
  document.querySelector('.cart-drawer')?.classList.remove('open');
  document.querySelector('.cart-overlay')?.classList.remove('show');
}
function checkoutWhatsapp() {
  const items = getCart();
  if (items.length === 0) { showToast('Your cart is empty.'); return; }
  let msg = 'Hi WEAR THE RISE, I would like to order:%0A%0A';
  items.forEach(i => {
    msg += '• ' + i.name + ' x' + i.qty + ' — P ' + (i.price * i.qty).toLocaleString() + '%0A';
  });
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  msg += '%0ATotal: P ' + total.toLocaleString();
  window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + msg, '_blank');
}
function orderProductWhatsapp(name, price) {
  const msg = encodeURIComponent('Hi WEAR THE RISE, I would like to order:\n\n• ' + name + ' — P ' + price.toLocaleString());
  window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + msg, '_blank');
}
