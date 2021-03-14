const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
var cors = require("cors");

// Routes
const category = require("./routes/api/category");
const subcategory = require("./routes/api/subcategory");
const vendor = require("./routes/api/vendor");
const product = require("./routes/api/product");
const deals = require("./routes/api/deals");
const orders = require("./routes/api/orders");

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const DB = require("./config/keys").mongoURI;
//app.use(upload.array());
//app.use(express.static("public"));
app.use("/uploads", express.static(__dirname + "/uploads"));

//set express view engine
app.set("view engine", "ejs");

console.log('__dirname',__dirname);

mongoose
  .connect(DB, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => console.log("Mongodb connected successfully"))
  .catch(err => console.log("Mongodb not connected" + err));

// Routes for controllers
app.use("/api/category", category);
app.use("/api/subcategory", subcategory);
app.use("/api/vendor", vendor);
app.use("/api/products", product);
app.use("/api/deals", deals);
app.use("/api/orders", orders);

const port = process.env.PORT || 8080;

app.listen(port, () => console.log(`server running on port ${port}`));
