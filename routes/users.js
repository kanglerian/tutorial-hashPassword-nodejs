const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const validator = require('fastest-validator');
const v = new validator();

const { User } = require('../models');

/* POST registration new user */
router.post('/', async (req, res) => {
  const schema = {
    name: 'string|empty:false',
    email: 'email|empty:false',
    password: 'string|min:6',
  }
  const validate = v.validate(req.body, schema);
  if (validate.length) {
    return res.status(400).json({
      status: 'error',
      message: validate
    });
  }
  const checkEmail = await User.findOne({
    where: {
      email: req.body.email
    }
  });
  if(checkEmail){
    return res.json({ message: 'email telah ada' });
  }
  const hashPassword = await bcrypt.hash(req.body.password, 10);
  const data = {
    name: req.body.name,
    email: req.body.email,
    password: hashPassword
  }
  await User.create(data);
  res.json({
    message: 'success registration'
  });
});

/* POST login user */
router.post('/login', async (req, res) => {
  const schema = {
    email: 'email|empty:false',
    password: 'string|min:6',
  }
  const validate = v.validate(req.body, schema);
  if (validate.length) {
    return res.status(400).json({
      status: 'error',
      message: validate
    });
  }
  const checkUser = await User.findOne({
    where: {
      email: req.body.email
    }
  });
  if(!checkUser){
    return res.json({ message: 'user not found' });
  }
  const isValid = await bcrypt.compare(req.body.password, checkUser.password);
  if(!isValid){
    return res.json({ message: 'wrong password' });
  }
  res.json({
    message: 'login success',
    data: {
      id: checkUser.id,
      name: checkUser.name
    }
  });
});

module.exports = router;
