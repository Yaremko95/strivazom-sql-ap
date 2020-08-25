const express = require("express");
const listEndpoints = require("express-list-endpoints");
const cors = require("cors");
const path = require("path");
const db = require("./db");
const dotenv = require("dotenv");
const productsRouter = require("./routes/products");
const reviewsRouter = require("./routes/reviews");
const cartRouter = require("./routes/cart");
const usersRouter = require("./routes/users");
dotenv.config();
const app = express();
global.appRoot = __dirname;
app.use("/static", express.static(path.join(__dirname, "./public")));
app.use(cors());
app.use(express.json());
app.use("/user", usersRouter);
app.use("/products", productsRouter);
app.use("/reviews", reviewsRouter);
app.use("/cart", cartRouter);

console.log(listEndpoints(app));
app.listen(process.env.PORT, () => {
  console.log("running on ", process.env.PORT);
});
