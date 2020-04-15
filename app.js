const bodyParser = require('body-parser');
const ejs = require('ejs');
const express = require('express');
const mongoose = require('mongoose');
const nm = require('nodemon');
const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

// Global variables
let button_status;

// Server setting
const port = process.env.Port || 2381;

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
  driver: {
    type: String,
    required: true
  },
  pork_t: String,
  amount: Number
});

const driverSchema = new mongoose.Schema({
  date: String,
  dv_start: String,
  dv_done: String,
  dv_back: String,
  driver: {
    type: String,
    required: true
  },
  port_t: String,
  amount: Number
});

const userDB = db.model("Login", personnelSchema, 'user');
const orderDB = db.model("Manager", orderSchema, 'order');
const driverDB = db.model("Driver", driverSchema, 'driver');

// Real time check
let temp_date = new Date();
date = "[Log] " + temp_date.getFullYear() + '/' + parseInt(temp_date.getMonth()+1) + '/' +
        temp_date.getDate() + " " + temp_date.getHours() + ":" + temp_date.getMinutes() + ":" +
        temp_date.getSeconds() + " > ";

// Login page rendering
app.get('/', (req, res) => {
  res.render('Login');
});

// Login page control
app.post('/', (req, res) => {
  button_status = req.body.button;

  var login = {
    id: req.body.login_id,
    passwd: req.body.login_passwd
  };

  if (button_status === "sign_in") {
    userDB.find({id:req.body.login_id, passwd:req.body.login_passwd}, 'person_t', (err, data) => {
      var login_check = JSON.stringify(data);

      if (!login.id || !login.passwd) {
        res.send('<script type="text/javascript">alert("사원번호와 비밀번호를 정확하게 입력해주세요"); window.location="/";</script>');
        console.log(date + "[Error] Input NULL in ID or Passwd for login");
      }
      else if (login_check == '[]') {
        res.send('<script type="text/javascript">alert("로그인 정보가 올바르지 않습니다"); window.location="/";</script>');
        console.log(date + "[Error] ID or Passwd does not match to DB");
      }

      // Check person type
      else {
        if (login_check.includes("manager")) {
          res.send('<script type="text/javascript">alert("관리자님 환영합니다"); window.location="/manager";</script>');
          console.log(date + "'[]" + "' logged in as a manager");
        }
        else {
          res.send('<script type="text/javascript">alert("기사님 환영합니다"); window.location="/driver";</script>');
          console.log(date + "'[]" + "' logged in as a driver");
        }
      }
    });
  }
  else
    res.redirect('/register');
    console.log(date + "New registration form is opened");
});

// Registration page rendering
app.get('/register', (req, res) => {
  res.render('Register');
});

// Registration page control
app.post('/register', (req, res) => {
  button_status = req.body.button;

  var info = {
    id: req.body.reg_id,
    passwd: req.body.reg_passwd,
    passwd_ch: req.body.reg_passwd_ch,
    person_t: req.body.reg_person_t
  };

  if (button_status === "reg_register") {
    userDB.findOne({id:info.id}, (err, data) => {
      var id_check = JSON.stringify(data);

      if (!info.id || info.id[0] === " ") {
        res.send('<script type="text/javascript">alert("사원번호를 입력해주세요 (공백 제외)"); window.location="/register";</script>');
        console.log(date + "[Error] Input NULL in ID");
      }
      else if (id_check.includes(info.id)) {
        res.send('<script type="text/javascript">alert("이미 가입되어 있는 사원번호입니다"); window.location="/register";</script>');
        console.log(date + "[Error] The ID already exists");
      }
      else if (!info.passwd) {
        res.send('<script type="text/javascript">alert("비밀번호를 입력해주세요"); window.location="/register";</script>');
        console.log(date + "[Error] Input NULL in Passwd");
      }
      else if (!info.passwd_ch) {
        res.send('<script type="text/javascript">alert("비밀번호를 다시 입력해주세요"); window.location="/register";</script>');
        console.log(date + "[Error] Input NULL in Passwd check");
      }
      else if (info.passwd !== info.passwd_ch) {
        res.send('<script type="text/javascript">alert("입력한 비밀번호가 서로 다릅니다"); window.location="/register";</script>');
        console.log(date + "[Error] Passwd is different with check");
      }
      else {
        let userDB_i = new userDB();

        userDB_i.id = info.id;
        userDB_i.passwd = info.passwd;
        userDB_i.person_t = info.person_t;

        if (info.person_t === "driver")
          userDB_i.status = "ready";
        else
          userDB_i.status = "-";

        userDB_i.save((err) => {
          if (err) {
            console.error(err);
            return;
          }
          else {
            res.send('<script type="text/javascript">alert("회원가입이 완료되었습니다"); window.location="/";</script>');
            console.log(date + "[Success] User '" + info.id + "' has registered");
          }
        });
      }
    });
  }
  else if (button_status === "reg_cancel") {
    console.log(date + "Registration form is closed by user");
    res.redirect('/');
  }
});

// Manager page rendering
app.get('/manager', (req, res) => {
  res.render('Manager');
});

// Manager page control
app.post('/manager', (req, res) => {
  button_status = req.body.button;

  if (button_status === "order_form_cr") {
    console.log(date + "New order form is opened");
    res.redirect('/orderForm');
  }
  else {
    res.send('<script type="text/javascript">alert("로그아웃 되었습니다"); window.location="/";</script>');
    console.log(date + "Manager '" + "[]" + "' logged out");
  }
});

// Order page rendering
app.get('/orderForm', (req, res) => {
  userDB.find({status:"ready"}, 'id', (err, data) => {
    var driver_id = data.map((obj) => {
      return obj.id;
    });

    res.render('OrderForm', {driver_ready: driver_id});
  });
});

// Order page contol
app.post('/orderForm', (req, res) => {
  button_status = req.body.button;

  var info = {
    date: req.body.order_date,
    order_adr: req.body.order_address,
    order_drv: req.body.order_driver,
    pork_t: req.body.pork_type,
    weight: req.body.order_kg
  };

  if (button_status === "order_confirm") {
    if (!info.date) {
      res.send('<script type="text/javascript">alert("주문 일자를 입력해주세요"); window.location="/orderForm";</script>');
      console.log(date + "[Error] Input NULL in order date");
    }
    else if (!info.order_adr || info.order_adr[0] === " ") {
      res.send('<script type="text/javascript">alert("배송지를 입력해주세요 (공백 제외)"); window.location="/orderForm";</script>');
      console.log(date + "[Error] Input NULL in order address");
    }
    else if (info.order_drv === "none") {
      res.send('<script type="text/javascript">alert("배송 기사를 선택해주세요"); window.location="/orderForm";</script>');
      console.log(date + "[Error] No driver has been chosen");
    }
    else if (!info.weight) {
      res.send('<script type="text/javascript">alert("고기 무게를 입력해주세요 (소수점 제외)"); window.location="/orderForm";</script>');
      console.log(date + "[Error] Input NULL in pork weight");
    }
    else {
      console.log(date + "[Success] Manager '" + "[]" + "' confirmed an order");
    }
  }
  else {
    res.send('<script type="text/javascript">alert("주문서 등록을 취소합니다"); window.location="/manager";</script>');
    console.log(date + "Manager '" + "[]" + "' canceled the order");
  }
})

// Driver page rendering
app.get('/driver', (req, res) => {
  res.render('Driver');
});

// Driver page control
app.post('/driver', (req, res) => {
  button_status = req.body.button;

  if (button_status === "delivery_noti") {
    res.redirect('/deliveryStatus')
  }
  else if (button_status === "delivery_start") {
    res.redirect('/deliveryStart')
  }
  else if (button_status === "delivery_done") {
    res.redirect('/deliveryDone')
  }
  else if (button_status === "delivery_back") {
    res.redirect('/driverBack')
  }
  else {
    res.send('<script type="text/javascript">alert("로그아웃 되었습니다"); window.location="/";</script>');
    console.log(date + "Driver '" + "[]" + "' logged out");
  }
})

// Order Status page rendering
app.get('/deliveryStatus', (req, res) => {
  console.log(date + "Driver '" + "[]" + "' entered into order status page");
  res.render('DeliveryStatus');
})

// Order Status page control
app.post('/deliveryStatus', (req, res) => {
  button_status = req.body.button;

  if (button_status === "order_check") {
    console.log(date + "Driver '" + "[]" + "' checked delivery status");
    res.redirect('/driver')
  }
})

// Order Start page rendering
app.get('/deliveryStart', (req, res) => {
  console.log(date + "Driver '[]" + "' entered into delivery start page");
  res.render('DeliveryStart');
})

// Order Start page control
app.post('/deliveryStart', (req, res) => {
  button_status = req.body.button;

  if (button_status === "delivery_confirm") {
    console.log(date + "Driver '[]" + "' has started delivery");
  }
  else {
    console.log(date + "Driver '" + "[]" + "' canceled delivery start");
    res.redirect('/driver');
  }
})

// Order Done page rendering
app.get('/deliveryDone', (req, res) => {
  console.log(date + "Driver '[]" + "' entered into delivery done page");
  res.render('DeliveryDone');
})

// Order Done page control
app.post('/deliveryDone', (req, res) => {
  button_status = req.body.button;

  if (button_status === "delivery_done") {
    ;
  }
  else {
    console.log(date + "Driver '" + "[]" + "' canceled delivery done");
    res.redirect('/driver');
  }
})

// Order Back page rendering
app.get('/driverBack', (req, res) => {
  console.log(date + "Driver '[]" + "' entered into driver back page");
  res.render('DriverBack');
})

// Order Back page control
app.post('/driverBack', (req, res) => {
  button_status = req.body.button;

  if (button_status === "driver_back") {
    ;
  }
  else {
    console.log(date + "Driver '" + "[]" + "' canceled driver back");
    res.redirect('/driver');
  }
})
