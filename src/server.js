const express = require("express");
const cors = require("cors");
const db = require("./db");
const dotenv = require("dotenv");
const productsRouter = require("./routes/products");
const reviewsRouter = require("./routes/reviews");
const cartRouter = require("./routes/cart");
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/products", productsRouter);
app.use("/reviews", reviewsRouter);
app.use("/cart", cartRouter);
app.listen(process.env.PORT, () => {
  console.log("running on ", process.env.PORT);
});
