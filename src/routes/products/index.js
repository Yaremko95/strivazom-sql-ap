const experss = require("express");
const db = require("../../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = experss.Router();
const upload = multer({ dest: path.join(__dirname, "../../public/uploads") });

router
  .route("/")
  .get(async (req, res) => {
    try {
      let sqlQuery = `SELECT *
          FROM products  LEFT JOIN LATERAL 
                            (  SELECT json_agg(json_build_object('_id', reviews._id , 'comment', reviews.comment, 'rate', reviews.rate, 'createdAt', "createdAt")) 
                            AS reviews  
                             FROM   reviews  WHERE  products._id = "productId") reviews ON true`;
      const { query } = req;
      console.log(query);
      let params = [];
      for (let key in query) {
        if (typeof query[key] === "object") {
          query[key].forEach((item) => {
            params.push(item);

            if (params.length === 1)
              sqlQuery += ` WHERE ${key} ILIKE '%${item}%' `;
            else sqlQuery += ` or ${key} ILIKE '%${item}%' `;
          });
        } else {
          params.push(query[key]);

          if (params.length === 1)
            sqlQuery += ` WHERE ${key} ILIKE '%${query[key]}%' `;
          else sqlQuery += ` AND ${key} ILIKE '%${query[key]}%' `;
        }
      }
      console.log(sqlQuery);
      let result = await db.query(sqlQuery);

      res.send({ data: result.rows });
    } catch (e) {
      console.log(e);
      res.status(500).send("Internal server error");
    }
  })
  .post(upload.single("file"), async (req, res) => {
    try {
      console.log(req.body);
      const file =
        global.appRoot + "/public/uploads/" + `${req.file.filename}.png`;
      fs.rename(req.file.path, file, async function (err) {
        if (err) {
          console.log(err);
          res.send(500);
        } else {
          let result = await db
            .query(
              `INSERT INTO products( name, description, brand, "imageUrl", category, price)
            VALUES ($1, $2, $3, $4, $5, $6)`,
              [
                req.body.name,
                req.body.description,
                req.body.brand,
                req.file.filename,
                req.body.category,
                parseFloat(req.body.price),
              ]
            )
            .then((r) => {
              res.send(req.file.path);
            });
        }
      });
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
      delete req.body.reviews;
      delete req.body.createdAt;
      delete req.body.updatedAt;

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
