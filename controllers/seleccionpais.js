import CONFIG from "../config.js";

document.addEventListener("DOMContentLoaded", async () => {
    const countryInput = document.getElementById("nacionalidad");
    const playButton = document.getElementById("jugar");
    let countryMap = {};

    try {
        const response = await fetch(CONFIG.API_COUNTRIES);
        if (!response.ok) throw new Error("Error al obtener países");

        const countriesArray = await response.json();

        // Crear un mapa de países para buscar por nombre
        countriesArray.forEach(countryObj => {
            const code = Object.keys(countryObj)[0].toLowerCase(); // Código del país en minúsculas
            const name = countryObj[code].toLowerCase(); // Nombre del país en minúsculas
            countryMap[name] = code; // Relaciona el nombre con su código
        });

        console.log("Mapa de países cargado correctamente:", countryMap);
    } catch (error) {
        console.error("Error cargando países:", error);
    }

    // Guardar datos antes de jugar
    playButton.addEventListener("click", () => {
        const nickname = document.getElementById("nombre").value.trim();
        const countryName = countryInput.value.trim().toLowerCase(); // Convertir a minúsculas
        const boardSize = document.getElementById("tamanio").value.trim();

        if (!nickname || !countryName || !boardSize) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        // Buscar el código del país basado en el nombre ingresado
        const countryCode = countryMap[countryName] || "desconocido"; // Si no existe, asigna "desconocido"

        // Guardar temporalmente en LocalStorage (se enviará al backend después)
        const playerData = {
            nick_name: nickname,
            score: 0, // Se actualizará después del juego
            country_code: countryCode,
            board_size: boardSize,
            date: new Date().toLocaleString()
        };

        localStorage.setItem("playerData", JSON.stringify(playerData));

        console.log("Datos guardados:", playerData);
    });
});
