const OrderModel = require("../models/Order").Order;

module.exports = {
  async createOrder(order_data) {
    const {
      domain,
      payload: {
        id,
        order_number,
        shipping_address,
        contact_email,
        fulfillments,
        fulfillment_status,
      },
    } = order_data;
    const order = await OrderModel.create({
      domain: domain,
      order_id: id,
      order_number: order_number,
      shipping_address: shipping_address,
      contact_email: contact_email,
      fulfillments: fulfillments,
      fulfillment_status: fulfillment_status,
    });
    if (!order) {
      throw new Error("Order could not be inserted");
    }
    return order;
  },

  async getOrders(domain) {
    const orders = await OrderModel.find({ domain: domain }).sort({
      createdAt: -1,
    });
    return orders;
  },
};
