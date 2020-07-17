const experss = require("express");
const db = require("../../db");
const router = experss.Router();

router
  .route("/")
  .get(async (req, res) => {
    try {
      let result = await db.query("SELECT * FROM products");
      console.log(result);
      if (result.rowCount > 0) res.send({ data: result.rows });
      res.status(404).send("not found");
    } catch (e) {
      console.log(e);
      res.status(500).send("Internal server error");
    }
  })
  .post(async (req, res) => {
    try {
      console.log(req.body);
      let result = await db.query(
        `INSERT INTO products( name, description, brand, "imageUrl", category, price)
            VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          req.body.name,
          req.body.description,
          req.body.brand,
          req.body.imageUrl,
          req.body.category,
          parseFloat(req.body.price),
        ]
      );
      if (result.rowCount === 1) res.send("ok");
    } catch (e) {
      console.log(e);
      res.status(500).send("Internal server error");
    }
  });

router
  .route("/:id")
  .get(async (req, res) => {
    try {
      let result = await db.query("SELECT * FROM products WHERE _id = $1", [
        req.params.id,
      ]);
      console.log(result);
      if (result.rowCount > 0) res.send({ data: result.rows });
      res.status(404).send("not found");
    } catch (e) {
      console.log(e);
      res.status(500).send("Internal server error");
    }
  })
  .put(async (req, res) => {
    try {
      console.log(req.body);
      const params = [];
      let query = `UPDATE products SET `;
      for (let key in req.body) {
        query +=
          (params.length > 0 ? ", " : "") +
          '"' +
          key +
          '"' +
          " = $" +
          (params.length + 1);
        params.push(req.body[key]);
      }
      params.push(req.params.id);
      query += " WHERE _id = $" + params.length + " RETURNING *";
      console.log(query);
      const response = await db.query(query, params);
      if (response.rowCount === 0) return res.status(404).send("Not Found");
      res.send(response.rows[0]);
    } catch (e) {
      console.log(e);
      res.status(500).send("Internal server error");
    }
  })
  .delete(async (req, res) => {
    try {
      const response = await db.query(`DELETE FROM products WHERE _id = $1`, [
        req.params.id,
      ]);

      if (response.rowCount === 0) return res.status(404).send("Not Found");

      res.send("OK");
    } catch (e) {
      console.log(e);
      res.status(500).send("Internal server error");
    }
  });

module.exports = router;
