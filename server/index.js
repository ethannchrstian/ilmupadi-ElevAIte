import express from "express";
import cors from "cors";

const app = express();         // now express is used
app.use(cors()); 

app.get("/getData", (req, res)=>{
    res.send("backend and front end connected");
});

app.listen(5000,()=>console.log("app is running on port 5000"));