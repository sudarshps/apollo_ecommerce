const isLogin = async(req,res,next)=>{
    try {
        if(req.session.user_id){
            res.redirect('/userProf')
        }else{
            res.render('login')
        }
    } catch (error) {
        console.log(error.message)
    }
}

const cartSession = async(req,res,next)=>{
    try {
        if(req.session.user_id){
            res.render('cart')
        }else{
            res.render('login')
        }
    } catch (error) {
        console.log(error.message)
    }
}
const isLogout = async(req,res,next)=>{
    try {
        if(req.session.user_id){}
        else{
            res.redirect('/')
        }next()
    } catch (error) {
        console.log(error.message)
    }
}



module.exports = {
    isLogin,
    cartSession,
    isLogout
}