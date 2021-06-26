const express = require('express');
const mongoose = require('mongoose')
const router = express.Router();

const {Product} = require('../models/product');
const {Category} = require('../models/category');

router.get('/', async (req, res) =>{
  const productList = await Product.find().populate('category');
  if(!productList) {
      res.status(500).json({success: false})
  } 
  res.send(productList);
});

router.get('/:id', async (req, res) =>{
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).send('Invalid Product Id');
  }
  const product = await Product.findById(req.params.id).populate('category');
  if(!product) {
      res.status(404).json({ message: 'the product with the given ID was not found!' })
  } 
  res.send(product);
});

router.post('/', async (req, res) =>{
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).send('Invalid category');
  }

  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: req.body.image,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured
  });

  product = await product.save();
  
  if(!product) {
    return res.status(500). send('the product cannot be created');
  }
  res.send(product);
});

router.put('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).send('Invalid Product Id');
  }
  if (!mongoose.isValidObjectId(req.body.category)) {
    res.status(400).send('Invalid Category Id');
  }
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).send('Invalid Category');
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id, 
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured
    },
    {new: true}
  );
  if (!product) {
    return res.status(400).send('the product not found!');
  }
  res.send(product);
});

router.delete('/:id', (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).send('Invalid Product Id');
  }
  Product.findByIdAndRemove(req.params.id).then((product) => {
    if (!product) {
      return res.status(404).json({ success: false, message: 'product not found!' })
    }
    return res.status(200).json({ success: true, message: 'the product is deleted!' })
  }).catch((err) => {
    return res.status(500).json({ success: false, error: err })
  })
});

module.exports = router;
