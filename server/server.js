const express = require('express')
const app = express()

// request response and next
app.get('/', (req, res)=>{
    console.log("Here")
    // res.download("server.js")

    // res.status(500).json({"message": "error"})
    // res.send("Hi")
}) 


app.listen(3000)