const Brand = require('../models/Brand');

async function getAllBrands(){
    let brands = await Brand.find();
    return brands;
}

async function addBrand(brand){
	let newBrand = new Brand({ name: brand.name.trim(), logo: brand.logo.trim() });
    let savedBrand = await newBrand.save();
    return savedBrand;
}

async function updateBrand(brandId,brand){
    let updatedBrand = await Brand.findByIdAndUpdate(brandId,brand,{new:true,runValidators: true});
    return updatedBrand;
}

async function deleteBrand(brandId){
    let deletedBrand = await Brand.findByIdAndDelete(brandId);
    return deletedBrand;
}

module.exports = {
    getAllBrands,
    addBrand,
    updateBrand,
    deleteBrand
}
