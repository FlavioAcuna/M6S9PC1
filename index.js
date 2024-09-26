const express = require("express");
const fs = require("fs").promises;
const { v4: uuidv4 } = require("uuid");
const app = express();
app.use(express.json());

//Ruta archivo anime.json
const archivoAnime = "anime.json";

//Leer todos los animes
app.get("/animes", async (req, res) => {
  try {
    const data = await fs.readFile(archivoAnime, "utf-8");
    const animes = JSON.parse(data);
    res.json(animes);
  } catch (error) {
    res.status(500).json({ error: "Error al leer el archivo" });
  }
});
//Leer anime por id
app.get("/animes/:idName", async (req, res) => {
  const idName = req.params.idName;
  try {
    const data = await fs.readFile(archivoAnime, "utf-8");
    const animes = JSON.parse(data);

    // Buscar por ID o Nombre
    const anime =
      animes[idName] ||
      Object.values(animes).find(
        (a) => a.nombre.toLowerCase() === idName.toLowerCase()
      );
    if (anime) {
      res.json(anime);
    } else {
      res.status(404).json({ error: "Anime no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al leer el archivo" });
  }
});

//crear nuevo anime
app.post("/animes", async (req, res) => {
  const newAnime = req.body;
  try {
    const data = await fs.readFile(archivoAnime, "utf-8");
    const animes = JSON.parse(data);

    //asignar nuevo id
    const newId = Object.keys(animes).length + 1;
    animes[newId] = newAnime;

    //guardar el nuevo anime en el archivo
    await fs.writeFile(archivoAnime, JSON.stringify(animes, null, 2));
    res
      .status(201)
      .json({ message: "Anime creado", anime: newAnime, id: newId });
  } catch (error) {
    res.status(500).json({ error: "Error al crear el anime " });
    console.error(console.error("Error al crear anime:", error.message));
  }
});
//actualizar anime
app.put("/animes/:id", async (req, res) => {
  const id = req.params.id;
  const updateAnime = req.body;

  try {
    const data = await fs.readFile(archivoAnime, "utf-8");
    const animes = JSON.parse(data);
    if (animes[id]) {
      animes[id] = updateAnime;
      await fs.writeFile(archivoAnime, JSON.stringify(animes, null, 2));
      res.json({ message: "Anime actualizado", anime: updateAnime });
    } else {
      res.status(404).json({ error: `el anime con id: ${id} no existe` });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el archivo" });
  }
});

//eliminar anime
app.delete("/animes/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const data = await fs.readFile(archivoAnime, "utf-8");
    const animes = JSON.parse(data);
    if (animes[id]) {
      delete animes[id];
      await fs.writeFile(archivoAnime, JSON.stringify(animes, null, 2));
      res.json({ message: "anime eliminado" });
    } else {
      res.status(404).json({ error: `el anime con id: ${id} no existe` });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar Anime" });
  }
});
//INICIAR EL SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutandose en el puerto ${PORT}`);
});
