const express = require("express");
const db = require("../../db");

const router = express.Router();

router.route("/").get(async (req, res) => {
  try {
    let result = await db.query(
      `SELECT  row_to_json(row) FROM (select  COUNT("productId") as quantity, SUM(p.price) as total, p AS product
       from carts inner join (select * from products) p
        on "productId"=p._id group by ( "productId", p)) row`
    );
    let filter = result.rows.map((item) => item.row_to_json);
    res.send({ data: filter });
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal server error");
  }
});
router
  .route("/:prodId")
  .post(async (req, res) => {
    try {
      let result = await db.query(
        `INSERT INTO public.carts( "productId")
                                                    VALUES ($1)`,
        [req.params.prodId]
      );
      if (result.rowCount === 1) res.send("ok");
    } catch (e) {
      console.log(e);
      res.status(500).send("Internal server error");
    }
  })
  .delete(async (req, res) => {
    try {
      let sqlQuery = `DELETE FROM public.carts WHERE _id in (select _id from carts where "productId"=$1 )`;
      if (req.query.limit !== "false")
        sqlQuery =
          ' DELETE FROM public.carts WHERE _id in (select _id from carts where "productId"=$1 limit 1)';

      console.log(sqlQuery);
      let result = await db.query(sqlQuery, [req.params.prodId]);
      if (result.rowCount === 0) return res.status(404).send("Not found");

      res.send("ok");
    } catch (e) {
      console.log(e);
      res.status(500).send("Internal server error");
    }
  });

module.exports = router;
