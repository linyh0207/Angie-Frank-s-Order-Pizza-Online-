"use strict";

const express = require('express');
const router = express.Router();

module.exports = (knex) => {

  router.get("/", function (req, res) {
    knex('cart')
    .join('menu', 'menu.id', 'cart.menu_id')
    .select('pizza_name','qty','sub_total', 'url')
    .then((results) =>{
      console.log(results);
      res.json(results);
    });
  }); //router.get ends here

  router.post("/", (req, res) => {

    //before inserting we need to verify if the ID already exists. If Exists, then we need to update else
    // Insert it.
    knex.select("*").from("cart").where({
      menu_id: req.body.menu_id,
    }).then((result) => {
      let newQty = 0;
      let newSubTotal = 0.00;
      if (result.length > 0) {
        result.forEach(function (value) {
          newQty = value.qty + parseInt(req.body.qty);
          newSubTotal = parseFloat(value.sub_total) + parseFloat(req.body.sub_total)
        }); //results for each ends here

        //update the record
        knex('cart').where("menu_id", req.body.menu_id)
          .update({
            qty: newQty,
            sub_total: newSubTotal
          }).then((count) => {
            //record updated.
            var result = {
              result: "True"
            }
            res.json(result)
          })
      } else {
        //insert into the table.
        knex('cart')
          .insert({
            'menu_id': req.body.menu_id,
            'qty': req.body.qty,
            'sub_total': req.body.sub_total
          })
          .returning('*')
          .asCallback((err, createdRecords) => {
            if (err) {
              return console.error("error running handler", err);
            } else {
              const createdRecord = createdRecords[0];
              res.json(createdRecords)
              console.log('Created Record is', createdRecord);
            }
          });
        console.log("we need to insert");
      }
    });



  });
  return router;
} //module exports ends here