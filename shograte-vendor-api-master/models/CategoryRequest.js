const mongoose = require("mongoose");

var CategoryRequestSchema = new mongoose.Schema({
  category_name: {
    type: String,
    required: [true, "Catgory name is required"]
  },
  category_desc: {
    type: String
  },
  is_active: {
    type: Boolean,
    default: 1
  },
  modified_date: {
    type: Date
  }
});

module.exports = mongoose.model("CategoryRequest", CategoryRequestSchema);
