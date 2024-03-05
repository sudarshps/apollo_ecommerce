const couponModel = require('../model/couponModel')





const loadCoupon = async(req,res)=>{
    try {
        const coupon = await couponModel.find()
        res.render('coupon',{coupon})
    } catch (error) {
        console.log(error.message)
    }
}

const loadAddCoupon = async(req,res)=>{
    try {
        
        res.render('addCoupon')
    } catch (error) {
        console.log(error.message)
    }
}

const postAddCoupon = async(req,res)=>{
    try {
        const {name,couponCode,couponAvailability,couponDescription,discountAmount,minAmount,expiryDate} = req.body
        
        const existCoupon = await couponModel.findOne({couponCode:{$regex:new RegExp(couponCode), $options:'i'}})
        if (existCoupon) {
            res.send({ success: false, message: 'Coupon code already exists' })
          } else {
            const coupon = new couponModel({ 
              couponName: name,
              couponCode: couponCode.toUpperCase(),
              discountAmount: discountAmount,
              minAmount: minAmount,
              couponDescription: couponDescription,
              availability: couponAvailability,
              expiryDate: expiryDate,
              status: true
      
            })
      
            const couponData = await coupon.save()
            if(couponData){
                res.send({success:true,message:'coupon added!'})
            }else{ 
                res.send({success:false,message:'error in coupon adding'})
            }

            
    }
} catch (error) {
    console.log(error.message)
}
}


const dltCoupon = async(req,res)=>{
    try {
        const couponCode = req.body.coupon
        const dltCoupon = await couponModel.findOneAndDelete({couponCode:couponCode})
        if(dltCoupon){
            res.send({success:true,message:'deletion successful!'})
        }else{
            res.send({success:false,message:'deletion failed!'})
        }
    } catch (error) {
        console.log(error.message)
    }
}



const applyCoupon = async(req,res)=>{
    try {
        const userid = req.session.user_id
        const {couponCode,totalAmount} = req.body
        const couponData = await couponModel.findOne({couponCode:couponCode})

        req.session.coupon = couponData
        let discountTotal = 0 


        if(couponData){
            let currentDate = new Date()

            let minAmount = couponData.minAmount
            if(totalAmount >= minAmount){
                if(currentDate <= couponData.expiryDate && couponData.status !== false){
                    const id = couponData._id
                    const couponUsed = await couponModel.findOne({_id:id,'userUsed.userid':userid})
                    if(couponUsed){
                        res.send({usedCoupon:true})
                    }else{
                        if(req.session.couponApplied===false){
                            
                            let discountAmount = couponData.discountAmount
                            discountTotal = totalAmount - discountAmount
                            req.session.couponApplied = true
                            res.send({couponApplied:true,discountTotal,discountAmount,couponid:id})
                            
                        }else{
                            res.send({onlyOneTime:true})
                        }
                    }
                }else{
                    res.send({expired:true})
                }
            }else{
                res.send({shouldMinAmount:true,minAmount})
            }
        }else{
            res.send({wrongCoupon:true})
        }
        
        
    } catch (error) {
        console.log(error.message)
    }
}


const removeUserCoupon = async(req,res)=>{
    try {
        const {couponCode,totalAmount} = req.body
        if(req.session.couponApplied===true){
            req.session.couponApplied = false
            res.send({removeCoupon:true,totalAmount})
        }else{
            console.log('error in couponremoval');
        }
        
        

    } catch (error) {
        console.log(error.message)
    }
}


module.exports ={
    loadCoupon,
    loadAddCoupon,
    postAddCoupon,
    dltCoupon,
    applyCoupon,
    removeUserCoupon
}
