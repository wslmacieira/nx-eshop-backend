const { Category } = require('../models/category');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const categoryList = await Category.find();

  if (!categoryList) {
    res.status(404).json({ success: false });
  }
  res.status(200).send(categoryList);
});

router.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).send('Invalid Category Id');
  }
  
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404).json({ message: 'the category with the given ID was not found!' })
  }
  res.status(200).send(category);
})

router.post('/', async (req, res) => {
  let category = new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color
  });
  category = await category.save();

  if (!category) {
    return res.status(404).send('the category cannot be created!');
  }
  res.send(category);
});

router.put('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).send('Invalid Category Id');
  }

  const category = await Category.findByIdAndUpdate(
    req.params.id, 
    {
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color
    },
    {new: true}
  );
  if (!category) {
    return res.status(404).send('the category cannot be updated!');
  }
  res.send(category);
});

router.delete('/:id', (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).send('Invalid Category Id');
  }
  Category.findByIdAndRemove(req.params.id).then((category) => {
    if (!category) {
      return res.status(404).json({ success: false, message: 'category not found!' })
    }
    return res.status(200).json({ success: true, message: 'the category is deleted!' })
  }).catch((err) => {
    return res.status(500).json({ success: false, error: err })
  })
});

module.exports = router;
