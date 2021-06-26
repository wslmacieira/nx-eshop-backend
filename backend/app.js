const express = require('express');
const app = express();
const morgan = require('morgan');

require('dotenv/config');

const api = process.env.API_URL;

app.use(express.json());
app.use(morgan('tiny'));

// http://localhost:3000/api/v1/products
app.get(`${api}/products`, (req, res) => {
  const product = {
    id: 1,
    name: 'hair dresser',
    image: 'some_url'
  }
  res.send(product);
});

app.post(`${api}/products`, (req, res) => {
  const newProduct = req.body;

  res.send(newProduct);
});

app.listen(3000, () => {
  console.log('🚀 Server runing in http://localhost:3000')
});