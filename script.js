/* =========================================
   VARIABLES Y CONFIGURACIÓN BASE
   ========================================= */
let guests = [];
const inputSearch = document.getElementById('guest-search');
const dynamicContainer = document.getElementById('dynamic-inputs');
const submitBtn = document.getElementById('submit-btn');
const guestNameDisplay = document.getElementById('guest-name-display');
const suggestionsDropdown = document.getElementById('suggestions-dropdown');

// Elementos del Carrusel
const members = document.querySelectorAll('.member');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');
const carouselContainer = document.querySelector('.carousel-container');

let index = 0;

/* =========================================
   LÓGICA DEL CARRUSEL (CON SWIPE)
   ========================================= */
function updateCarousel() {
    members.forEach(m => m.classList.remove('active', 'left', 'right'));
    const total = members.length;
    let left = (index - 1 + total) % total;
    let right = (index + 1) % total;
    
    members[index].classList.add('active');
    members[left].classList.add('left');
    members[right].classList.add('right');
}

// Eventos de botones
prevBtn.onclick = () => {
    index = (index - 1 + members.length) % members.length;
    updateCarousel();
};

nextBtn.onclick = () => {
    index = (index + 1) % members.length;
    updateCarousel();
};

// Implementación de Swipe para Móviles
let touchStartX = 0;
let touchEndX = 0;

carouselContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

carouselContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    const swipeThreshold = 50; 
    if (touchStartX - touchEndX > swipeThreshold) {
        nextBtn.click(); // Deslizar a la izquierda -> Siguiente
    } else if (touchEndX - touchStartX > swipeThreshold) {
        prevBtn.click(); // Deslizar a la derecha -> Anterior
    }
}

// Inicializar carrusel
updateCarousel();

/* =========================================
   SISTEMA RSVP (CSV E INVITADOS)
   ========================================= */
async function loadGuestsFromCSV() {
    try {
        const response = await fetch('Felipe invitados.csv');
        const csvText = await response.text();
        const lines = csvText.trim().split('\n');
        
        guests = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const parts = line.split(',');
            if (parts.length >= 1) {
                const nombre = parts[0].trim();
                const adultos = parseInt(parts[1]?.trim()) || 0;
                const ninos = parseInt(parts[2]?.trim()) || 0;
                if (nombre) {
                    guests.push({ nombre, adultos, ninos });
                }
            }
        }
        console.log('Invitados cargados:', guests.length);
    } catch (error) {
        console.error('Error cargando CSV:', error);
    }
}

loadGuestsFromCSV();

// Buscador y Sugerencias
inputSearch.addEventListener('input', (e) => {
    const val = e.target.value.trim().toLowerCase();
    dynamicContainer.innerHTML = '';
    submitBtn.style.display = 'none';

    if (val === '') {
        resetRSVPDisplay();
        return;
    }

    const filtered = guests.filter(g => g.nombre.toLowerCase().includes(val));
    
    if (filtered.length > 0) {
        suggestionsDropdown.innerHTML = '';
        suggestionsDropdown.classList.add('active');
        
        filtered.forEach(guest => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.innerHTML = `
                <span class="suggestion-name">${guest.nombre}</span>
                <span class="suggestion-count">${guest.adultos + guest.ninos} pers.</span>
            `;
            item.onclick = () => {
                inputSearch.value = guest.nombre;
                suggestionsDropdown.classList.remove('active');
                selectGuest(guest);
            };
            suggestionsDropdown.appendChild(item);
        });

        // Match exacto
        const exactMatch = guests.find(g => g.nombre.toLowerCase() === val);
        if (exactMatch) selectGuest(exactMatch);
    } else {
        suggestionsDropdown.classList.remove('active');
        guestNameDisplay.classList.remove('active');
    }
});

function selectGuest(guest) {
    guestNameDisplay.innerHTML = `<div class="name-text">${guest.nombre}</div>`;
    guestNameDisplay.classList.add('active');
    renderFields(guest);
    submitBtn.style.display = 'block';
    suggestionsDropdown.classList.remove('active');
}

function resetRSVPDisplay() {
    guestNameDisplay.innerHTML = '';
    guestNameDisplay.classList.remove('active');
    suggestionsDropdown.innerHTML = '';
    suggestionsDropdown.classList.remove('active');
}

function renderFields(guest) {
    dynamicContainer.innerHTML = ''; 
    if (guest.adultos > 0) {
        const title = document.createElement('p');
        title.textContent = `Nombres de adultos (${guest.adultos}):`;
        title.style.cssText = 'font-weight: bold; margin-top: 20px; color: var(--primary);';
        dynamicContainer.appendChild(title);

        for (let i = 1; i <= guest.adultos; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Nombre del invitado ${i}`;
            input.required = true;
            dynamicContainer.appendChild(input);
        }
    }

    if (guest.ninos > 0) {
        const label = document.createElement('label');
        label.textContent = `¿Cuántos niños asistirán? (Máximo ${guest.ninos}):`;
        label.style.cssText = 'font-weight: bold; display: block; margin-top: 15px; color: var(--primary);';
        const nInput = document.createElement('input');
        nInput.type = 'number';
        nInput.min = 0;
        nInput.max = guest.ninos;
        nInput.value = 0;
        dynamicContainer.appendChild(label);
        dynamicContainer.appendChild(nInput);
    }
}

// Manejo del envío del formulario
document.getElementById('rsvp-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const val = inputSearch.value.trim().toLowerCase();
    const guestFound = guests.find(g => g.nombre.toLowerCase() === val);
    
    if (guestFound) {
        showConfirmationMessage(guestFound);
    } else {
        alert('Por favor, selecciona un nombre de la lista.');
    }
});

function showConfirmationMessage(guest) {
    const form = document.getElementById('rsvp-form');
    const rsvpSection = document.querySelector('.rsvp');
    form.style.display = 'none';
    
    const confirmationBox = document.createElement('div');
    confirmationBox.id = 'confirmation-box';
    confirmationBox.innerHTML = `
        <div class="confirmation-content">
            <div class="confirmation-icon">✓</div>
            <h3>¡Confirmado!</h3>
            <p>Gracias <strong>${guest.nombre}</strong>, tu asistencia ha sido confirmada.</p>
            <p>Nos vemos el 11 de Abril, 2026.</p>
            <button class="btn-new-rsvp">Confirmar otro invitado</button>
        </div>
    `;
    rsvpSection.appendChild(confirmationBox);
    
    confirmationBox.querySelector('.btn-new-rsvp').onclick = () => {
        confirmationBox.remove();
        form.style.display = 'block';
        inputSearch.value = '';
        dynamicContainer.innerHTML = '';
        resetRSVPDisplay();
        submitBtn.style.display = 'none';
    };
}

// Cerrar dropdown al hacer click fuera
document.addEventListener('click', (e) => {
    if (!inputSearch.contains(e.target) && !suggestionsDropdown.contains(e.target)) {
        suggestionsDropdown.classList.remove('active');
    }
});