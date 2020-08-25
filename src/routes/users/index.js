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
  });

router.route("/login").post(authorization, async (req, res, next) => {
  try {
    res.send(req.body.user);
  } catch (e) {
    res.send(e);
  }
});

module.exports = router;
