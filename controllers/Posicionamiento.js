document.addEventListener("DOMContentLoaded", () => {
    const board = document.getElementById("board");
    const generateButton = document.getElementById("generateBoard");
    const dimensionSelect = document.getElementById("dimension");
    const rotateButton = document.getElementById("rotate");
    const startBattleButton = document.getElementById("startBattle");
    const shipsContainer = document.getElementById("shipsContainer");
    let selectedShip = null;
    let isVertical = false;
    let placedShips = [];
    let battleStarted = false;

    generateButton.addEventListener("click", () => {
        if (battleStarted) return;
        const size = parseInt(dimensionSelect.value);
        createBoard(size);
        resetShips();
    });

    function createBoard(size) {
        board.innerHTML = "";
        board.style.gridTemplateColumns = `repeat(${size}, 30px)`;
        board.style.gridTemplateRows = `repeat(${size}, 30px)`;

        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const cell = document.createElement("div");
                cell.classList.add("cell");
                cell.dataset.row = row;
                cell.dataset.col = col;
                board.appendChild(cell);
            }
        }
    }

    function resetShips() {
        shipsContainer.innerHTML = "";
        placedShips = [];
        const shipSizes = [2, 3, 4, 5, 6];
        shipSizes.forEach(size => {
            const ship = document.createElement("div");
            ship.classList.add("ship", "horizontal");
            ship.dataset.size = size;
            ship.draggable = true;
            ship.style.width = `${size * 30}px`;
            ship.style.height = "30px";
            shipsContainer.appendChild(ship);
            addDragListeners(ship);
        });
    }

    function addDragListeners(ship) {
        ship.addEventListener("dragstart", (e) => {
            if (battleStarted) return;
            selectedShip = e.target;
            setTimeout(() => ship.classList.add("hidden"), 0);
        });
        ship.addEventListener("dragend", () => {
            selectedShip.classList.remove("hidden");
        });
        ship.addEventListener("click", () => {
            if (battleStarted) return;
            selectedShip = ship;
        });
    }

    board.addEventListener("dragover", (e) => {
        e.preventDefault();
    });

    board.addEventListener("drop", (e) => {
        if (!selectedShip || battleStarted) return;
        const rect = board.getBoundingClientRect();
        const size = parseInt(selectedShip.dataset.size);
        const cellSize = 30;

        const x = Math.floor((e.clientX - rect.left) / cellSize);
        const y = Math.floor((e.clientY - rect.top) / cellSize);

        if (canPlaceShip(y, x, size)) {
            placeShip(y, x, size, selectedShip);
        }
    });

    function canPlaceShip(row, col, size) {
        for (let i = 0; i < size; i++) {
            let targetCell = isVertical ?
                document.querySelector(`[data-row='${row + i}'][data-col='${col}']`) :
                document.querySelector(`[data-row='${row}'][data-col='${col + i}']`);

            if (!targetCell || targetCell.classList.contains("occupied")) return false;
        }
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

        localStorage.setItem("playerShips", JSON.stringify(shipsData));
        alert("¡Batalla iniciada! Tu configuración se ha guardado.");
    });


    resetShips();
});
