import CONFIG from "../config.js";

document.addEventListener("DOMContentLoaded", async () => {
    try {
        console.log("Obteniendo datos del ranking...");

        // Obtener la lista de países
        const countriesResponse = await fetch(CONFIG.API_COUNTRIES);
        if (!countriesResponse.ok) throw new Error(`Error al obtener países: ${countriesResponse.status}`);

        const countriesArray = await countriesResponse.json();
        console.log("Lista de países recibida:", countriesArray);

        const countryMap = {};
        countriesArray.forEach(countryObj => {
            const code = Object.keys(countryObj)[0].toLowerCase();
            countryMap[code] = countryObj[code];
        });

        console.log("Mapa de países procesado:", countryMap);

        // Obtener el ranking
        const response = await fetch(CONFIG.API_RANKING);
        if (!response.ok) throw new Error(`Error en la petición: ${response.status}`);

        const rankingData = await response.json();
        console.log("Datos del ranking:", rankingData);

        if (!Array.isArray(rankingData)) {
            throw new Error("El servidor no devolvió un array.");
        }

        const tabla = document.getElementById("ranking-table");
        tabla.innerHTML = "";

        rankingData.forEach((item, index) => {
            const countryCode = item.country_code ? item.country_code.toLowerCase() : "";
            const countryName = countryMap[countryCode] || "Desconocido";
            const banderaURL = `https://flagsapi.com/${countryCode.toUpperCase()}/flat/64.png`;
            const fechaHora = item.fechaHora ? new Date(item.fechaHora).toLocaleString() : "Desconocido";

            console.log(`Código: ${countryCode} -> Nombre: ${countryName}`);

            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.nick_name || "Sin nombre"}</td>
                <td>${item.score ?? "0"}</td>
                <td class="pais-container">
                    <span>${countryName}</span>
                    <img src="${banderaURL}" alt="${countryName}" class="bandera"/>
                </td>
                <td>${fechaHora.split(" ")[0]}</td>
            `;
            tabla.appendChild(fila);
        });

        console.log("Ranking actualizado correctamente.");
    } catch (error) {
        console.error("Error al obtener el ranking:", error);
    }
});
