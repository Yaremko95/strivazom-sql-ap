const express = require("express");
const db = require("../../db");

const router = express.Router();

router
  .route("/")
  .get(async (req, res) => {
    try {
      let result = await db.query("SELECT * FROM reviews");
      console.log(result);
      if (result.rowCount === 0) res.status(404).send("not found");
      res.status(200).send(result.rows);
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  })
  .post(async (req, res) => {
    try {
      let result = await db.query(
        `INSERT INTO reviews(
                                        comment, rate, "productId")
                                            VALUES ($1, $2, $3)`,
        [req.body.comment, parseInt(req.body.rate), req.body.productId]
      );
      console.log(result);
      res.send("ok");
    } catch (e) {
      console.log(e);
      res.status(500).send("internal server error");
    }
  });
router.route("/:id").put(async (req, res) => {
  try {
    console.log(req.body);
    const params = [];
    let query = `UPDATE reviews SET `;
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
});

module.exports = router;
