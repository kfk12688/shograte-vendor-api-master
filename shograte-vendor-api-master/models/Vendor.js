const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');


var VendorSchema = new Schema({
  vendor_name: {
    type: String,
    required: [true, "Vendor name is required"]
  },
  owner_name: {
    type: String,
    required: [true, "Owner name is required"]
  },
  mobile: {
    type: String,
    required: [true, "Mobile number is required"]
  },
  email: {
    type: String,
    required: [true, "Subcategory name is required"]
  },
  password: {
    type: String,
    required: [true, "Password id is required"]
  }, 
  modified_date: {
    type: Date
  },

  forget_password_expiry: {
    type: Date
  },
  forget_password_otp: {
    type: String
  },
  forget_password_token: {
    type: String
  },


  is_active: {
    type: Boolean,
    default: 1
  }
});

VendorSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Vendor", VendorSchema);