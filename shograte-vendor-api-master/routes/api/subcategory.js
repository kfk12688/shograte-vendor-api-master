const express = require("express");
const router = express.Router();
const SubCategory = require("../../models/SubCategory");
const Category = require("../../models/Category");
const checkAuth = require("../../middleware/check-auth");
const checkAdmin = require("../../middleware/check-role");

//get pagination component

const pagination=require('../../components/pagination');



router.post("/add", checkAuth, checkAdmin("admin"), (req, res) => {
  Category.findById({ _id: req.body.category_id }, (err, category) => {
    if (!category) return res.json({ msg: "Category not found" });
  });

  const subcategory = new SubCategory({
    subcategory_name: req.body.subcategory_name,
    subcategory_desc: req.body.subcategory_desc,
    category_id: req.body.category_id,
    modified_date: new Date()
  });
  subcategory
    .save()
    .then(data => {
      res.json({
        msg: "Subcategory is added successfully",
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

router.get("/list", (req, res) => {  
  console.log('query',req.query);
  var SubCategoryAggregate = SubCategory.aggregate([
    {
      $lookup: {
        from: "categories",
        localField: "category_id",
        foreignField: "_id",
        as: "categories"
      }
    },
    { $unwind: "$categories" },
    {
      $project: {
        subcategory_name: 1,
        subcategory_desc: 1,
        _id: 1,
        category_name: "$categories.category_name",
        category_id: 1
      }
    }
  ]);

  const { page, size, title }=req.query;

  const { limit, offset } = pagination.getPagination(page, size);

  SubCategory.aggregatePaginate(SubCategoryAggregate, { limit, offset })
    .then(data => {

      let output={
        success:true,
        data:data.docs,
        pagination:{
          totalDocs:data.totalDocs,
          totalPages:data.totalPages,
          page:data.page,
          pagingCounter:data.pagingCounter,
          hasPrevPage:data.hasPrevPage,
          hasNextPage:data.hasNextPage,
          limit:data.limit
        }
        
      }

      res.json(output);


      //res.json({ data });
    })
    .catch(err => res.json({
      success:false,
      msg:'Error Occured'
    }));
});

router.get("/list/:id", (req, res) => {
  SubCategory.findOne({ _id: req.params.id })
    .select("_id, subcategory_name")
    .then(data => {
      res.json({ data });
    })
    .catch(err => res.json({ err }));
});

router.post("/list/:id", checkAuth, checkAdmin("admin"), (req, res) => {
  Category.findById({ _id: req.body.category_id }, (err, category) => {
    if (!category) return res.json({ msg: "Category not found" });
  });
  SubCategory.findById({ _id: req.params.id }, (err, subcategory) => {
    if (!subcategory) return res.json({ msg: "Subcategory not found" });
    if (!subcategory.is_active && req.body.is_active === 0)
      return res.json({ msg: "Subcategory is not activated" });
    subcategory.modified_date = new Date();
    subcategory.subcategory_name = req.body.subcategory_name;
    subcategory.subcategory_desc = req.body.subcategory_desc;
    subcategory.category_id = req.body.category_id;
    subcategory.is_active = req.body.is_active == 1 ? req.body.is_active : 0;

    subcategory
      .save()
      .then(() => {
        res.json({
          msg: "Sub category is updated successfully"
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
});

module.exports = router;
