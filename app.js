const bodyParser = require('body-parser');
const ejs = require('ejs');
const express = require('express');
const mongoose = require('mongoose');
const nm = require('nodemon');
const app = express();

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
  name: String,
  phone: String,
  status: String
});

const loginDB = mongoose.model("Login", personnelSchema, 'login');

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
  var id_check = false;
  let button_status = req.body.button; // 중복확인
  let regi_id = req.body.reg_id; // 사원번호
  let regi_passwd = req.body_reg_passwd; // 비밀번호
  let regi_passwd_ch = req.body_reg_passwd_ch; // 비밀번호 확인
  let regi_person_t = req.body_reg_person_t; // 사원분류
  let regi_phone = req.body_reg_phone; // 전화번호

  if (button_status === "reg_check") {
    if (regi_id === "") {
      console.log(date + "[Error] Checked with ID 'NULL'");
      res.send('<script type="text/javascript">alert("사원번호를 입력해주세요"); window.location=history.back();</script>');
    }
    else {
      res.send('<script type="text/javascript">alert("사용 가능한 사원번호입니다."); window.location=history.back();</script>');
    }
  }
  else if (button_status === "reg_register") {
    if (regi_id === "") {
      console.log(date + "[Error] Input NULL in ID tab")
      res.send('<script type="text/javascript">alert("사원번호를 입력해주세요"); window.location=history.back();</script>');
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
