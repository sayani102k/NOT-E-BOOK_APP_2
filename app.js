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

const postSchema=mongoose.Schema({
  subject:String,
  title:String,
  content:String
});

const userSchema=mongoose.Schema({
  email:String,
  password:String,
  subject:String,
  //userposts:postSchema
});

userSchema.plugin(passportLocalMongoose);

const User=new mongoose.model("User",userSchema);
const Post=new mongoose.model("Post",userSchema);

passport.use(User.createStrategy());
// passport.use(Post.createStrategy());

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

    var subjectame=req.params.subjectName;
    Post.find({},function(err,posts){
    res.render(req.params.subjectName,{posts: posts});
  });
  app.render(req.params.subjectName);
});


app.get("/compose", function(req, res){
    res.render("compose");
    const post = new Post({
      subject:req.body.subject,
      title: req.body.postTitle,
      content: req.body.postBody
    });
    post.save(function(err){
      if(!err){
        res.redirect("/compose");
      }
    });
});

app.post("/compose", function(req, res){

});

// ////////////////////////////////////////////////////////////////////////
//
//
//   const subjectName=req.params.subjectName;
//   console.log(subjectName);
//   Post.find({},function(err,posts){
//     res.render(subjectName,{posts: posts});
//   });
//   User.findById(req.user.id,function(err,foundUser){
//     if(err){
//       console.log(err);
//     }else{
//       if(foundUser){
//         foundUser.subject=subjectName;
//         foundUser.save(function(){
//           //res.render("subjectName");
//           res.render(req.params.subjectName);
//         });
//       }
//     }
//
//   });
//   User.find({subject:subjectName}, function(err, foundUsers){
//   if (err){
//     console.log(err);
//   } else {
//     if (foundUsers) {
//       res.render(subjectName, {usersWithPosts: foundUsers});
//     }
//   }
// });

///////////////////////////////////////////////////////////////////////

//{"post": {$ne: null}}
// User.find({subject:subjectName},function(err,subjectUsers){
//   if(subjectUsers){
//
// res.render(subjectName, {usersWithPosts: subjectUsers});
//
// }

// app.get("/submit", function(req, res){
//   if (req.isAuthenticated()){
//     User.findOne({post:req.body.post},function(err){
//       if(err){
//         console.log(err);
//       }else{
//         res.render("submit");
//
//       }
//     });
//   } else {
//     res.redirect("/subject");
//   }
// });
// app.get("/secrets", function(req, res){
//
// });

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
        console.log(req.user.id);
        res.redirect("/subject");
      //   if({subject:{$ne:null}}){
      //   res.redirect("/subject/science");
      // }else{
      //   res.redirect("/subject");
      // }
      });
    }
  });
});

//   res.render("subject");
// });


app.post("/subject",function(req,res){
  res.render("science");
});


app.post("/subject/:subjectName",function(req,res){

});

app.get("/posts/:postId", function(req, res){

  const requestedPostId =req.params.postId;

  Post.findOne({_id: requestedPostId}, function(err, post){
      res.render("post", {
        title: post.title,
        content: post.content
      });
  });
});

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
