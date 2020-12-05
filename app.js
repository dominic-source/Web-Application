//jshint esversion:6
require("dotenv").config();
const bodyParser = require("body-parser");
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const findOrCreate = require("mongoose-findorcreate");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const getDate = require(__dirname + "/date.js");
const _ = require("lodash");
const {
  v4: uuidv4
} = require("uuid");
const app = express();


app.use(bodyParser.urlencoded({
  extended: true
}));

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public/"));

mongoose.connect("mongodb://localhost:27017/affiliateDB", {
  useNewUrlParser: true
});
mongoose.set("useCreateIndex", true);

app.use(session({
  secret: "Our little secret",
  resave: false,
  saveUninitialized: false
}));


/**********************initialize passport and session ******************/
app.use(passport.initialize());
app.use(passport.session());
/**********************end initialize passport and session ******************/


//Schema area

const blogSchema = new mongoose.Schema({
  authorName: String,
  title: String,
  imageurl: String,
  content: String,
  time: String,
  typeofBlog: String,
  views: {
    type: Number,
    default: 0
  }
});

const integrationSchema = new mongoose.Schema({
  apiName: String,
  apiImageAddress: String,
  apiLinkAddress: String,
  apiCompanySupplier: String
});

const customerSchema = new mongoose.Schema({
  nameOfCustomer: String,
  emailAddress: String,
  transactionId: String,
  websiteType: String,
  payment: Boolean,
  time: String,
  delivered: Boolean
});
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  surname: String,
  username: String,
  googleId: String,
  customer: customerSchema
  // customer: {type:mongoose.Schema.Types.ObjectId,ref:"Customer"}

});

//End of schema area


/************* Schema plugin ***********************************/
//user Schema
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

/************* End of Schema plugin ***********************************/


/*************** models *********************/
const User = mongoose.model("User", userSchema);
const Customer = mongoose.model("Customer", customerSchema);
const Integration = mongoose.model("Integration", integrationSchema);
const Blog = mongoose.model("Blog", blogSchema);
/*************End of models*********************/


/*******************Creating Strategy***********************/
passport.use(User.createStrategy());
/*******************End of Creating Strategy***********************/


/*****************Serializing the user ***************************/
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    console.log(err);
    done(err, user);
  });
});
/*****************End of Serializing the user ***************************/


/******************google Strategy**************************/
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/member",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    // console.log(profile)
    User.findOrCreate({
      googleId: profile.id
    }, function(err, user) {
      return cb(err, user);
    });
  }
));
/******************google Strategy**************************/

//Registration and signing in

app.get('/auth/google',
  passport.authenticate('google', {
    scope: ["profile"]
  })
);

app.get('/auth/google/member',
  passport.authenticate('google', {
    failureRedirect: '/login'
  }),
  function(req, res) {
    // Successful authentication, redirect secrets.
    res.render("customer", {
      id: req.user.id
    });
  });

app.get("/register", function(req, res) {
  Blog.find({}, function(err, foundItem) {
    if (err) {
      console.log(err);
    } else {
      res.render("register", {
        blogPost: foundItem
      });
    }
  });
});

app.get("/login", function(req, res) {
  Blog.find({}, function(err, foundItem) {
    if (err) {
      console.log(err);
    } else {
      res.render("login", {
        blogPost: foundItem
      });
    }
  });
});

app.post("/customer/:param", function(req, res) {
  if (req.isAuthenticated()) {

    User.findById(req.params.param, function(err, founditem) {
      if (err) {
        console.log(err);
      } else {
        const webType = req.body.affiliate + " " + req.body.blog + " " + req.body.portfolio + " " + req.body.others;
        const customer = new Customer({
          nameOfCustomer: founditem.username,
          emailAddress: founditem.email,
          transactionId: uuidv4(),
          websiteType: webType,
          payment: false,
          time: getDate.getDate(),
          delivered: false,
        });
        customer.save();

        User.updateOne({
            _id: req.params.param
          }, {
            $set: {
              customer: customer
            }
          },
          function(err, result) {});
      }
    });
    res.redirect("/member");
  } else {
    res.redirect("/login");
  }
});



app.get("/member", function(req, res) {
  if (req.isAuthenticated()) {
    Blog.find({}, function(err, foundItem) {
      if (err) {
        console.log(err);
      } else {
        User.findById({_id:req.user._id},function(err,customFound){
          if(!err){
            Customer.findById({_id:customFound.customer._id},function(err,found){
              if(!err){
              res.render("member",{customer:found,blogPost: foundItem});
            } else{console.log("Failed");}

            });
            console.log(customFound);

          } else{console.log(err);}
        });

      }
    });

  } else {
    res.redirect("/login");
  }
});

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

app.post("/register", function(req, res) {
  User.register({
    username: req.body.username,
    email: req.body.email,
    surname: req.body.surname,
    name: req.body.name,
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.render("customer", {
          id: req.user.id
        });
      });
    }
  });
});

app.post("/login", function(req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, function(err) {
    if (err) {
      console.log(err);
      res.redirect("/login");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/member");
      });
    }
  });
});
//End of registeration and signing in


// Main part of dome technologies
app.get("/", function(req, res) {
  Blog.find({}, function(err, foundItem) {
    if (err) {
      console.log(err);
    } else {
      res.render("home", {
        blogPost: foundItem
      });
    }
  });
});

app.get("/myBlog", function(req, res) {
  Blog.find({}, function(err, foundItem) {
    if (err) {
      console.log(err);
    } else {
      res.render("myBlog", {
        blogPost: foundItem
      });
    }
  });
});

app.get("/products", function(req, res) {

  Blog.find({}, function(err, foundItem) {
    if (err) {
      console.log(err);
    } else {
      res.render("payment", {
        blogPost: foundItem
      });
    }
  });

});


app.get("/Marketplace", function(req, res) {
  Blog.find({}, function(err, foundItem) {
    if (err) {
      console.log(err);
    } else {
      res.render("Marketplace", {
        blogPost: foundItem
      });
    }
  });
});

// Admin part of dome technologies
app.get("/dashboard", function(req, res) {
  User.find({}, function(err, foundItem) {
    if (err) {
      console.log(err);
    } else {
      res.render("customerEntry", {
        customer: foundItem
      });
    }
  });
});

app.get("/blog", function(req, res) {
  res.render("blog");
});

app.post("/blog", function(req, res) {

  const blog = new Blog({
    authorName: req.body.author,
    title: _.lowerCase(req.body.title),
    content: req.body.content,
    time: getDate.getDate(),
    imageurl: req.body.url,
    typeofBlog: req.body.typeofBlog
  });
  blog.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Successful");
    }
  });
  res.redirect("/blog");
});


app.get("/reports", function(req, res) {
  Blog.find({}, function(err, foundItem) {
    if (err) {
      console.log(err);
    } else {
      res.render("reports", {
        report: foundItem
      });
    }
  });
});

app.get("/integration", function(req, res) {
  res.render("integration");
});

app.post("/integration", function(req, res) {
  if (typeof(req.body.apiNames) === "object") {
    for (var i = 0; i < req.body.apiNames.length; i++) {
      const integration = new Integration({
        apiName: req.body.apiNames[i],
        apiImageAddress: req.body.apiImageAddresses[i],
        apiLinkAddress: req.body.apiAddresses[i],
        apiCompanySupplier: req.body.apiCompanySupplier[i]
      });
      integration.save(function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successful");
        }
      });
    }

  } else {
    const integration = new Integration({
      apiName: req.body.apiNames,
      apiImageAddress: req.body.apiImageAddresses,
      apiLinkAddress: req.body.apiAddresses,
      apiCompanySupplier: req.body.apiCompanySupplier
    });
    integration.save(function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Successful");
      }
    });
  }
  res.redirect("/integration");
});

app.get("/myBlog/message/:param", function(req, res) {

  Blog.findById(req.params.param, function(err, foundItem) {
    if (err) {
      console.log(err);
    } else {
      Blog.updateOne({
        _id: req.params.param
      }, {
        $set: {
          views: foundItem.views + 1
        }
      }, function(err) {
        if (err) {
          console.log(err);
        } else {}
      });
      res.render("message", {
        blogPost: foundItem
      });
    }
  });
});


app.post("/search", function(req, res) {
  Blog.find({
    title: _.lowerCase(req.body.blogtitle)
  }, function(err, foundItem) {
    if (err) {
      console.log(err);
    } else {
      if (foundItem.length === 0) {
        res.redirect("/myBlog");
      } else {
        res.render("searchBlog", {
          blogPost: foundItem
        });
      }
    }
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function(req, res) {
  console.log("Connected to server 3000");
});
