document.addEventListener("DOMContentLoaded", () => {
    const playerBoard = document.getElementById("player-board");
    const opponentBoard = document.getElementById("opponent-board");
    const attackButton = document.getElementById("attack-button");
    const resetButton = document.getElementById("reset-button");

    const BOARD_SIZE = 10;
    let currentPlayerTurn = "player"; // "player" o "opponent"
    let selectedTarget = null;
    let opponentBoardMatrix = []; // Simulación del tablero del oponente

    function createBoard(boardElement, isPlayer) {
        boardElement.innerHTML = "";
        boardElement.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 30px)`;
        boardElement.style.gridTemplateRows = `repeat(${BOARD_SIZE}, 30px)`;

        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const cell = document.createElement("div");
                cell.classList.add("cell");
                cell.dataset.row = row;
                cell.dataset.col = col;

                if (!isPlayer) {
                    cell.addEventListener("click", () => {
                        if (currentPlayerTurn === "player") {
                            document.querySelectorAll("#opponent-board .cell").forEach(c => c.classList.remove("selected"));
                            selectedTarget = { row, col };
                            cell.classList.add("selected");
                        }
                    });
                }

                boardElement.appendChild(cell);
            }
        }
    }

    function loadPlayerShips() {
        const ships = JSON.parse(localStorage.getItem("playerShips")) || [];
        ships.forEach(ship => {
            const { row, col, size, isVertical } = ship;
            for (let i = 0; i < size; i++) {
                const r = isVertical ? row + i : row;
                const c = isVertical ? col : col + i;
                const cell = playerBoard.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                if (cell) {
                    cell.classList.add("occupied");
                }
            }
        });
    }

    function simulateOpponentBoard() {
        opponentBoardMatrix = Array.from({ length: BOARD_SIZE }, () =>
            Array.from({ length: BOARD_SIZE }, () => ({ hasShip: Math.random() < 0.2, hit: false }))
        );
    }

    function attackOpponent() {
        if (!selectedTarget) return;

        const { row, col } = selectedTarget;
        const cell = opponentBoard.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        const target = opponentBoardMatrix[row][col];

        if (target.hit) {
            alert("Ya atacaste esa celda.");
            return;
        }

        target.hit = true;
        cell.classList.remove("selected");
        cell.classList.add(target.hasShip ? "hit" : "miss");

        selectedTarget = null;
        currentPlayerTurn = "opponent";
        setTimeout(opponentAttack, 1000);
    }

    function opponentAttack() {
        let row, col, cell;
        do {
            row = Math.floor(Math.random() * BOARD_SIZE);
            col = Math.floor(Math.random() * BOARD_SIZE);
            cell = playerBoard.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        } while (cell.classList.contains("hit") || cell.classList.contains("miss"));

        if (cell.classList.contains("occupied")) {
            cell.classList.add("hit");
        } else {
            cell.classList.add("miss");
        }

        currentPlayerTurn = "player";
    }

    function resetGame() {
        createBoard(playerBoard, true);
        createBoard(opponentBoard, false);
        loadPlayerShips();
        simulateOpponentBoard();
        currentPlayerTurn = "player";
        selectedTarget = null;
    }

    // Inicialización
    resetGame();

    // Event Listeners
    attackButton.addEventListener("click", () => {
        if (currentPlayerTurn === "player" && selectedTarget) {
            attackOpponent();
        }
    });

    resetButton.addEventListener("click", () => {
        resetGame();
    });
});
