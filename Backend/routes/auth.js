const express  = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');
const JWT_SECRET ='sober';


//ROUTE 1 : create a user using:POST "/api/auth/createuser". No login required.
router.post('/createuser',[
    body('name','Enter a valid name').isLength({ min:3 }),
    body('email','Enter a valid email').isEmail(),
    body('password','Password must be atleast 5 characters.').isLength({ min:5 }),
],async (req,res)=>{

  //If there are errors.return bad request and errors.
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({ errors: result.array() });
  }

  //check whether the user with this email exist already.
  try{
  let user = await User.findOne({email:req.body.email})
  if(user){
    return res.status(400).json({error:"Sorry user with this email already exists."});
  }
  
  const salt = await bcrypt.genSalt(10);
  secPass = await bcrypt.hash(req.body.password,salt);
  // craete a new users
  user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password:secPass
  });
  // res.json(user);

  const data = {
    user:{
       id:user.id,
    }
  }
  const authtoken = jwt.sign(data,JWT_SECRET);
  // console.log(authtoken);
  res.json(authtoken);

  //catch errors

  }catch(error){
 console.log(error.message);
res.status(500).send("Internal Server Error");
  }
  // Since we are using async await no need of .then()
  // .then(user => res.json(user))
  // .catch(err =>{console.log(err)
  // res.json({error :' Please enter a unique value for email.',message:err.message})})
  
  // below code is useful when we want the request from body present of thunderclient.
  // const user = User(req.body);
  // user.save(); -- This save the data in database mention in mongoURI.
  
  // console.log(req.body);
  // res.send(req.body);
   
})

//ROUTE 2: Authenticate the user using Post: /api/auth/login .No login required
router.post('/login',[
  body('email','Enter a valid email').isEmail(),
  body('password','Password cannot be blank').exists(),
],async (req,res)=>{
//If there are errors.return bad request and errors.
const result = validationResult(req);
if (!result.isEmpty()) {
  return res.status(400).json({ errors: result.array() });
}

const {email,password} = req.body;

try{
  let user = await User.findOne({email});
  if(!user){
    return res.status(400).json({error:"Try to login with correct credentials."});
  }

  const passwordCompare = await bcrypt.compare(password,user.password);
  
  if(!passwordCompare){
    return res.status(400).json({error:"Try to login with correct credentials."});
  }
  const data = {
    user:{
       id:user.id,
    }
  }
  const authtoken = jwt.sign(data,JWT_SECRET);
  res.json({authtoken});

}catch(error){
  console.log(error.message);
  res.status(500).send("Internal Server Error");
}

})

//ROUTE 3: Get the loggedin users details using Post: /api/auth/getuser . Login required
router.post('/getuser',fetchuser ,async (req,res)=>{
try{
  userid = req.user.id;
let user = await User.findById(userid).select("-password")
res.send(user);
}catch(error){
  console.log(error.message);
  res.status(500).send("Internal Server Error");
}

})
module.exports = router;