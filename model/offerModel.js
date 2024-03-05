const mongoose = require('mongoose')

const offerSchema = mongoose.Schema({
        offerName:{
            type:String,
        },
        startingDate:{
            type:Date,
            
        },
        expiryDate:{
            type:Date,
            
        },
        percentage:{
            type:Number,
        },
        status:{
            type:Boolean,
            default:true
        }
})

module.exports = mongoose.model('offerModel',offerSchema)