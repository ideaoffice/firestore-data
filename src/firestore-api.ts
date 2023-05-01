import express from "express";
import FirestoreData from "./firestore-data";

export default class FirestoreApi {
  private app: express.Express;
  private route: string;
  private data: FirestoreData;
  private collection: string;

  constructor(collection: string) {
    this.collection = collection;
    this.route = "/" + collection;
    this.data = new FirestoreData(collection);
    this.app = express();

    this.app.use(express.json());

    // Adiciona um Registro
    this.app.post(this.route, async (req, res) => {
      const body = req.body;

      if (!body) {
        return res.status(400).json({
          status: "Bad Request",
          message: "Informe não informados.",
        });
      }

      try {
        const docRef = await (await this.data.add(body)).get();
        return res.status(201).json({
          status: "Created",
          message: "Registro adicionado ID: " + docRef.id,
          collection: docRef.data(),
        });
      } catch (error) {
        console.error("Erro ao adicionar registro:", error);
        return res.status(500).json({
          status: "Internal Server Error",
          message: "Erro ao adicionar o registro.",
        });
      }
    });

    // Busca um Registro por ID ou por condição
    this.app.get(this.route + "/:idOrCondition", async (req, res) => {
      const idOrCondition = req.params.idOrCondition;

      try {
        const result = await this.data.get(idOrCondition);

        if (result.length === 0) {
          return res.status(404).json({
            status: "Not Found",
            message: "Registro não encontrado.",
          });
        }

        return res.status(200).json({
          status: "OK",
          [this.collection]: result,
        });
      } catch (error) {
        console.error("Erro ao pesquisar Registro.", error);
        return res.status(500).json({
          status: "Internal Server Error",
          message: "Erro ao pesquisar Registro.",
        });
      }
    });

    // Atualiza um Registro por ID ou por condição
    this.app.put(this.route, async (req, res) => {
      const id = req.body.id;

      if (!id) {
        return res.status(400).json({
          status: "Bad Request",
          message: "Informe o id do registro.",
        });
      }

      try {
        const result = await this.data.update(id, req.body);

        if (result.length == 0) {
          return res.status(404).json({ error: "Registro não encontrado." });
        }

        return res.status(200).json({
          status: "OK",
          message: "Registro atualizado com sucesso.",
        });
      } catch (error) {
        console.error("Erro ao atualizar Registro.", error);
        return res.status(500).json({
          status: "Internal Server Error",
          message: "Erro ao atualizar o Registro.",
        });
      }
    });

    // Deleta um Registro por ID ou por condição
    this.app.delete(this.route + "/:idOrCondition", async (req, res) => {
      const idOrCondition = req.params.idOrCondition;

      try {
        const result = await this.data.delete(idOrCondition);

        if (result.length == 0) {
          return res.status(404).json({
            status: "Not Found",
            message: "Registro não encontrado.",
          });
        }
        return res.status(200).json({
          status: "OK",
          message: "Registro deletado com sucesso.",
        });
      } catch (error) {
        console.error("Erro ao deletar Registro.", error);
        return res.status(500).json({
          status: "Internal Server Error",
          message: "Erro ao deletar o Registro.",
        });
      }
    });
  }

  public build(): express.Express {
    return this.app;
  }
}
