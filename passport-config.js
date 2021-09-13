const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Access = require('./schema');
const hash = require('hash-converter');
passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        session: false
    },
    async function(email, password , done) {
      email = hash.SHA256(email);
      Access.findOne({ email: email },async(err,res)=>{
          if(err){
            console.log('error in finding user ---> passport',err);
            return done(err);
          }if(!res){
              console.log('Account not Exist');
              return done(null,false);
          }
          const access = hash.SHA256(password); 
          if(res.password === access){
              return done(null,res);
          }else{
              console.log('Invalid Email/Password');
              return done(null,false);
          }
      });
    }
));
passport.serializeUser(function(user,done){
    return done(null,user.id);
});
passport.deserializeUser(function(id,done){
    Access.findById(id,(err,user)=>{
        if(err){
          console.log('error in finding user ---> passport',err);
          return done(err);
        }
        return done(null,user);
    });
});
module.exports = passport;