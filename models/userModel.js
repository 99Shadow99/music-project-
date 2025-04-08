const mongoose=require("mongoose");

const userSchema= new mongoose.Schema({
    userName:{
        type:String,
        trime:true,
        required:true
    },
    email:{
        type:String,
        required:true,
       
    },
    password:{
        type:String,
        trim:true,
        required:true
    },
    isAdmin: {
         type: Boolean,
          default: false 
        },
        

});

const userModel=mongoose.model("userModel",userSchema);

module.exports=userModel;
