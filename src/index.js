import dotenv from "dotenv";
import connectDB from "./config/mongo.config.js";
import {app} from "./app.js";

dotenv.config({
    path: "./.env",
});

const PORT = process.env.PORT || 8000;

connectDB()
.then(() => {

    app.listen(PORT, () => {
        console.log(`server running at port ${PORT}`);
    });

    app.on("error", (err) => {
        console.log("ERROR from express", err);
        throw err;
    });
})
.catch((err) => {
        console.log("MONGO db connection async Error ", err);
});