const http = require("http");
const fs = require("fs").promises;
const url = require("url");

// Ruta archivo anime.json
const archivoAnime = "anime.json";

// Función para manejar las peticiones
const servidor = async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;

  if (method === "GET" && parsedUrl.pathname === "/animes") {
    // Leer todos los animes
    try {
      const data = await fs.readFile(archivoAnime, "utf-8");
      const animes = JSON.parse(data);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(animes));
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Error al leer el archivo" }));
    }
  } else if (method === "GET" && parsedUrl.pathname.startsWith("/animes/")) {
    const idOrName = decodeURIComponent(parsedUrl.pathname.split("/")[2]);
    try {
      const data = await fs.readFile(archivoAnime, "utf-8");
      const animes = JSON.parse(data);

      // Buscar por ID
      const animeById = animes[idOrName];

      // Buscar por nombre (asegurando que el campo "nombre" exista en cada anime)
      const animeByName = Object.values(animes).find(
        (a) => a.nombre && a.nombre.toLowerCase() === idOrName.toLowerCase()
      );

      const anime = animeById || animeByName;

      if (anime) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(anime));
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Anime no encontrado" }));
      }
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Error al leer el archivo" }));
    }
  } else if (method === "POST" && parsedUrl.pathname === "/animes") {
    // Crear nuevo anime
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      const newAnime = JSON.parse(body);
      if (
        !newAnime.nombre ||
        !newAnime.genero ||
        !newAnime.año ||
        !newAnime.autor
      ) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Faltan campos obligatorios" }));
      }
      try {
        const data = await fs.readFile(archivoAnime, "utf-8");
        const animes = JSON.parse(data);
        const newId = Object.keys(animes).length + 1;
        animes[newId] = newAnime;

        await fs.writeFile(archivoAnime, JSON.stringify(animes, null, 2));
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            message: "Anime creado",
            anime: newAnime,
            id: newId,
          })
        );
      } catch (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Error al crear el anime" }));
      }
    });
  } else if (method === "PUT" && parsedUrl.pathname.startsWith("/animes/")) {
    // Actualizar anime
    const id = parsedUrl.pathname.split("/")[2];
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      const updateAnime = JSON.parse(body);
      try {
        const data = await fs.readFile(archivoAnime, "utf-8");
        const animes = JSON.parse(data);
        if (animes[id]) {
          animes[id] = updateAnime;
          await fs.writeFile(archivoAnime, JSON.stringify(animes, null, 2));
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ message: "Anime actualizado", anime: updateAnime })
          );
        } else {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ error: `el anime con id: ${id} no existe` })
          );
        }
      } catch (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Error al actualizar el archivo" }));
      }
    });
  } else if (method === "DELETE" && parsedUrl.pathname.startsWith("/animes/")) {
    // Eliminar anime
    const id = parsedUrl.pathname.split("/")[2];
    try {
      const data = await fs.readFile(archivoAnime, "utf-8");
      const animes = JSON.parse(data);
      if (animes[id]) {
        delete animes[id];
        await fs.writeFile(archivoAnime, JSON.stringify(animes, null, 2));

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "anime eliminado" }));
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: `el anime con id: ${id} no existe` }));
      }
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Error al eliminar Anime" }));
    }
  } else {
    // Ruta no encontrada
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Ruta no encontrada" }));
  }
};

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
const server = http.createServer(servidor);

server.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});

module.exports = server;

/*
----------TEST POSTMAN-------------
GET /animes mostrar todos los animes
url:localhost:3000/animes
GET /animes/:id mostrar un anime por id 
url:localhost:3000/animes/2
GET /animes/:nombre mostrar un anime por nombre debe ser textual contando espacios,etc.
url:localhost:3000/animes/Dragon Ball

POST /animes agregar un nuevo anime
url:localhost:3000/animes 

{
  "nombre": "One Piece",
  "genero": "Shonen",
  "año": "1999",
  "autor": "Eiichiro Oda"
}
PUT /animes/:id editar anime por id
url:localhost:3000/animes/6

{
 "nombre": "One Piece 2 Actualizado",
  "genero": "Shonen",
  "año": "1999",
  "autor": "Eiichiro Oda"
}
DELETE /animes/:id eliminar anime por id 
url:localhost:3000/animes/6
*/
