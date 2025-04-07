document.addEventListener("DOMContentLoaded", () => {
  const playerBoard = document.getElementById("player-board");
  const enemyBoard = document.getElementById("enemy-board");
  const attackButton = document.getElementById("attack-button");
  const resetButton = document.getElementById("reset-button");
  const homeButton = document.getElementById("home-button");

  /* VARIABLES GLOBALES */
  let selectedCell = null;
  let playerTurn = true;
  let playerShips = JSON.parse(localStorage.getItem("playerShips")) || [];
  let playerBoardSize = parseInt(localStorage.getItem("playerBoardSize")) || 10;
  let enemyShips = [];
  let estandarPuntaje = 19;
  let puntajeUsuario = 0;
  let vidaUsuario = 19;
  let vidaIa = 19;
  let tirosUsuario = 0;
  let tirosIa = 0;
  //(vida/cantidad de tiros* 100)+100 o-100
  // ((19 / 15) * 100) + 100
  // (19 / vidaIa) * 100
  // (19 / vidaUsuario) * 100
  

  // Variables para el modo killer simplificado
  const IA = {
    modo: "normal",
    disparosPrevios: [],
    direccionesPendientes: [], // Almacena coordenadas adyacentes por probar
    ultimoHit: null, // Coordenada del último acierto
    direccionActual: null, // Dirección en la que estamos siguiendo un barco
  };

  //craer el tablero
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
            if (
              cell.classList.contains("hit") ||
              cell.classList.contains("miss")
            )
              return;
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

  //pone los barcos del jugador
  function placeShips(container, ships, isEnemy = false) {
    ships.forEach(({ row, col, size, isVertical }) => {
      for (let i = 0; i < size; i++) {
        const targetRow = isVertical ? row + i : row;
        const targetCol = isVertical ? col : col + i;
        const cell = container.querySelector(
          `[data-row='${targetRow}'][data-col='${targetCol}']`
        );
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

  //pone los barcos de la ia
  function generateEnemyShips(size) {
    const ships = [5, 4, 3, 3, 2, 2];
    const placed = [];

    ships.forEach((shipSize) => {
      let placedSuccessfully = false;
      while (!placedSuccessfully) {
        const isVertical = Math.random() < 0.5;
        const row = Math.floor(
          Math.random() * (isVertical ? size - shipSize + 1 : size)
        );
        const col = Math.floor(
          Math.random() * (isVertical ? size : size - shipSize + 1)
        );

        let valid = true;
        for (let i = 0; i < shipSize; i++) {
          const r = isVertical ? row + i : row;
          const c = isVertical ? col : col + i;
          if (
            placed.some(
              (s) =>
                s.row <= r &&
                r < s.row + (s.isVertical ? s.size : 1) &&
                s.col <= c &&
                c < s.col + (s.isVertical ? 1 : s.size)
            )
          ) {
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

  // Función para verificar si una coordenada está dentro del tablero
  function dentroTablero(row, col) {
    return (
      row >= 0 && row < playerBoardSize && col >= 0 && col < playerBoardSize
    );
  }

  // Función para verificar si ya se disparó en una coordenada
  function yaDisparado(row, col) {
    return IA.disparosPrevios.some(([r, c]) => r === row && c === col);
  }

  // Función que devuelve las coordenadas adyacentes a una celda
  function obtenerAdyacentes(row, col) {
    const adyacentes = [
      [row - 1, col], // arriba
      [row, col + 1], // derecha
      [row + 1, col], // abajo
      [row, col - 1], // izquierda
    ];

    // Filtra solo las coordenadas válidas (dentro del tablero y no disparadas)
    return adyacentes.filter(
      ([r, c]) => dentroTablero(r, c) && !yaDisparado(r, c)
    );
  }

  // Función que obtiene la siguiente coordenada en una dirección
  function obtenerSiguiente(row, col, direccion) {
    switch (direccion) {
      case "arriba":
        return [row - 1, col];
      case "derecha":
        return [row, col + 1];
      case "abajo":
        return [row + 1, col];
      case "izquierda":
        return [row, col - 1];
      default:
        return null;
    }
  }

  // Función que dispara en una coordenada específica
  function dispararEn(row, col) {
    const celda = playerBoard.querySelector(
      `[data-row="${row}"][data-col="${col}"]`
    );
    if (!celda) return false; // Por si acaso

    const ocupada = celda.classList.contains("occupied");
    if(ocupada) {
        vidaUsuario--
        if(vidaUsuario === 0) {
            // le resto puntos por perder, le doy puntos por la vida que le quito a la ia
            puntajeUsuario = -100 + (estandarPuntaje - vidaIa)

            partidaFinalizada(puntajeUsuario, false)
        }
    }

    // Marcado estándar
    celda.classList.add(ocupada ? "hit" : "miss");
    celda.style.backgroundColor = ocupada ? "#e74c3c" : "#ecf0f1";

    // Registrar disparo
    IA.disparosPrevios.push([row, col]);

    return ocupada; // Devuelve true si acertó
  }

  //disparo ia
  function enemyAttack() {
    tirosIa++;
    console.log("Modo IA:", IA.modo);

    if (IA.modo === "normal") {
      // Modo normal: disparo aleatorio
      const cells = Array.from(playerBoard.querySelectorAll(".cell"));
      const unhit = cells.filter(
        (cell) =>
          !cell.classList.contains("hit") && !cell.classList.contains("miss")
      );
      if (unhit.length === 0) return;

      const target = unhit[Math.floor(Math.random() * unhit.length)];
      const row = parseInt(target.dataset.row);
      const col = parseInt(target.dataset.col);

      const hit = dispararEn(row, col);

      if (hit) {
        // Si acierta, cambia a modo killer y guarda coordenadas adyacentes
        IA.modo = "killer";
        IA.ultimoHit = [row, col];
        IA.direccionesPendientes = obtenerAdyacentes(row, col);
        IA.direccionActual = null;
      }
    } else if (IA.modo === "killer") {
      if (IA.direccionActual) {
        // Seguimos una dirección específica
        const [lastRow, lastCol] = IA.ultimoHit;
        const [nextRow, nextCol] = obtenerSiguiente(
          lastRow,
          lastCol,
          IA.direccionActual
        );

        // Verificar si la siguiente coordenada es válida
        if (dentroTablero(nextRow, nextCol) && !yaDisparado(nextRow, nextCol)) {
          const hit = dispararEn(nextRow, nextCol);

          if (hit) {
            // Si acierta, continúa en la misma dirección
            IA.ultimoHit = [nextRow, nextCol];
          } else {
            // Si falla, resetea al modo normal
            IA.modo = "normal";
            IA.ultimoHit = null;
            IA.direccionActual = null;
            IA.direccionesPendientes = [];
          }
        } else {
          // Si la próxima coordenada no es válida, vuelve al modo normal
          IA.modo = "normal";
          IA.ultimoHit = null;
          IA.direccionActual = null;
          IA.direccionesPendientes = [];
        }
      } else if (IA.direccionesPendientes.length > 0) {
        // Probamos una de las direcciones pendientes
        const [nextRow, nextCol] = IA.direccionesPendientes.shift();
        const hit = dispararEn(nextRow, nextCol);

        if (hit) {
          // Si acierta, descarta las otras direcciones y sigue en esta dirección
          const [lastRow, lastCol] = IA.ultimoHit;

          // Determinar la dirección actual
          if (nextRow < lastRow) IA.direccionActual = "arriba";
          else if (nextRow > lastRow) IA.direccionActual = "abajo";
          else if (nextCol < lastCol) IA.direccionActual = "izquierda";
          else if (nextCol > lastCol) IA.direccionActual = "derecha";

          IA.direccionesPendientes = []; // Descarta las otras direcciones
          IA.ultimoHit = [nextRow, nextCol]; // Actualiza el último hit
        } else if (IA.direccionesPendientes.length === 0) {
          // Si falla y no hay más direcciones que probar, vuelve al modo normal
          IA.modo = "normal";
          IA.ultimoHit = null;
          IA.direccionActual = null;
        }
      } else {
        // Si no hay más direcciones que probar, vuelve al modo normal
        IA.modo = "normal";
        IA.ultimoHit = null;
        IA.direccionActual = null;
      }
    }
  }

  attackButton.addEventListener("click", () => {
    tirosUsuario++;
    if (
      !playerTurn ||
      !selectedCell ||
      selectedCell.classList.contains("hit") ||
      selectedCell.classList.contains("miss")
    )
      return;

    const row = parseInt(selectedCell.dataset.row);
    const col = parseInt(selectedCell.dataset.col);

    let hit = false;
    enemyShips.forEach(({ row: r, col: c, size, isVertical }) => {
      for (let i = 0; i < size; i++) {
        const sr = isVertical ? r + i : r;
        const sc = isVertical ? c : c + i;
        if (sr === row && sc === col) {
          hit = true;
          vidaIa--
          if(vidaIa == 0) {
            //le doy 100 de puntos, más un extra de la vida que conserve el usuaro
            puntajeUsuario = 100 + vidaUsuario 
            partidaFinalizada(puntajeUsuario, true)
          }
        }
      }
    });

    // aqui es adonde el envia al backend los del jugador y de la partida
   function partidaFinalizada (puntaje, ganoUsuario) {
    if(ganoUsuario) {
      alert('ganaste!')
    } else {
      alert('perdiste!')
    }
    //ejecutar una función que nos saca del tablero
    //leer el local storage para recuperar la info del usuario y añadirle su puntaje
    const nickname = localStorage.getItem('nickname')
    const country = localStorage.getItem('country')
    const body = {
      nickname,
      countrycode: country,
      score : puntaje
    }
    fetch(CONFIG.API_COUNTRIES, {
      method: 'post',
      body
    })
    window.location.href = "Ranking.html"
   }

    // Marcado estándar
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
