const cartModel = require('../model/cartModel')
require('dotenv').config()
const productModel = require('../model/productModel')
const userModel = require('../model/userModel')
const couponModel = require('../model/couponModel')





const loadCart = async(req,res)=>{
    try { 
        const productid = req.query.id
        const userid = req.session.user_id
        const cart = await cartModel.find()
        const product = await productModel.findOne({_id:productid,isListed:true}).populate('offer').populate({path:'categoryId',populate:{path:'offer',model:'offerModel'}})
        
            
                if(!userid){
                    res.redirect('/login')
                }else{
                    
                const cartDetails = await cartModel.findOne({ user_id: userid }).populate({
                    path: 'items.product_id',
                    populate: [
                        { path: 'offer', model: 'offerModel' },
                        { path: 'categoryId', model: 'categoryModel',populate:{path:'offer',model:'offerModel'}}
                    ]
                });
                

                if (cartDetails && cartDetails.items) {
                    cartDetails.items = cartDetails.items.filter(item => item.product_id.isListed === true);
                }
        
                const userData = await userModel.findOne({_id:userid})
                const coupon = await couponModel.find()
                
                res.render('cart',{cartDetails,coupon})
                }
            
            
        
        
    } catch (error) {
        console.log(error.message)
    }
}

const addToCart = async(req,res)=>{
    try {
        
        const userid = req.session.user_id 
        // console.log('user:',userid,'pid:',productid);
        if(userid){
            const productid = req.body.productId
            const existInCart = await cartModel.findOne({user_id:userid,'items.product_id':productid})
            const product = await productModel.findOne({_id:productid,isListed:true}).populate('offer').populate({path:'categoryId',populate:{path:'offer',model:'offerModel'}})
            // let price = product.price
            // if(product.offer && product.categoryId.offer){
            //     price = product.price - product.price*(product.offer.percentage/100)
            // }else if(product.categoryId.offer){
            //     price = product.price - product.price*(product.categoryId.offer.percentage/100)
            // }
            const quantity = 1

            if(product && product.quantity>0){
                if(!existInCart){
                    const cartItem = await cartModel.findOneAndUpdate({user_id:userid},{
                        $push:{items:{
                            product_id:productid,
                            quantity:quantity,
                            // price:price,
                            // total_price:price*quantity
        
                        }
                  }},{upsert:true,new:true})
                  res.json({success:true})
    
                }else{
                    res.json({success:false,message:'item already in cart'}) 
                }
                }else{
                    res.json({success:false,message:'product is not available'}) 
                }
                
         }else{
                res.json({success:false})
            }
          
          
       
        
        

    } catch (error) {
        console.log(error.message)
    }
}


const deleteProduct = async(req,res)=>{
    try {
        const userid = req.session.user_id
        const productid = req.query.id
        if(userid){
            const dltitem = await cartModel.updateOne({user_id:userid},{$pull:{items:{_id:productid}}})
            if(dltitem){
                res.json({success:true})
            }else{
                res.json({success:false})
            }
            
        }else{
                res.json({success:false})
        }
    } catch (error) {
        console.log(error.message)
    }
}


const changeQuantity = async(req,res)=>{
        try {
            const userid = req.session.user_id
            const productid = req.body.productId
            const count = req.body.count
            const cart = await cartModel.findOne({user_id:req.session.user_id})
            
            if(!cart){
                return res.json({ success: false, message: 'Cart not found.' });
            }
            const cartProduct = cart.items.find((item) => item.product_id.toString() === productid);
            
            if (!cartProduct) {
              return res.json({ success: false, message: 'Product not found in the cart.' });
            }


            const product = await productModel.findById({_id:productid})
            if (!product) {
                console.log('Product not found in the database.');
                return res.json({ success: false, message: 'Product not found in the database.' });
              }

              if(count==1){
                await cartModel.updateOne({user_id:userid,'items.product_id':productid},
                {$inc:{'items.$.quantity':1}})
                if(cartProduct.quantity>product.quantity-1){
                    res.json({success:false,message:'Exceeded the stock'})
                }else{
                    return res.json({success:true})
                }
                
              }else if(count==-1){
                if (cartProduct.quantity > 1) {
                    await cartModel.updateOne({ user_id: userid, 'items.product_id': productid },
                      { $inc: { 'items.$.quantity':-1} }
                    );
                    return res.json({success:true})
              }else{
                return res.json({ success: false, message: 'Quantity cannot be less than 1.'});
              }
            }

        } catch (error) {
            console.log(error.message)
        }
}

const applyCoupon = async(req,res)=>{
    try {
        
        const userid = req.session.user_id 
        const couponCode = req.query.code
        // console.log('user:',userid,'pid:',productid);
        const couponData = await couponModel.findOne({couponCode:couponCode})
        
        if(couponData){
            res.json({success:true,discountAmount:couponData.discountAmount})
        }else{
            res.json({success:false})
        }
        
        
        

    } catch (error) {
        console.log(error.message)
    }
}


const getCoupon = async(req,res)=>{
    try {
        
        const userid = req.session.user_id 
        const couponAmt = req.body.discountAmount
        const reducedTotal = req.body.reducedTotal 
        // console.log('user:',userid,'pid:',productid);
        const cartUpdate = await cartModel.findOneAndUpdate({user_id:userid},{$set:{discountAmount:couponAmt}})
        if(cartUpdate){
            res.json({success:true})
        }else{
            res.json({success:false}) 
        }
        
        
        

    } catch (error) {
        console.log(error.message)
    }
}




module.exports ={
    loadCart,
    addToCart,
    deleteProduct,
    changeQuantity,
    applyCoupon,
    getCoupon
}