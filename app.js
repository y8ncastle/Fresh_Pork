const bodyParser = require('body-parser');
const ejs = require('ejs');
const express = require('express');
const mongoose = require('mongoose');
const nm = require('nodemon');
const app = express();

var id_check = false;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
//app.use(exp.static(__dirname + "/"));

// Database connection
mongoose.connect('mongodb://localhost:27017/user', {useNewUrlParser:true, useUnifiedTopology:true});
const db = mongoose.connection;

const personnelSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  passwd: String,
  person_t: String,
  status: String
});

const userDB = mongoose.model("Login", personnelSchema, 'user');

// Login page
app.get('/', (req, res) => {
  res.render('Login');
});

app.post('/', (req, res) => {
  let button_status = req.body.button;
  var login_status = req.body.login;

  if (button_status === "sign_in") {
      res.redirect('/orderForm');
  }
  else
    res.redirect('/register');
});

// Registration page
let temp_date = new Date();
date = "[Log] " + temp_date.getFullYear() + "/" + parseInt(temp_date.getMonth()+1) + "/" +
        temp_date.getDate() + " " + temp_date.getHours() + ":" + temp_date.getMinutes() + ":" +
        temp_date.getSeconds() + " > ";

app.get('/register', (req, res) => {
  console.log(date + "New registration form is opened");
  res.render('Register');
});

app.post('/register', (req, res) => {
  let button_status = req.body.button; // 중복확인

  var info = {
    id: req.body.reg_id,
    passwd: req.body.reg_passwd,
    passwd_ch: req.body.reg_passwd_ch,
    person_t: req.body.reg_person_t,
    phone: req.body.reg_phone
  };

  if (button_status === "reg_check") {
    if (!info.id) {
      console.log(date + "[Error] Checked with ID 'NULL'");
      res.send('<script type="text/javascript">alert("사원번호를 입력해주세요"); window.location="/register";</script>');
    }
    else { // **********************************************
      res.send('<script type="text/javascript">alert("사용 가능한 사원번호입니다."); window.location=history.back();</script>');
    }
  }
  else if (button_status === "reg_register") {
    if (!info.id) {
      console.log(date + "[Error] Input NULL in ID tab");
      res.send('<script type="text/javascript">alert("사원번호를 입력해주세요"); window.location="/register";</script>');
    }
    else if (!info.passwd) {
      console.log(date + "[Error] Input NULL in Password tab");
      res.send('<script type="text/javascript">alert("비밀번호를 입력해주세요"); window.location=history.back();</script>');
    }
    else if (!info.passwd_ch) {
      console.log(date + "[Error] Input NULL in Password check tab");
      res.send('<script type="text/javascript">alert("비밀번호를 한 번 더 입력해주세요"); window.location=history.back();</script>');
    }
    else if (info.passwd !== info.passwd_ch) {
      console.log(date + "[Error] Password is different with check");
      res.send('<script type="text/javascript">alert("입력한 비밀번호가 서로 다릅니다"); window.location=history.back();</script>');
    }
    else {


    }
  }
  else if (button_status === "reg_cancel") {
    console.log(date + "Registration form is closed by user");
    res.redirect('/');
  }
});

// Order page
app.get('/orderForm', (req, res) => {
  console.log(date + "New orderForm is opened");
  res.render("OrderForm");
});

app.post('/orderForm', (req, res) => {
  ;
})

// Server setting
const port = process.env.Port || 3000;

const server = app.listen(port, () => {
  console.log(date + "[Success] Server is ON");
});
