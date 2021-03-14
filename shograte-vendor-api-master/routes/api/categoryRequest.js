const express = require("express");
const router = express.Router();
const Category = require("../../models/CategoryRequestSchema");
const checkAuth = require("../../middleware/check-auth");
const checkAdmin = require("../../middleware/check-role");

router.post("/add", checkAuth, (req, res) => {
  const categroy = new Category({
    category_name: req.body.category_name,
    category_desc: req.body.category_desc,
    modified_date: new Date()
  });
  categroy
    .save()
    .then(data => {
      res.json({
        msg: "Category is added successfully",
        data
      });
    })
    .catch(err => {
      let errors = {};
      Object.keys(err.errors).forEach(function(key) {
        errors[key] = err.errors[key].message;
      });
      res.json({ errors });
    });
});

router.get("/list", checkAuth, (req, res) => {
  Category.find()
    .then(categroy => {
      res.json({ data: categroy });
    })
    .catch(err => console.log(err));
});

router.get("/list/:id", checkAuth, (req, res) => {
  Category.findOne({ _id: req.params.id })
    .then(categroy => {
      res.json({ data: categroy });
    })
    .catch(err => console.log(err));
});

router.post("/list/:id", checkAuth, (req, res) => {
  Category.findById({ _id: req.params.id }, (err, categroy) => {
    if (!categroy) {
      res.json({ msg: "Category not found" });
    }

    categroy.modified_date = new Date();
    categroy.category_name = req.body.category_name;
    categroy.category_desc = req.body.category_desc;

    categroy
      .save()
      .then(() => {
        res.json({ msg: "Category is updated successfully" });
      })
      .catch(err => {
        if (err.errors) {
          res.json({ errors: err });
        }
      });
  });
});

module.exports = router;
