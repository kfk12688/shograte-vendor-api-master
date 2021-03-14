const express = require("express");
const jwt = require("jsonwebtoken");
const key = require("../../config/keys");
const router = express.Router();
const SubCategory = require("../../models/SubCategory");
const Category = require("../../models/Category");
const Vendor = require("../../models/Vendor");

const checkAuth = require("../../middleware/check-auth");
const checkAdmin = require("../../middleware/check-role");

const validateEmail = require("../../validation/login");
const bcrypt = require("bcryptjs");
const saltRounds = 10;



//get pagination component
const pagination=require('../../components/pagination');



router.post("/register", (req, res) => {

  const { errors, isValid } = validateEmail(req.body);
  if (!isValid) {
    return res.json({success:false, errors });
  }

  var body=req.body;
  var vendor_name=body.vendor_name;
  var mobile=body.mobile;
  var password=body.password;

  if(!vendor_name){
    return res.json({success:false, msg:'Vendor name required.' });
  }

  if(!mobile){
    return res.json({success:false, msg:'Mobile required.' });
  }

  if(!password){
    return res.json({success:false, msg:'Password required.' });
  }
  
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {

      const vendor = new Vendor({
        vendor_name:vendor_name,
        owner_name: req.body.owner_name,
        mobile: mobile,
        email: req.body.email,
        password: hash,
        modified_date: new Date()
      });

        //save the hash password in db
        vendor
        .save()
        .then(data => {

          const payload = {
            id: data._id,
            email: req.body.email,
            mobile: mobile
          };

          jwt.sign(
            payload,
            key.secretORKey,
            { expiresIn: 86400 },
            (err, token) => {
              res.json({
                success: true,
                token:token,
                email: req.body.email
              });
            }
          )

        })
        .catch(err => {
          let errors = {};
          Object.keys(err.errors).forEach(function(key) {
            errors[key] = err.errors[key].message;
          });
          res.json({ success:false,errors });
        });

    });
  });
 
});

router.get("/list",checkAuth, (req, res) => {

  console.log('query',req.userData);

  const { page, size, title }=req.query;

  const { limit, offset } = pagination.getPagination(page, size);


  Vendor.paginate({_id:req.userData.id },{ offset, limit })
    .then(vendor => {

      let output={
        success:true,
        data:vendor.docs,
        pagination:{
          totalDocs:vendor.totalDocs,
          totalPages:vendor.totalPages,
          page:vendor.page,
          pagingCounter:vendor.pagingCounter,
          hasPrevPage:vendor.hasPrevPage,
          hasNextPage:vendor.hasNextPage,
          limit:vendor.limit
        }
        
      }

      res.json(output);

    })
    .catch(err => {
      res.json({
        success:false,
        msg:"Error occured."
      });
    });
});

router.get("/list/:id",checkAuth, (req, res) => {
  Vendor.findOne({ _id: req.params.id })
    .then(data => {
      let output={
        success:true,
        data:data
      }
      res.json(output);

    })
    .catch(err => res.json({ err }));
});


// change status of the vendor user
router.post("/changeStatus/:id", checkAuth, (req, res) => {
  
  Vendor.findById({ _id: req.params.id }, (err, vendor) => {
   
    vendor.modified_date = new Date();
    vendor.is_active = req.body.is_active;

    vendor
      .save()
      .then(() => {
        res.json({
          success:true,
          msg: "Vendor is updated successfully"
        });
      })
      .catch(err => {
        let errors = {};
        Object.keys(err.errors).forEach(function(key) {
          errors[key] = err.errors[key].message;
        });
        res.json({ errors });
      });
  });
});



router.post("/edit_vendor", checkAuth, (req, res) => {
  
  Vendor.findById({ _id: req.userData.id }, (err, vendor) => {
    if (!vendor) return res.json({success:false, msg: "user not found" });
    if (!vendor.is_active && req.body.is_active === 0)
      return res.json({success:false, msg: "user is not activated" });
    
    vendor.modified_date = new Date();
    vendor.email = req.body.email;
    vendor.mobile = req.body.mobile;
    vendor.vendor_name = req.body.vendor_name;

    vendor
      .save()
      .then(() => {
        res.json({
          success:true,
          msg: "Profile updated successfully"
        });
      })
      .catch(err => {
        let errors = {};
        Object.keys(err.errors).forEach(function(key) {
          errors[key] = err.errors[key].message;
        });
        res.json({ errors });
      });
  });
});


router.post("/login", (req, res) => {
  const { errors, isValid } = validateEmail(req.body);
  if (!isValid) {
    return res.json({ errors });
  }

  const email = req.body.email;
  const password = req.body.password;

  Vendor.findOne({ email }).then( async (user) => {
    if (!user) {
      errors.email = "Vendor not found";
      return res.json({
        success:false,
        msg:'Invalid login details.',
      });
    }

    console.log('user',user);

    if (user.is_active == 0) {     
      return res.json({
        success:false,
        msg:'User acount is inactive.Contact admin.',
      });
    }




    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        const payload = {
          id: user._id,
          email: user.email,
          mobile: user.mobile
        };
        jwt.sign(
          payload,
          key.secretORKey,
          { expiresIn: 86400 },
          (err, token) => {
            res.json({
              success: true,
              token:token,
              email: user.email
            });
          }
        );
      } else {
        errors.password = "Password incorrect";
        return res.json({
          success:false,
          msg:'Invalid login details.',
        });
      }
    });
  });
});

// forget password :
router.post("/forget-password", (req, res) => {
  const { errors, isValid } = ValidateLoginInput(req.body);
  if (!isValid) {
    return res.json({ errors });
  }
  //check the email is valid or not

  const email = req.body.email;

  Vendor.findOne({ email }).then(async function(user) {
    if (!user) {
      errors.email = "Vendor not found";
      let output={
        success:false,
        message:"Vendor not found"
      }
      return res.json(output);
    }

    //create unique with expiry date

    let uniquecode = otpGenerator.generate(6, { upperCase: true, specialChars: false });
    let expiryDate = new Date(Date.now() + 3600 * 1000 * 24);

    console.log('expiryDate',expiryDate);
    console.log('uniquecode',uniquecode);

    //update admin user with unique code and expiry time
    //user.role = "SuperAdmin";
    user.forget_password_otp = uniquecode;
    user.forget_password_expiry = expiryDate;

    user
      .save()
      .then(async function(data) {
        // send mail test
        var response = await Mail.sendMail(
          "admin@gmail.com",
          user.email,
          "Forget Password",
          "<p>Please find the otp.<br> code : "+uniquecode+"</p>"
        ).catch(()=>{
          let output={
            success:false,
            message:'Error Occured.'
          }
          res.json(output);
        });

        console.log("response in function", response);

        let output={
          success:true,
          message:'Verification code sent email.'
        }
        return res.json(output);
      })
      .catch(err => {
        let errors = {};
        Object.keys(err.errors).forEach(function(key) {
          errors[key] = err.errors[key].message;
        });

        console.log('error',err);

        let output={
          success:false,
          message:'Email does not exists.'
        }
        res.json(output);
      });
  });
});


router.post("/forget-password-otp-verify", (req, res) => {
  
  const email = req.body.email;
  const otp = req.body.otp;

  console.log('email',email);
  console.log('otp',otp);
  console.log('date',new Date());

  Vendor.findOne({ email:email,forget_password_otp:otp,forget_password_expiry:{$gt: new Date()} }).then( async function (user) {
    if (!user) {
      return res.json({ 
        success:false,
        message:"Otp expired" 
      });
    }


    //once otp verified generate new code and  send back the uuid code 

    user.forget_password_token = uuidv4();

    user.save().then((data)=>{
      return res.json({
        success:true,
        message:"OTP verified",
        token:data.forget_password_token
      });

    }).catch((err)=>{
      return res.json({ 
        success:false,
        message:"Error Occured" 
      });
    })
  });

});

//update password:

// forget password :
router.post("/update-password", (req, res) => {

  const token = req.body.token;
  const password = req.body.password;

  Vendor.findOne({ forget_password_token:token }).then( async function (user) {
    if (!user) {
      errors.email = "Token expired.Please try again";
      let output={
        success:false,
        message:"Session expired.Please try again"
      }
      return res.json(output);
    }

    //update admin user with unique code and expiry time
    
    bcrypt.hash(password, saltRounds, function(err, hash) {
      // Store hash in your password DB.
      user.password=hash;  
      user.forget_password_otp='';
      user.forget_password_token='';
      user.forget_password_expiry='';

      user
      .save()
      .then( async function (data) {
  
          // send mail test
          var response=await Mail.sendMail('admin@gmail.com',user.email,'Password Updated','<p>Password Updated Successfully.</p>');
  
          let output={
            success:true,
            message:'Password updated successfully.'
          }
          return res.json(output);
       
      })
      .catch(err => {
        let errors = {};
        Object.keys(err.errors).forEach(function(key) {
          errors[key] = err.errors[key].message;
        });
        res.json({ errors });
      });

    });  

  });

});








module.exports = router;