const express = require('express');
const app = express();
const db=require("./config/mongooseConfig.js");
const userModel=require("./models/userModel.js");
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', async (req, res) => { 

    // try{
    //     const data= await userModel.create({
    //           userName:"John Doe",
    //           email:"ssd",
    //           password:"password123",
    //       })
    //       res.send('Welcome to the Music Player App!');
    //   }
    //       catch (error) {
    //           console.error('Error creating user:', error);
    //           res.status(500).send('Internal Server Error');
    //       }
    res.render("login.ejs");
});
app.post("/",async (req,res)=>{
    const{userName,email,password}=req.body;
const user = await userModel.findOne({email:email})
if(user){
    if(user.password===password){
        res.redirect("./home.ejs")
    }
    else{
        res.redirect("./login.ejs")
    }
}
else{
    res.redirect("./register.ejs")
}


})
app.get("/register",async (req,res)=>{
    res.render("register.ejs")
})
app.post("/register",async(req,res)=>{
    try{
    const {userName,password,email}=req.body;
   const user=userModel.findOne({email:email})
   if(user){
    res.redirect("/");
   }
   else{

       await userModel.create({
            userName:userName,
            email:email,
            password:password,
        })
        res.redirect("/")
   }
}
catch(err){
    console.error("Error creating user:", err); // ✅ Logs the actual error
    res.status(500).json({ error: "Error in creating user" });
    }
})




app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
