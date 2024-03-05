const offerModel = require('../model/offerModel')
const productModel = require('../model/productModel')
const categoryModel = require('../model/categoryModel')


const loadOffer = async(req,res)=>{
    try {
        const offerData = await offerModel.find()
        res.render('offer',{offerData})
    } catch (error) {
        console.log(error.message)
    }
}


const loadAddOffer = async(req,res)=>{
    try {
        res.render('addOffer')
    } catch (error) {
        console.log(error.message)
    }
}

const postAddOffer = async(req,res)=>{
    try {
        const {name,startingDate,expiryDate,percentage} = req.body
        const offer = new offerModel({
            offerName:name,
            startingDate:startingDate,
            expiryDate:expiryDate,
            percentage:percentage,
            status:true
        })
        const offerData = await offer.save()
        if(offerData){
            res.json({success:true})
        }else{
            res.json({success:false})
        }

    } catch (error) {
        console.log(error.message)
    }
}

const dltOffer = async(req,res)=>{
    try {
        const offerid = req.body.offerId
        const dltOffer = await offerModel.findOneAndDelete({_id:offerid})
        if(dltOffer){
            res.send({success:true,message:'deletion successful!'})
        }else{
            res.send({success:false,message:'deletion failed!'})
        }
    } catch (error) {
        console.log(error.message)
    }
}

const addProductOffer = async(req,res)=>{
    try {
       const {offerId,productId} = req.body
       const offerData = await offerModel.findOne({_id:offerId})
       const productOfferAdded = await productModel.findOneAndUpdate({_id:productId},{$set:{offer:offerId}},{upsert:true,setDefaultsOnInsert: true,
       new: true })
       if(productOfferAdded){
            res.json({success:true})
       }else{
        res.json({success:false})
       }
       
        
       
    } catch (error) {
        console.log(error.message)
    }
}



const addCategoryOffer = async(req,res)=>{
    try {
       const {offerId,categoryId} = req.body
       const offerData = await offerModel.findOne({_id:offerId})
       const categoryOfferAdded = await categoryModel.findOneAndUpdate({_id:categoryId},{$set:{offer:offerId}},{upsert:true,setDefaultsOnInsert: true,
       new: true })
       if(categoryOfferAdded){
            res.json({success:true})
       }else{
        res.json({success:false})
       }
       
        
       
    } catch (error) {
        console.log(error.message)
    }
}






const removeProductOffer = async(req,res)=>{
    try {
       const {productId} = req.body
       const productOfferRemoved = await productModel.findOneAndUpdate({_id:productId},{$set:{offer:null}})
       if(productOfferRemoved){
            res.json({success:true})
       }else{
        res.json({success:false})
       }
       
        
       
    } catch (error) {
        console.log(error.message)
    }
}


const removeCategoryOffer = async(req,res)=>{
    try {
       const {categoryId} = req.body
       const categoryOfferRemoved = await categoryModel.findOneAndUpdate({_id:categoryId},{$set:{offer:null}})
       if(categoryOfferRemoved){
            res.json({success:true})
       }else{
        res.json({success:false})
       }
       
        
       
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    loadOffer,
    loadAddOffer,
    postAddOffer,
    dltOffer,
    addProductOffer,
    removeProductOffer,
    addCategoryOffer,
    removeCategoryOffer
}