const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

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
        bio:{
            type:String,
            trim:true,
        },
        avatarUrl:{
            type:String,
            trim:true,
            default: ""
        },
        coverUrl:{
            type:String,
            trim:true,
        },        
        reels:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Reel",
            default:[],
        }],
        provider:{
            type:String,
            enum:["local", "google", "facebook"],
            default:"local",
            required:true,
        },
        rewards:[{      // provide points with the profile data dynamically
            type:mongoose.Schema.Types.ObjectId,
            ref:"Reward",
        }],
        previousIternaries:[{                                   // Iternaries that the user has finalalised for booking in the past
            type: mongoose.Schema.Types.ObjectId,
            ref: "Iternary"
        }]
    
    },
    {
        timestamps: true,
    }   
)

// userScehma.pre("save",async function(next){

//     if(this.isModified("password")){
//        this.password = await bcrypt.hash(this.password, 10);

//        console.log("hashed password" , this.password);
//     }
//     next();
// })

userScehma.methods.generateAccessToken = function(){
    return jwt.sign( 
        {
            _id: this._id,
            email: this.email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    )
}

userScehma.methods.verifyPassword = async function(password){
    return await bcrypt.compare(password, this.password);
}

module.exports =  mongoose.model("User", userScehma);