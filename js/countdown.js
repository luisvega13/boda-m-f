document.addEventListener('DOMContentLoaded', () => {
    // Fecha de la boda: 11 de Abril de 2026 a las 16:00 hrs (Hora de la ceremonia)
    const weddingDate = new Date("April 11, 2026 16:00:00").getTime();

    const timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = weddingDate - now;

        // Si la cuenta llega a cero
        if (distance < 0) {
            clearInterval(timer);
            document.querySelector('.countdown-container').innerHTML = "<h3>¡Hoy es el gran día!</h3>";
            return;
        }

        // Cálculos de tiempo
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Actualizar el HTML (padStart añade un '0' a la izquierda si es un solo dígito)
        document.getElementById("days").innerText = days.toString().padStart(2, '0');
        document.getElementById("hours").innerText = hours.toString().padStart(2, '0');
        document.getElementById("minutes").innerText = minutes.toString().padStart(2, '0');
        document.getElementById("seconds").innerText = seconds.toString().padStart(2, '0');
    }, 1000);
});