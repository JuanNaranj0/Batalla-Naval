document.addEventListener("DOMContentLoaded", () => {

    /* Seguir el board para ver como lo llena
        1. tablero
    */
    const board = document.getElementById("board");
    /* 
        Generar tablero
        2. botón que dice generar tablero
    */
    const generateButton = document.getElementById("generateBoard");
    /* 
        dimensionSelect nos permite saber la opción que se ha seleccionado para el tamaño del tablero
        se usa en la parte #2 que es generateButton
    */
    const dimensionSelect = document.getElementById("dimension");
    const rotateButton = document.getElementById("rotate");
    const startBattleButton = document.getElementById("startBattle");
    /* 
        Es un contenedor para los barcos que todavia no están ubicados
    */
    const shipsContainer = document.getElementById("shipsContainer");
    let selectedShip = null;
    let isVertical = false;
    let placedShips = [];
    let battleStarted = false;

    /* 
        GenerateButton es un elemento de html y lo que hace esta fucnión
        es añadir un evento que se ejecuta (un evento es codigo)

        que evento, es el primer parametro, click y le va a decir que va a ejecutar cuando haga click
    */

    generateButton.addEventListener("click", () => {
        /* 
         2.
         va a crear una variable size, que va a ser el número (value) de la etiqueta select

         después con esa variable size se la va a pasar a la función crear board (paso 1)
        */
        if (battleStarted) return;
        const size = parseInt(dimensionSelect.value);
        createBoard(size);
        /* 
            después de cambiar el tamaño, limpia o borra todos los botes del board.
        */
        resetShips();
    });


    /* 1. función para crear tablero */
    function createBoard(size) {
        /* estilos para que se ubique como una matriz */
        board.innerHTML = "";
        /* repitete la cantidad de veces del parametro size con un tamaño
        de 30px para columnas, y otro para filas. 
        */
        board.style.gridTemplateColumns = `repeat(${size}, 30px)`;
        board.style.gridTemplateRows = `repeat(${size}, 30px)`;

        /* doble recorrida primero para crear filas, y la seugnda para las 
            columnas dentro de esas filas.

            el largo del recorrido del ciclo depende de el argumento size
            y eso permite que el tablero sea del tamaño del size.
            si size es 10, un recorrido de 10*10.
        */

        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                /* usa document que es la forma de crear o interactuar con html desde
                el codiog. y en este le dice que va a crear un div.

                createElement(el nombre de la etiqueta a crear)
                */
                const cell = document.createElement("div");
                /* le añade una clase, principalmente para darle estilos a la caja */
                /* que puedes dar clases para indentificar. por ejemplo si una caja 
                    está disparada, puedes darle la clase .destroyed, y al reinicar el juego
                    quitas esa clase y todas las casillas están como nuevas

                    estas disparando y quieres asegurarte de no disparar dos veces en el mismo lugar
                    seleccionas la celda, y ves que no tenga la clase destroyed, porque si la tiene ya fue disparada

                */
                cell.classList.add("cell");
                /* dos propiedades que se llaman dataset que te permite poner
                    las propiedades que necesites bajo los nombres que necesitas
                */
                cell.dataset.row = row;
                cell.dataset.col = col;
                /* appendChild es añade este elemento como hijo de board. */
                board.appendChild(cell);
            }
        }
    }

    /* 
        3.
        resetShips es la primera función que se ejecuta de forma independiente del usaurio
    */
    
    function resetShips() {
        /* estilos para que se ubique como una matriz */
        shipsContainer.innerHTML = "";
        placedShips = [];

        const shipSizes = [5, 4, 3, 3, 2, 2];

        shipSizes.forEach(size => {
            const ship = document.createElement("div");
            ship.classList.add("ship", "horizontal");
            ship.dataset.size = size;
            /* 
                3.
                Está permitiendo que cada uno de los barcos sean arrastables
            */
            ship.draggable = true;

            /* 
                Crea cada cuadrito que compone un barco
                la variable ship es solo un div que hasta el momento no tiene contenido
                el barco no tiene forma
            */

            for (let i = 0; i < size; i++) {
                const cell = document.createElement("div");
                cell.classList.add("ship-cell");
                ship.appendChild(cell);
            }

            shipsContainer.appendChild(ship);
            /* Ejecuta la función addDragListener y le pasa cada barco */
            /* Al crear cada barco, a la vez ejecuta la función que más adelante
                permite que el barco se arraste. o la que va a definir como se comparta
                cuando el barco está siendo arrastrado.
            */
           /* 
                Al ejecutar esta función pasa al paso 4
           */
                
            addDragListeners(ship);
        });
    }

    /* 
        4. Paso 4.
        Lo que hacen las siguientes 3 funciones: addDragListeners, dragover, drop

        son eventos que te permiten arrastrar elementos y más importante obtener información de 
        donde está siendo arrastrado, cuando empezo, cuando termina, cuando se el drop (soltar)
    */

    function addDragListeners(ship) {
        /* le añade 3 eventos. drag start: cuando empieza a arraztrase */
        /* 
            lo que va a hacer es darle una clase, sobre todo relacionada con estilos
        */
        ship.addEventListener("dragstart", (e) => {
            if (battleStarted) return;
            /* cuando se arrastra, determina a nivel global que barco se está arrastradno */
            selectedShip = e.target;
            setTimeout(() => ship.classList.add("hidden"), 0);
        });
        /* le añade 3 eventos. drag start: cuando ya fue arrastrado*/
        ship.addEventListener("dragend", () => {
            selectedShip.classList.remove("hidden");
        });
        ship.addEventListener("click", () => {
            if (battleStarted) return;
            selectedShip = ship;
        });
    }

    /* El paso 4 se continua aca 
        el final del arraste es controlado por el tablero para reconocer donde debe ubicar el barco.
    */
    board.addEventListener("dragover", (e) => {
        e.preventDefault();
    });

    /* 
        Paso 4. Soltar el barco dentro del tablero.
    */
    board.addEventListener("drop", (e) => {
        if (!selectedShip || battleStarted) return;
        /* rect da las coordenadas exactas del tablero */
        const rect = board.getBoundingClientRect();
        /* 
            como al empezar a arrastrar tengo la info de que barco
            se está arrastrando, tomo el tamaño de ese barco
            con el dataset.size
        */
        const size = parseInt(selectedShip.dataset.size);
        /* cellsize que mide 30 porque cada cuadro dentro de la matriz */
        const cellSize = 30;

        const x = Math.floor((e.clientX - rect.left) / cellSize);
        const y = Math.floor((e.clientY - rect.top) / cellSize);
        /* Ya optiene x y y, y usa la función canPlaceShip para saber si lo puede ubicar o no
            en caso de que sí ejecuta placeShip
        */

        
        /* Paso 5. entender como funciona canPlaceShip (alcanza cabe) */
        if (canPlaceShip(y, x, size)) {
            /* paso 6. ubicar el barco */
            placeShip(y, x, size, selectedShip);
        }
    });

    /* Paso 5
        recibe el x, y, tamaño del barco
        donde x, y son donde se ubicar el barco
    */
    function canPlaceShip(row, col, size) {
        for (let i = 0; i < size; i++) {
            /* selecciona el elemento que tenga data-row y data-col  con los valores de
             la columna y fila donde se quiera
            */
            let targetCell = isVertical ?
                document.querySelector(`[data-row='${row + i}'][data-col='${col}']`) :
                document.querySelector(`[data-row='${row}'][data-col='${col + i}']`);
            /* 
                podemos usar clases para indicar si un elemento está en un estado o en otro

                aquí no añadimos estilos, pero estamos dandole a cada casilla una indicacion de si está ocupada o no
            */
            if (!targetCell || targetCell.classList.contains("occupied")) return false;
        }
        /* Seguimos a paso 6 */
        return true;
    }

    function placeShip(row, col, size, ship) {
        ship.classList.add("placed-ship");
        ship.style.position = "absolute";
        const firstCell = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
        if (firstCell) {
            ship.style.left = firstCell.offsetLeft + "px";
            ship.style.top = firstCell.offsetTop + "px";
        }
        ship.classList.remove("horizontal", "vertical");
        ship.classList.add(isVertical ? "vertical" : "horizontal");
        ship.style.width = isVertical ? "30px" : `${size * 30}px`;
        ship.style.height = isVertical ? `${size * 30}px` : "30px";
        board.appendChild(ship);

        for (let i = 0; i < size; i++) {
            let targetCell = isVertical ?
                document.querySelector(`[data-row='${row + i}'][data-col='${col}']`) :
                document.querySelector(`[data-row='${row}'][data-col='${col + i}']`);

            if (targetCell) targetCell.classList.add("occupied");
        }
    }

    rotateButton.addEventListener("click", () => {
        if (selectedShip && !battleStarted) {
            isVertical = !isVertical;
            selectedShip.classList.remove("horizontal", "vertical");
            selectedShip.classList.add(isVertical ? "vertical" : "horizontal");
            selectedShip.style.width = isVertical ? "30px" : `${selectedShip.dataset.size * 30}px`;
            selectedShip.style.height = isVertical ? `${selectedShip.dataset.size * 30}px` : "30px";
        }
    });

    startBattleButton.addEventListener("click", () => {
        battleStarted = true;
        let shipsData = [];

        document.querySelectorAll(".ship.placed-ship").forEach(ship => {
            let size = parseInt(ship.dataset.size);
            let isVertical = ship.classList.contains("vertical");
            let rect = ship.getBoundingClientRect();
            let boardRect = board.getBoundingClientRect();

            let col = Math.round((rect.left - boardRect.left) / 30);
            let row = Math.round((rect.top - boardRect.top) / 30);

            shipsData.push({ row, col, size, isVertical });
        });

        const boardSize = parseInt(dimensionSelect.value);
        localStorage.setItem("playerBoardSize", boardSize);
        localStorage.setItem("playerShips", JSON.stringify(shipsData));

        alert("¡Batalla iniciada! Tu configuración se ha guardado.");
        window.location.href = "Partida.html";
    });

    // Si ya hay una dimensión seleccionada, generar el tablero automáticamente
    if (dimensionSelect.value) {
        createBoard(parseInt(dimensionSelect.value));
    }

    resetShips();
});
