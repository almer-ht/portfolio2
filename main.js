// =============================================
// TOAST NOTIFICATION
// =============================================

/**
 * Tampilkan toast notifikasi di pojok kanan bawah.
 * @param {string} msg   - Pesan yang ditampilkan
 * @param {string} type  - 'success' | 'error' | 'info'
 */
function showToast(msg, type = 'success') {
    // Buat container toast kalau belum ada
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 99999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    const colors = {
        success: { bg: 'linear-gradient(135deg,#22c55e,#16a34a)', icon: '✅' },
        error:   { bg: 'linear-gradient(135deg,#ef4444,#dc2626)', icon: '❌' },
        info:    { bg: 'linear-gradient(135deg,#3b82f6,#2563eb)', icon: 'ℹ️'  },
    };
    const { bg, icon } = colors[type] || colors.success;

    const toast = document.createElement('div');
    toast.style.cssText = `
        background: ${bg};
        color: #fff;
        padding: 12px 18px;
        border-radius: 12px;
        font-family: 'Poppins', sans-serif;
        font-size: .85rem;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 8px 24px rgba(0,0,0,.25);
        pointer-events: all;
        opacity: 0;
        transform: translateX(60px);
        transition: opacity .3s ease, transform .3s ease;
        min-width: 220px;
        max-width: 320px;
    `;
    toast.innerHTML = `<span style="font-size:1.1rem">${icon}</span> ${msg}`;
    container.appendChild(toast);

    // Animate masuk
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        });
    });

    // Animate keluar & hapus
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(60px)';
        setTimeout(() => toast.remove(), 350);
    }, 3000);
}

// =============================================
// PHOTO UPLOAD + LOCALSTORAGE PERSISTENCE
// =============================================

/**
 * Simpan foto ke localStorage dan tampilkan ke elemen yang dituju.
 * @param {Event} event - File input change event
 * @param {string} imgId - ID elemen <img> tujuan
 * @param {string} phId  - ID elemen placeholder yang disembunyikan
 * @param {string} storageKey - Kunci localStorage
 */
function handlePhoto(event, imgId, phId, storageKey) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const dataUrl = e.target.result;

        // Simpan ke localStorage supaya tetap ada setelah reload
        localStorage.setItem(storageKey, dataUrl);

        // Tampilkan foto
        applyPhoto(imgId, phId, dataUrl);

        // Notifikasi berhasil
        showToast('Foto berhasil disimpan! 📸');
    };
    reader.onerror = function () {
        showToast('Gagal membaca file. Coba lagi!', 'error');
    };
    reader.readAsDataURL(file);

    // Reset input supaya file yang sama bisa dipilih lagi
    event.target.value = '';
}

/**
 * Terapkan foto ke elemen img dan sembunyikan placeholder.
 */
function applyPhoto(imgId, phId, dataUrl) {
    const img = document.getElementById(imgId);
    const ph  = document.getElementById(phId);
    if (!img) return;

    img.src = dataUrl;
    img.style.display = 'block';
    if (ph) ph.style.display = 'none';
}

/**
 * Muat semua foto tersimpan dari localStorage saat halaman dimuat.
 */
function loadSavedPhotos() {
    // Hero photo
    const heroData = localStorage.getItem('photo_hero');
    if (heroData) applyPhoto('heroPhoto', 'heroPH', heroData);

    // Tentang photo
    const tentangData = localStorage.getItem('photo_tentang');
    if (tentangData) applyPhoto('tentangPhoto', 'tentangPH', tentangData);

    // Project photos (0-based index sesuai jumlah kartu projek)
    document.querySelectorAll('.projek-kartu').forEach((_, i) => {
        const data = localStorage.getItem('photo_projek_' + i);
        if (data) applyProjectPhoto(i, data);
    });
}

// =============================================
// PROJECT CARD PHOTO UPLOAD
// =============================================

/**
 * Terapkan foto ke kartu projek tertentu.
 */
function applyProjectPhoto(index, dataUrl) {
    const gambar = document.querySelectorAll('.projek-gambar')[index];
    if (!gambar) return;

    // Hilangkan icon default dan label, pasang <img>
    let img = gambar.querySelector('.projek-img-upload');
    if (!img) {
        img = document.createElement('img');
        img.className = 'projek-img-upload';
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:inherit;position:absolute;top:0;left:0;';
        gambar.appendChild(img);
    }

    img.src = dataUrl;

    // Sembunyikan icon bawaan tapi tetap tampilkan label
    const icon = gambar.querySelector(':scope > .fa-image, :scope > .fa-shopping-cart, :scope > .fa-bell, :scope > .fa-laptop');
    if (icon) icon.style.display = 'none';
}

/**
 * Dipanggil saat user klik area gambar projek.
 */
function uploadProjectPhoto(index) {
    // Buat input file sementara
    const input = document.createElement('input');
    input.type  = 'file';
    input.accept = 'image/*';
    input.onchange = function (e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (ev) {
            const dataUrl = ev.target.result;
            localStorage.setItem('photo_projek_' + index, dataUrl);
            applyProjectPhoto(index, dataUrl);
            showToast('Foto projek ke-' + (index + 1) + ' tersimpan! 🖼️');
        };
        reader.onerror = function () {
            showToast('Gagal membaca file. Coba lagi!', 'error');
        };
        reader.readAsDataURL(file);
    };
    input.click();
}

/**
 * Pasang event klik ke semua .projek-gambar setelah DOM siap.
 */
function initProjectPhotoUpload() {
    document.querySelectorAll('.projek-gambar').forEach((el, i) => {
        el.style.cursor = 'pointer';
        el.title = 'Klik untuk upload foto projek';

        // Pastikan posisi relatif untuk overlay & img
        el.style.position = 'relative';
        el.style.overflow = 'hidden';

        // Tambahkan hint overlay
        const hint = document.createElement('div');
        hint.className = 'projek-upload-hint';
        hint.innerHTML = '<i class="fas fa-camera"></i><span>Upload Foto</span>';
        hint.style.cssText = `
            position:absolute; bottom:0; left:0; right:0;
            background:rgba(0,0,0,.55); color:#fff;
            display:flex; align-items:center; justify-content:center; gap:6px;
            padding:6px; font-size:.75rem; opacity:0;
            transition:opacity .25s; pointer-events:none;
        `;
        el.appendChild(hint);

        el.addEventListener('mouseenter', () => hint.style.opacity = '1');
        el.addEventListener('mouseleave', () => hint.style.opacity = '0');
        el.addEventListener('click', () => uploadProjectPhoto(i));
    });
}

// =============================================
// NAVBAR SCROLL + ACTIVE LINK
// =============================================
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    const scrollTop = document.getElementById('scrollTop');

    if (navbar)    navbar.classList.toggle('scrolled', window.scrollY > 50);
    if (scrollTop) scrollTop.classList.toggle('show', window.scrollY > 400);

    // Update active nav link
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 100) current = sec.id;
    });
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
});

// =============================================
// MOBILE NAV TOGGLE
// =============================================
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');
if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        navToggle.classList.toggle('open');
    });
    // Tutup menu saat klik link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            navToggle.classList.remove('open');
        });
    });
}

// =============================================
// FADE-IN OBSERVER
// =============================================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// =============================================
// TYPING EFFECT
// =============================================
const texts = [
    'Membangun pengalaman digital yang keren ',
    'Full-stack web development enthusiast ',
    'UI/UX Designer yang suka detail kecil ',
    'Hardware geek & problem solver ',
];
let tIdx = 0, cIdx = 0, isDeleting = false;
function typeEffect() {
    const span = document.getElementById('typingSpan');
    if (!span) return;
    const current = texts[tIdx];
    if (isDeleting) {
        span.textContent = current.substring(0, --cIdx);
    } else {
        span.textContent = current.substring(0, ++cIdx);
    }
    if (!isDeleting && cIdx === current.length) {
        setTimeout(() => isDeleting = true, 1800);
    } else if (isDeleting && cIdx === 0) {
        isDeleting = false;
        tIdx = (tIdx + 1) % texts.length;
    }
    setTimeout(typeEffect, isDeleting ? 40 : 80);
}
typeEffect();

// =============================================
// WELCOME MODAL
// =============================================
function closeWelcome() {
    const modal = document.getElementById('welcomeModal');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => modal.style.display = 'none', 400);
    }
}
// Auto close setelah 8 detik
setTimeout(() => {
    const modal = document.getElementById('welcomeModal');
    if (modal && modal.style.display !== 'none') closeWelcome();
}, 8000);

// =============================================
// INIT ON DOM READY
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    loadSavedPhotos();
    initProjectPhotoUpload();
});
