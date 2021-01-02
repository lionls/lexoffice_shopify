import "@babel/polyfill";
import dotenv from "dotenv";
import "isomorphic-fetch";
import createShopifyAuth, { verifyRequest } from "@shopify/koa-shopify-auth";
import graphQLProxy, { ApiVersion } from "@shopify/koa-shopify-graphql-proxy";
import { receiveWebhook } from "@shopify/koa-shopify-webhooks";
import Koa from "koa";
import next from "next";
import Router from "koa-router";
import session from "koa-session";
import * as handlers from "./handlers/index";
const axios = require('axios');
import { createBrotliDecompress } from "zlib";
import { createOrder, getOrders } from "./services/Orders";
const bodyParser = require("koa-bodyparser");
var mongoose = require("mongoose");
const parseHermesCSV = require("./handlers/hermes");
import gql from "graphql-tag";
import {createClient} from "./handlers"
var FormData = require('form-data');
const fs = require('fs');
const Blob = require("cross-blob");
globalThis.Blob = Blob;
var done = [];
var doneRefund = [];
var request = require('request');
//Set up default mongoose connection

dotenv.config();
const port = parseInt(process.env.PORT, 10) || 9898 || 3000 || 8081;
const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev,
});
const handle = app.getRequestHandler();
const { SHOPIFY_API_SECRET, SHOPIFY_API_KEY, SCOPES, HOST } = process.env;


app.prepare().then(() => {
  const server = new Koa();
  const router = new Router();
  server.use(
    session(
      {
        sameSite: "none",
        secure: true,
      },
      server
    )
  );
  server.keys = [SHOPIFY_API_SECRET];
  server.use(
    createShopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET,
      scopes: [SCOPES],
      accessMode: 'offline',

      async afterAuth(ctx) {
        //Auth token and shop available in session
        //Redirect to shop upon auth
        const { shop, accessToken } = ctx.session;
        ctx.cookies.set("shopOrigin", shop, {
          httpOnly: false,
          secure: true,
          sameSite: "none",
        });
        console.log(shop)
        console.log(accessToken)
        // handlers.registerWebhooks(
        //   shop,
        //   accessToken,
        //   "ORDERS_CREATE",
        //   `/webhooks/orders/create`,
        //   ApiVersion.April20
        // );
        ctx.redirect("/");
      },
    })
  );
  server.use(
    graphQLProxy({
      version: ApiVersion.April20,
    })
  );
  server.use(bodyParser());

  const buildUrl = (id,order_id)=>"https://sportsmask.eu/apps/download-pdf/orders/1e209d04bc7aac6e3104/"+parseInt(id)*6882+"/"+order_id+".pdf"

  const buildUrlRefund = (id,order_id,refund_id)=>"https://sportsmask.eu/apps/download-pdf/orders/0d37a05e0c241ad07af9/"+parseInt(id)*5016+"/"+order_id+".pdf?refund="+refund_id;
  //https://sportsmask.eu/apps/download-pdf/orders/0d37a05e0c241ad07af9/{{ order.id | times: 5016 }}/{{ order.name | handleize }}.pdf?refund={{id}}'

  const webhook = receiveWebhook({ secret: "e3602d0359af9b390257a8f2fd17d5ab9a9e5db9657d5f830b6e5c7a63bd4195" });//SHOPIFY_API_SECRET });
  router.post("/webhooks/orders/create", webhook, async (ctx) => {
    try {
      var is_paypal = false;
      const order = ctx.state.webhook;
      const id = order.payload.id;
      const name = order.payload.name;
      const date = order.payload.created_at;
      const amount = order.payload.total_price; //subtotal_price
      const taxamount = order.payload.total_tax;
      const payment = order.payload.payment_gateway_names;
      var pp_token = "";
      if(payment.includes('paypal')){
        is_paypal = true;
        pp_token = "c"+order.payload.checkout_id.toString()+".1";
      }else{
        pp_token = "c"+order.payload.checkout_id.toString()+".1";
      }
      

      const order_id = await name.substring(10);
      const url = buildUrl(id,order_id);

      const pdf = await axios(buildUrl(id,order_id),{
          responseType: 'arraybuffer',
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/pdf'
          }
      });

      if(!done.includes(parseInt(order_id))){
      	done.push(parseInt(order_id));

        const res = await axios({url:'https://api.lexoffice.io/v1/vouchers', method:"POST", data: { type: "salesinvoice", 
        voucherNumber: pp_token, 
        voucherDate: date, 
        dueDate: date, 
        totalGrossAmount: amount, 
        totalTaxAmount: taxamount, 
        taxType: "gross", 
        useCollectiveContact: true, 
        remark: name, 
        voucherItems: [{ 
          amount: amount, 
          taxAmount: taxamount, 
          taxRatePercent: 19, 
          categoryId: "8f8664a1-fd86-11e1-a21f-0800200c9a66" 
        }] 
      }, headers:{
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 94bfad73-4968-44e4-9519-bebec40f9e8e', //205445f2-627e-438d-80ab-c7ce5b53ec0a
          'Accept': 'application/json'
        }})

        const voucher_id = await res.data.id;


        fs.writeFile(order_id + ".pdf", pdf.data, async (fsError) => {
          if (fsError) {
              throw fsError;
          }
          // Send the file
          const url = 'https://api.lexoffice.io/v1/vouchers/'+voucher_id+'/files';
          const formData = new FormData();
          formData.append('file',fs.createReadStream("./"+order_id+".pdf"), { knownLength: fs.statSync("./"+order_id+".pdf").size });
          //formData.append('type','voucher');
          const config = {
              headers: {
                  ...formData.getHeaders(),
                  'Content-Length': formData.getLengthSync(),
                  'Authorization': 'Bearer 94bfad73-4968-44e4-9519-bebec40f9e8e',
                  'Accept': 'application/json',
              }
          };
          axios({ method: 'post',
          url: url,data:formData,headers:config.headers }).then((res)=>{
            console.log(res);
            try {
              fs.unlinkSync("./"+order_id+".pdf");
              //file removed
            } catch(err) {
              console.error(err);
            }
          }).catch(err=>{console.log(err)});
          
      });
    }


    } catch (e) {
      console.log(e);
    }

    ctx.respond = true;
    ctx.res.statusCode = 200;
  });


  const refund_query = gql`query get_refund($trans:ID!){
      refund(id:$trans){
        id
    		totalRefundedSet{
          shopMoney{amount}
        }
    		transactions(first:1){
          edges {
            node {
              id
              order{
              	id
                name
              }
            }
          }
        }
      }
    }`

    const add_refunds = (a,b) => a+b;


  router.post("/webhooks/orders/refund", webhook, async (ctx) => {
    try {
      var is_paypal = false;
      const order = ctx.state.webhook;
      const id = order.payload.id;
      const date = order.payload.created_at;
      const amount = await parseInt(order.payload.refund_line_items.map(e=>e.subtotal).reduce(add_refunds, 0)*100)/100;
      const payment = order.payload.transactions.gateway;
      const admin_url = order.payload.admin_graphql_api_id;
      const shop = "sportsmaskde.myshopify.com"
      const accessToken = "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"//"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"
      // const refund_id = "gid://shopify/Order/"+id
      const client = createClient(shop,accessToken)
      const {loading,error,data} = await client.query({query:refund_query,variables:{trans:admin_url}})
      const name = data.refund.transactions.edges[0].node.order.name;
      const real_id = order.payload.order_id;
      const order_id = await name.substring(10);
      const url = buildUrlRefund(real_id,order_id,id);

      const pdf = await axios(buildUrlRefund(real_id,order_id,id),{
          responseType: 'arraybuffer',
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/pdf'
          }
      });
      if(!doneRefund.includes(parseInt(order_id))){
      	doneRefund.push(parseInt(order_id));
        const res = await axios({url:'https://api.lexoffice.io/v1/vouchers', method:"POST", data: { type: "salescreditnote", 
        voucherNumber: name, 
        voucherDate: date, 
        dueDate: date, 
        totalGrossAmount: amount, 
        totalTaxAmount: 0.00, 
        taxType: "gross", 
        useCollectiveContact: true, 
        remark: "Rückerstattung", 
        voucherItems: [{ 
          amount: amount, 
          taxAmount: 0.00, 
          taxRatePercent: 0, 
          categoryId: "8f8664a1-fd86-11e1-a21f-0800200c9a66" 
        }] 
      }, headers:{
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 94bfad73-4968-44e4-9519-bebec40f9e8e',
          'Accept': 'application/json'
        }})
        const voucher_id = await res.data.id;
        fs.writeFile("./refunds/"+order_id + ".pdf", pdf.data, async (fsError) => {
          if (fsError) {
              throw fsError;
          }
          // Send the file
          const url = 'https://api.lexoffice.io/v1/vouchers/'+voucher_id+'/files';
          const formData = new FormData();
          formData.append('file',fs.createReadStream("./refunds/"+order_id+".pdf"), { knownLength: fs.statSync("./"+order_id+".pdf").size });
          //formData.append('type','voucher');
          const config = {
              headers: {
                  ...formData.getHeaders(),
                  'Content-Length': formData.getLengthSync(),
                  'Authorization': 'Bearer 94bfad73-4968-44e4-9519-bebec40f9e8e',
                  'Accept': 'application/json',
              }
          };
          axios({ method: 'post',
          url: url,data:formData,headers:config.headers }).then((res)=>{
          }).catch(err=>{console.log(err)});
          
      });
    }
    } catch (e) {
      console.log(e);
    }

    ctx.respond = true;
    ctx.res.statusCode = 200;
  });


  router.get("*", verifyRequest(), async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  });

  router.post("*", verifyRequest(), async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  });

  server.use(router.allowedMethods());
  server.use(router.routes());
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
