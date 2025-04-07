const sea = "🟦";

//se crea el tablero, de 10 por 10
//el contenido de cada elemento es el cuadrito azul
const tablero = Array(10)
  .fill(null)
  .map(() => Array(10).fill(sea));

// datos de cada barco
const boats = [];
const boatsIa = []

// estado del juego (para poder modificar cantboats desde funciones)
const estado = {
  cantboats: 6,
};

// tipo, tamaño y cuantos hay disponibles para ubicar
const contadores = [
  { opcion: 1, tipo: "Lancha", size: 2, disponibles: 2 },
  { opcion: 1, tipo: "Lancha", size: 2, disponibles: 2 },
  { opcion: 2, tipo: "Destructor", size: 3, disponibles: 2 },
  { opcion: 2, tipo: "Destructor", size: 3, disponibles: 2 },
  { opcion: 3, tipo: "Acorazado", size: 4, disponibles: 1 },
  { opcion: 4, tipo: "Portaviones", size: 5, disponibles: 1 },
];

const contadoresIa = [
  { opcion: 1, tipo: "Lancha", size: 2 },
  { opcion: 1, tipo: "Lancha", size: 2 },
  { opcion: 2, tipo: "Destructor", size: 3 },
  { opcion: 2, tipo: "Destructor", size: 3 },
  { opcion: 3, tipo: "Acorazado", size: 4 },
  { opcion: 4, tipo: "Portaviones", size: 5 },
];

  for (let i = 0; i < contadoresIa.length; i++) {
  const bote = contadoresIa[i];
  console.log(bote)
  const size = bote.size
  const direccion = Math.floor(Math.random() * 2) + 1;
  const x = Math.floor(Math.random() * 10);
  const y = Math.floor(Math.random() * 10);
  const cabe =
    (direccion === 1 && x + size <= tablero[0].length) ||
    (direccion === 2 && y + size <= tablero.length);

  if (!cabe) {
    i--;
    continue;
  }
  let estaOcupado;
  if (direccion == 1) {
    const fila = tablero[y];
    for (let i = x; i < x + size; i++) {
      if (fila[i] !== sea) {
        estaOcupado = true;
        break;
      }
    }
  }
  if (direccion == 2) {
    const fila = tablero[y];
    for (let i = y; i < y + size; i++) {
      if (fila[i][x] !== sea) {
        estadoOcupado = true;
        break;
      }
    }
  }

  if (estaOcupado) {
    i--;
    continue;
  }
  
  const id = bote.tipo[0].toUpperCase() + i;

  for (let j = 0; j < size; j++) {
    const fila = direccion === 1 ? y : y + j;
    const col = direccion === 1 ? x + j : x;
    tablero[fila][col] = id;
  }

  boatsIa.push({
    id: id,
    tipo: bote.tipo,
    size: size,
    x: x,
    y: y,
    direccion: direccion === 1 ? "horizontal" : "vertical",
    vida: size,
  });
}
console.log(tablero)




// relleno de los barcos
function relleno_boats() {
  const tipoContador = {
    Lancha: 0,
    Destructor: 0,
    Acorazado: 0,
    Portaviones: 0,
  };

  for (let i = 0; i < estado.cantboats; i++) {
    //Esto debería hacerlo la IA (escoger las opciones)
    //las opciones son limitadas que es un arreglo de barcos
    //recorrer el arreglo de barcos y dar la posicion
    const opcion = parseInt(
      prompt(
        "Elige entre los siguientes tipos de barcos:\n" +
          "1. para el tipo Lancha (tamaño 2), faltan: " +
          contadores[0].disponibles +
          "\n" +
          "2. para el tipo Destructor (tamaño 3), faltan: " +
          contadores[1].disponibles +
          "\n" +
          "3. para el tipo Acorazado (tamaño 4), faltan: " +
          contadores[2].disponibles +
          "\n" +
          "4. para el tipo Portaviones (tamaño 5), faltan: " +
          contadores[3].disponibles
      )
    );
    //Toma la opcion, y revisa si existe o si hay disponibles. sino sigue
    const barco = contadores.find((b) => b.opcion === opcion);

    if (!barco || barco.disponibles <= 0) {
      alert("Opción inválida o ya no quedan barcos de ese tipo.");
      i--;
      continue;
    }

    // Ingresa direccion, revisa si es valida. sino sigue
    const direccion = parseInt(
      prompt("Ingrese la dirección con números (1. horizontal o 2. vertical):")
    );

    if (direccion !== 1 && direccion !== 2) {
      alert("Dirección inválida.");
      i--;
      continue;
    }

    // Esto de aquí se reemplaza con eventos de html
    // Tomar el click y ubicar la posicion de ese click para conocer x y y
    const x = parseInt(prompt("Ingrese la columna (X):"));
    const y = parseInt(prompt("Ingrese la fila (Y):"));
    const size = barco.size;

    const cabe =
      (direccion === 1 && x + size <= tablero[0].length) ||
      (direccion === 2 && y + size <= tablero.length);

    if (!cabe) {
      alert("Ese barco no cabe en esa dirección. Vuelva a intentarlo.");
      i--;
      continue;
    }

    let estaOcupado;
    if (direccion == 1) {
      const fila = tablero[y];
      for (let i = x; i < x + size; i++) {
        if (fila[i] !== sea) {
          estaOcupado = true;
          break;
        }
      }
    }
    if (direccion == 2) {
      const fila = tablero[y];
      for (let i = y; i < y + size; i++) {
        if (fila[i][x] !== sea) {
          estadoOcupado = true;
          break;
        }
      }
    }

    if (estaOcupado) {
      alert("Ese espacio ya está ocupado.");
      i--;
      continue;
    }

    tipoContador[barco.tipo]++;
    const id = barco.tipo[0].toUpperCase() + i;

    for (let j = 0; j < size; j++) {
      const fila = direccion === 1 ? y : y + j;
      const col = direccion === 1 ? x + j : x;
      tablero[fila][col] = id;
    }

    boats.push({
      id: id,
      tipo: barco.tipo,
      size: size,
      x: x,
      y: y,
      direccion: direccion === 1 ? "horizontal" : "vertical",
      vida: size,
    });

    barco.disponibles--;
  }
}

// sistema de disparo sin mostrar información del barc

function disparo(boats, tablero, estado) {
  const dispY = parseInt(prompt("Disparo en el eje Y:"));
  const dispX = parseInt(prompt("Disparo en el eje X:"));

  // ya no lo vas a necesitar
  if (
    dispX < 0 ||
    dispX >= tablero[0].length ||
    dispY < 0 ||
    dispY >= tablero.length
  ) {
    alert("Coordenadas fuera del tablero.");
    return;
  }

  const casilla = tablero[dispY][dispX];

  if (casilla === "❌" || casilla === "💥") {
    alert("Ya disparaste ahí.");
    return;
  }

  if (casilla === sea) {
    tablero[dispY][dispX] = "❌";
    alert("Disparo fallido.");
    return;
  }

  const barco = boats.find((b) => b.id === casilla);
  if (barco) {
    barco.vida--;
    tablero[dispY][dispX] = "💥";

    if (barco.vida === 0) {
      estado.cantboats--;
    }
  }
}

const IAtotal = {
  // C = chill
  modo: "c",
  tacticaActual: "malla",
  fallosConsec: 0,
  disparosPrevios: [],
  //SE PUEDE HACER ESO ASI?????
  IAbarcosPendientes: contadores,
  barcosUndidos: [],
  IAturno: 0,
};

const IApersec = {
  eje: 1, // 1 para hortizontal y 2 para vertical
  direccion: 1,
  historial: [],
  atino: [],
  extremos: [],
  contador: 1,
};

function modoKiller(tablero, boats, estado, IAtotal, IAturno, IApersec) {
  const [y, x] = IApersec.historial[IApersec.contador];

  // probando direcciones
  if (IApersucionista.atino.length === 1) {
    let casilla;
    let ny = y;
    let nx = x;

    //direcciones ddesde punto tocado
    switch (IApersucionista.direccion) {
      case 1:
        ny = y - 1;
        break;
      case 2:
        nx = x + 1;
        break;
      case 3:
        ny = y + 1;
        break;
      case 4:
        nx = x - 1;
        break;
      default:
        return;
    }

    // Validar límites del tablero
    if (ny >= 0 && ny < tablero.length && nx >= 0 && nx < tablero[0].length) {
      casilla = tablero[ny][nx];

      // Marcar disparo y verificar si fue acierto
      if (casilla !== sea) {
        const [y, x] = IApersec.historial[0];

        if (ny === y) {
          IApersec.direccion = 2;
        }

        IApersec.atino.push(casilla);
      }

      IApersec.historial.push([ny, nx, casilla]);
      IApersec.contador++;
    }

    // Pasar a siguiente dirección
    IApersec.direccion++;
  } else {
    // orenacion de lista
    const [y1, x1] = historial.atino[0];
    const [y2, x2] = historial.atino[1];

    if (IApersec.eje === 1 && x1 < x2) {
      IApersec.atino[0] = [y2, x2];
      IApersec.atino[1] = [y1, x1];
    }

    if (IApersec.eje === 2 && y1 < y2) {
      IApersec.atino[0] = [y2, x2];
      IApersec.atino[1] = [y1, x1];
    }

    //punto de refrencia futura y mirar si ya disparo ahi o si esta fuera de limites
    const buscandoExtremo1 = IApersec.extremos.length;
    const cont = IApersec.atino.length;

    const base = IApersec.atino[cont];

    let [y, x] = base;
    let ny = y;
    let nx = x;

    if (IApersec.eje === 1) {
      nx = buscandoExtremo1 ? x - 1 : x + 1;
    } else {
      ny = buscandoExtremo1 ? y - 1 : y + 1;
    }

    const fueraTablero =
      ny < 0 || ny >= tablero.length || nx < 0 || nx >= tablero[0].length;
    const yaDisparoAntes = IAtotal.disparosPrevios.some(
      (d) => d[0] === ny && d[1] === nx
    );

    //fuera tablero o ya disaparado prevemante por la IA
    if (fueraTablero || yaDisparoAntes) {
      IApersec.extremos.push([ny, nx]);

      if (extremos.length <= 1) {
        IApersec.atino.push(IApersec.atino[0]);
        IApersec.atino.shift();
      }
    }

    //disapro cumple con condiciones
    const casilla = tablero[ny][nx];
    IAtotaldisparosPrevios.push([ny, nx]);
    IApersec.historial.push([ny, nx]);

    if (casilla !== sea && casilla !== "❌" && casilla !== "💥") {
      IApersec.atino.push([ny, nx]);
      IApersec.contador++;
    } else {
      IApersec.extremos.push([ny, nx]);
      if (extremos.length <= 1) {
        IApersec.atino.push(IApersec.atino[0]);
        IApersec.atino.shift();
      }
    }

    //buscar barco possible
    if (IApersec.extremos === 2) {
      const tamaño = IApersec.atino.length;
      const possibles = IAbarcosPendientes.filter((b) => b.size === tamaño);

      //marcar los fallos y los atinados en el tablero
      if (possibles.length === 1) {
        for (let [py, px] of IApersec.atinado) {
          tablero[(py, px)] = "💥";
        }

        for (let [fy, fx] of IApersec.extremos) {
          if (
            fy >= 0 &&
            fx >= 0 &&
            fy < tablero.length &&
            fx < tablero[0].length
          ) {
            tablero[fy][fx] = "❌";
          }
        }
      }

      IAtotal.IAbarcosPendientes = IAbarcosPendientes.filter(
        (b) => b.size !== tamaño
      );
      IAtotal.modo = "c";
      IApersec.atino = [];
      IApersec.extremos = [];
      IApersec.historial = [];
      IApersec.contador = 0;
      IApersec.direccion = 1;
      IApersec.eje = 1;
    }
  }
}

function IAdisparo(tablero, boats, estado, IAtotal, IAturno, IApersec) {
  if (IAturno === 1) {
    const nx = Math.floor(Math.random() * tablero[0].length);
    const ny = Math.floor(Math.random() * tablero.length);

    const casilla = tablero[ny][nx];

    if (casilla != sea) {
      IAtotal.modo = "k";
      IApersec.historial.push(casilla);
      IApersec.atino.push(casilla);
    }

    IAtotal.disparosPrevios.push(casilla);
  } else {
    if (IAtotal.modo === "k") {
      modoKiller();
    } else {
    }
  }
}
let turnoIa = false;

function turnos() {
  while (estado.cantboats > 0) {
    if (!turnoIa) {
      disparo();
      turnoIa = true;
    } else {
      IAdisparo();
      turnoIa = false;
    }
  }
  alert("Has ganado la partida.");
}