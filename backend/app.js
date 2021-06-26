const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');


require('dotenv/config');
const api = process.env.API_URL;
const productsRouter = require('./routes/products');


app.use(express.json());
app.use(morgan('tiny'));

// Routers
app.use(`${api}/products`, productsRouter)

const Product = require('./models/product');

mongoose.connect(process.env.CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology:true
})
  .then(() => {
    console.log('Database Connection is ready...')
  })
  .catch((err) => {
    console.log(err);
  })

app.listen(3000, () => {
  console.log('🚀 Server runing in http://localhost:3000')
});