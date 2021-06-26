const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

const {User} = require('../models/user');

router.get('/', async (req, res) =>{
    const userList = await User.find().select('-passwordHash');

    if(!userList) {
        res.status(500).json({success: false})
    } 
    res.send(userList);
});

router.get('/:id', async (req, res) =>{
  const user = await User.findById(req.params.id).select('-passwordHash');

  if(!user) {
      res.status(500).json({success: false})
  } 
  res.send(user);
});

router.post('/', async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 8),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country
  });
  user = await user.save();

  if (!user) {
    return res.status(404).send('the user cannot be created!');
  }
  res.send(user);
});

router.put('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).send('Invalid User Id');
  }

  const userExist = await User.findById(req.params.id);
  let newPassword;

  if (req.body.password) {
    newPassword = bcrypt.hashSync(req.body.password, 8);
  } else {
    newPassword = userExist.passwordHash;
  }

  const user = await User.findByIdAndUpdate(
    req.params.id, 
    {
      name: req.body.name,
      email: req.body.email,
      passwordHash: newPassword,
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      street: req.body.street,
      apartment: req.body.apartment,
      zip: req.body.zip,
      city: req.body.city,
      country: req.body.country
    },
    {new: true}
  );
  if (!user) {
    return res.status(404).send('the user cannot be updated!');
  }
  res.send(user);
});

router.post('/login',  async (req, res) => {
  const user = await User.findOne({email: req.body.email}).select();
  const sercret = process.env.SECRET_KEY;

  if(!user) {
    return res.status(400).send('the user not found!');
  }

  if(user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const token = jwt.sign(
      {
      userId: user.id,
      },
      sercret,
      {
        expiresIn: '1d'
      }
    );
    res.status(200).send({user: user.email, token});
  } else {
    res.status(400).send('user or password is wrong!');
  }
  
})

module.exports = router;
