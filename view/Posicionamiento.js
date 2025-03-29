document.addEventListener("DOMContentLoaded", function () {
    const tablero = document.querySelector(".tablero");
    const coordenadasTop = document.querySelector(".coordenadas-top");
    const coordenadasLeft = document.querySelector(".coordenadas-left");
    const letras = "ABCDEFGHIJ";
    const barcos = document.querySelectorAll(".barco");
    let barcoSeleccionado = null;
    let esVertical = false;

    // Crear coordenadas
    for (let i = 0; i < 10; i++) {
        let coordTop = document.createElement("div");
        coordTop.textContent = letras[i];
        coordenadasTop.appendChild(coordTop);

        let coordLeft = document.createElement("div");
        coordLeft.textContent = i + 1;
        coordenadasLeft.appendChild(coordLeft);
    }

    // Crear celdas del tablero (10x10)
    for (let i = 0; i < 100; i++) {
        let celda = document.createElement("div");
        celda.classList.add("celda");
        celda.setAttribute("data-pos", i);
        tablero.appendChild(celda);
    }

    // Funcionalidad de arrastrar y soltar barcos
    barcos.forEach(barco => {
        barco.addEventListener("dragstart", (e) => {
            barcoSeleccionado = barco;
            setTimeout(() => barco.style.visibility = "hidden", 0);
        });

        barco.addEventListener("dragend", () => {
            barco.style.visibility = "visible";
        });
    });

    tablero.addEventListener("dragover", (e) => {
        e.preventDefault();
    });

    tablero.addEventListener("drop", (e) => {
        e.preventDefault();
        if (barcoSeleccionado && e.target.classList.contains("celda")) {
            let celda = e.target;
            celda.appendChild(barcoSeleccionado);
            barcoSeleccionado.style.position = "absolute";
            barcoSeleccionado.style.top = "0";
            barcoSeleccionado.style.left = "0";
        }
    });

    // Botón para rotar barco
    document.getElementById("btn-rotar").addEventListener("click", () => {
        if (barcoSeleccionado) {
            esVertical = !esVertical;
            barcoSeleccionado.style.transform = esVertical ? "rotate(90deg)" : "rotate(0deg)";
        }
    });

    // Botón para trasladar barco de regreso
    document.getElementById("btn-trasladar").addEventListener("click", () => {
        if (barcoSeleccionado) {
            document.querySelector(".barcos").appendChild(barcoSeleccionado);
            barcoSeleccionado.style.transform = "rotate(0deg)";
            esVertical = false;
        }
    });

    document.getElementById("btn-volver").addEventListener("click", () => {
        location.reload(); // Recarga la página para reiniciar el tablero
    });

    document.getElementById("btn-iniciar-batalla").addEventListener("click", () => {
        let posiciones = [];

        document.querySelectorAll(".barco").forEach(barco => {
            let parentCell = barco.parentElement;
            if (parentCell.classList.contains("celda")) {
                posiciones.push({
                    barco: barco.classList[1],
                    posicion: parentCell.getAttribute("data-pos"),
                    rotado: barco.style.transform === "rotate(90deg)"
                });
            }
        });

        localStorage.setItem("posicionesBarcos", JSON.stringify(posiciones));
        alert("¡Posiciones guardadas! La batalla está por comenzar.");
    });

});
