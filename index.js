
// dependencies
const cors = require("cors")
const express = require("express")
require("dotenv").config()
const stripe = require("stripe")(process.env.API_KEY)
const uuid = require("uuid")
const app = express();
const PORT = process.env.PORT;
const mongoose = require("mongoose");
mongoose.connect(process.env.MOONGOOSE_CONNECTION).then(()=>console.log("DB Connection Successful")).catch((err)=>console.log(err))
const userRoute = require("./routes/user")
const authRoute = require("./routes/auth")

// middleware

app.use(express.json())// lets our express server parse json
app.use(cors()) // seen before not sure what it does.


// routes
app.get("/", (req,res)=>{
    res.send("IT WORKS!")
})

app.use("/api/auth",authRoute)
app.use("/api/users",userRoute)














// example of stripe post request
app.post("/payment", (req,res)=>{
  const { product, token } = req.body;
  const idempotencyKey = uuid(); // this prevents double orders somehow needs more research

  return stripe.customers
    .create({
      email: token.email,
      source: token.id,
    })
    .then((customer) => {
      stripe.charges.create(
        {
          amount: product.price * 100,
          currency: "usd",
          customer: customer.id,
          receipt_email: token.email,
          description: product.name,
          shipping: {
            name: token.card.name,
            address: {
              country: token.card.address_country,
            },
          },
        },
        { idempotencyKey }
      );
    })
    .then((result) => res.status(200).json(result))
    .catch((err) => console.log(err));
})

// listen

app.listen(PORT, ()=> console.log(`LISTENING AT PORT ${PORT}`))