/* =========================================
   LÓGICA DEL CARRUSEL INFINITO
   ========================================= */
const track = document.getElementById('track');
const carouselCards = Array.from(track.children);
const btnNext = document.getElementById('nextBtn');
const btnPrev = document.getElementById('prevBtn');
const carouselContainer = document.querySelector('.carousel-container');

const numOriginals = carouselCards.length;
let currentIndex = numOriginals; 
let isTransitioning = false;

// 1. Clonación para efecto infinito
const clonesAfter = carouselCards.map(card => card.cloneNode(true));
const clonesBefore = carouselCards.map(card => card.cloneNode(true));

clonesAfter.forEach(clone => track.appendChild(clone));
clonesBefore.reverse().forEach(clone => track.prepend(clone));

const allCards = Array.from(track.children);

function updateCarousel(smooth = true) {
    const cardWidth = allCards[0].offsetWidth;
    const offset = -(currentIndex * cardWidth) + (track.parentElement.offsetWidth / 2) - (cardWidth / 2);
    
    track.style.transition = smooth ? "transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)" : "none";
    track.style.transform = `translateX(${offset}px)`;

    allCards.forEach((card, i) => {
        card.classList.toggle('active', i === currentIndex);
    });
}

// 2. Salto invisible al terminar la transición
track.addEventListener('transitionend', () => {
    isTransitioning = false;
    if (currentIndex >= numOriginals * 2) {
        currentIndex = numOriginals;
        updateCarousel(false);
    } else if (currentIndex < numOriginals) {
        currentIndex = numOriginals * 2 - 1;
        updateCarousel(false);
    }
});

// Eventos de botones
btnNext.addEventListener('click', () => {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex++;
    updateCarousel();
});

btnPrev.addEventListener('click', () => {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex--;
    updateCarousel();
});

// Soporte para Swipe
let touchStartX = 0;
carouselContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

carouselContainer.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    if (touchStartX - touchEndX > 50) btnNext.click();
    else if (touchEndX - touchStartX > 50) btnPrev.click();
}, { passive: true });

// Inicialización
window.addEventListener('load', () => setTimeout(() => updateCarousel(false), 50));
window.addEventListener('resize', () => updateCarousel(false));