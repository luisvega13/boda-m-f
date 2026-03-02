/* =========================================
   SISTEMA RSVP (CSV E INVITADOS)
   ========================================= */
let guests = [];
const inputSearch = document.getElementById('guest-search');
const dynamicContainer = document.getElementById('dynamic-inputs');
const submitBtn = document.getElementById('submit-btn');
const guestNameDisplay = document.getElementById('guest-name-display');
const suggestionsDropdown = document.getElementById('suggestions-dropdown');
const dataList = document.getElementById('guests-list');

async function loadGuestsFromCSV() {
    try {
        // Se asume el nombre del archivo basado en tu proyecto anterior
        const response = await fetch('Felipe invitados.csv'); 
        const csvText = await response.text();
        const lines = csvText.trim().split('\n');
        
        for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split(',');
            if (parts.length < 3) continue;
            
            guests.push({
                nombre: parts[0].trim(),
                adultos: parseInt(parts[1]) || 0,
                ninos: parseInt(parts[2]) || 0
            });
        }
        
        // Llenar datalist nativo
        guests.forEach(g => {
            const opt = document.createElement('option');
            opt.value = g.nombre;
            dataList.appendChild(opt);
        });
    } catch (error) {
        console.error('Error cargando invitados:', error);
    }
}

// Buscador dinámico
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
    } else {
        suggestionsDropdown.classList.remove('active');
    }
});

function selectGuest(guest) {
    guestNameDisplay.innerHTML = `<div class="name-text">${guest.nombre}</div>`;
    guestNameDisplay.classList.add('active');
    renderFields(guest);
    submitBtn.style.display = 'block';
    suggestionsDropdown.classList.remove('active');
}

function renderFields(guest) {
    if (guest.adultos > 0) {
        const title = document.createElement('p');
        title.innerText = `Invitados adultos (${guest.adultos}):`;
        title.style.fontWeight = 'bold';
        dynamicContainer.appendChild(title);

        for (let i = 1; i <= guest.adultos; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Nombre del invitado ${i}`;
            input.required = true;
            input.style.marginBottom = "10px";
            dynamicContainer.appendChild(input);
        }
    }
}

function resetRSVPDisplay() {
    guestNameDisplay.innerHTML = '';
    guestNameDisplay.classList.remove('active');
    suggestionsDropdown.classList.remove('active');
}

// Manejo del envío
document.getElementById('rsvp-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const guestFound = guests.find(g => g.nombre.toLowerCase() === inputSearch.value.trim().toLowerCase());
    
    if (guestFound) {
        const form = document.getElementById('rsvp-form');
        form.style.display = 'none';
        
        const confirmationBox = document.createElement('div');
        confirmationBox.id = 'confirmation-box';
        confirmationBox.innerHTML = `
            <h3>¡Confirmado!</h3>
            <p>Gracias <strong>${guestFound.nombre}</strong>, nos vemos el 11 de Abril.</p>
            <button class="btn-link" onclick="location.reload()">Confirmar otro</button>
        `;
        document.querySelector('.rsvp').appendChild(confirmationBox);
    }
});

loadGuestsFromCSV();