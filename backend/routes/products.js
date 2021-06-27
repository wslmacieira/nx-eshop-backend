const express = require('express');
const mongoose = require('mongoose')
const router = express.Router();
const multer = require('multer');

const {Product} = require('../models/product');
const {Category} = require('../models/category');

const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'png'
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isvalid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error('invalid image type')

    if(isvalid) {
      uploadError = null
    }
    cb(uploadError, 'public/upload')
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(' ').join('-')
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`)
  }
});

const uploadOptions = multer({ storage: storage})

router.get('/', async (req, res) =>{
  let filter = {};
  if(req.query.categories) {
    filter = {category: req.query.categories.split(',')};
  }
  const productList = await Product.find(filter).populate('category');
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

router.post('/', uploadOptions.single('image'), async (req, res) =>{
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).send('Invalid category');
  }
  const file = req.file;
  if (!file) {
    return res.status(400).send('No image in the request');
  }
  const fileName = req.file.filename
  const basePath = `${req.protocol}//${req.get('host')}/public/upload/`;

  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`, //"http://localhost:3000/public/upload/image-2222"
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

router.get('/get/count', async (req, res) =>{
  const productCount = await Product.countDocuments((count) => count);
  if(!productCount) {
      res.status(500).json({ success: false });
  } 
  res.send({
    productCount
  });
});

router.get('/get/featured/:count?', async (req, res) =>{
  let count = req.params.count ? +req.params.count : 0;
  console.log('count', count)
  const products = await Product.find({isFeatured: true}).limit(+count);
  
  if(!products) {
      res.status(500).json({ success: false });
  } 
  res.send(products);
});

router.put(
  '/gallery-images/:id', 
  uploadOptions.array('images', 10), 
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).send('Invalid Product Id');
    }
    const files = req.files;
    let imagesPath = [];
    const basePath = `${req.protocol}//${req.get('host')}/public/upload/`;

    if(files) {
      files.map((file) => {
        imagesPath.push(`${basePath}${file.filename}`)
      })
      console.log(files)
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      {
        images: imagesPath,
      },
      {new: true}
    )

    if (!product) {
      return res.status(400).send('the product not found!');
    }
    res.send(product);
  });

module.exports = router;
