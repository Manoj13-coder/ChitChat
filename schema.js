require('dotenv').config();
const mongoose = require('mongoose');
const DB = process.env.DB;
mongoose.connect(DB).then((res)=>{
    console.log('Success');
}).catch((err)=>{
    console.log('Failure');
})
/*mongoose.connect('mongodb://localhost:27017/user').then((res)=>{
    console.log('Success');
}).catch((err)=>{
    console.log('Failure');
})*/
const Ps = new mongoose.Schema({
    name : {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true
    },
    password : {
        type: String,
        required: true
    },
    recover : {
        type: String,
        required: true
    }
});
const Access = new mongoose.model('Credentials',Ps);

module.exports = Access;