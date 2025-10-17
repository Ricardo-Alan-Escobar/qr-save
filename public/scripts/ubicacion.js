window.addEventListener('DOMContentLoaded', () => {
  const ubicacion = document.getElementById('ubicacion');
  const botonCompartir = document.getElementById('compartirUbicacion');

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const enlace = `https://maps.google.com/?q=${lat},${lon}`;
        ubicacion.innerHTML = `<a href="${enlace}" target="_blank" class="text-primary underline">Ver en Google Maps</a><br><span class="text-xs text-muted-foreground">Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}</span>`;

        botonCompartir.addEventListener('click', async () => {
          if (navigator.share) {
            await navigator.share({
              title: 'Emergencia - Ubicación del siniestro',
              text: 'Emergencia médica: Juan Pérez necesita ayuda en esta ubicación.',
              url: enlace
            });
          } else {
            // Copiar al portapapeles como respaldo
            navigator.clipboard.writeText(enlace);
            alert('Ubicación copiada al portapapeles.');
          }
        });
      },
      () => ubicacion.textContent = "No se pudo obtener la ubicación."
    );
  } else {
    ubicacion.textContent = "Geolocalización no compatible con este dispositivo.";
  }
});
