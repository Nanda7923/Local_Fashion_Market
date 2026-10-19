const AdminDashboardService = require('./../services/adminDashboardService');
const resError = require("../middlewares/resError");

async function adminDashboardController(req, res) {
    try{
        let adminDashboard = await AdminDashboardService.getAdminDashboardOverView();
        if(adminDashboard){
            res.json({
                success : "Admin Dashboard",
                data : adminDashboard
            })
        }
    }catch(err){
        return resError(res,err);
    }
}

module.exports = {
    adminDashboardController
}
