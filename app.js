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
  status: String
});

const userDB = mongoose.model("Login", personnelSchema, 'user');

// Login page
app.get('/', (req, res) => {
  res.render('Login');
});

app.post('/', (req, res) => {
  let button_status = req.body.button;

  var login = {
    id: req.body.login_id,
    passwd: req.body.login_passwd
  };

  if (button_status === "sign_in") {
    userDB.find({id:req.body.login_id, passwd:req.body.login_passwd}, 'person_t', (err, data) => {
      var login_check = JSON.stringify(data);

      if (!login.id || !login.passwd)
        res.send('<script type="text/javascript">alert("사원번호와 비밀번호를 정확하게 입력해주세요"); window.location="/";</script>');
      else if (login_check == '[]')
        res.send('<script type="text/javascript">alert("가입되지 않은 사원입니다"); window.location="/";</script>');
      else
        res.redirect('/orderForm');
    });
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
  let button_status = req.body.button; // Register button

  var info = { // text area
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
