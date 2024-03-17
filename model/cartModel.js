const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({

    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    items:[{
        product_id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'productModel',
            required:true
        },
        quantity:{
            type:Number,
            default:1,
            required:true
        },
        // price:{
        //     type:Number,
        //     required:true
        // },
        // total_price:{
        //     type:Number,
        //     required:true
        // } 
        
    }],

})


module.exports = mongoose.model('cartModel',cartSchema)