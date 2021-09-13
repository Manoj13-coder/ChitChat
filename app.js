require('dotenv').config();
const express = require('express');
const session = require('express-session');
const upload = require('express-fileupload');
const path = require('path');
const Access = require('./schema.js');
const hash = require('hash-converter');
const passport = require('./passport-config.js');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'./views'));
app.use(express.static(path.join(__dirname,'./styles')));
app.use(express.urlencoded());
app.use(upload());
let add;
let SECRETPASS;
const text = process.env.RANDOM;
for(let i=0;i<10;i++){
    let S = Math.floor(Math.random()*6102);
    let E = Math.floor(Math.random()*6102);
    if(S > E){
        let temp = S;
        S = E;
        E = temp;
    }
    for(let i=S;i<=E;i++){
        if(text[i] !== undefined){
            add+=text[i];
        }
    }
    SECRETPASS = hash.SHA256(add);
}
let x;
io.on('connection',socket=>{
    x = socket.id;
    socket.on('join',function(room){
        socket.join(room);
    });
    socket.on('message',function(message){
        socket.to(message.room).emit('message',message);
    });
});
app.use(session({
    name:'ChitChat',
    secret:SECRETPASS,
    saveUninitialized: false,
    resave: false,
    failureFlash:true,
    cookie:{
        maxAge : (1000*60*60*24)
    }
}));
app.use(passport.initialize());
app.use(passport.session());
app.get('/',(req,res)=>{
    if(req.isAuthenticated()){
        return res.status(200).render('chat',{
            room : x,
            user : req["user"].name
        });
    }else{
        return res.status(200).render('Signup');
    }
});
app.get('/signup',(req,res)=>{
    if(req.isAuthenticated()){
        return res.status(200).render('chat',{
            room : x,
            user : req["user"].name
        });
    }else{
        return res.status(200).render('Signup');
    }
});
app.post('/signup',async(req,res)=>{
    let {name,email,password} = req.body;
    if(!email || !password){
        return res.status(400).json('Invalid credentials');
    }else{
        password = hash.SHA256(password);
        email = hash.SHA256(email);
        const recover = hash.SHA256(password+email+password+email);
        try{
            const data = await Access.findOne({email : email});
            if(data){
                return res.status(400).json('Account already exist');
            }else{
                try{
                    const x = new Access({
                        name : name,
                        email : email,
                        password : password,
                        recover : recover
                    });
                    await x.save();
                    return res.status(200).render('Login');
                }catch(err){
                    console.log(err);
                    return res.status(404).json('Unknown error');
                };
            }
        }catch(err){
            console.log(err);
            return res.status(404).json('Unknown error');
        }
    }
});
app.get('/login',(req,res)=>{
    if(req.isAuthenticated()){
        return res.status(200).render('chat',{
            room : x,
            user : req["user"].name
        });
    }else{
        return res.status(200).render('Login');
    }
})
app.post('/login',passport.authenticate('local', { failureRedirect: '/login' }),async(req,res)=>{
    return res.status(200).render('chat',{
        room : x,
        user : req["user"].name
    });
});
app.get('/home',(req,res)=>{
    if(req.isAuthenticated()){
        return res.status(200).render('chat',{
            room : x,
            user : req["user"].name
        });
    }else{
        return res.status(200).render('Login');
    }
});
app.get('/delete',(req,res)=>{
    const {access} = req.query;
    if(req.isAuthenticated() && access === 'Trust'){
        req.logOut();
        return res.status(200).render('Signup');
    }else if(req.isAuthenticated()){
        return res.status(200).render('chat',{
            room : x,
            user : req["user"].name
        });
    }else{
        return res.status(200).render('Signup');
    }
});
app.post('/change',async(req,res)=>{
    const {username} = req.body;
    let email = req["user"].email;
    await Access.updateOne({email : email},{
        $set:{name : username}
    });
    return res.status(200).render('chat',{
        room : x,
        user : req["user"].name
    });
})
app.get('*',(req,res)=>{
    if(req.isAuthenticated()){
        return res.status(200).render('chat',{
            room : x,
            user : req["user"].name
        });
    }else{
        return res.status(200).render('Login');
    }
})
http.listen(PORT,()=>{
    console.log(`Server listening on port : ${PORT}`);
});