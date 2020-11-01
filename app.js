//jshint esversion:6

require("dotenv").config();
const bodyParser = require("body-parser");
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const findOrCreate = require("mongoose-findorcreate");
const passport = require ("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/affiliateDB",{useNewUrlParser:true});
mongoose.set("useCreateIndex",true);

app.use(session({
  secret:"Our little secret",
  resave:false,
  saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

const userSchema = new mongoose.Schema({
  email:String,
  password : String,
  name: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user,done){
  done(null,user.id);
});

passport.deserializeUser(function(id,done){
  User.findById(id, function(err,user){
    console.log(err);
    done(err,user);
  });
});



app.get("/",function(req,res){
  res.render("home");
});

app.get("/products", function(req,res){
  res.render("products");
});











let port = process.env.PORT;
if (port == null || port == ""){
  port = 3000;
}

app.listen(port,function(req,res){
  console.log("Connected to server 3000");
});
