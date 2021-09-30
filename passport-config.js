const LocalStrategy = require('passport-local').Strategy
const loginService = require('./loginService.js')

 function initialize(passport, findUserByEmail,getUserFromId) {
     
    const authenticateUser = async (email, password, done) => {

    
        try {
            let user = await loginService.findUserByEmail(email)
            if(!user){
                return done(null,false,req.flash("Users don't exists"))
            }
            if(user){
                let match = await loginService.comparePasswordUser(user,password)
                if (match === true){
                    return done(null,user,null)
                }else{
                    return done(null, false, req.flash("Errors",match));
                }
            }
        } 
        catch (e) {
            return done(e)
        }
    }


    passport.use(new LocalStrategy({
        usernameField: 'email',

    }, authenticateUser))
    passport.serializeUser((user, done) => done(null,user.id))
    passport.deserializeUser( async (id, done) => {  
    return done(null, await getUserFromId(id))
    })
}


module.exports = initialize