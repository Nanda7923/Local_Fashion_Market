const mongoose = require('mongoose');
const {Schema} = mongoose;

const CartSchema = new Schema({
                    user : {
                        type : mongoose.Schema.Types.ObjectId,
                        ref : 'User',
                        required: true,
                        unique : true,
                    },
                    items : [
                        {
                            product :{
                                type : mongoose.Schema.Types.ObjectId,
                                ref : 'Product',
                                required : true
                            },
                            quantity : {
                                type : Number,
                                min : 1,
                                required : true

                            },
                            size : {
                                type : String,
                                required : true
                            },
                            color : {
                                type : String,
                                required : true
                            }
                        }
                    ]
                },
        {
                    timestamps : true
                });
const Cart = mongoose.model('Cart', CartSchema);
module.exports = Cart;