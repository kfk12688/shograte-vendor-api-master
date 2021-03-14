const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var aggregatePaginate = require('mongoose-aggregate-paginate-v2');

var ProductSchema = new Schema({
  product_name: {
    type: String,
    required: [true, "Product name is required"]
  },
  product_desc: {
    type: String,
    required: [true, "Product desc is required"]
  },
  // product_image: {
  //   type: String,
  //   required: [true, "Product image is required"]
  // },
  // product_images: {
  //   type: Array,
  //   required: [true, "Product image is required"]
  // },
  category_id: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: [true, "Category id is required"]
  },
  sub_category_id: {
    type: Schema.Types.ObjectId,
    ref: "Subcategory",
    required: [true, "Subcategory name is required"]
  },
  vendor_id: {
    type: Schema.Types.ObjectId,
    ref: "Vendor",
    required: [true, "vendor name is required"]
  },
  // basic details
  brand_name: {
    type: String,
    required: [true, "Brand name is required"]
  },
  no_of_units: {
    type: String,
    required: [true, "Number of units is required"]
  },
  no_of_items: {
    type: String,
    required: [true, "Number of items is required"]
  },
  included_Components: {
    type: String,
    required: [true, "Included Components is required"]
  },
  manufacturer: {
    type: String,
    required: [true, "Manufacturer is required"]
  },
  country_of_origin: {
    type: String,
    required: [true, "Country of origin is required"]
  },
  height: {
    type: String,
    required: [true, "Height is required"]
  },
  length: {
    type: String,
    required: [true, "Length is required"]
  },
  width: {
    type: String,
    required: [true, "Width is required"]
  },
  size: {
    type: String,
    required: [true, "Size is required"]
  },
  color: {
    type: String,
    required: [true, "Color is required"]
  },
  // videos: {
  //   type: String,
  //   required: [true, "videos is required"]
  // },
  variations: [],
  modified_date: {
    type: Date
  },
  is_active: {
    type: Boolean,
    default: 1
  }
});

ProductSchema.plugin(aggregatePaginate);

module.exports = mongoose.model("Product", ProductSchema);
