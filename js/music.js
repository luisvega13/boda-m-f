document.addEventListener('DOMContentLoaded', () => {
    const sobreScreen = document.getElementById('sobre-screen');
    const sobre = document.getElementById('envelope-main');
    const sello = document.getElementById('seal-click');
    const music = document.getElementById('bg-music');

    // Función para manejar el clic en el sobre o el sello
    const abrirSobre = () => {
        // 1. Agregar clase CSS para iniciar animaciones (solapa y tarjeta)
        sobre.classList.add('abierto');

        // 2. Iniciar la música (intentar autoplay tras la interacción)
        if (music) {
            music.play().catch(error => {
                console.log("El navegador bloqueó la música, se requiere otra interacción.", error);
            });
        }

        // 3. Esperar a que las animaciones terminen (2.5 seg aprox total) y limpiar
        // 1s flap + 1s card + buffer
        setTimeout(() => {
            // Desvanecer la pantalla negra completa
            sobreScreen.classList.add('oculto');
            
            // Permitir scroll en la página principal
            document.body.classList.remove('locked');
        }, 2800); 
    };

    // Detectar clic en el sello o el sobre
    if (sello && sobreScreen) {
        // Solo permitimos el clic una vez
        sello.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita clics dobles
            abrirSobre();
        }, { once: true });
        
        // También por si acaso hacen clic en el sobre pero no exactamente en el sello
        sobre.addEventListener('click', () => {
             abrirSobre();
        }, { once: true });
    }
});