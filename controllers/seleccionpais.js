import CONFIG from "../config.js";

const CITY_LIST_PATH = "../city.list.json";

document.addEventListener("DOMContentLoaded", async () => {
    const countryInput = document.getElementById("nacionalidad");
    const countryList = document.getElementById("lista-paises");
    const cityInput = document.getElementById("ciudad");
    const cityList = document.getElementById("lista-ciudades");
    const playButton = document.getElementById("jugar");

    let countryMap = {};
    let cityData = [];

    try {
        // Cargar países
        const countriesResponse = await fetch(CONFIG.API_COUNTRIES);
        const countriesArray = await countriesResponse.json();

        countriesArray.forEach(countryObj => {
            const code = Object.keys(countryObj)[0].toLowerCase();
            const name = countryObj[code].toLowerCase();
            countryMap[name] = code;

            const option = document.createElement("option");
            option.value = countryObj[code]; // Nombre visible
            countryList.appendChild(option);
        });

        console.log("✅ Países cargados:", Object.keys(countryMap).length);

        // Cargar ciudades
        const citiesResponse = await fetch(CITY_LIST_PATH);
        cityData = await citiesResponse.json();
        console.log("🏙️ Ciudades cargadas:", cityData.length);
    } catch (error) {
        console.error("❌ Error cargando datos:", error);
    }

    // Actualizar ciudades cuando el país cambie
    countryInput.addEventListener("input", () => {
        const countryName = countryInput.value.trim().toLowerCase();
        const countryCode = countryMap[countryName];

        cityList.innerHTML = "";

        if (!countryCode) {
            console.warn("❌ País no válido o no reconocido:", countryName);
            return;
        }

        const ciudadesFiltradas = cityData
            .filter(ciudad => ciudad.country.toLowerCase() === countryCode)
            .slice(0, 200); // limitar sugerencias

        ciudadesFiltradas.forEach(ciudad => {
            const option = document.createElement("option");
            option.value = ciudad.name;
            cityList.appendChild(option);
        });

        console.log(`🌍 Ciudades para ${countryName}:`, ciudadesFiltradas.length);
    });

    // Guardar datos al hacer clic
    playButton.addEventListener("click", () => {
        const nickname = document.getElementById("nombre").value.trim();
        const countryName = countryInput.value.trim().toLowerCase();
        const boardSize = document.getElementById("tamanio")?.value?.trim() || "10";

        const citySelect = document.getElementById("ciudad");
        const selectedCity = citySelect.value.trim();

        if (!nickname || !countryName || !selectedCity) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        const countryCode = countryMap[countryName];
        if (!countryCode) {
            alert("El país ingresado no es válido.");
            return;
        }

        const playerData = {
            nick_name: nickname,
            score: 0,
            country_code: countryCode,
            city_name: selectedCity, // 👈 ciudad seleccionada del <select>
            board_size: boardSize,
            date: new Date().toLocaleString()
        };

        localStorage.setItem("playerData", JSON.stringify(playerData));
        console.log("✅ Datos guardados en localStorage:", playerData);
    });

});
