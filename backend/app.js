const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');

require('dotenv/config');

const api = process.env.API_URL;

app.use(express.json());
app.use(morgan('tiny'));

const productSchema = mongoose.Schema({
  name: String,
  image: String,
  countInStock: {
    type: Number,
    required: true
  }
});

const Product = mongoose.model('Product', productSchema);

// http://localhost:3000/api/v1/products
app.get(`${api}/products`, async(req, res) => {
  const productList = await Product.find();
  if (!productList) {
    res.status(500).json({success: false})
  }
  res.send(productList);
});

app.post(`${api}/products`, (req, res) => {
  const product = new Product({
    name: req.body.name,
    image: req.body.image,
    countInStock: req.body.countInStock
  });

  product.save().then((createdProduct => {
    res.status(201).json(createdProduct)
  })).catch((err) => {
    res.status(500).json({
      error: err,
      success: false
    })
  })
});

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