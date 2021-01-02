import mongoose from "mongoose";

const ShopsSchema = new mongoose.Schema(
  {
    shop_name:{
        type:String,
        index:true
    },
    access_token:{
        type:String
    }
  },
  { timestamps: true }
);
var Shops = mongoose.model("Shops", ShopsSchema);
module.exports.Shops = Shops;