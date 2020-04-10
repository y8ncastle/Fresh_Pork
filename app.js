const bodyParser = require('body-parser');
const ejs = require('ejs');
const express = require('express');
const mongoose = require('mongoose');
const nm = require('nodemon');
const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

// Server setting
const port = process.env.Port || 3827;

const server = app.listen(port, () => {
  console.log(date + "[Success] Server is ON");
});

// Database connection
mongoose.connect('mongodb://localhost:27017/user', {useNewUrlParser:true, useUnifiedTopology:true});
const db = mongoose.connection;

// Database schema
const personnelSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  passwd: {
    type: String,
    required: true
  },
  person_t: String,
  status: String
});

const orderSchema = new mongoose.Schema({
  date: String,
  address: String,
  driver: String,
  pork_t: String,
  amount: Number
});

const driverSchema = new mongoose.Schema({
  date: String,
  dv_start: String,
  dv_done: String,
  dv_check: String,
  driver: String,
  port_t: String,
  amount: Number
});

const userDB = db.model("Login", personnelSchema, 'user');
const orderDB = db.model("Manager", orderSchema, 'order');
const driverDB = db.model("Driver", driverSchema, 'driver');

// Real time check
let temp_date = new Date();
date = "[Log] " + temp_date.getFullYear() + "/" + parseInt(temp_date.getMonth()+1) + "/" +
        temp_date.getDate() + " " + temp_date.getHours() + ":" + temp_date.getMinutes() + ":" +
        temp_date.getSeconds() + " > ";

// Login page rendering
app.get('/', (req, res) => {
  res.render('Login');
});

// Login page control
app.post('/', (req, res) => {
  let button_status = req.body.button;

  var login = {
    id: req.body.login_id,
    passwd: req.body.login_passwd
  };

  // Login page text area
  if (button_status === "sign_in") {
    userDB.find({id:req.body.login_id, passwd:req.body.login_passwd}, 'person_t', (err, data) => {
      var login_check = JSON.stringify(data);

      if (!login.id || !login.passwd) {
        console.log(data + "[Error] Input NULL in ID or Passwd");
        res.send('<script type="text/javascript">alert("사원번호와 비밀번호를 정확하게 입력해주세요"); window.location="/";</script>');
      }
      else if (login_check == '[]') {
        console.log(data + "[Error] ID or Passwd do not match to DB")
        res.send('<script type="text/javascript">alert("로그인 정보가 올바르지 않습니다"); window.location="/";</script>');
      }

      // Check person type
      else {
        if (data.includes('manager')) {
          res.redirect('/manager');
        }
        else {
          res.redirect('/driver');
        }
      }
    });
  }
  else
    res.redirect('/register');
});

// Manager page rendering
app.get('/manager', (req, res) => {
  res.render('Manager');
});

// Driver page rendering
app.get('/driver', (req, res) => {
  res.render('Driver');
});


// Registration page control
app.get('/register', (req, res) => {
  console.log(date + "New registration form is opened");
  res.render('Register');
});

app.post('/register', (req, res) => {
  let button_status = req.body.button; // Register button

  var info = { // Registration page text area variable
    id: req.body.reg_id,
    passwd: req.body.reg_passwd,
    passwd_ch: req.body.reg_passwd_ch,
    person_t: req.body.reg_person_t
  };

  if (button_status === "reg_register") {
    if (!info.id || info.id[0] === " ") {
      console.log(date + "[Error] Input NULL in ID");
      res.send('<script type="text/javascript">alert("사원번호를 입력해주세요 (공백 제외)"); window.location="/register";</script>');
    }
    else if (!info.id) {
      userDB.findOne({id:info.id}, (err, data) => {
        if (data.id) {
          console.log(data + "[Error] The ID already exists");
          res.send('<script type="text/javascript">alert("이미 가입되어 있는 사원번호입니다"); window.location="/register";</script>')
        }
      });
    }
    else if (!info.passwd) {
      console.log(date + "[Error] Input NULL in Password");
      res.send('<script type="text/javascript">alert("비밀번호를 입력해주세요"); window.location="/register";</script>');
    }
    else if (!info.passwd_ch) {
      console.log(date + "[Error] Input NULL in Password check");
      res.send('<script type="text/javascript">alert("비밀번호를 다시 입력해주세요"); window.location="/register";</script>');
    }
    else if (info.passwd !== info.passwd_ch) {
      console.log(date + "[Error] Password is different with check");
      res.send('<script type="text/javascript">alert("입력한 비밀번호가 서로 다릅니다"); window.location="/register";</script>');
    }
    else {
      let userDB_i = new userDB();

      userDB_i.id = info.id;
      userDB_i.passwd = info.passwd;
      userDB_i.person_t = info.person_t;
      userDB_i.status = "ready";

      userDB_i.save((err) => {
        if (err) {
          console.error(err);
          return;
        }
        else {
          console.log(date + "[Success] User " + info.id + " has registered");
          res.send('<script type="text/javascript">alert("회원가입이 완료되었습니다"); window.location="/";</script>')
        }
      });
    }
  }
  else if (button_status === "reg_cancel") {
    console.log(date + "Registration form is closed by user");
    res.redirect('/');
  }
});

// Order page rendering
app.get('/orderForm', (req, res) => {
  console.log(date + "New orderForm is opened");
  res.render("OrderForm");
});

// Order page contol
app.post('/orderForm', (req, res) => {
  ;
})
