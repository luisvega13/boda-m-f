// URL de tu implementación de Google Apps Script (la misma que usas en rsvp.js)
const googleScriptURL = "https://script.google.com/macros/s/AKfycbykse9b3nOSOaSVISP0u2yGokpqEg1Qb2P0KdvuYAmeEAxNeVJ45GY5ftl1ei5DOGIL/exec";

document.addEventListener('DOMContentLoaded', cargarInvitados);

// Variable global para guardar los datos cargados y poder exportarlos a CSV después
let datosConfirmados = [];

async function cargarInvitados() {
    const tbody = document.getElementById('tabla-invitados');
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 30px;">Cargando datos desde la nube...</td></tr>';
    
    try {
        // Hacemos la petición GET al script de Google
        const response = await fetch(googleScriptURL);
        datosConfirmados = await response.json();
        
        tbody.innerHTML = ''; // Limpiar mensaje de carga

        if (!datosConfirmados || datosConfirmados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 30px; color: #888;">No hay invitados confirmados aún.</td></tr>';
            return;
        }

        // Renderizar cada invitado en la tabla
        // Localiza esta sección dentro de la función cargarInvitados
        datosConfirmados.forEach((invitado) => {
            const tr = document.createElement('tr');
            
            const acompañantesTexto = (invitado.acompanantes && invitado.acompanantes.length > 0 && invitado.acompanantes[0] !== "")
                ? invitado.acompanantes.join(', ') 
                : '<span style="color: #aaa;">Sin invitados extra</span>';

            // Agregamos data-label para que el CSS sepa qué título poner en móvil
            tr.innerHTML = `
                <td data-label="Nombre Principal"><strong>${invitado.nombre}</strong></td>
                <td data-label="Invitados">${acompañantesTexto}</td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Error al obtener datos:", error);
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 30px; color: red;">Error al conectar con Google Sheets. Verifica la URL del script.</td></tr>';
    }
}

function exportarCSV() {
    if (datosConfirmados.length === 0) {
        alert("No hay datos cargados para exportar.");
        return;
    }

    // Definir encabezados del CSV
    let csvContent = "Nombre Principal,Invitados,Fecha de Registro\n";

    // Recorrer los invitados cargados desde la nube
    datosConfirmados.forEach(invitado => {
        const acompañantes = (invitado.acompanantes && invitado.acompanantes.length > 0) 
            ? invitado.acompanantes.join(' - ') 
            : "Sin Invitados";
            
        // Formatear fila con comillas para evitar errores por comas internas
        const fila = `"${invitado.nombre}","${acompañantes}","${invitado.fecha}"\n`;
        csvContent += fila;
    });

    // Crear el archivo y forzar la descarga (UTF-8 con BOM para Excel/Acentos)
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", "confirmaciones_boda_realtime.csv");
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// function reiniciarTodos() {
//     alert("Para reiniciar la lista, por favor borra las filas directamente en tu archivo de Google Sheets.");
// }