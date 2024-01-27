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
    }
})


module.exports = mongoose.model('categoryModel',categorySchema)