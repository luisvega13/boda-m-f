// 1. BASE DE DATOS DE INVITADOS
const guests = [
    { nombre: "Juan Perez", adultos: 1, ninos: 2 },
    { nombre: "Maria Garcia", adultos: 0, ninos: 0 },
    { nombre: "Carlos Slim", adultos: 1, ninos: 0 },
    { nombre: "Familia Rodriguez", adultos: 2, ninos: 3 }
];

// Elementos del DOM
const inputSearch = document.getElementById('guest-search');
const dataList = document.getElementById('guests-list');
const dynamicContainer = document.getElementById('dynamic-inputs');
const submitBtn = document.getElementById('submit-btn');
const track = document.getElementById('track');

// 2. POBLAR LISTA DE INVITADOS
guests.forEach(g => {
    const option = document.createElement('option');
    option.value = g.nombre;
    dataList.appendChild(option);
});

// 3. LÓGICA DE BÚSQUEDA RSVP
inputSearch.addEventListener('input', (e) => {
    const val = e.target.value.trim().toLowerCase();
    const guestFound = guests.find(g => g.nombre.toLowerCase() === val);
    
    dynamicContainer.innerHTML = '';
    
    if (guestFound) {
        renderFields(guestFound);
        submitBtn.style.display = 'block';
    } else {
        submitBtn.style.display = 'none';
    }
});

function renderFields(guest) {
    // Acompañantes Adultos
    if (guest.adultos > 0) {
        const title = document.createElement('p');
        title.innerText = `Nombres de acompañantes adultos (${guest.adultos}):`;
        dynamicContainer.appendChild(title);

        for (let i = 1; i <= guest.adultos; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Nombre del acompañante ${i}`;
            input.required = true;
            input.style.marginBottom = "10px";
            dynamicContainer.appendChild(input);
        }
    }

    // Niños
    if (guest.ninos > 0) {
        const label = document.createElement('label');
        label.innerHTML = `<br>¿Cuántos niños asistirán? (Máximo ${guest.ninos}):`;
        const nInput = document.createElement('input');
        nInput.type = 'number';
        nInput.min = 0;
        nInput.max = guest.ninos;
        nInput.value = 0;
        dynamicContainer.appendChild(label);
        dynamicContainer.appendChild(nInput);
    }
}

// 4. LÓGICA DEL CARRUSEL INFINITO
const originalCards = Array.from(track.children);
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');

// Clonación (Espejos) para efecto infinito
const numClones = 3;
const firstClones = originalCards.slice(0, numClones).map(c => c.cloneNode(true));
const lastClones = originalCards.slice(-numClones).map(c => c.cloneNode(true));

firstClones.forEach(clone => track.appendChild(clone));
lastClones.reverse().forEach(clone => track.prepend(clone));

const allCards = Array.from(track.children);
let currentIndex = numClones; 
let isTransitioning = false;

function updateCarousel(smooth = true) {
    const cardWidth = allCards[0].offsetWidth;
    // Cálculo de centrado de la foto activa
    const offset = -(currentIndex * cardWidth) + (track.parentElement.offsetWidth / 2) - (cardWidth / 2);
    
    track.style.transition = smooth ? "transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)" : "none";
    track.style.transform = `translateX(${offset}px)`;

    allCards.forEach((card, i) => {
        card.classList.toggle('active', i === currentIndex);
    });
}

// Salto invisible al terminar la transición
track.addEventListener('transitionend', () => {
    isTransitioning = false;
    if (currentIndex >= allCards.length - numClones) {
        currentIndex = numClones;
        updateCarousel(false);
    } else if (currentIndex < numClones) {
        currentIndex = allCards.length - numClones - 1;
        updateCarousel(false);
    }
});

nextBtn.addEventListener('click', () => {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex++;
    updateCarousel();
});

prevBtn.addEventListener('click', () => {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex--;
    updateCarousel();
});

// Auto-play cada 4 segundos
setInterval(() => { if(!isTransitioning) nextBtn.click(); }, 4000);

// Ajuste en cambio de ventana
window.addEventListener('resize', () => updateCarousel(false));

// Inicio retardado para asegurar carga de imágenes y cálculo de ancho
window.addEventListener('load', () => updateCarousel(false));