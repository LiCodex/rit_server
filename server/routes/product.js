const router = require('express').Router();
const Product = require('../models/product');
//post request create a new product
router.post('/products', async (req, res) => {
    try {
        let product = new Product();
        product.title = req.body.title;
        product.description = req.body.description;
        product.photo = req.body.photo;
        product.stockQuantity = req.body.stockQuantity;

        await product.save()

        res.json({
            status: true,
            message: "Successfully saved"
        })
    } catch (err) {
        res.status(500).json({
            status: false,
            message: err.message
        })
    }

    
})

//get request get all products



//get request get a single product


//put request update a single product


//delete request delete a single product

module.exports = router;