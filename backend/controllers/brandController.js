const brandService = require('../services/brandService');
const resError = require('../middlewares/resError')

async function getAllBrands(req,res){
    try{
        let brands = await brandService.getAllBrands();
        res.json({
            message : "Success",
            data : brands,
        })
    }catch(err){
        return resError(res,err);
    }
}

async function addBrand(req,res) {
    try{
		const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
		const logo = typeof req.body.logo === 'string' ? req.body.logo.trim() : '';
		if (!name || !logo) {
			return res.status(400).json({ message: 'Brand name and logo are required.' });
		}
		let brand = { name, logo };
        let addedBrand = await brandService.addBrand(brand);
        res.status(201).json({
            message : "Success",
            data : addedBrand
        })
    }catch(err){
		if (err && err.code === 11000) {
			return res.status(409).json({ message: 'A brand with this name already exists.' });
		}
        return resError(res,err);
    }
}

async function updateBrand(req, res){
    try{
        let brandId = req.params.brandId;
        let brand = req.body;
        let updatedBrand = await brandService.updateBrand(brandId,brand);
        res.json({
            message : "Success",
            data : updatedBrand
        })
    }catch(err){
        return resError(res,err);
    }
}

async function deleteBrand(req,res){
    try{
        let brandId = req.params.brandId;
        let deletedBrand = await brandService.deleteBrand(brandId);
        res.json({
            message : "Success",
            data : deletedBrand
        })
    }catch(err){
        return resError(res,err);
    }
}


module.exports = {
    getAllBrands,
    addBrand,
    updateBrand,
    deleteBrand
}
