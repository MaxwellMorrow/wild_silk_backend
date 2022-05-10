const cors = require("cors")
const express = require("express")
require("dotenv").config()
const stripe = require("stripe")(process.env.API_KEY)
const uuid = require("uuid")
const app = express();

const PORT = process.env.PORT;

// middleware

app.use(express.json())
app.use(cors())


// routes
app.get("/", (req,res)=>{
    res.send("IT WORKS!")
})

app.post("/payment", (req,res)=>{

    const {product, token} = req.body;
    console.log("PRODUCT",product);
    console.log("PRICE", product.price);
    const idempotencyKey = uuid()

    return stripe.customers.create({
        email: token.email,
        source: token.id
    }).then(customer =>{
        stripe.charges.create({
            amount:product.price * 100 ,
            currency:"usd",
            customer:customer.id,
            receipt_email: token.email,
            description: product.name,
            shipping:{
                name:token.card.name,
                address: {
                    country: token.card.address_country
                }
            }

        },{idempotencyKey})
    }).then(result => res.status(200).json(result))
    .catch(err => console.log(err))

})

// listen

app.listen(PORT, ()=> console.log(`LISTENING AT PORT ${PORT}`))