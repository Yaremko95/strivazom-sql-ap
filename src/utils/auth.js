const basicAuth = require("basic-auth");
const db = require("../db");
const bcrypt = require("bcrypt");
module.exports = async (req, res, next) => {
  const user = basicAuth(req);
  console.log(user);

  if (!user || !user.name || !user.pass) {
    res.set("WWW-Authenticate", "Basic realm=Authorization Required");
    res.sendStatus(401);
    return;
  }
  const result = await db.query("SELECT * FROM users WHERE email = $1", [
    user.name,
  ]);
  if (result.rowCount === 0) {
    res.set("invalid login or password");
    res.sendStatus(401);
    return;
  } else {
    const compared = await bcrypt.compare(user.pass, result.rows[0].password);
    if (compared) {
      req.body.auth = result.rows[0];
      next();
    } else {
      res.set("invalid login or password");
      res.sendStatus(401);
      return;
    }
  }
};
