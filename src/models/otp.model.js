const mongoose = require("mongoose");
const {mailSender} = require("../utils")
const otpSchema = new mongoose.Schema({
    code:{
        type:Number,
        required:[true, 'OTP is required'],
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

otpSchema.pre("save", async(next)=>{

    try{
        await sendVerificationEmail(this.email, this.code);
        next();
    }
    catch(err){
        console.log("OTP EMAIL SENDING FAILED");
        console.log(err);
    }
    
})

async function sendVerificationEmail(email, code){
    try{
        const emailResponse = await mailSender(email, "Your Ontrigo verification code is: ", code);

        console.log(emailResponse);
    }
    catch(err){
        console.log("ERROR WHILE SENDING VERIFICATION MAIL");
        console.log(err);
    }
}

module.exports = mongoose.model("Otp", otpSchema);