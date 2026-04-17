// WELCOME MODAL
window.addEventListener('load', () => setTimeout(() => document.getElementById('welcomeModal').classList.add('open'), 600));
function closeWelcome() {
    const m = document.getElementById('welcomeModal');
    m.style.opacity = '0';
    setTimeout(() => { m.style.display = 'none'; }, 400);
}
document.getElementById('welcomeModal').addEventListener('click', function (e) {
    if (e.target === this) closeWelcome();
});

// PHOTO UPLOAD
function handlePhoto(event, imgId, phId) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        const img = document.getElementById(imgId);
        const ph = document.getElementById(phId);
        img.src = e.target.result;
        img.style.display = 'block';
        if (ph) ph.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

// NAVBAR
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    document.getElementById('scrollTop').classList.toggle('visible', window.scrollY > 400);
    let cur = '';
    document.querySelectorAll('section[id],footer[id]').forEach(s => { if (window.scrollY >= s.offsetTop - 100) cur = s.id; });
    document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + cur));
});

// MOBILE MENU
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => { navToggle.classList.toggle('active'); navLinks.classList.toggle('open'); });
document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => { navToggle.classList.remove('active'); navLinks.classList.remove('open'); }));

// SMOOTH SCROLL
document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); const t = document.querySelector(a.getAttribute('href')); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));

// FADE IN
const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));

// TYPING EFFECT
const roles = ['Web Developer 💻', 'UI/UX Designer 🎨', 'Hardware Enthusiast 🖥️', 'Front-End Developer ⚡', 'Figma Designer ✏️', 'PC Builder 🔧'];
let ri = 0, ci = 0, del = false;
const tspan = document.getElementById('typingSpan');
function type() {
    const r = roles[ri];
    tspan.textContent = del ? r.substring(0, ci - 1) : r.substring(0, ci + 1);
    del ? ci-- : ci++;
    if (!del && ci === r.length) { del = true; setTimeout(type, 1800); return; }
    if (del && ci === 0) { del = false; ri = (ri + 1) % roles.length; setTimeout(type, 300); return; }
    setTimeout(type, del ? 55 : 95);
}
setTimeout(type, 1200);