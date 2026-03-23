import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

import connectDB from "./db/index.js";
import {app} from "./app.js";



connectDB()/// ITS store a promise
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is running on port ${process.env.PORT || 8000}`);
    });
    app.on("error",(err)=>{
        console.log("error",err);
        throw err;
    })
})
.catch((err)=>{
    console.log("MONGO DB CONNECTION FAILED",err)
})