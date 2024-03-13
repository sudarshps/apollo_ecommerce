const userModel = require('../model/userModel')
const productModel = require('../model/productModel')
const cartModel = require('../model/cartModel')


const loadWishlist = async(req,res)=>{
    try {
        const userid = req.session.user_id
        const userData = await userModel.findOne({_id:userid}).populate('wishlist.product_id')
        const wishlist = userData.wishlist
        res.render('wishlist',{userData,wishlist})
    } catch (error) {
        console.log(error.message)
    }
}



const addToWishlist = async(req,res)=>{
    try {
        const date = new Date()
            .toLocaleDateString("en-us", {
               weekday: "short",
               day: "numeric",
               year: "numeric",
               month: "short",
            }).replace(",", "");
        const userid = req.session.user_id
       const productId = req.body.productId
       const existProduct = await userModel.findOne({_id:userid,'wishlist.product_id':productId})
       
            if(!existProduct){
                const wishlistData = await userModel.findByIdAndUpdate({_id:userid},{$push:{wishlist:{product_id:productId,date:date}}},{new:true})
                if(wishlistData){
                    res.json({success:true})
                }else{
                    res.json({success:false})
                }
            }else{
                    res.json({existproduct:true,message:'Item is already in wishlist!'})
            }
            
        
       
    } catch (error) {
        console.log(error.message)
    }  
}


const deleteWishlistItem = async(req,res)=>{
    try {
        const userid = req.session.user_id
        const productId = req.body.productId
        const userData = await userModel.findOneAndUpdate({_id:userid},{$pull:{wishlist:{product_id:productId}}},{new:true})
        if(userData){
            res.json({success:true})
        }else{
            res.json({success:false})
        }
    } catch (error) {
        console.log(error.message)
    }
}


const addToCart = async(req,res)=>{
    try {
        const userid = req.session.user_id
        const productId = req.body.productId
        const product = await productModel.findOne({_id:productId,isListed:true})
        const existInCart = await cartModel.findOne({user_id:userid,'items.product_id':productId})
        let quantity = 1
        if(userid && product.quantity>0){
            if(!existInCart){
                const cartItem = await cartModel.findOneAndUpdate({user_id:userid},{
                    $push:{items:{
                        product_id:productId,
                        quantity:quantity,
                        price:product.price,
                        total_price:product.price*quantity
        
                    }
              }},{upsert:true,new:true})
                if(cartItem){
                    res.json({success:true})
                }else{
                    res.json({success:false})
                }
            }else{
                res.json({success:false,message:'item already in cart'})
            }
            }else{
                res.json({success:false})
            }
            
       
    } catch (error) {
        console.log(error.message)
    }
}


module.exports = {
    loadWishlist,
    addToWishlist,
    deleteWishlistItem,
    addToCart
}