const chai = require("chai");
const expect = chai.expect;
const chaiHttp = require("chai-http");
const server = require("../app.js");

chai.use(chaiHttp);

describe("Prueba de Endpoints API animes", () => {
  // Prueba del endpoint GET /animes
  it("Deberia devolver la lista de animes", (done) => {
    chai
      .request(server)
      .get("/animes")
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        expect(res.body).to.not.be.empty;
        done();
      });
  });
  // Prueba del endpoint GET /animes/1
  it("Deberia devolver 1 anime segun el id", (done) => {
    chai
      .request(server)
      .get("/animes/1")
      .end((err, res) => {
        expect(res).to.have.status(200); //codigo de exito
        expect(res.body).to.be.an("object"); //comprobar que sea un objeto
        expect(res.body).to.not.be.empty; //comprobar que no este vacio
        done();
      });
  });
});

describe("Prueba insercion Endpoints API animes POST /animes", () => {
  // Prueba del endpoint POST /animes
  it("debería agregar un nuevo anime", (done) => {
    const nuevoAnime = {
      nombre: "One Piece",
      genero: "Shonen",
      año: "1999",
      autor: "Eiichiro Oda",
    };

    chai
      .request(server)
      .post("/animes")
      .send(nuevoAnime)
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.be.an("object");
        expect(res.body.message).to.equal("Anime creado");
        expect(res.body.anime).to.deep.equal(nuevoAnime); // Verifica que el objeto creado sea correcto
        expect(res.body.id).to.exist; // Verifica que se haya asignado un ID
        done();
      });
  });
  it("debería devolver un error si faltan campos obligatorios", (done) => {
    const nuevoAnimeIncompleto = {
      nombre: "Full Metal",
    };

    chai
      .request(server)
      .post("/animes")
      .send(nuevoAnimeIncompleto)
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property("error");
        expect(res.body.error).to.equal("Faltan campos obligatorios"); // Verifica el mensaje de error
        done();
      });
  });
});
// Prueba del endpoint PUT /animes
describe("Prueba edicion Endpoint API animes PUT /animes", () => {
  it("debería actualizar completamente un anime", (done) => {
    const actualizarAnime = {
      id: 6,
      anime: {
        nombre: "One Piece 2 Actualizado",
        genero: "Shonen",
        año: "2000",
        autor: "Eiichiro Oda",
      },
    };
    chai
      .request(server)
      .put(`/animes/${actualizarAnime.id}`) // Asegúrate de que la ruta sea correcta
      .send(actualizarAnime)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        expect(res.body.message).to.equal("Anime actualizado"); // Verificar que se haya actualizado
        done();
      });
  });
});
// Prueba del endpoint DELETE /animes
describe("Prueba edicion Endpoint API animes DELETE /animes", () => {
  it("debería eliminar un anime por índice", (done) => {
    chai
      .request(server)
      .delete("/animes/6")
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("Object");
        done();
      });
  });
});
