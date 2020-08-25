const express = require("express");
const db = require("../../db");
const bcrypt = require("bcrypt");
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

router.route("/login").post(async (req, res, next) => {
  try {
    if (!req.body.email || !req.body.password) {
      const error = new Error("provide credentials");
      error.httpStatusCode = 401;
      next(error);
    } else {
      let user = await db.query("SELECT * FROM users WHERE email = $1", [
        req.body.email,
      ]);
      console.log(user.rowCount);
      if (user.rowCount === 0) {
        const error = new Error("invalid login or password");
        error.httpStatusCode = 401;
        next(error);
      } else {
        const compared = await bcrypt.compare(
          req.body.password,
          user.rows[0].password
        );
        if (compared) {
          res.send({ user: user.rows[0] });
        } else {
          const error = new Error("invalid login or password");
          error.httpStatusCode = 401;
          next(error);
        }
      }
    }
  } catch (e) {
    res.send(e);
  }
});

module.exports = router;
