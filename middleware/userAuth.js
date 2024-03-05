const User = require('../model/userModel')


// const isLogin = async(req,res,next)=>{
//     try {
//         if(req.session.user_id){ 
//             res.redirect('/userProf')
//         }else{
//             res.render('login')
//         }
//     } catch (error) {
//         console.log(error.message)
//     }
// }


const isLogin = async(req,res,next)=>{
    try {
        if(req.session.user_id){ 

            const userData = await User.findById({_id:req.session.user_id})

            if(userData && userData.isBlocked===true){
                req.session.destroy()
                res.redirect('/login')
            }else{
                next()
            }
            
        }else{
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message)
    }
}

// const cartSession = async(req,res,next)=>{
//     try {
//         if(req.session.user_id){
//             res.render('cart')
//         }else{
//             res.render('login')
//         }
//     } catch (error) {
//         console.log(error.message)
//     }
// }


const isLogout = async(req,res,next)=>{
    try {
        if(req.session.user_id){
            res.redirect('/home')
        }
        else{
            next()
        }
    } catch (error) {
        console.log(error.message)
    }
}



module.exports = {
    isLogin,
    // cartSession,
    isLogout
}