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
const https = require("https");
const random = require(__dirname + "/random.js");
const bcrypt = require("bcrypt");
const saltRounds = 7;
//security for headers
// const helmet = require("helmet");
// app.use(helmet());


//End of security headers

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.use(express.static("public"));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));


/**********************initialize passport and session ******************/
app.use(passport.initialize());
app.use(passport.session());
/**********************end initialize passport and session ******************/
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});
/********************************************* create storage engine **************************/
//Schema area
const messageSchema = new mongoose.Schema({
  message: String,
  time: String,
});

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
  },
  message: [messageSchema]
});

const paymentSchema = new mongoose.Schema({
  email: String,
  id: Number,
  customerCode: String,
  Amount: Number,
  currency: String,
  status: String,
  reference: String,
});

const integrationSchema = new mongoose.Schema({
  apiName: String,
  apiImageAddress: String,
  apiLinkAddress: String,
  apiCompanySupplier: String
});

const memberSchema = new mongoose.Schema({
  projectName: String,
  transactionId: String,
  budget: String,
  projectDescription: String,
  payment: String,
  dateOfTransaction: String,
  timeDuration: String,
  delivered: String,
  dateDelivered: String,
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  organisation_name: String,
  googleId: String,
  active: Boolean,
  secret: String,
  passcode: String,
  member:[memberSchema]
});

//End of schema area
/************* Schema plugin ***********************************/
//user Schema
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

/************* End of Schema plugin ***********************************/


/*************** models *********************/
const User = new mongoose.model("User", userSchema);
const Member = new mongoose.model("Member", memberSchema);
const Integration = new mongoose.model("Integration", integrationSchema);
const Blog = new mongoose.model("Blog", blogSchema);
const Payment = new mongoose.model("Payment", paymentSchema);
const Message = new mongoose.model("Message", messageSchema);
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


/**************************Registration and signing in*******************************/

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
    res.render("member", {
      id: req.user.id
    });
  });


app.get("/register", function(req, res) {
  Blog.find({}, function(err, foundItem) {
    if (err) {
      console.log(err);
    } else {
      res.render("register", {
        blogPost: foundItem,
        words: null,
        email: null
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
        blogPost: foundItem,
        words: null
      });
    }
  });
});


app.get("/member", function(req, res) {
  if (req.isAuthenticated()) {
    Blog.find({}, function(err, foundItem) {
      if (err) {
        console.log(err);
      } else {
        let foundIt = req.user;
        let item = {
          username: foundIt.username,
          id: foundIt._id,
          email: foundIt.email,
          organisation: foundIt.organisation_name,
          member: foundIt.member
        };
        res.render("member", {
          blogPost: foundItem,
          member: item,
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
  let password = req.body.password;
  let password2 = req.body.password2;
  let username = req.body.username;
  let email = req.body.email;
  User.findOne({
    username: username
  }, function(err, found) {
    if (found) {
      Blog.find({}, function(err, foundItem) {
        if (!err) {
          User.findOne({
            email: email
          }, function(err, found) {
            if (found) {
              res.render("register", {
                blogPost: foundItem,
                words: "username already in use. Suggested username: " + username + random.random(),
                email: "Email already taken by another user."
              });
            } else {
              res.render("register", {
                blogPost: foundItem,
                words: "username already in use. Suggested username: " + username + random.random(),
                email: null
              });
            }
          });
        }
      });
    } else if (!found) {
      Blog.find({}, function(err, foundItem) {
        if (!err) {
          User.findOne({
            email: email
          }, function(err, found) {
            if (found) {
              res.render("register", {
                blogPost: foundItem,
                words: null,
                email: "Email already taken by another user."
              });
            }
          });
        }
      });
      // server side validation
      if (password === password2) {
        User.register({
            username: username,
            email: email,
            organisation_name: req.body.organisation
          }, req.body.password,
          function(err, user) {
            if (!err) {
              passport.authenticate("local", {
                failureRedirect: "/errorRegister"
              })(req, res, function() {
                res.redirect("/login");
              });
            } else {
              res.redirect("/errorRegister");
            }
          });
      } else {
        res.redirect("/errorRegister");
      }
    } else {
      console.log(err);
      res.redirect("/errorRegister");
    }
  });
});


app.get("/errorRegister", function(req, res) {
  res.render("errorRegister");
});


app.post("/login", function(req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err) {
    if (err) {
      console.log("There was an error");
    } else {
      passport.authenticate("local", {
        failureRedirect: "/failureLogin"
      })(req, res, function() {
        if (!err) {
          res.redirect("/member");
        }
      });
    }
  });
});


app.post("/registerAdmin", function(req, res) {
  let password = req.body.password;
  let password2 = req.body.password2;
  let username = req.body.username;
  let email = req.body.email;
  let passcode = req.body.passcode;

  bcrypt.hash(passcode, saltRounds)
    .then(function(hash) {
      if (hash) {
        User.findOne({
          username: username
        }, function(err, found) {
          if (found) {
            Blog.find({}, function(err, foundItem) {
              if (!err) {
                User.findOne({
                  email: email
                }, function(err, found) {
                  if (found) {
                    res.render("RegisterAdmin", {
                      blogPost: foundItem,
                      words: "username already in use. Suggested username: " + username + random.random(),
                      email: "Email already taken by another user."
                    });
                  } else if (!found) {
                    res.render("RegisterAdmin", {
                      blogPost: foundItem,
                      words: "username already in use. Suggested username: " + username + random.random(),
                      email: null
                    });
                  }
                });
              }
            });
          } else if (!found) {
            Blog.find({}, function(err, foundItem) {
              if (!err) {
                User.findOne({
                  email: email
                }, function(err, found) {
                  if (found) {
                    res.render("RegisterAdmin", {
                      blogPost: foundItem,
                      words: null,
                      email: "Email already taken by another user."
                    });
                  }
                });
              }
              if (password === password2) {
                User.register({
                    username: username,
                    email: email,
                    organisation_name: req.body.organisation,
                    passcode: hash
                  }, req.body.password,
                  function(err, user) {
                    if (!err) {
                      passport.authenticate("local", {
                        failureRedirect: "/errorRegister"
                      })(req, res, function() {
                        res.redirect("/admin");
                      });
                    } else {
                      res.redirect("/errorRegister");
                    }
                  });
              } else {
                res.redirect("/errorRegister");
              }
            });
          } else {
            console.log(err);
            res.redirect("/errorRegister");
          }
        });
      }
    })
    .catch(error => {
      console.log("Error somewhere: " + error);
    });
});


app.get("/registerAdmin", function(req, res) {
  Blog.find({}, function(err, foundItem) {
    if (err) {
      console.log(err);
    } else {
      res.render("RegisterAdmin", {
        blogPost: foundItem,
        words: null,
        email: null
      });
    }
  });
});


app.get('/admin', function(req, res) {
  Blog.find({}, function(err, foundItem) {
    if (err) {
      console.log(err);
    } else {
      res.render("admin", {
        blogPost: foundItem,
        words: null
      });
    }
  });
});


app.post("/admin", function(req, res) {
  User.findOne({
    username: req.body.username
  }, function(err, found) {
    if (found) {
      let hash = found.passcode;

      bcrypt.compare(req.body.passcode, hash).then(function(result) {
        if (result === true) {
          const user = new User({
            username: req.body.username,
            password: req.body.password,
          });

          req.login(user, function(err) {
            if (err) {
              console.log("There was an error");
            } else {
              passport.authenticate("local", {
                failureRedirect: "/failureLogin"
              })(req, res, function() {
                if (!err) {
                  res.redirect("/dashboard");
                }
              });
            }
          });
        } else {
          res.redirect("/errorRegister");
        }
      });
    } else {
      res.redirect("/errorRegister");
    }
  });
});

app.get("/failureLogin", function(req, res) {
  Blog.find({}, function(err, foundItem) {
    res.render("login", {
      blogPost: foundItem,
      words: "Invalid username or password."
    });
  });
});
/******************************* End of registeration and signing in ******************************/

/******************************** Beginning of business logic *****************************/
app.post("/transaction/create", function(req, res) {
  if (req.isAuthenticated()) {
    const projectName = req.body.projectName;
    const currency = req.body.currency;
    const budget = req.body.amount;
    const description = req.body.description;

    const member = new Member({
      projectName: projectName,
      transactionId: uuidv4(),
      budget: currency + budget,
      projectDescription: description,
      payment: "No payment yet",
      dateOfTransaction: getDate.getDate(),
      timeDuration: "A date of delivery will be fixed soonest",
      delivered: "Not yet delivered",
      dateDelivered: "Not yet delivered"
    });

    member.save();
    User.findOne({
      _id: req.user._id
    }, function(err, foundItem) {
      console.log(foundItem);
      foundItem.member.push(member);
      foundItem.save();
      res.redirect("/member");
    });
  }
});
/********************************** End of business logic ***********************************/


// Main part of cadatech
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


app.get("/products", function(req, res) {
  Blog.find({}, function(err, foundItem) {
    if (err) {
      console.log(err);
    } else {
      res.render("payment3", {
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


app.post("/search", function(req, res) {
  let blogTitle = req.body.blogtitle;
  if (blogTitle == "") {
    res.redirect("/myBlog");
  } else {
    Blog.find({
      title: _.startCase(blogTitle)
    }, function(err, foundItem) {
      if (err) {
        console.log(err);
      } else if (foundItem.length === 0) {
        res.render("searchBlog", {
          noItem: "Search not found!",
          rendernoItem: true
        });
      } else {
        res.render("searchBlog", {
          blogPost: foundItem,
          rendernoItem: false
        });
      }
    });
  }
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

// Admin part of cadatech
app.get("/dashboard", function(req, res) {
  if (req.isAuthenticated()) {
    bcrypt.compare(process.env.PASSCODE, req.user.passcode).then(function(result) {
      if (result) {
        User.find({}, function(err, foundItem) {
          if (err) {
            console.log(err);
          } else {
            res.render("customerEntry", {
              customer: foundItem
            });
          }
        });
      } else {
        res.redirect("/admin");
      }

    });
  } else {
    res.redirect("/admin");
  }
});

app.get("/blog", function(req, res) {
  if (req.isAuthenticated()) {
    bcrypt.compare(process.env.PASSCODE, req.user.passcode).then(function(result) {
      if (result) {
        res.render("blog");
      } else {
        res.redirect("/login");
      }
    });
  } else {
    res.redirect("/admin");
  }
});

app.post("/blog", function(req, res) {
  if (req.isAuthenticated()) {
    bcrypt.compare(process.env.PASSCODE, req.user.passcode).then(function(result) {
      if (result) {
        const blog = new Blog({
          authorName: req.body.author,
          title: _.startCase(req.body.title),
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

      } else {
        res.redirect("/login");
      }
    });
  } else {
    res.redirect("/admin");
  }
});

app.get("/reports", function(req, res) {
  if (req.isAuthenticated()) {
    bcrypt.compare(process.env.PASSCODE, req.user.passcode).then(function(result) {
      if (result) {
        Blog.find({}, function(err, foundItem) {
          if (err) {
            console.log(err);
          } else {
            res.render("reports", {
              report: foundItem
            });
          }
        });
      } else {
        res.redirect("/login");
      }
    });
  } else {
    res.redirect("/admin");
  }
});

app.get("/integration", function(req, res) {
  if (req.isAuthenticated()) {
    bcrypt.compare(process.env.PASSCODE, req.user.passcode).then(function(result) {
      if (result) {
        res.render("integration");
      } else {
        res.redirect("/login");
      }
    });
  } else {
    res.redirect("/admin");
  }
});

app.post("/integration", function(req, res) {
  if (req.isAuthenticated()) {
    bcrypt.compare(process.env.PASSCODE, req.user.passcode).then(function(result) {
      if (result) {
        if (typeof(req.body.apiNames) === "object") {
          for (var i = 0; i < req.body.apiNames.length; i++) {
            const integration = new Integration({
              apiName: req.body.apiNames[i],
              apiImageAddress: req.body.apiImageAddresses[i],
              apiLinkAddress: req.body.apiAddresses[i],
              apiCompanySupplier: req.body.apiCompanySupplier[i]
            });
            integration.save();
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
      } else {
        res.redirect("/login");
      }
    });
  } else {
    res.redirect("/admin");
  }
});

/******************* Delete blog and/or delete customer ******************/
app.post("/del_b", function(req, res) {
  bcrypt.compare(process.env.PASSCODE, req.user.passcode).then(function(result) {
    if (result) {
      let delBlogItem = req.body.delete;
      Blog.deleteOne({
        _id: delBlogItem
      }, function(err) {
        if (!err) {
          res.redirect("/reports");
        }
      });
    }
  });
});

app.post("/del_c", function(req, res) {
  bcrypt.compare(process.env.PASSCODE, req.user.passcode).then(function(result) {
    if (result) {
      let delCustomer1 = req.body.delete1;
      let delCustomer2 = req.body.delete2;
      let delCustomer3 = req.body.delete3;
      if (delCustomer1 !== undefined) {
        User.deleteOne({
          _id: delCustomer1
        }, function(err) {
          if (!err) {
            res.redirect("/dashboard");
          }
        });
      } else if (delCustomer2 !== undefined) {
        Member.findByIdAndRemove(delCustomer2, function(err, founditem) {
          if (!err) {
            User.findOne({
              _id: delCustomer3
            }, function(err, foundItem) {
              if (!err) {
                foundItem.member.forEach(function(item, index) {
                  if (item._id == delCustomer2) {
                    foundItem.member.splice(index, 1);
                    foundItem.save();
                    res.redirect("/dashboard");
                  }
                });
              }
            });
          }
        });
      }
    }
  });
});

/********************************* Payment point authentication *******************************/
app.get("/payment1", function(req, res) {
  res.render("payment1");
});

app.get("/payment3", function(req, res) {
  res.render("payment3");
});

app.post("/payment", function(reqs, resp) {
  const params = JSON.stringify({
    "email": reqs.body.emailAddress,
    "amount": reqs.body.amount * 100,
    "currency": reqs.body.currency
  });

  const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: '/transaction/initialize',
    method: "POST",
    headers: {
      Authorization: process.env.PAYSTACK_SECRET,
      'content-Type': 'application/json'
    }
  };

  const req = https.request(options, res => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      const myData = JSON.parse(data);
      resp.redirect("https://checkout.paystack.com/" + myData.data.access_code);
    });
  }).on('error', error => {
    console.error(error);
  });

  req.write(params);
  req.end();
});

app.get("/verify_transaction/:reference", function(reqs, resp) {
  const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: '/transaction/verify_transaction/' + req.params.reference,
    method: "GET",
    headers: {
      Authorization: process.env.PAYSTACK_SECRET,
    }
  };

  https.request(options, res => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(JSON.parse(data));
      const customerInformation = JSON.parse(data);
      const payment = new Payment({
        email: customerInformation.customer.email,
        firstName: customerInformation.customer.firt_name,
        lastName: customerInformation.customer.last_name,
        id: customerInformation.customer.id,
        customerCode: customerInformation.customer.customer_code,
        Amount: customerInformation.data.amount,
        currency: customerInformation.data.currency,
        status: customerInformation.data.status,
        reference: customerInformation.data.reference,
      });
      payment.save(function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("congratulations!");
        }
      });

    });
  }).on('error', error => {
    console.error(error);
  });
});
/*************************** Paystack *****************************/


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3007;
}

app.listen(port, function(req, res) {
  console.log("Server is connected at port " + port);
});
