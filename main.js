/* ============================================================
   W&B LANDSCAPING & CLEANING SERVICE — Main JS
   ============================================================ */

// ---------- NAVBAR SCROLL ----------
const navbar = document.getElementById('navbar');
if (navbar) {
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ---------- MOBILE TOGGLE ----------
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
    }
  });
}

// ---------- HERO SLIDER (old full-screen slider — kept for compat) ----------
const heroSlider = document.getElementById('heroSlider');
const heroDots   = document.getElementById('heroDots');
if (heroSlider && heroDots) {
  const slides = heroSlider.querySelectorAll('.hero-slide');
  const dots   = heroDots.querySelectorAll('.dot');
  let current  = 0;
  let timer;
  const goTo = (idx) => {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  };
  const startTimer = () => { timer = setInterval(() => goTo(current + 1), 5000); };
  const resetTimer = () => { clearInterval(timer); startTimer(); };
  dots.forEach((dot, i) => { dot.addEventListener('click', () => { goTo(i); resetTimer(); }); });
  startTimer();
}

// ---------- HERO RIGHT-PANEL SLIDER ----------
const heroRight     = document.getElementById('heroRight');
const heroSlideDots = document.getElementById('heroSlideDots');
if (heroRight && heroSlideDots) {
  const slides = heroRight.querySelectorAll('.hero-slide');
  const dots   = heroSlideDots.querySelectorAll('.hero-slide-dot');
  let current  = 0;
  let timer;

  const goTo = (idx) => {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  };

  const startTimer = () => { timer = setInterval(() => goTo(current + 1), 4500); };
  const resetTimer = () => { clearInterval(timer); startTimer(); };

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); resetTimer(); });
  });

  startTimer();
}

// ---------- GALLERY FILTER ----------
const galleryGrid = document.getElementById('galleryGrid');
if (galleryGrid) {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      galleryGrid.querySelectorAll('.gallery-item').forEach(item => {
        item.classList.toggle('hidden', filter !== 'all' && item.dataset.category !== filter);
      });
    });
  });
}

// ---------- LIGHTBOX ----------
const lightbox = document.getElementById('lightbox');
if (lightbox) {
  const lbImg     = document.getElementById('lightboxImg');
  const lbCaption = document.getElementById('lightboxCaption');
  const lbClose   = document.getElementById('lightboxClose');
  const lbPrev    = document.getElementById('lightboxPrev');
  const lbNext    = document.getElementById('lightboxNext');
  let items = [];
  let lbIndex = 0;

  const openLightbox = (idx) => {
    items = Array.from(document.querySelectorAll('.gallery-item:not(.hidden)'));
    lbIndex = idx;
    showLb();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  };

  const showLb = () => {
    const item = items[lbIndex];
    const img  = item.querySelector('img');
    const cap  = item.querySelector('.gallery-overlay span');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    if (lbCaption) lbCaption.textContent = cap ? cap.textContent : '';
  };

  document.addEventListener('click', (e) => {
    const item = e.target.closest('.gallery-item');
    if (!item) return;
    const visibles = Array.from(document.querySelectorAll('.gallery-item:not(.hidden)'));
    openLightbox(visibles.indexOf(item));
  });

  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbPrev)  lbPrev.addEventListener('click', () => { lbIndex = (lbIndex - 1 + items.length) % items.length; showLb(); });
  if (lbNext)  lbNext.addEventListener('click', () => { lbIndex = (lbIndex + 1) % items.length; showLb(); });

  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft')  { lbIndex = (lbIndex - 1 + items.length) % items.length; showLb(); }
    if (e.key === 'ArrowRight') { lbIndex = (lbIndex + 1) % items.length; showLb(); }
  });
}

// ---------- SCROLL REVEAL ----------
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal, .reveal-group').forEach(el => revealObserver.observe(el));

// ---------- CONTACT FORM HANDLER ----------
function setupContactForm(formId, subject) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = this.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending...';

    const name    = (this.querySelector('[name="name"]') || {}).value?.trim() || '';
    const phone   = (this.querySelector('[name="phone"]') || {}).value?.trim() || '';
    const email   = (this.querySelector('[name="email"]') || {}).value?.trim() || '';
    const service = (this.querySelector('[name="service"]') || {}).value?.trim() || '';
    const city    = (this.querySelector('[name="city"]') || {}).value?.trim() || '';
    const message = (this.querySelector('[name="message"]') || {}).value?.trim() || '';

    try {
      const res  = await fetch('https://wb-contact-worker.jawadyah.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, service, city, message, subject: subject || 'New Quote Request — W&B Landscaping' }),
      });
      const json = await res.json();

      if (json.success) {
        form.innerHTML = '<div style="text-align:center;padding:2.5rem 0"><svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#2d6a2d" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg><h3 style="margin-top:1rem;font-family:Raleway,sans-serif">Request Sent!</h3><p style="color:#6b7280;margin-top:.5rem">Thanks! We\'ll get back to you within 1 business day.</p></div>';
      } else {
        btn.disabled = false;
        btn.textContent = 'Send My Request';
        alert('Something went wrong. Please try again or call us at (845) 584-6245.');
      }
    } catch {
      btn.disabled = false;
      btn.textContent = 'Send My Request';
      alert('Something went wrong. Please try again or call us at (845) 584-6245.');
    }
  });
}
