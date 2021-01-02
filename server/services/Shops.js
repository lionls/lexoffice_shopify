const ShopModel = require("../models/Shops").Shops;

module.exports = {
  async createShop(shop,access_token) {
    const shop = await ShopModel.create({shop_name:shop,access_token:access_token})
    if (!shop) {
      throw new Error("Order could not be inserted");
    }
    return shop;
  },

  async getShop(shop_name) {
    const shop = await shop.findOne({ shop_name: shop_name });
    return shop;
  },
};
