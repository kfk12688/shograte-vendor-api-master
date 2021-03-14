const express = require("express");
const router = express.Router();
const Vendor = require("../../models/Vendor");
const Product = require("../../models/Product");
const Deals = require("../../models/Deals");
const checkAuth = require("../../middleware/check-auth");
const checkAdmin = require("../../middleware/check-role");
var multer = require("multer");
const path = "uploads";

const pagination=require('../../components/pagination');

var storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, path);
  },
  filename: function(req, file, callback) {
    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post(
  "/add",
  upload.fields([{ name: "deal_image", maxCount: 1 }]),
  checkAuth,
  (req, res) => {
    console.log(req.body);
    Vendor.findById({ _id:req.userData.id }, (err, vendor) => {
      if (!vendor) return res.json({ msg: "Vendor not found" });
    });
    Product.findById({ _id: req.body.product_id }, (err, product) => {
      if (!product) return res.json({ msg: "Product not found" });
    });

    let image = "";
    if (req.files && req.files.deal_image) {
      image =req.files.deal_image[0].filename;
    }
    const deals = new Deals({
      deal_name: req.body.deal_name,
      deal_desc: req.body.deal_desc,
      deal_image: image,
      product_id: req.body.product_id,
      milestones: req.body.milestones,
      vendor_id: req.userData.id,
      modified_date: new Date()
    });
    deals
      .save()
      .then(data => {
        res.json({
          success:true,
          msg: "Deal is added successfully"
        });
      })
      .catch(err => {
        console.log(err.errors);
        let errors = {};
        Object.keys(err.errors).forEach(function(key) {
          errors[key] = err.errors[key].message;
        });
        res.json({ errors });
      });
  }
);

// router.get("/list", (req, res) => {
//   Deals.find()
//     .then(deals => {
//       res.json({ data: deals });
//     })
//     .catch(err => console.log(err));
// });


//list deals with product name  and vendor name

router.get("/list",checkAuth, (req, res) => {

  var DealsAggregate = Deals.aggregate([
    {
      $lookup: {
        from: "products",
        localField: "product_id",
        foreignField: "_id",
        as: "products"
      }
    },

    { $unwind: "$products" },
    {
      $project: {
        deal_name: 1,
        deal_desc: 1,
        _id: 1,
        product_name: "$products.product_name",
        product_id: 1,
        vendor_id:req.userData.id,
        is_active:1,
        deal_image:1
      }
    }
  ]);

  const { page, size, title }=req.query;

  const { limit, offset } = pagination.getPagination(page, size);

  Deals.aggregatePaginate(DealsAggregate, { limit, offset })
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
    })
    .catch(err => res.json({
      success:false,
      msg:'Error Occured'
    }));


});

//change product status

router.post("/changeStatus/:id", checkAuth, (req, res) => {
  
  Deals.findById({ _id: req.params.id }, (err, deal) => {
   
    deal.modified_date = new Date();
    deal.is_active = req.body.is_active;

    deal
      .save()
      .then(() => {
        res.json({
          success:true,
          msg: "Deal is updated successfully"
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


// update single deal

router.post("/list/:id",
upload.fields([{ name: "deal_image", maxCount: 1 }]),
checkAuth,  (req, res) => {
  
  Vendor.findById({ _id:req.userData.id }, (err, vendor) => {
    if (!vendor) return res.json({ msg: "Vendor not found" });
  });
  Product.findById({ _id: req.body.product_id }, (err, product) => {
    if (!product) return res.json({ msg: "Product not found" });
  });

  let image = "";
  if (req.files && req.files.deal_image) {
    image =req.files.deal_image[0].filename;
  }

  console.log('req file',req.files);
  console.log('req',req.body);



  Deals.findById({ _id: req.params.id }, (err, deal) => {
    if (!deal) return res.json({ success:false, msg: "Deal not found" });
    
    deal.modified_date = new Date();  
    deal.deal_name = req.body.deal_name;
    deal.deal_desc = req.body.deal_desc;
    deal.deal_image = image;
    deal.product_id = req.body.product_id;
    deal.milestones = req.body.milestones;
    deal.vendor_id = req.userData.id;

    deal
      .save()
      .then(() => {
        res.json({
          success:true,
          msg: "Deal is updated successfully"
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




router.get("/list/:id", (req, res) => {
  Deals.findOne({ _id: req.params.id })
    .then(deals => {

      let output={
        success:true,
        data:deals
      }
      res.json(output);

    })
    .catch(err => console.log(err));
});
module.exports = router;
