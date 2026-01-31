/* --- LIGHTBOX & SLIDER LOGIC --- */
let currentImages = [];
let currentIndex = 0;

function openSlider(imgs, title, description) {
    currentImages = imgs;
    currentIndex = 0;
    document.getElementById('side-title').innerText = title;
    document.getElementById('side-desc').innerText = description;
    updateSlider();
    document.getElementById('lightbox').style.display = 'block';
    setTimeout(() => document.getElementById('lightbox').classList.add('active'), 10);
    document.body.style.overflow = 'hidden';
}

function updateSlider() {
    const container = document.getElementById('media-container');
    const isMobile = window.innerWidth <= 768;
    
    container.innerHTML = '';

    if (isMobile) {
        // MOBILE: Load all images at once so user can scroll
        currentImages.forEach(file => {
            const element = file.toLowerCase().endsWith('.mp4') 
                ? document.createElement('video') 
                : document.createElement('img');
            
            element.src = file;
            if (file.toLowerCase().endsWith('.mp4')) {
                element.controls = true;
                element.muted = true;
                element.loop = true;
            }
            container.appendChild(element);
        });
    } else {
        // DESKTOP: Keep existing single-slide logic
        const file = currentImages[currentIndex];
        const element = file.toLowerCase().endsWith('.mp4') 
            ? document.createElement('video') 
            : document.createElement('img');
        
        element.src = file;
        if (file.toLowerCase().endsWith('.mp4')) {
            element.controls = true;
            element.autoplay = true;
        }
        container.appendChild(element);
        
        // Update Dots (only for desktop)
        const dotContainer = document.getElementById('dot-container');
        dotContainer.innerHTML = '';
        currentImages.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = `dot ${index === currentIndex ? 'active' : ''}`;
            dot.onclick = () => { currentIndex = index; updateSlider(); };
            dotContainer.appendChild(dot);
        });
    }
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