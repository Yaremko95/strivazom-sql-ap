const express = require("express");
const cors = require("cors");
const db = require("./db");
const dotenv = require("dotenv");
const productsRouter = require("./routes/products");
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/products", productsRouter);
app.listen(process.env.PORT, () => {
  console.log("running on ", process.env.PORT);
});
