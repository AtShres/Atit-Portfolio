/* --- LIGHTBOX & SLIDER LOGIC --- */
/* --- LIGHTBOX & SLIDER LOGIC --- */
let currentImages = [];
let currentIndex = 0;

/* --- MOBILE NAV LOGIC --- */
function setNavOpen(isOpen) {
    document.body.classList.toggle('nav-open', isOpen);
    const btn = document.querySelector('.nav-toggle');
    if (btn) {
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        btn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    }
}

function openSlider(imgs, title, description) {
    currentImages = imgs;
    currentIndex = 0;
    document.getElementById('side-title').innerText = title;
    // Format description with line breaks
    document.getElementById('side-desc').innerHTML = description.replace(/\n/g, '<br>');
    updateSlider();
    document.getElementById('lightbox').style.display = 'block';
    setTimeout(() => document.getElementById('lightbox').classList.add('active'), 10);
    document.body.style.overflow = 'hidden';
}

function updateSlider() {
    const container = document.getElementById('media-container');
    container.innerHTML = '';

    const file = currentImages[currentIndex];
    const isVideo = file.toLowerCase().endsWith('.mp4');
    const element = isVideo ? document.createElement('video') : document.createElement('img');
    
    element.src = file;
    if (isVideo) {
        element.controls = true;
        element.autoplay = true;
        element.muted = true; // Required for autoplay
        element.loop = true;
        element.playsInline = true;
    }
    container.appendChild(element);
    
    // Update Dots (Now active for both Mobile and Desktop)
    const dotContainer = document.getElementById('dot-container');
    dotContainer.innerHTML = '';
    currentImages.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = `dot ${index === currentIndex ? 'active' : ''}`;
        dot.onclick = (e) => { 
            e.stopPropagation();
            currentIndex = index; 
            updateSlider(); 
        };
        dotContainer.appendChild(dot);
    });
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
    setTimeout(() => { 
        document.getElementById('lightbox').style.display = 'none'; 
        document.body.style.overflow = 'auto'; 
    }, 500);
}

function changeSlide(direction) {
    currentIndex = (currentIndex + direction + currentImages.length) % currentImages.length;
    updateSlider();
}

/* --- THREE.JS PLEXUS --- */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

const group = new THREE.Group();
scene.add(group);
const count = 80;
const positions = new Float32Array(count * 3);
for(let i=0; i<count*3; i++) positions[i] = (Math.random()-0.5)*12;
const pGeom = new THREE.BufferGeometry();
pGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
group.add(new THREE.Points(pGeom, new THREE.PointsMaterial({color: 0xf59e0b, size: 0.04, transparent: true, opacity: 0.6})));

camera.position.z = 6;
function animate() { 
    requestAnimationFrame(animate); 
    group.rotation.y += 0.0006; 
    group.rotation.x += 0.0002; 
    renderer.render(scene, camera); 
}
animate();

/* --- REVEAL OBSERVER --- */
const obs = new IntersectionObserver((es) => { 
    es.forEach(e => { if(e.isIntersecting) e.target.classList.add('active'); }); 
}, {threshold: 0.1});
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

window.addEventListener('resize', () => { 
    camera.aspect = window.innerWidth / window.innerHeight; 
    camera.updateProjectionMatrix(); 
    renderer.setSize(window.innerWidth, window.innerHeight); 
});

window.addEventListener('load', () => {
    const mainTitle = document.querySelector('.hero-content h1');
    if (mainTitle) {
        mainTitle.classList.add('animate');
    }
});

/* --- SCROLL HINT LOGIC (script.js) --- */
function scrollToWork() {
    const workSection = document.getElementById('work');
    workSection.scrollIntoView({ behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            const isOpen = document.body.classList.contains('nav-open');
            setNavOpen(!isOpen);
        });

        // Close after choosing a section
        navLinks.querySelectorAll('a[href^="#"]').forEach(a => {
            a.addEventListener('click', () => setNavOpen(false));
        });

        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') setNavOpen(false);
        });
    }

    // If resizing up to desktop, ensure menu isn't stuck open
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024) setNavOpen(false);
    });

    /* --- LIGHTBOX SWIPE (MOBILE) --- */
    const viewer = document.querySelector('.lightbox-viewer');
    if (viewer) {
        let startX = 0;
        let startY = 0;
        let dragging = false;
        let lockedAxis = null; // 'x' | 'y' | null
        let activeEl = null;

        const minSwipe = 50; // px before slide change

        const getActiveMedia = () => {
            const container = document.getElementById('media-container');
            return container ? container.querySelector('img, video') : null;
        };

        const setTranslate = (px, withTransition) => {
            const el = activeEl || getActiveMedia();
            if (!el) return;
            activeEl = el;
            el.classList.toggle('swipe-transition', !!withTransition);
            el.style.transform = `translateX(${px}px)`;
        };

        const resetTranslate = () => {
            if (!activeEl) return;
            activeEl.classList.add('swipe-transition');
            activeEl.style.transform = 'translateX(0px)';
            const el = activeEl;
            setTimeout(() => {
                el.classList.remove('swipe-transition');
                el.style.transform = '';
            }, 220);
        };

        viewer.addEventListener('touchstart', (e) => {
            if (!e.touches || e.touches.length !== 1) return;
            if (currentImages.length <= 1) return;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            dragging = true;
            lockedAxis = null;
            activeEl = getActiveMedia();
            if (activeEl) activeEl.classList.remove('swipe-transition');
        }, { passive: true });

        viewer.addEventListener('touchmove', (e) => {
            if (!dragging || !e.touches || e.touches.length !== 1) return;
            const x = e.touches[0].clientX;
            const y = e.touches[0].clientY;
            const dx = x - startX;
            const dy = y - startY;

            if (!lockedAxis) {
                if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
                lockedAxis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
            }

            if (lockedAxis === 'x') {
                e.preventDefault();
                const resistance = 0.85;
                setTranslate(dx * resistance, false);
            }
        }, { passive: false });

        viewer.addEventListener('touchend', (e) => {
            if (!dragging) return;
            dragging = false;
            if (!e.changedTouches || e.changedTouches.length !== 1) {
                resetTranslate();
                return;
            }

            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const dx = endX - startX;
            const dy = endY - startY;

            if (lockedAxis !== 'x' || Math.abs(dx) < Math.abs(dy) * 1.2) {
                resetTranslate();
                return;
            }

            if (Math.abs(dx) >= minSwipe) {
                const direction = dx < 0 ? 1 : -1;
                const offscreen = (dx < 0 ? -1 : 1) * Math.max(window.innerWidth, 420);
                setTranslate(offscreen, true);
                setTimeout(() => {
                    changeSlide(direction);
                    activeEl = getActiveMedia();
                    if (!activeEl) return;
                    const from = (direction === 1 ? 1 : -1) * Math.max(window.innerWidth, 420);
                    activeEl.classList.remove('swipe-transition');
                    activeEl.style.transform = `translateX(${from}px)`;
                    requestAnimationFrame(() => {
                        activeEl.classList.add('swipe-transition');
                        activeEl.style.transform = 'translateX(0px)';
                        setTimeout(() => {
                            activeEl.classList.remove('swipe-transition');
                            activeEl.style.transform = '';
                        }, 220);
                    });
                }, 190);
            } else {
                resetTranslate();
            }
        }, { passive: true });
    }
});

// Optional: Hide arrow when user scrolls down
window.addEventListener('scroll', () => {
    const indicator = document.querySelector('.scroll-indicator');
    if (window.scrollY > 100) {
        indicator.classList.add('fade-out');
    } else {
        indicator.classList.remove('fade-out');
    }
});

const contactForm = document.getElementById('contact-form');
const scriptURL = 'https://script.google.com/macros/s/AKfycbwuWlw0bXRV_UI9qM2y7G21nixF-sdt8WnNPc2LL6Tzli7thCDVWUn0kt9lSBxfhlM/exec'; // Paste the URL you copied in Step 3

contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const btn = contactForm.querySelector('button');
    btn.innerText = 'TRANSMITTING...';

    fetch(scriptURL, { method: 'POST', body: new FormData(contactForm)})
        .then(response => {
            btn.innerText = 'SIGNAL_RECEIVED';
            contactForm.reset();
            setTimeout(() => btn.innerText = 'SEND_SIGNAL', 3000);
        })
        .catch(error => {
            btn.innerText = 'ERROR_SIGNAL_FAILED';
            console.error('Error!', error.message);
        });
});