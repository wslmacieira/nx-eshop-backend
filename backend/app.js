const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');
const api = process.env.API_URL;
const authJwt = require('./helpers/jwt');

app.use(cors());
app.options('*', cors())

app.use(express.json());
app.use(morgan('tiny'));
app.use(authJwt());

//Routes
const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/products');
const usersRoutes = require('./routes/users');
const ordersRoutes = require('./routes/orders');

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);


mongoose.connect(process.env.CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology:true,
  dbName: 'eshop-database'
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