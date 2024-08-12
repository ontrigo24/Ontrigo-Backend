const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    service:"gmail",
    host:"smtp.gmail.com",
    port:587,
    secure:false,
    auth:{
        user: "gouravpanseja25@gmail.com",
        pass: "kubrwaqgdivqzdlq"
    }
});

const mailSender = async (email,title, body)=>{
    
    try{

        let info = await transporter.sendMail({

            from:{
                name: 'Gourav Panseja',
                address:process.env.MAIL_USER,
            },
            to: `${email}`,
            subject:`${title}`,
            text:`${body}`,
        })   
        
        console.log("mail succesfully sent ", info);

        return "mail sent successfull";

    }
    catch(err){
        console.log("ERROR WHILE SENDING EMAIL", err);
        console.log(err.message);
    }
}

module.exports = mailSender;