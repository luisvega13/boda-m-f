/* ============================================================
   SISTEMA RSVP CON VALIDACIÓN EN TIEMPO REAL (GOOGLE SHEETS)
   ============================================================ */

let guests = [];
let confirmedGuests = []; // Lista de personas que ya están en el Excel

const inputSearch = document.getElementById('guest-search');
const dynamicContainer = document.getElementById('dynamic-inputs');
const submitBtn = document.getElementById('submit-btn');
const guestNameDisplay = document.getElementById('guest-name-display');
const suggestionsDropdown = document.getElementById('suggestions-dropdown');

// URL de tu Google Apps Script (doGet y doPost)
const googleScriptURL = "https://script.google.com/macros/s/AKfycbykse9b3nOSOaSVISP0u2yGokpqEg1Qb2P0KdvuYAmeEAxNeVJ45GY5ftl1ei5DOGIL/exec";

/**
 * 1. Inicialización: Carga invitados del CSV y confirmados de la nube
 */
async function initRSVP() {
    try {
        // Cargar lista base desde CSV
        const responseCsv = await fetch('Felipe invitados.csv'); 
        const csvText = await responseCsv.text();
        const lines = csvText.trim().split('\n');
        
        guests = []; 
        for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split(',');
            if (parts.length < 3) continue;
            
            guests.push({
                nombre: parts[0].trim(),
                adultos: parseInt(parts[1]) || 0,
                ninos: parseInt(parts[2]) || 0
            });
        }

        // Cargar confirmados desde Google Sheets (usando tu función doGet)
        const responseSheets = await fetch(googleScriptURL);
        const dataSheets = await responseSheets.json();
        
        // Si la respuesta es un array, lo guardamos
        if (Array.isArray(dataSheets)) {
            confirmedGuests = dataSheets;
        }
        
        console.log("Sistema listo. Invitados cargados y confirmaciones sincronizadas.");
    } catch (error) {
        console.error('Error al inicializar datos:', error);
    }
}

/**
 * 2. Buscador Dinámico
 */
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

/**
 * 3. Selección de Invitado y VALIDACIÓN de duplicados
 */
function selectGuest(guest) {
    guestNameDisplay.innerHTML = `<div class="name-text">${guest.nombre}</div>`;
    guestNameDisplay.classList.add('active');
    dynamicContainer.innerHTML = '';

    // Verificar si el nombre ya aparece en la lista de confirmados de Google Sheets
    const yaRegistro = confirmedGuests.some(c => c.nombre.trim().toLowerCase() === guest.nombre.trim().toLowerCase());

    if (yaRegistro) {
        // Mostrar mensaje de bloqueo si ya confirmó anteriormente
        dynamicContainer.innerHTML = `
            <div style="background: #fff5f5; border: 1px solid #feb2b2; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: center;">
                <p style="color: #c53030; font-weight: 600; margin-bottom: 5px;">¡Ya hemos recibido tu confirmación!</p>
                <p style="font-size: 0.9rem; color: #742a2a;">Gracias por avisarnos, tu registro ya se encuentra en nuestra lista.</p>
            </div>
        `;
        submitBtn.style.display = 'none';
    } else {
        // Mostrar campos para llenar si es la primera vez
        renderFields(guest);
        submitBtn.style.display = 'block';
    }
}

function renderFields(guest) {
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
            input.className = 'input-adulto';
            input.style.display = "block";
            input.style.width = "100%";
            input.style.marginBottom = "10px";
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
            input.className = 'input-nino';
            input.style.display = "block";
            input.style.width = "100%";
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

/**
 * 4. Envío de Formulario (doPost)
 */
document.getElementById('rsvp-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const guestFound = guests.find(g => g.nombre.toLowerCase() === inputSearch.value.trim().toLowerCase());
    
    if (guestFound) {
        const inputs = dynamicContainer.querySelectorAll('input');
        const listaAcompanantes = Array.from(inputs).map(inp => inp.value).filter(val => val.trim() !== '');
        
        const datosInvitado = {
            nombre: guestFound.nombre,
            acompanantes: listaAcompanantes,
            fecha: new Date().toLocaleString()
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

            mostrarExito(guestFound.nombre);

        } catch (error) {
            console.error("Error al enviar:", error);
            alert("Hubo un error al registrar tu asistencia. Intenta de nuevo.");
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
        <h3 style="font-family: 'Dancing Script', cursive; font-size: 2.5rem; color: #D4AF37;">¡Confirmado!</h3>
        <p style="font-family: 'Montserrat', sans-serif; font-size: 1.1rem;">Gracias <strong>${nombre}</strong>, nos vemos el 11 de Abril de 2026.</p>
        <button class="btn-link" onclick="location.reload()" style="margin-top: 20px; border:none; background:none; text-decoration:underline; cursor:pointer;">Confirmar otra invitación</button>
    `;
    document.querySelector('.rsvp').appendChild(confirmationBox);
}

// Iniciar proceso
initRSVP();