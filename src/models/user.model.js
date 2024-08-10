const mongoose = require("mongoose");

const userScehma = new mongoose.Schema(
    {
        email:{
            type:String,
            required:true,
            trim:true,
            lowercase: true,
            unique: true,
            index:true
        },
        password:{
            type:String,
            required:[true, 'Password is required']
        },
        firstName:{
            type:String,
            required:true,
            trim:true
        },
        lastName:{
            type:String,
            required:true,
            trim:true,
        },
        avatarUrl:{
            type:String,
            trim:true,
            default: ""
        },
        phoneNumber:{
            type:String,
            trim:true,
        },
        gender:{
            type:String,
        },
        city:{
            type:String,
        },
        state:{
            type:String,
        },
        martialStatus:{
            type:Boolean
        },
        previousIternaries:[{                                   // Iternaries that the user has finalalised for booking in the past
            type: mongoose.Schema.Types.ObjectId,
            ref: "Iternary"
        }]
    
    },
    {
        timestamps: true,
    }   
)


module.exports =  mongoose.model("User", userScehma);