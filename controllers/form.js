// obtienes los datos nickname y pais
document.addEventListener("DOMContentLoaded", () => {
  const botoncontinuar = document.getElementById("jugar");

  botoncontinuar.addEventListener("click", async () => {
    const nickname = document.getElementById("nombre").value;
    const nacionalidad = document.getElementById("nacionalidad").value;

    if (nickname == "" || nacionalidad == "") {
      alert("no puedes continuar");
      return;
    } else {
        //revisar que el pais existe en el backend y luego mandar respuesta si existe o no existe
      const countriesResponse = await fetch(CONFIG.API_COUNTRIES);
      const countriesArray = await countriesResponse.json();
      let countrycode;
      countriesArray.find((pais) => {
        const code = Object.keys(pais)[0].toLowerCase();
        const name = pais[code].toLowerCase();
        if (
          name.toLowerCase() === nacionalidad.toLowerCase() ||
          name.toLowerCase().includes(nacionalidad.toLowerCase())
        ) {
          countrycode = code;
        } else {
          alert(
            "el pais que ingresaste no existe, usaremos colombia por defecto"
          );
          countrycode = "co";
        }
      });
      // guarda los datos en el local, parar usarlos cuando la partida acabe
      localStorage.setItem("nickname", nickname);
      localStorage.setItem("country", countrycode);
      window.location.href = "Posicionamiento.html";
    }
  });
});
