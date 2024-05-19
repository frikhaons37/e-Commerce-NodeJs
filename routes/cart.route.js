const express = require('express')
const {
  addProductInCart,
  deleteProductInCart,
  getCartProducts,
} = require('../controller/cart.controller')
const {verifyUser} = require('../middleware/middleware')
const router = express.Router()

router
  .route('/')
  .get([verifyUser], getCartProducts)
  .post([verifyUser], addProductInCart)

router.route('/:id').delete([verifyUser], deleteProductInCart)

const Cart = require('../models/Cart')

const getCartProducts = async (req, res) => {
  try {
    const carts = await Cart.find({userId: req.user._id}).populate('productId')
    // console.log(carts)
    res.status(200).send({status: 'ok', carts})
  } catch (err) {
    console.log(err)
    sendResponseError(500, `Error ${err}`, res)
  }
}

const addProductInCart = async (req, res) => {
  const {productId, count} = req.body
  try {
    const cart = await Cart.findOneAndUpdate(
      {productId},
      {productId, count, userId: req.user._id},
      {upsert: true},
    )

    res.status(201).send({status: 'ok', cart})
  } catch (err) {
    console.log(err)
    sendResponseError(500, `Error ${err}`, res)
  }
}
const deleteProductInCart = async (req, res) => {
  try {
    await Cart.findByIdAndRemove(req.params.id)
    res.status(200).send({status: 'ok'})
  } catch (e) {
    console.log(err)
    sendResponseError(500, `Error ${err}`, res)
  }
}
module.exports = {addProductInCart, deleteProductInCart, getCartProducts}

module.exports = router
