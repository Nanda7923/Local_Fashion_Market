let productService = require('../services/productService');
const resError = require('./../middlewares/resError');

async function getAllProducts(req,res){
    try {
        let {
            minPrice,
            maxPrice,
        }   = req.query;
        let filter = {};
        if(minPrice || maxPrice){
            filter.price = {};
            if(minPrice){
                filter.price.$gte = +minPrice;
            }
            if(maxPrice){
                filter.price.$lte = +maxPrice;
            }
        }
        let products = await productService.getAllProducts(filter);

        res.json({
            message : "Success",
            data  : products
        });
    } catch (err) {
        return resError(res,err);
    }
}

async function getNewArrivals(req,res){
    let {limit=8} = req.query;
    try{
        let products = await productService.getNewArrivals(limit);
        res.json({
            message : "Success",
            data  : products
        })
    }catch(err){
        return resError(res,err)
    }
}

async function getProductsByRating(req,res){
    try{
        let {limit=5} = req.query;
        let products = await productService.getProductsByRating(limit);
        if(!products){
            return resError(res,"There is no products",404);
        }else{
            res.json({
                message : "Success",
                data  : products
            })
        }
    }catch(err){
        return resError(res,err);
    }
}

async function getProductById(req,res){
    try{
        let id = req.params.id;
        let product = await productService.getProductById(id);
        console.log("product" ,product);
        if(!product){
            return resError(res,"Product not found!",404);
        }else{
            res.json({
                message : "Success",
                data : product
            })
        }
    }catch(err){
        return resError(res,err);
    }
}

async function getProductByBrand(req,res){
    try{
        let brandId = req.params.brandId;
        let product = await productService.getProductByBrand(brandId);
        console.log("product",product);
        if(!product){
            return resError(res,"Product not found",404);
        }else{
            res.json({
                message : "Success",
                data : product
            })
        }
    }catch(err){
        return resError(res,err);
    }
}

async function getProductsByCategory(req,res){
    try{
        let category = req.params.category;
        let product = await productService.getProductsByCategory(category);
        if(!product){
            return resError(res,"Product not found!");
        }else{
            res.json({
                message : "Success",
                data : product
            })
        }
    }catch(err){
        return resError(res,err);
    }


}

async function addProducts(req,res){
    try{
        let  product= await productService.addProduct(req.body);
        res.json({
            message : "Success",
            data  : product
        });
    }catch(err){
        return resError(res,err);
    }
}

async function deleteProducts(req,res){
    try{
        let product = await productService.deleteProduct(req.params.id);
        console.log("product => ",product);
        if(!product){
            return resError(res,"You can't delete the product",404);
        }else{
            res.status(200).json({ message: "Successfully deleted product", data: product });
        }

    }catch(err){
        return resError(res,err);
    }
}

async function updateProducts(req, res){
    try{
        let id = req.params.id;
        let product = await productService.updateProduct(id,req.body);
        if(!product){
            return resError(res,"You can't update the product!",404)
        }else{
            res.json({
                message : "Successfully updated product",
                data : product
            })
        }
    }catch(err){
        return resError(res,err);
    }
}

async function getProductsByHeadCategory(req,res){
    try{
        let {headCategory} = req.params;
        let product = await productService.getProductsByHeadCategory(headCategory);
        if(!product){
            return resError(res,"You can't get the product",404);
        }
        res.json({
            message : "Success",
            data : product
        })
    }catch(err){
        return resError(res,err);
    }
}

async function getHeadCategories(req,res){
    try{
        let headCategories = await productService.getHeadCategories();
        if(!headCategories){
            return resError(res,"You can't get the head categories!",404);
        }
        res.json({
            message : "Success",
            data : headCategories
        })
    }catch(err){
        return resError(res,err);
    }
}

module.exports = {
    getAllProducts,
    getNewArrivals,
    getProductsByRating,
    getProductById,
    getProductByBrand,
    getProductsByCategory,
    addProducts,
    deleteProducts,
    updateProducts,
    getProductsByHeadCategory,
    getHeadCategories
}
