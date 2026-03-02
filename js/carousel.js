const track = document.getElementById('track');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const dotsContainer = document.getElementById('dots-container');

// Seleccionar solo las tarjetas originales al inicio
const originalCards = Array.from(track.children);
const originalCount = originalCards.length;

// Comenzamos en el primer elemento real (después de los clones)
let currentIndex = originalCount; 
let isTransitioning = false;

// 1. Generar los puntos indicadores (Dots)
originalCards.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (index === 0) dot.classList.add('active');
    
    dot.addEventListener('click', () => {
        if (isTransitioning || currentIndex === index + originalCount) return;
        currentIndex = index + originalCount;
        updateCarousel();
    });
    dotsContainer.appendChild(dot);
});
const dots = Array.from(dotsContainer.children);

// 2. Clonación para el efecto infinito sin cortes
const clonesBefore = originalCards.map(card => card.cloneNode(true));
const clonesAfter = originalCards.map(card => card.cloneNode(true));

// Insertar clones en el DOM
track.append(...clonesAfter);
track.prepend(...clonesBefore);

const allCards = Array.from(track.children);

// 3. Función principal de actualización y matemáticas de centrado
function updateCarousel(smooth = true) {
    const cardWidth = allCards[0].offsetWidth;
    const containerWidth = track.parentElement.offsetWidth;
    
    // Fórmula exacta para centrar la tarjeta activa sin importar su ancho
    const offset = -(currentIndex * cardWidth) + (containerWidth / 2) - (cardWidth / 2);
    
    if (smooth) {
        track.style.transition = "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)";
    } else {
        track.style.transition = "none";
    }
    
    track.style.transform = `translateX(${offset}px)`;

    // Actualizar clases activas en las tarjetas
    allCards.forEach((card, i) => {
        card.classList.toggle('active', i === currentIndex);
    });

    // Actualizar los puntos (dots)
    const realIndex = (currentIndex - originalCount + originalCount) % originalCount;
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === realIndex);
    });
}

// 4. Salto invisible al terminar la transición
track.addEventListener('transitionend', () => {
    isTransitioning = false;
    
    // Si nos pasamos hacia los clones del final, saltamos al inicio real
    if (currentIndex >= originalCount * 2) {
        currentIndex = currentIndex - originalCount;
        updateCarousel(false);
    } 
    // Si retrocedemos hacia los clones del principio, saltamos al final real
    else if (currentIndex < originalCount) {
        currentIndex = currentIndex + originalCount;
        updateCarousel(false);
    }
});

// 5. Controles de botones con Failsafe
function moveNext() {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex++;
    updateCarousel();
    setTimeout(() => { isTransitioning = false; }, 650); // Failsafe para evitar bloqueos
}

function movePrev() {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex--;
    updateCarousel();
    setTimeout(() => { isTransitioning = false; }, 650); // Failsafe para evitar bloqueos
}

nextBtn.addEventListener('click', moveNext);
prevBtn.addEventListener('click', movePrev);

// 6. Deslizamiento en móviles (Swipe mejorado)
let touchStartX = 0;
let touchEndX = 0;

track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const swipeDistance = touchStartX - touchEndX;
    
    if (swipeDistance > 50) moveNext();
    else if (swipeDistance < -50) movePrev();
}, { passive: true });

// 7. Optimización del redimensionamiento de pantalla (Debounce)
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        updateCarousel(false); // Recalcula sin animación para que no se vea raro
    }, 150); 
});

// 8. Inicialización
window.addEventListener('load', () => {
    // Un pequeño retraso para asegurar que CSS haya renderizado los anchos
    setTimeout(() => updateCarousel(false), 50);
});