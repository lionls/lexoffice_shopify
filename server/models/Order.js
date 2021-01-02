import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    order_number: {
      type: String,
      index: true,
    },
    order_id: {
      type: Number,
      index: true,
      unique: true,
    },
    domain: {
      type: String,
      lowercase: true,
      index: true,
    },
    contact_email: {
      type: String,
      lowercase: true,
      index: true,
    },
    shipping_address: {
      first_name: String,
      address1: String,
      phone: String,
      city: String,
      zip: String,
      province: String,
      country: String,
      last_name: String,
      address2: String,
      company: String,
      latitude: String,
      longitude: String,
      name: String,
      country_code: String,
      province_code: String,
    },
    fulfillments: [
      {
        created_at: Date,
        id: Number,
        order_id: Number,
        status: String,
        tracking_company: String,
        tracking_number: String,
        updated_at: Date,
      },
    ],
    fulfillment_status: {
      type: String,
    },
    label_status: {
      type: String,
      default: "none",
    },
  },
  { timestamps: true }
);
var Order = mongoose.model("Order", OrderSchema);
module.exports.Order = Order;

// var Sequelize = require('sequelize');
//  // Including db.js which contains the database configuration
// var db = require('../config/db');

// // Creating Table with name user
// module.exports = db.define('orders', {
//     orderId: {
//         primaryKey: true,
//         type: Sequelize.UUID,
//         defaultValue: Sequelize.UUIDV1,
//     },
//     storeID:{
//         type:Sequelize.STRING
//     },
//     orderNumber: {
//         type: Sequelize.STRING
//     },
//     shippingAddress:{
//         type:Sequelize.JSONB
//     },
//     shippingLabel:{
//         type:Sequelize.BLOB
//     },
//     shippingLabelCreated:{
//         type:Sequelize.BOOLEAN,
//         defaultValue:false
//     },
//     shippingLabelInformation:{
//         type:Sequelize.JSONB
//     },
//     createdAt: {
//         type: Sequelize.DATE,
//       },
//     updatedAt: {
//         type: Sequelize.DATE,
//       }
// },
//     {timestamps:true,underscored:true}
// );
// // id,created_at,total_price,order_number,shipping_address

/***
 * 
 * 
 * 
 * 
 * shippingFirstName: {
        type: Sequelize.STRING
    },
    shippingAddress1: {
        type: Sequelize.STRING
    },
    shippingPhone: {
        type: Sequelize.STRING
    },
    shippingCity: {
        type: Sequelize.STRING
    },
    shippingZip: {
        type: Sequelize.STRING
    },
    shippingProvince: {
        type: Sequelize.STRING
    },
    shippingCountry: {
        type: Sequelize.STRING
    },
    shippingLastName: {
        type: Sequelize.STRING
    },
    shippingAddress2: {
        type: Sequelize.STRING
    },
    shippingCompany: {
        type: Sequelize.STRING
    },
    shippingName: {
        type: Sequelize.STRING
    },
    shippingAddress2: {
        type: Sequelize.STRING
    },
 */
