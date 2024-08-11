const mongoose = require("mongoose");
const {mailSender} = require("../utils")

const otpSchema = new mongoose.Schema({
    otp:{
        type:String,
        required:[true, 'OTP is required'],
    },
    type:{
        type:String,
        enum:["signup", "forgotPassword"],
        required:true
    },
    
    email:{
        type:String,
        required:[true, 'email is required'],
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires:5*60,
    }
});

// otpSchema.pre("save", async(next)=>{
//     try{
//         const emailResponse = await mailSender(this.email, "Your Ontrigo verification code is: ", this.otp);
//         console.log("EMAIL RESPONSE:" , emailResponse);
//     }
//     catch(err){
//         console.log("ERROR WHILE SENDING VERIFICATION MAIL");
//         console.log(err);
//     }
// })

module.exports = mongoose.model("Otp", otpSchema);