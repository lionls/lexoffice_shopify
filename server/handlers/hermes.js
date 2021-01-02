"use strict";
const Papa = require("papaparse");
const extractHermes_DE = (elem, email_address, order_number) => {
  const firstname = elem.firstName ? elem.firstName.trim() : "";
  const lastname = elem.lastName ? elem.lastName.trim() : "";
  const address_addition = "";
  const zip = elem.zip ? elem.zip.trim() : "";
  const city = elem.city ? elem.city.trim() : "";
  const pre_phone = "";
  const phone = elem.phone ? elem.phone.trim() : "";
  const email = email_address ? email_address.trim() : "";
  const ref = order_number ? order_number.trim() : "";
  const paketsize = "XS";
  const explicit_package = 0;
  const cod = "";
  const additional_information = "";
  const blank = "";

  var result_street = /\D*/.exec(elem.address1);
  var result_number = /\d+.*/.exec(elem.address1);
  var result_street = result_street ? result_street[0] : "";
  var result_number = result_number ? result_number[0] : "";

  if (elem.address1.match(/^\d/)) {
    var temp_number = /^\d+\s?\w?\s/.exec(elem.address1)
    result_number = temp_number?temp_number[0].trim():"";
    result_street = /\D*/.exec(
      elem.address1.substring(result_number.length, elem.address1.length)
    )[0];
  }

  const street = result_street.trim();
  const street_number =
    result_number.length > 0 ? result_number : elem.address2;

  return {
    firstname: firstname,
    lastname: lastname,
    address_addition: address_addition,
    street: street,
    street_number: street_number,
    zip: zip,
    city: city,
    pre_phone: pre_phone,
    phone: phone,
    email: email,
    ref: ref,
    paketsize: paketsize,
    explicit_package: explicit_package,
    cod: cod,
    additional_information: additional_information,
    blank: blank,
  };
};

module.exports = async (ctx) => {
  const out = await ctx.request.body.orders.map((e) =>
    extractHermes_DE(e.order.shippingAddress, e.order.email, e.order.name)
  );
  const csv = await Papa.unparse(out, {
    quotes: false, //or array of booleans
    quoteChar: '"',
    escapeChar: '"',
    encoding: "ISO-8859-1",
    delimiter: ";",
    header: false,
    newline: "\r\n",
    skipEmptyLines: false, //or 'greedy',
    columns: null, //or array of strings
  });
  ctx.response.statusCode = 200;
  ctx.response.body = csv;
};
