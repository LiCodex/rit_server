const router = require("express").Router();
const User = require("../models/user");
const verifyToken = require("../middlewares/verify-token");

const jwt = require("jsonwebtoken");

/* Signup Route */
router.post("/auth/signup", async (req, res) => {
  if (!req.body.phone || !req.body.password) {
    res.json({ success: false, message: "Please enter phone or password" });
  } else {
    try {
      let newUser = new User();
      //newUser.name = req.body.name;
      newUser.phone = req.body.phone;
      newUser.password = req.body.password;
      await newUser.save();
      let token = jwt.sign(newUser.toJSON(), process.env.SECRET, {
        expiresIn: 604800 // 1 week
      });

      res.json({
        success: true,
        token: token,
        message: "Successfully created a new user"
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
});

/* Profile Route */
router.get("/auth/user", verifyToken, async (req, res) => {
  try {
    let foundUser = await User.findOne({ _id: req.decoded._id }).populate(
      "address"
    );
    if (foundUser) {
      res.json({
        success: true,
        user: foundUser
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/* Update a profile */
router.put("/auth/user", verifyToken, async (req, res) => {
  try {
    let foundUser = await User.findOne({ _id: req.decoded._id });

    if (foundUser) {
      if (req.body.phone) foundUser.phone = req.body.phone;
      if (req.body.password) foundUser.password = req.body.password;

      await foundUser.save();

      res.json({
        success: true,
        message: "Successfully updated"
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/* Login Route */
router.post("/auth/login", async (req, res, next) => {
  try {
    console.log(req.form);
    // req.form.complete(function(err, fields, files) {
    //     // fields fields fields
    //     if (err) { next(err); }
    //     else {
    //       console.log(fields);
    //       console.log('---------------');
    //       console.log(files);
    //       res.redirect(req.url);
    //     }
    // });

    // let foundUser = await User.findOne({ phone: req.body.phone });
    // console.log("phone: req.body.phone");
    // console.log(req);
    // if (!foundUser) {
    //   res.status(405).json({
    //     success: false,
    //     message: "Authentication failed, User not found"
    //   });
    // } else {
    //   if (foundUser.comparePassword(req.body.password)) {
    //     let token = jwt.sign(foundUser.toJSON(), process.env.SECRET, {
    //       expiresIn: 604800 // 1 week
    //     });

    //     res.json({ success: true, token: token });
    //   } else {
    //     console.log("phone");
    //     console.log(req.body.phone);
    //     console.log("password");
    //     console.log(req.body.password);
    //     res.status(403).json({
    //       success: false,
    //       message: "Authentication failed, Wrong password!"
    //     });
    //   }
    // }
  } catch (err) {
    console.log(err.message);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/* Twillio api */
router.post("/auth/messaging_code", async (req, res) => {
  const accountSid = process.env.accountSid;
  const authToken = process.env.authToken;
  try {
    let foundUser = await User.findOne({ phone: req.body.phone });
    console.log(foundUser);
    if (!foundUser) {
      res.status(403).json({
        success: false,
        message: "Authentication failed, User not found"
      });
    } else {
      const client = require('twilio')(accountSid, authToken);
      client.messages.create({
        body: '888668',
        to: '+1' + req.body.phone,  // Text this number
        from: '+14012373657' // From a valid Twilio number
    }).then((message) => console.log(message.sid));
      
    res.json({ success: true });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;
