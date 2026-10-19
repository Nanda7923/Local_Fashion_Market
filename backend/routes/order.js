let express = require('express');
let router = express.Router();
let Order = require('./../controllers/OrderController');
let {checkRole,checkIsBanned} = require('./../middlewares/auth')

router.post('/',checkIsBanned(false),Order.createOrder);
router.get('/myOrders',Order.getMyOrders);

router.put('/:orderId',Order.cancelOrder);
router.get('/:orderId',Order.getOrderById);

router.post('/:orderId',checkRole("Admin"),Order.updateOrderStatus);
router.get('/',checkRole("Admin"),Order.getAllOrders);

module.exports = router;
