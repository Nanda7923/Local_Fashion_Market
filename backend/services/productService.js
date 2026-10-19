const Product = require("../models/product");
const Brand = require("../models/Brand");
const mongoose = require("mongoose");

async function getAllProducts (filter){
    let products = await Product.find(filter)
								.populate("brand")
                                .sort({ price: 1 });
    return products;
}

async function getNewArrivals (limit){
    const products = await Product.find()
                                    .populate("brand")
                                    .sort({createdAt:-1})
                                    .limit(limit);
    return products;
}

async function getProductsByRating (limit){
    let products = await Product.aggregate([
        {
            $lookup: {
                from: "reviews",
                localField: "_id",
                foreignField: "product",
                as: "reviews"
            }
        },
        {
            $addFields: {
                averageRating: { $avg: "$reviews.rating" },
                reviewCount: { $size: "$reviews" }
            }
        },
        {
            $sort: {
                averageRating: -1
            }
        },
        {
            $limit: Number(limit)
        }
    ]);
    return products;
}

async function getProductById (id){
    let product = await Product.findById(id)
                                .populate("brand");
    console.log("product", product);
    return product;
}

async function getProductByBrand (brandId) {
    let product = await Product.find({brand : brandId})
                                .populate("brand").sort({ price: 1 });
    return product;
}

async function getProductsByCategory (category) {
    let product = await Product.find({
        category : {
            $regex: category,
            $options: "i"
        }
    }).populate("brand").sort({ price: 1 });
    return product;
}

async function addProduct (product) {
	await assertBrandExists(product.brand);
    let newProduct = new Product(product);
    let savedProduct = await newProduct.save();
    return savedProduct.populate("brand");
}



async function deleteProduct (id){
    let delProduct = await Product.findByIdAndDelete(id);
    console.log("Deleted product", delProduct);
    return delProduct;
}

async function updateProduct (id, product){
	if (product.brand !== undefined) await assertBrandExists(product.brand);
    let updateProduct = await Product.findOneAndUpdate({_id : id},product,{new: true, runValidators: true});
	return updateProduct ? updateProduct.populate("brand") : null;
}

async function assertBrandExists(brandId) {
    if (!mongoose.isValidObjectId(brandId)) {
        throw new Error("Choose a valid brand.");
    }
    const brand = await Brand.findById(brandId).select("_id");
    if (!brand) throw new Error("The selected brand no longer exists. Choose another brand.");
}

async function getProductsByHeadCategory(headCategory){
    let products = await Product.find({
        $or: [
            { headCategory: { $regex: headCategory, $options: "i" } },
            { department: { $regex: headCategory, $options: "i" } },
        ],
    }).populate("brand");
    return products;
}

async function getHeadCategories(){
	const [headCategories, legacyDepartments] = await Promise.all([
        Product.distinct("headCategory"),
        Product.collection.distinct("department"),
    ]);
	return [...new Set([...headCategories, ...legacyDepartments].filter(Boolean))];
}

module.exports = {
    getAllProducts,
    getNewArrivals,
    getProductsByRating,
    getProductById,
    getProductByBrand,
    getProductsByCategory,
    addProduct,
    deleteProduct,
    updateProduct,
    getProductsByHeadCategory,
    getHeadCategories
}
