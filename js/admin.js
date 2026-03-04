document.addEventListener('DOMContentLoaded', cargarInvitados);

function cargarInvitados() {
    const tbody = document.getElementById('tabla-invitados');
    tbody.innerHTML = '';
    
    // Obtener datos del localStorage
    let confirmados = JSON.parse(localStorage.getItem('invitadosConfirmados')) || [];
    
    if (confirmados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 30px; color: #888;">No hay invitados confirmados aún.</td></tr>';
        return;
    }

    // Renderizar cada invitado en la tabla
    confirmados.forEach((invitado, index) => {
        const tr = document.createElement('tr');
        
        const acompañantesTexto = invitado.acompanantes && invitado.acompanantes.length > 0 
            ? invitado.acompanantes.join(', ') 
            : '<span style="color: #aaa;">Sin invitados extra</span>';

        tr.innerHTML = `
            <td><strong>${invitado.nombre}</strong></td>
            <td>${acompañantesTexto}</td>
            <td>
                <button class="btn btn-reset" onclick="eliminarInvitado(${index})">Resetear Estado</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function eliminarInvitado(index) {
    if (confirm('¿Estás seguro de que deseas reiniciar a este invitado? El invitado podrá volver a confirmar en la página principal.')) {
        let confirmados = JSON.parse(localStorage.getItem('invitadosConfirmados')) || [];
        confirmados.splice(index, 1); // Remover el elemento del array
        localStorage.setItem('invitadosConfirmados', JSON.stringify(confirmados)); // Guardar cambios
        cargarInvitados(); // Recargar la tabla
    }
}

function reiniciarTodos() {
    if (confirm('⚠️ ¿Estás completamente seguro de eliminar TODAS las confirmaciones actuales?')) {
        localStorage.removeItem('invitadosConfirmados');
        cargarInvitados();
    }
}
function exportarCSV() {
    // Obtener los datos actuales del localStorage
    let confirmados = JSON.parse(localStorage.getItem('invitadosConfirmados')) || [];

    if (confirmados.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }

    // Definir encabezados del CSV
    let csvContent = "Nombre Principal,Invitados,Fecha de Registro\n";

    // Recorrer los invitados y dar formato a las filas
    confirmados.forEach(invitado => {
        const acompañantes = invitado.acompanantes ? invitado.acompanantes.join(' - ') : "Sin Invitados";
        // Limpiar comas internas para no romper el formato CSV
        const fila = `"${invitado.nombre}","${acompañantes}","${invitado.fecha}"\n`;
        csvContent += fila;
    });

    // Crear el archivo y forzar la descarga con codificación UTF-8 para acentos
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", "lista_invitados_boda.csv");
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}