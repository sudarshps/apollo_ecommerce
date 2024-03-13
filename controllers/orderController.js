const cartModel = require('../model/cartModel')
const orderModel = require('../model/orderModel')
require('dotenv').config()
const productModel = require('../model/productModel')
const User = require('../model/userModel')
const coupon = require('../model/couponModel')
const couponModel = require('../model/couponModel')
const Razorpay = require('razorpay')


var instance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET,
  });



const loadCheckout = async(req,res)=>{ 
    try {
        const coupon = await couponModel.find()
        const userid = req.session.user_id
        req.session.coupon = null
        const user = await User.findOne({_id:userid})
        req.session.couponApplied = false

        const cart = await cartModel.findOne({user_id:userid}).populate({
            path:'items.product_id'
        })

        
        // console.log(cart);
        if(user){
            res.render('checkout',{user,cart,coupon})
        }else{
            res.redirect('/')
        }
        
    } catch (error) {
        console.log(error.message)
    }
}


const loadOrderDetails = async(req,res)=>{
    try {
        const orderId = req.query.id
        const orderData = await orderModel.findOne({_id:orderId}).populate({path:'items.product_id'}).populate('userId')
        res.render('orderDetailsnew',{orderData})
        
    } catch (error) {
        console.log(error.message)
    }
}

const placeOrder = async(req,res)=>{
    try {
        const userid = req.session.user_id
        const address = req.body.selectedaddress
        const payment = req.body.selectedpayment
        const reducedTotal = req.body.reducedTotal
        const couponid = req.body.couponid
    
        const cartItems = await cartModel.findOne({user_id:userid}).populate({path:'items'})
        
        
    


        let status = '';
        if (payment === 'cod') {
     status = 'placed';
    } else if (payment === 'debit') {
      status = 'pending';
    } else if (payment === 'upi') {
      status = 'pending';
     } else {
       status = 'pending';
     }
     

     const cartData = await cartModel.findOne({user_id:userid})
     const cartItem = cartData.items

     
            const date = new Date()
            const dateShort = date.toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
            .replace(/\//g, '-');
       
            const delivery = new Date(date.getTime() + 10 * 24 * 60 * 60 * 1000);
            const deliveryDate = delivery.toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
            .replace(/\//g, '-');
       
            const order = new orderModel({  
               userId:userid,
               deliveryAddress:address,
               paymentMethod:payment,
               reducedTotal:reducedTotal,
               status:status,
               date:dateShort,
               expectedDelivery:deliveryDate,
               items:cartItem,
               
       
            })
            let orderData = await order.save()
            const orderId = orderData._id
            const reducedAmount = orderData.reducedTotal
            const totalAmt = orderData.items.reduce((acc,item)=>{
               return acc+item.total_price
            },0)

            if(orderData.items.length > 0){ 
                orderData.items.forEach(async(orderItems)=>{
                   await productModel.findOneAndUpdate({_id:orderItems.product_id},{$inc:{quantity:-orderItems.quantity}})
                })
            }
            
            
            if(orderData && payment==='cod'){ 
               res.json({codSuccess:true})
               await cartModel.deleteMany({user_id:userid})
               const updateCouponUsed = await couponModel.updateOne({_id:couponid},{$push:{userUsed:{userid:userid}}})
                                   await couponModel.updateOne({_id:couponid},{$inc:{availability:-1}})
            }else if(orderData && payment==='upi'){
            //    if(reducedAmount){
                   generateRazorpay(orderId,orderData.reducedTotal,orderData,couponid).then(async(response)=>{
                       res.json(response)
                      await couponModel.updateOne({_id:couponid},{$push:{userUsed:{userid:userid}}})
                       await couponModel.updateOne({_id:couponid},{$inc:{availability:-1}})
                       console.log('resss:',response);
                       
                   })
            //    }else{
            //        generateRazorpay(orderId,totalAmt).then(async (response)=>{
            //            res.json(response)
            //            console.log('done');
            //            console.log('resss:',response);
            //         //    cartModel.deleteMany({user_id:userid})
                       
                       
            //        })
               
            // }
           }else if(orderData && payment==='wallet'){
               const userModel = await User.findOne({_id:userid})
               const walletBalance = userModel.wallet
               if(reducedAmount>walletBalance){
                   res.json({walletsuccess:false,message:'Insufficient Balance in Wallet!'})
               }else{
                   await User.findOneAndUpdate({_id:userid},{$inc:{wallet:-reducedAmount},$push:{walletHistory:{date:new Date,type:'Debit',amount:reducedAmount}}})
                   res.json({walletsuccess:true})
                   await cartModel.deleteMany({user_id:userid})
                   await orderModel.findOneAndUpdate({_id:orderData._id},{$set:{status:'placed'}})
                   await couponModel.updateOne({_id:couponid},{$push:{userUsed:{userid:userid}}})
                   await couponModel.updateOne({_id:couponid},{$inc:{availability:-1}})
                   
               }
           }
        

    

    } catch (error) {
        console.log(error.message)
    }
}


const generateRazorpay = (orderId,total_price,couponId) =>{
    console.log('oid:',orderId,'tot:',total_price);
    
        return new Promise((resolve,reject)=>{
            var options = {
                amount: total_price*100,  
                currency: "INR",
                receipt: orderId
                
              };
              instance.orders.create(options, function(err, order) {
                console.log('razororder:',order);
                resolve(order)
              }); 
        })
}

const verifyPayment = async(req,res)=>{ 

    const {order,payment} = req.body
    const userid = req.session.user_id
    console.log('oid:',order,'pmnt:',payment);
    if(order && payment){
        await cartModel.deleteMany({user_id:userid})
        await orderModel.findOneAndUpdate({_id:order.receipt},{$set:{status:'placed'}})
        // await couponModel.updateOne({_id:couponid},{$push:{userUsed:{userid:userid}}})
        //            await couponModel.updateOne({_id:couponid},{$inc:{availability:-1}})
        res.json({success:true})
        
    }else{
        res.json({success:false})
    }
}




const cancelOrder = async(req,res)=>{
    try {
        const userid = req.session.user_id
        const {productId,orderId,itemAmount} = req.body
        
        const orderData = await orderModel.findOneAndUpdate({userId:userid,'items.product_id':productId,_id:orderId},
        {$set:{'items.$.status':'Cancelled'}})
        

        if(orderData){
            if(orderData.paymentMethod==='upi'){
                await User.findOneAndUpdate({_id:userid},{$inc:{wallet:itemAmount},$push:{walletHistory:{date:new Date,type:'Credit',amount:itemAmount}}})
                
                res.json({success:true})
            }else{
                res.json({success:true})
            }
        }else{
            res.json({success:false})
        }
        
    } catch (error) {
        console.log(error.message)
    }
}



const loadOrderDetailsAdmin = async(req,res)=>{
    try {
        const orderId = req.query.id
        console.log('ooooid:',orderId);
        const users = await User.find()
        const order = await orderModel.findOne({_id:orderId}).populate('userId').populate('items.product_id')
        console.log(order);
        if(order){
            res.render('orderDetails',{order})
        }else{
            res.render('orders',{message:'something went wrong!'})
        }
          
        
    } catch (error) {
        console.log(error.message)
    }
}


const updateStatus = async(req,res)=>{
    try {
        
        const orderId = req.body.orderId
        const status = req.body.status
        const itemId = req.body.itemId
        const updateStatus = await orderModel.findOneAndUpdate({_id:orderId,'items._id':itemId},{$set:{'items.$.status':status}},{new:true})
          if(updateStatus){
            res.json({success:true})
          }else{
            res.json({success:false})
          }
        
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    loadCheckout,
    placeOrder,
    loadOrderDetails,
    cancelOrder,
    loadOrderDetailsAdmin,
    updateStatus,
    verifyPayment
}