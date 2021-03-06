var express = require('express');
var router = express.Router();
var Cart = require('../models/cart');
var Product = require('../models/product');

/* GET home page. */
router.get('/', function (req, res, next) {
    var successMsg = req.flash('success')[0];
    
    var products = Product.find(function (err, docs) {
        var productChunks = [];
        var chunkSize = 3;
        for (var i = 0; i < docs.length; i += chunkSize) {
            productChunks.push(docs.slice(i, i + chunkSize));
        }
        res.render('shop/index', { title: 'Shopping cart', products: productChunks, successMsg: successMsg, noMessage: !successMsg });
    });
});

router.get('/add-to-cart/:id', function (req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    Product.findById(productId, function (err, product) {
        if (err) {
            res.redirect('/');
        }
        cart.add(product, product.id);
        req.session.cart = cart;
        console.log(req.session.cart);
        res.redirect('/');
    });
});


router.get('/shopping-cart', function (req, res, next) {
    if (!req.session.cart) {
        return res.render('shop/shopping-cart', { products: null });
    }

    var cart = new Cart(req.session.cart);
    var render = { products: cart.generateArray(), totalPrice: cart.totalPrice };
    res.render('shop/shopping-cart', render);
});

router.get('/checkout', function (req, res, next) {
    if (!req.session.cart) {
        return res.render('shop/shopping-cart');
    }

    var cart = new Cart(req.session.cart);
    var errMsg = req.flash('error')[0]
    return res.render('shop/checkout', { total: cart.totalPrice , errMsg: errMsg, noError: !errMsg});

});

router.post('/checkout', function (req, res, next) {
    if (!req.session.cart) {
        return res.render('shop/shopping-cart');
    }
    var cart = new Cart(req.session.cart);
    
    var stripe = require("stripe")(
        "sk_test_MWGgzRVytPJiT3aXvl5ZtKYy"
    );

    stripe.charges.create({
        amount: cart.totalPrice * 100,
        currency: "usd",
        source: req.body.stripeToken, // obtained with Stripe.js
        description: "Test Change"
    }, function (err, charge) {
        if(err){
            req.flash('error', err.message);
            res.redirect('/chackout');
        }
        req.flash('success', 'Successfully bought product');
        req.session.cart = null;
        res.redirect('/');
    });

});


module.exports = router;
