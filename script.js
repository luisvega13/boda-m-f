let guests = [];

const inputSearch = document.getElementById('guest-search');
const dataList = document.getElementById('guests-list');
const dynamicContainer = document.getElementById('dynamic-inputs');
const submitBtn = document.getElementById('submit-btn');
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
        
        // Repoblar datalist con los invitados cargados
        guests.forEach(g => {
            const option = document.createElement('option');
            option.value = g.nombre;
            dataList.appendChild(option);
        });
    } catch (error) {
        console.error('Error cargando CSV:', error);
    }
}

// Cargar invitados al iniciar
loadGuestsFromCSV();

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