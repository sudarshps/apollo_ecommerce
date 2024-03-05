const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    name:{
        type:String
    },
    description:{
        type:String
    },
    is_Listed:{
        type:Boolean
    },
    offer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'offerModel',
        default:null
    }
})


module.exports = mongoose.model('categoryModel',categorySchema)