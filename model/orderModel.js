const mongoose = require('mongoose')


const orderSchema = mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    deliveryAddress:{
        type:String,
        required:true
    },
    paymentMethod:{
        type:String,
        required:true
    },
    status:{
        type:String,
        required:true
    },
    date:{
        type:String,
        required:true
    },
    expectedDelivery:{
        type:String,
        required:true
    },
    reducedTotal:{
        type:Number
    },
    items:[{
        product_id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'productModel',
            required:true
        },
        quantity:{
            type:Number,
            required:true
        },
        price:{
            type:Number,
            required:true
        },
        total_price:{
            type:Number,
            required:true
        },
        status:{
            default:'Placed',
            type:String,
            
        }
    }]
},
{timestamps:true}  )


module.exports = mongoose.model('orderModel',orderSchema)