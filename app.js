require('dotenv').config();
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");

const app=express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
  secret:"Educational website application",
  resave:false,
  saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/ProjectWebDB", { useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex",true);

const userSchema=mongoose.Schema({
  email:String,
  password:String,
  subject:String
  //userposts:postSchema
});

userSchema.plugin(passportLocalMongoose);

const User=new mongoose.model("User",userSchema);

passport.use(User.createStrategy());

//////////////SERIALISATION AND DESERIALISATION///////////////////

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.get("/",function(req,res){
  res.render("home");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.get("/subject",function(req,res){
  if (req.isAuthenticated()){
  res.render("subject");
} else {
  res.redirect("/login");
}
});

app.get("/subject/:subjectName",function(req,res){
    res.render(req.params.subjectName);
});

/////////////////////////////////POST/////////////////////////////////

app.post("/register", function(req, res){

  User.register({username: req.body.username}, req.body.password, function(err, user){
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/subject");
      });
    }
  });
});


app.post("/login", function(req, res){

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/subject");
      });
    }
  });
});

//   res.render("subject");
// });


app.post("/subject",function(req,res){
  res.render("subject");
});


// app.post("/subject/:subjectName",function(req,res){
//   res.render(req.params.subjectName)
// });

var aboutContent="Hi this is a website made with love for you!";
var contactContent="Contact us:abcd@gmail.com"
app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});


app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.listen(3000,function(){
  console.log("Server running on port 3000");
});
