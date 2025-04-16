const mongoose  = require('mongoose');


const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    googleId: {
        type: String,
        sparse: true
    },
    profilePicture: String,
    authMethod: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    }
})


const UserModel=mongoose.model('user',userSchema);

module.exports=UserModel;