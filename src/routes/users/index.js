const express = require("express");
const db = require("../../db");
const bcrypt = require("bcrypt");
const authorization = require("../../utils/auth");
const router = express.Router();

router
  .route("/")
  .get(async (req, res, next) => {
    try {
      let result = await db.query("SELECT * FROM users");
      res.send({ data: result.rows });
    } catch (e) {
      console.log(e);
      res.status(500).send("bad request");
    }
  })
  .post(async (req, res, next) => {
    try {
      const hash = await bcrypt.hash(req.body.password, 12);
      await db
        .query(
          `INSERT INTO users( name, surname, email, password, role)
            VALUES ($1, $2, $3, $4, $5)`,
          [req.body.name, req.body.surname, req.body.email, hash, req.body.role]
        )
        .then((r) => {
          res.sendStatus(r.rowCount);
        });
    } catch (e) {
      console.log(e);
      res.status(500).send("bad request");
    }
  })
  .put(authorization, async (req, res, next) => {
    try {
      const hash = await bcrypt.hash(req.body.password, 12);
      const userId = req.body.auth._id;
      delete req.body.auth;
      const params = [];
      let query = `UPDATE users SET `;
      for (let key in req.body) {
        query +=
          (params.length > 0 ? ", " : "") +
          '"' +
          key +
          '"' +
          " = $" +
          (params.length + 1);
        if (key === "password") params.push(hash);
        else params.push(req.body[key]);
      }

      params.push(userId);
      query += " WHERE _id = $" + params.length + " RETURNING *";
      console.log(query, params);
      let response = await db.query(query, params);
      res.send(response.rows[0]);
    } catch (e) {
      console.log(e);
      res.status(500).send("bad request");
    }
  })
  .delete(authorization, async (req, res, next) => {
    try {
      await db.query("DELETE FROM  users WHERE _id = $1", [req.body.auth._id]);
      res.send("ok");
    } catch (e) {
      console.log(e);
      res.status(500).send("bad request");
    }
  });

router.route("/login").post(authorization, async (req, res, next) => {
  try {
    res.send(req.body.auth);
  } catch (e) {
    res.send(e);
  }
});

module.exports = router;
