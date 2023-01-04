import { GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "./shopify.js";
import axios from "axios";
import React,{ useState,useEffect } from 'react';
const ADJECTIVES = [
  "autumn",
  "hidden",
  "bitter",
  "misty",
  "silent",
  "empty",
  "dry",
  "dark",
  "summer",
  "icy",
  "delicate",
  "quiet",
  "white",
  "cool",
  "spring",
  "winter",
  "patient",
  "twilight",
  "dawn",
  "crimson",
  "wispy",
  "weathered",
  "blue",
  "billowing",
  "broken",
  "cold",
  "damp",
  "falling",
  "frosty",
  "green",
  "long",
];

const NOUNS = [
  "waterfall",
  "river",
  "breeze",
  "moon",
  "rain",
  "wind",
  "sea",
  "morning",
  "snow",
  "lake",
  "sunset",
  "pine",
  "shadow",
  "leaf",
  "dawn",
  "glitter",
  "forest",
  "hill",
  "cloud",
  "meadow",
  "sun",
  "glade",
  "bird",
  "brook",
  "butterfly",
  "bush",
  "dew",
  "dust",
  "field",
  "fire",
  "flower",
];

export const DEFAULT_PRODUCTS_COUNT = 1;
const CREATE_PRODUCTS_MUTATION = `
  mutation populateProduct($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
      }
    }
  }
`;

export default async function ProductCreator(
  session,
  count = DEFAULT_PRODUCTS_COUNT
) {
//getting products from sellercentral api
let data = [];
axios.post('http://sellercenter-api-preprod.theiconic.com.au/oauth/client-credentials',
    'grant_type=client_credentials&client_id=9af9f679e74ebdff4b07&client_secret=6cd51f62baf03c13ef06b2daf9c70027d6d2b9fc'
    )
    .then(function(res) {
      let access_token='';
      console.log("ACcess tokennnn:");
      access_token=res.data.access_token;
      let auth='Bearer '+access_token;
      axios({
        method: 'GET',
        url: 'https://sellercenter-api-preprod.theiconic.com.au/v2/product-sets',
        params: {status: 'active',inStock:true 
        },
        headers: {
          Authorization: auth
        }
       })
       .then (async function (response) {
        data = response.data.items;
        console.log("Data------------>",data);
        const client = new shopify.api.clients.Graphql({ session });
  try {
    for (let i = 0; i < data.length; i++) {
      count +=1;
      client.query({
        data: {
          query: CREATE_PRODUCTS_MUTATION,
          variables: 
          {
            input: {
              // id:data[i].id,
              title: data[i].name,
              descriptionHtml:data[i].description,
              variants: [{ price: randomPrice() }],
            },
          },
        },
      });
    }
  } catch (error) {
    if (error instanceof GraphqlQueryError) {
      throw new Error(
        `${error.message}\n${JSON.stringify(error.response, null, 2)}`
      );
    } else {
      throw error;
    }
  }
        
    
      }).catch(function (error) {
        console.error(error);
      });

    })
    .catch(error => {
       console.log(error)
    });

   






  
}

function randomTitle() {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adjective} ${noun}`;
}

function randomPrice() {
  return Math.round((Math.random() * 10 + Number.EPSILON) * 100) / 100;
}
