document.addEventListener("DOMContentLoaded", () => {
    const playerBoard = document.getElementById("player-board");
    const enemyBoard = document.getElementById("enemy-board");
    const attackButton = document.getElementById("attack-button");
    const resetButton = document.getElementById("reset-button");
    const homeButton = document.getElementById("home-button");

    let selectedCell = null;
    let playerTurn = true;
    let playerShips = JSON.parse(localStorage.getItem("playerShips")) || [];
    let playerBoardSize = parseInt(localStorage.getItem("playerBoardSize")) || 10;
    let enemyShips = [];

    function createBoard(container, size, isEnemy = false) {
        container.innerHTML = "";
        container.style.display = "grid";
        container.style.gridTemplateColumns = `repeat(${size}, 40px)`;
        container.style.gridTemplateRows = `repeat(${size}, 40px)`;
        container.style.border = "3px solid #222";
        container.style.boxShadow = "0 8px 16px rgba(0,0,0,0.25)";
        container.style.padding = "12px";
        container.style.margin = "20px auto";
        container.style.background = "linear-gradient(145deg, #e6f0ff, #ffffff)";
        container.style.borderRadius = "20px";

        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const cell = document.createElement("div");
                cell.classList.add("cell");
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.style.width = "40px";
                cell.style.height = "40px";
                cell.style.border = "1px solid #aaa";
                cell.style.display = "flex";
                cell.style.alignItems = "center";
                cell.style.justifyContent = "center";
                cell.style.cursor = isEnemy ? "pointer" : "default";
                cell.style.backgroundColor = "#d0e7ff";
                cell.style.transition = "all 0.2s ease-in-out";
                cell.style.borderRadius = "6px";

                if (isEnemy) {
                    cell.addEventListener("click", () => {
                        if (!playerTurn) return;
                        if (cell.classList.contains("hit") || cell.classList.contains("miss")) return;
                        if (selectedCell) selectedCell.classList.remove("selected");
                        selectedCell = cell;
                        cell.classList.add("selected");
                        cell.style.outline = "3px solid gold";
                        cell.style.zIndex = "2";
                    });
                }

                container.appendChild(cell);
            }
        }
    }

    function placeShips(container, ships, isEnemy = false) {
        ships.forEach(({ row, col, size, isVertical }) => {
            for (let i = 0; i < size; i++) {
                const targetRow = isVertical ? row + i : row;
                const targetCol = isVertical ? col : col + i;
                const cell = container.querySelector(`[data-row='${targetRow}'][data-col='${targetCol}']`);
                if (cell) {
                    cell.classList.add("occupied");
                    if (!isEnemy) {
                        cell.style.backgroundColor = "#2c3e50";
                        cell.style.border = "1px solid #1a252f";
                    }
                }
            }
        });
    }

    function generateEnemyShips(size) {
        const ships = [5, 4, 3, 3, 2, 2];
        const placed = [];

        ships.forEach(shipSize => {
            let placedSuccessfully = false;
            while (!placedSuccessfully) {
                const isVertical = Math.random() < 0.5;
                const row = Math.floor(Math.random() * (isVertical ? size - shipSize + 1 : size));
                const col = Math.floor(Math.random() * (isVertical ? size : size - shipSize + 1));

                let valid = true;
                for (let i = 0; i < shipSize; i++) {
                    const r = isVertical ? row + i : row;
                    const c = isVertical ? col : col + i;
                    if (placed.some(s => s.row <= r && r < s.row + (s.isVertical ? s.size : 1) &&
                        s.col <= c && c < s.col + (s.isVertical ? 1 : s.size))) {
                        valid = false;
                        break;
                    }
                }

                if (valid) {
                    placed.push({ row, col, size: shipSize, isVertical });
                    placedSuccessfully = true;
                }
            }
        });

        return placed;
    }

    function enemyAttack() {
        const cells = Array.from(playerBoard.querySelectorAll(".cell"));
        const unhit = cells.filter(cell => !cell.classList.contains("hit") && !cell.classList.contains("miss"));

        if (unhit.length === 0) return;

        const target = unhit[Math.floor(Math.random() * unhit.length)];
        const row = parseInt(target.dataset.row);
        const col = parseInt(target.dataset.col);

        let hit = false;
        playerShips.forEach(({ row: r, col: c, size, isVertical }) => {
            for (let i = 0; i < size; i++) {
                const sr = isVertical ? r + i : r;
                const sc = isVertical ? c : c + i;
                if (sr === row && sc === col) {
                    hit = true;
                }
            }
        });

        target.classList.add(hit ? "hit" : "miss");
        target.style.backgroundColor = hit ? "#e74c3c" : "#ecf0f1";
    }

    attackButton.addEventListener("click", () => {
        if (!playerTurn || !selectedCell || selectedCell.classList.contains("hit") || selectedCell.classList.contains("miss")) return;

        const row = parseInt(selectedCell.dataset.row);
        const col = parseInt(selectedCell.dataset.col);

        let hit = false;
        enemyShips.forEach(({ row: r, col: c, size, isVertical }) => {
            for (let i = 0; i < size; i++) {
                const sr = isVertical ? r + i : r;
                const sc = isVertical ? c : c + i;
                if (sr === row && sc === col) {
                    hit = true;
                }
            }
        });

        selectedCell.classList.add(hit ? "hit" : "miss");
        selectedCell.style.backgroundColor = hit ? "#e74c3c" : "#ecf0f1";
        selectedCell.classList.remove("selected");
        selectedCell.style.outline = "none";
        selectedCell = null;

        playerTurn = false;
        setTimeout(() => {
            enemyAttack();
            playerTurn = true;
        }, 1000);
    });

    resetButton.addEventListener("click", () => {
        window.location.reload();
    });

    homeButton.addEventListener("click", () => {
        window.location.href = "menuinicial.html";
    });

    createBoard(playerBoard, playerBoardSize);
    createBoard(enemyBoard, playerBoardSize, true);

    placeShips(playerBoard, playerShips);
    enemyShips = generateEnemyShips(playerBoardSize);
    placeShips(enemyBoard, enemyShips, true);
});
