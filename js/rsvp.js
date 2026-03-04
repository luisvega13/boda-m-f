/* =========================================
   SISTEMA RSVP (CSV Y ENVÍO A GOOGLE SHEETS)
   ========================================= */
let guests = [];
const inputSearch = document.getElementById('guest-search');
const dynamicContainer = document.getElementById('dynamic-inputs');
const submitBtn = document.getElementById('submit-btn');
const guestNameDisplay = document.getElementById('guest-name-display');
const suggestionsDropdown = document.getElementById('suggestions-dropdown');
const dataList = document.getElementById('guests-list');

// URL de tu implementación de Google Apps Script
const googleScriptURL = "https://script.google.com/macros/s/AKfycbykse9b3nOSOaSVISP0u2yGokpqEg1Qb2P0KdvuYAmeEAxNeVJ45GY5ftl1ei5DOGIL/exec";

async function loadGuestsFromCSV() {
    try {
        // Se carga la lista actualizada de invitados
        const response = await fetch('Felipe invitados.csv'); 
        const csvText = await response.text();
        const lines = csvText.trim().split('\n');
        
        guests = []; // Limpiar array antes de cargar
        for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split(',');
            if (parts.length < 3) continue;
            
            guests.push({
                nombre: parts[0].trim(),
                adultos: parseInt(parts[1]) || 0,
                ninos: parseInt(parts[2]) || 0
            });
        }
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

function renderFields(guest) {
    dynamicContainer.innerHTML = ''; 
    
    if (guest.adultos > 0) {
        const titleAdultos = document.createElement('p');
        titleAdultos.innerText = `Invitados adultos (${guest.adultos}):`;
        titleAdultos.style.fontWeight = 'bold';
        dynamicContainer.appendChild(titleAdultos);

        for (let i = 1; i <= guest.adultos; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Nombre del adulto ${i}`;
            input.required = true;
            input.style.marginBottom = "10px";
            input.classList.add('input-adulto');
            dynamicContainer.appendChild(input);
        }
    }

    if (guest.ninos > 0) {
        const titleNinos = document.createElement('p');
        titleNinos.innerText = `Niños (${guest.ninos}):`;
        titleNinos.style.fontWeight = 'bold';
        titleNinos.style.marginTop = '15px';
        dynamicContainer.appendChild(titleNinos);

        for (let i = 1; i <= guest.ninos; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Nombre del niño ${i}`;
            input.required = true;
            input.style.marginBottom = "10px";
            input.classList.add('input-nino');
            dynamicContainer.appendChild(input);
        }
    }
}

function resetRSVPDisplay() {
    guestNameDisplay.innerHTML = '';
    guestNameDisplay.classList.remove('active');
    suggestionsDropdown.classList.remove('active');
}

function selectGuest(guest) {
    guestNameDisplay.innerHTML = `<div class="name-text">${guest.nombre}</div>`;
    guestNameDisplay.classList.add('active');

    // Se eliminó la validación contra localStorage para permitir re-registros si el admin limpia la lista
    renderFields(guest);
    submitBtn.style.display = 'block';
    
    suggestionsDropdown.classList.remove('active');
}

document.getElementById('rsvp-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const guestFound = guests.find(g => g.nombre.toLowerCase() === inputSearch.value.trim().toLowerCase());
    
    if (guestFound) {
        const inputs = dynamicContainer.querySelectorAll('input');
        const listaAcompanantes = Array.from(inputs).map(inp => inp.value).filter(val => val.trim() !== '');
        
        const datosInvitado = {
            nombre: guestFound.nombre,
            acompanantes: listaAcompanantes,
            fecha: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()
        };

        try {
            submitBtn.innerText = "Enviando...";
            submitBtn.disabled = true;

            // Envío a Google Sheets
            await fetch(googleScriptURL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosInvitado)
            });

            // Opcional: Guardamos en localStorage solo como referencia local, 
            // pero ya no bloquea el flujo principal si el usuario recarga.
            let confirmados = JSON.parse(localStorage.getItem('invitadosConfirmados')) || [];
            confirmados.push(datosInvitado);
            localStorage.setItem('invitadosConfirmados', JSON.stringify(confirmados));

            mostrarExito(guestFound.nombre);

        } catch (error) {
            console.error("Error al enviar a Sheets:", error);
            alert("Hubo un error al registrar tu asistencia.");
            submitBtn.innerText = "Confirmar Asistencia";
            submitBtn.disabled = false;
        }
    }
});

function mostrarExito(nombre) {
    const form = document.getElementById('rsvp-form');
    form.style.display = 'none';
    
    const confirmationBox = document.createElement('div');
    confirmationBox.id = 'confirmation-box';
    confirmationBox.innerHTML = `
        <h3 style="font-family: 'Dancing Script', cursive; font-size: 2.5rem; color: var(--primary);">¡Confirmado!</h3>
        <p style="font-family: 'Montserrat', sans-serif; font-size: 1.1rem;">Gracias <strong>${nombre}</strong>, nos vemos el 11 de Abril de 2026.</p>
        <button class="btn-link" onclick="location.reload()" style="margin-top: 20px; cursor: pointer; background: none; border: none; font-size: 1rem; color: var(--primary); text-decoration: underline;">Confirmar otra invitación</button>
    `;
    document.querySelector('.rsvp').appendChild(confirmationBox);
}

loadGuestsFromCSV();