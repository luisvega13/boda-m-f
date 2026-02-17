let guests = [];

const inputSearch = document.getElementById('guest-search');
const dataList = document.getElementById('guests-list');
const dynamicContainer = document.getElementById('dynamic-inputs');
const submitBtn = document.getElementById('submit-btn');
const guestNameDisplay = document.getElementById('guest-name-display');
const suggestionsDropdown = document.getElementById('suggestions-dropdown');
const track = document.getElementById('track');

// Cargar invitados desde CSV
async function loadGuestsFromCSV() {
    try {
        const response = await fetch('Felipe invitados.csv');
        const csvText = await response.text();
        const lines = csvText.trim().split('\n');
        
        // Saltar encabezado (primera fila)
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const parts = line.split(',');
            const nombre = parts[0].trim();
            const adultos = parseInt(parts[1].trim()) || 0;
            const ninos = parseInt(parts[2].trim()) || 0;
            
            if (nombre && nombre !== '') {
                guests.push({ nombre, adultos, ninos });
            }
        }
        // Repoblar la datalist nativa para autocompletado
        if (dataList) {
            dataList.innerHTML = '';
            guests.forEach(g => {
                const opt = document.createElement('option');
                opt.value = g.nombre;
                dataList.appendChild(opt);
            });
        }
    } catch (error) {
        console.error('Error cargando CSV:', error);
    }
}

// Cargar invitados al iniciar
loadGuestsFromCSV();

// Autocompletado personalizado
inputSearch.addEventListener('input', (e) => {
    const val = e.target.value.trim().toLowerCase();
    dynamicContainer.innerHTML = '';
    submitBtn.style.display = 'none';
    
    if (val === '') {
        autocompleteList.innerHTML = '';
        autocompleteList.style.display = 'none';
        return;
    }
    
    const filtered = guests.filter(g => g.nombre.toLowerCase().includes(val));
    
    if (filtered.length > 0) {
        autocompleteList.innerHTML = '';
        autocompleteList.style.display = 'block';
        
        filtered.forEach(guest => {
            const option = document.createElement('div');
            option.className = 'autocomplete-option';
            option.innerHTML = `
                <span class="guest-name">${guest.nombre}</span>
                <span class="guest-info">${guest.adultos + guest.ninos} persona(s)</span>
            `;
            
            option.addEventListener('click', () => {
                inputSearch.value = guest.nombre;
                autocompleteList.style.display = 'none';
                selectGuest(guest);
            });
            
            autocompleteList.appendChild(option);
        });
    } else {
        autocompleteList.innerHTML = '<div class="no-results">No se encontraron invitados</div>';
        autocompleteList.style.display = 'block';
    }
});

// Cuando se selecciona un invitado
function selectGuest(guest) {
    const val = inputSearch.value.trim().toLowerCase();
    const guestFound = guests.find(g => g.nombre.toLowerCase() === val);
    
    if (guestFound) {
        // Mostrar nombre elegantemente
        guestNameDisplay.innerHTML = `<div class="name-text">${guestFound.nombre}</div>`;
        guestNameDisplay.classList.add('active');
        
        renderFields(guestFound);
        submitBtn.style.display = 'block';
    }
}

// Cerrar autocompletado al hacer click fuera
document.addEventListener('click', (e) => {
    if (e.target !== inputSearch) {
        autocompleteList.style.display = 'none';
    }
});

inputSearch.addEventListener('focus', () => {
    if (inputSearch.value.trim() !== '' && autocompleteList.children.length > 0) {
        autocompleteList.style.display = 'block';
    }
});

// Prevenir envío si el invitado no está en la lista
document.getElementById('rsvp-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const val = inputSearch.value.trim().toLowerCase();
    const guestFound = guests.find(g => g.nombre.toLowerCase() === val);
    
    if (!guestFound) {
        alert('Lo sentimos, tu nombre no aparece en la lista de invitados.');
        return;
    }
    
    // Si la validación pasa, mostrar mensaje de confirmación
    showConfirmationMessage(guestFound);
});

function renderFields(guest) {
    if (guest.adultos > 0) {
        const title = document.createElement('p');
        title.innerText = `Nombres de acompañantes adultos (${guest.adultos}):`;
        title.style.fontWeight = 'bold';
        title.style.marginTop = '20px';
        title.style.marginBottom = '10px';
        title.style.color = 'var(--primary)';
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

    if (guest.ninos > 0) {
        const label = document.createElement('label');
        label.innerHTML = `¿Cuántos niños asistirán? (Máximo ${guest.ninos}):`;
        label.style.fontWeight = 'bold';
        label.style.marginTop = '20px';
        label.style.marginBottom = '10px';
        label.style.color = 'var(--primary)';
        const nInput = document.createElement('input');
        nInput.type = 'number';
        nInput.min = 0;
        nInput.max = guest.ninos;
        nInput.value = 0;
        nInput.style.marginBottom = "20px";
        dynamicContainer.appendChild(label);
        dynamicContainer.appendChild(nInput);
    }
}

function showConfirmationMessage(guest) {
    // Ocultar formulario y mostrar mensaje
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
    
    document.querySelector('.btn-new-rsvp').addEventListener('click', () => {
        confirmationBox.remove();
        form.style.display = 'block';
        inputSearch.value = '';
        dynamicContainer.innerHTML = '';
        guestNameDisplay.innerHTML = '';
        guestNameDisplay.classList.remove('active');
        suggestionsDropdown.innerHTML = '';
        suggestionsDropdown.classList.remove('active');
        submitBtn.style.display = 'none';
        inputSearch.focus();
    });
}

// ... (Tu código de invitados se mantiene igual)

const originalCards = Array.from(track.children);
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');

// 1. Clonación mejorada: Creamos un set antes y otro después
// Esto asegura que siempre haya contenido visual en ambos extremos
const numOriginals = originalCards.length;
const clonesAfter = originalCards.map(card => card.cloneNode(true));
const clonesBefore = originalCards.map(card => card.cloneNode(true));

clonesAfter.forEach(clone => track.appendChild(clone));
clonesBefore.reverse().forEach(clone => track.prepend(clone));

const allCards = Array.from(track.children);
// El índice inicial debe ser el número de clones para mostrar la primera foto real
let currentIndex = numOriginals; 
let isTransitioning = false;

function updateCarousel(smooth = true) {
    const cardWidth = allCards[0].offsetWidth;
    // Cálculo de desplazamiento centrado
    const offset = -(currentIndex * cardWidth) + (track.parentElement.offsetWidth / 2) - (cardWidth / 2);
    
    // Usamos requestAnimationFrame para asegurar que el navegador esté listo para el cambio
    requestAnimationFrame(() => {
        track.style.transition = smooth ? "transform 8s cubic-bezier(0.25, 1, 0.5, 1)" : "none";
        track.style.transform = `translateX(${offset}px)`;
    });

    allCards.forEach((card, i) => {
        card.classList.toggle('active', i === currentIndex);
    });
}

// 2. EL SALTO INVISIBLE (SIN PARPADEO)
track.addEventListener('transitionend', () => {
    isTransitioning = false;

    // Si llegamos al final de las originales (empezamos a ver clones del final)
    if (currentIndex >= numOriginals * 2) {
        currentIndex = numOriginals; // Teletransportar a la primera original
        updateCarousel(false);
    } 
    // Si llegamos al principio de las originales (empezamos a ver clones del inicio)
    else if (currentIndex < numOriginals) {
        currentIndex = numOriginals * 2 - 1; // Teletransportar a la última original
        updateCarousel(false);
    }
});

// Botones y Eventos
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

// Inicialización corregida
window.addEventListener('load', () => {
    // Pequeño timeout para asegurar que el DOM y estilos CSS estén aplicados
    setTimeout(() => updateCarousel(false), 50);
});
window.addEventListener('resize', () => updateCarousel(false));

// Auto-play (opcional)
setInterval(() => { if(!isTransitioning) nextBtn.click(); }, 20000000);