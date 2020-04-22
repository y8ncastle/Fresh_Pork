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
let button_status, current_user;

let temp_date = new Date();
let date = "[Log] " + temp_date.getFullYear() + '/' + parseInt(temp_date.getMonth()+1) + '/' +
        temp_date.getDate() + " " + temp_date.getHours() + ":" + temp_date.getMinutes() + ":" +
        temp_date.getSeconds() + " > ";
let db_date = temp_date.getFullYear() + '/' + parseInt(temp_date.getMonth()+1) + '/' +
        temp_date.getDate() + " " + temp_date.getHours() + ":" + temp_date.getMinutes() + ":" +
        temp_date.getSeconds();

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
  amount: Number,
  time: String
});

const driverSchema = new mongoose.Schema({
  date: String,
  dv_done: String,
  dv_back: String,
  driver: {
    type: String,
    required: true
  },
  address: String,
  location: String,
  pork_t: String,
  amount: Number,
  start_time: String,
  arrival_time: String
});

const userDB = db.model("Login", personnelSchema, 'user');
const orderDB = db.model("Manager", orderSchema, 'order');
const driverDB = db.model("Driver", driverSchema, 'driver');

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
        res.send('<script type="text/javascript">alert("사원번호와 비밀번호를 정확하게 입력해주세요");window.location="/";</script>');
        console.log(date + "[Error] Input NULL in ID or Passwd for login");
      }
      else if (login_check == '[]') {
        res.send('<script type="text/javascript">alert("로그인 정보가 올바르지 않습니다"); window.location="/";</script>');
        console.log(date + "[Error] ID or Passwd does not match to DB");
      }
      else {
        if (login_check.includes("manager")) {
          res.send('<script type="text/javascript">alert("관리자님 환영합니다"); window.location="/manager";</script>');
          console.log(date + "'" + current_user + "' logged in as a manager");
        }
        else {
          res.send('<script type="text/javascript">alert("기사님 환영합니다"); window.location="/driver";</script>');
          console.log(date + "'" + current_user + "' logged in as a driver");
        }
        current_user = login.id;
      }
    });
  }
  else {
    res.redirect('/register');
    console.log(date + "New registration form is opened");
  }
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
  res.render('Manager', {manager_info:current_user});
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
    console.log(date + "Manager '" + current_user + "' logged out");
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
    pork_type: req.body.pork_t,
    weight: req.body.order_kg
  };

  if (button_status === "order_confirm") {
    if (!info.date) {
      res.send('<script type="text/javascript">alert("주문 일자를 입력해주세요"); window.location="/orderForm";</script>');
      console.log(date + "[Error] Input NULL in order date");
    }
    else if (!info.order_adr || info.order_adr[0] === " ") {
      res.send('<script type="text/javascript">alert("배송지를 입력해주세요 (첫 글자 공백 제외)"); window.location="/orderForm";</script>');
      console.log(date + "[Error] Input NULL in order address");
    }
    else if (info.order_drv === "none") {
      res.send('<script type="text/javascript">alert("배송 기사를 선택해주세요"); window.location="/orderForm";</script>');
      console.log(date + "[Error] No driver has been chosen");
    }
    else if (!info.weight || Number(info.weight) > 1000) {
      res.send('<script type="text/javascript">alert("고기 무게를 정확히 입력해주세요 (소수점 제외, 1,000kg 이하)"); window.location="/orderForm";</script>');
      console.log(date + "[Error] Input NULL or wrong value in pork weight");
    }
    else {
      let orderDB_i = new orderDB();

      orderDB_i.date = info.date;
      orderDB_i.address = info.order_adr;
      orderDB_i.driver = info.order_drv;
      orderDB_i.pork_t = info.pork_type;
      orderDB_i.amount = info.weight;
      orderDB_i.time = String(temp_date);

      orderDB_i.save((err) => {
        if (err) {
          console.error(err);
          return;
        }
        else {
          userDB.findOne({id:info.order_drv}, (err, data) => {
            data.status = "set";
            data.save();
          });

          res.send('<script type="text/javascript">alert("새로운 주문이 등록되었습니다"); window.location="/manager";</script>');
          console.log(date + "[Success] Manager '" + current_user + "' has made an order request");
        }
      });
    }
  }
  else {
    res.send('<script type="text/javascript">alert("주문서 등록을 취소합니다"); window.location="/manager";</script>');
    console.log(date + "Manager '" + current_user + "' canceled the order");
  }
});

// Driver page rendering
app.get('/driver', (req, res) => {
  res.render('Driver', {driver_info:current_user});
});

// Driver page control
app.post('/driver', (req, res) => {
  button_status = req.body.button;

  if (button_status === "delivery_noti") {
    res.redirect('/deliveryStatus');
    console.log(date + "Driver '" + current_user + "' entered into order status page");
  }
  else if (button_status === "delivery_start") {
    res.redirect('/deliveryStart');
    console.log(date + "Driver '" + current_user + "' entered into delivery start page");
  }
  else if (button_status === "delivery_done") {
    res.redirect('/deliveryDone');
    console.log(date + "Driver '" + current_user + "' entered into delivery done page");
  }
  else if (button_status === "delivery_back") {
    res.redirect('/driverBack');
    console.log(date + "Driver '" + current_user + "' entered into driver back page");
  }
  else {
    res.send('<script type="text/javascript">alert("로그아웃 되었습니다"); window.location="/";</script>');
    console.log(date + "Driver '" + current_user + "' logged out");
  }
});

function driver_information(res, loc) {
  orderDB.find({driver:current_user}, (err, data) => {
    var status_date = data.map((obj) => {
      return obj.date;
    });

    var status_adr = data.map((obj) => {
      return obj.address;
    });

    var status_driver = data.map((obj) => {
      return obj.driver;
    });

    var status_pork = data.map((obj) => {
      return obj.pork_t;
    });

    var status_amount = data.map((obj) => {
      return obj.amount;
    });

    var t_status_pork;

    if (status_pork === "pork_belly")
      t_status_pork = "삼겹살";
    else if (status_pork === "pork_neck")
      t_status_pork = "항정살";
    else
      t_status_pork = "목살";

    t_status_pork += " " + status_amount + "kg";

    res.render(loc, {stat_date:status_date, stat_adr:status_adr, stat_driver:status_driver, stat_pork:t_status_pork});
  });
};

// Order Status page rendering
app.get('/deliveryStatus', (req, res) => {
  userDB.find({id:current_user}, 'status', (err, data) => {
    var data_check = JSON.stringify(data);

    if (data_check.includes("set"))
      driver_information(res, 'DeliveryStatus');
    else if (data_check.includes("driving")) {
      res.send('<script type="text/javascript">alert("이미 운송이 시작되었습니다"); window.location="/driver";</script>');
      console.log(date + "[Fail] Driver '" + current_user + "' can't access to status page");
    }
    else if (data_check.includes("back")) {
      res.send('<script type="text/javascript">alert("회사 복귀 처리를 완료해주세요"); window.location="/driver";</script>');
      console.log(date + "[Fail] Driver '" + current_user + "' can't access to delivery status page");
    }
    else {
      res.send('<script type="text/javascript">alert("배정된 내역이 없습니다"); window.location="/driver";</script>');
      console.log(date + "[Fail] Driver '" + current_user + "' is not assigned");
    }
  });
});

// Order Status page control
app.post('/deliveryStatus', (req, res) => {
  button_status = req.body.button;

  if (button_status === "order_check") {
    console.log(date + "Driver '" + current_user + "' checked delivery status");
    res.redirect('/driver');
  }
});

// Order Start page rendering
app.get('/deliveryStart', (req, res) => {
  userDB.find({id:current_user}, 'status', (err, data) => {
    var data_check = JSON.stringify(data);

    if (data_check.includes("set"))
      driver_information(res, 'DeliveryStart');
    else if (data_check.includes("driving")) {
      res.send('<script type="text/javascript">alert("현재 위치를 확인/변경하거나 운송을 완료해주세요"); window.location="/driver";</script>');
      console.log(date + "[Fail] Driver '" + current_user + "' can't access to delivery start page");
    }
    else if (data_check.includes("back")) {
      res.send('<script type="text/javascript">alert("회사 복귀 처리를 완료해주세요"); window.location="/driver";</script>');
      console.log(date + "[Fail] Driver '" + current_user + "' can't access to delivery start page");
    }
    else {
      res.send('<script type="text/javascript">alert("배정된 내역이 없습니다"); window.location="/driver";</script>');
      console.log(date + "[Fail] Driver '" + current_user + "' is not assigned");
    }
  });
});

// Order Start page control
app.post('/deliveryStart', (req, res) => {
  button_status = req.body.button;

  if (button_status === "delivery_confirm") {
    let driverDB_i = new driverDB();

    orderDB.find({driver:current_user}, (err, data) => {
      var order_date = data.map((obj) => {
        return obj.date;
      });

      var order_adr = data.map((obj) => {
        return obj.address;
      });

      var order_driver = data.map((obj) => {
        return obj.driver;
      });

      var order_pork = data.map((obj) => {
        return obj.pork_t;
      });

      var order_amount = data.map((obj) => {
        return obj.amount;
      });

      driverDB_i.date = String(order_date);
      driverDB_i.dv_done = "-";
      driverDB_i.dv_back = "-";
      driverDB_i.driver = String(order_driver);
      driverDB_i.address = String(order_adr);
      driverDB_i.location = "신선 돼지 유통 직영점";
      driverDB_i.pork_t = String(order_pork);
      driverDB_i.amount = String(order_amount);
      driverDB_i.start_time = String(db_date);
      driverDB_i.arrival_time = "-";

      driverDB_i.save((err) => {
        if (err) {
          console.error(err);
            return;
        }
        else {
          userDB.findOne({id:current_user}, (err, data) => {
            data.status = "driving";
            data.save();
          });

          orderDB.findOne({driver:current_user}, (err, data) => {
            data.remove();
          })

          res.send('<script type="text/javascript">alert("배송이 시작되었습니다"); window.location="/driver";</script>');
          console.log(date + "[Success] Driver '" + current_user + "' has started delivery service");
        }
      });
    });
  }
  else {
    console.log(date + "Driver '" + current_user + "' canceled delivery start");
    res.redirect('/driver');
  }
});

// Order Done page rendering
app.get('/deliveryDone', (req, res) => {
  userDB.find({id:current_user}, 'status', (err, data) => {
    var data_check = JSON.stringify(data);

    if (data_check.includes("driving")) {
      driverDB.find({driver:current_user}, (err, data) => {
        var driver_date = data.map((obj) => {
          return obj.date;
        });

        var driver_address = data.map((obj) => {
          return obj.address;
        });

        var driver_id = data.map((obj) => {
          return obj.driver;
        });

        var driver_pork = data.map((obj) => {
          return obj.pork_t;
        });

        var driver_amount = data.map((obj) => {
          return obj.amount;
        });

        var driver_location = data.map((obj) => {
          return obj.location;
        });

        var t_driver_pork;

        if (driver_pork === "pork_belly")
          t_driver_pork = "삼겹살";
        else if (driver_pork === "pork_neck")
          t_driver_pork = "항정살";
        else
          t_driver_pork = "목살";

        t_driver_pork += " " + driver_amount + "kg";

        res.render('DeliveryDone', {stat_date:driver_date, stat_adr:driver_address, stat_driver:driver_id,
          stat_pork:t_driver_pork, stat_adr_cr:driver_location});
      });
    }
    else if (data_check.includes("set")) {
      res.send('<script type="text/javascript">alert("먼저 운송을 시작해주세요"); window.location="/driver";</script>');
      console.log(date + "[Fail] Driver '" + current_user + "' can't access to delivery done page");
    }
    else if (data_check.includes("back")) {
      res.send('<script type="text/javascript">alert("회사 복귀 처리를 완료해주세요"); window.location="/driver";</script>');
      console.log(date + "[Fail] Driver '" + current_user + "' can't access to delivery done page");
    }
    else {
      res.send('<script type="text/javascript">alert("배정된 내역이 없습니다"); window.location="/driver";</script>');
      console.log(date + "[Fail] Driver '" + current_user + "' is not assigned");
    }
  });
});

// Order Done page control
app.post('/deliveryDone', (req, res) => {
  button_status = req.body.button;

  var current_loc = req.body.current_location;

  if (current_loc.length > 0 && current_loc[0] !== " ") {
    driverDB.findOne({driver:current_user}, (err, data) => {
      if (button_status === "delivery_done") {
        data.dv_done = "O";
        data.arrival_time = String(db_date);
        data.save();

        userDB.findOne({id:current_user}, (err, data2) => {
          data2.status = "back";
          data2.save();
        })

        res.send('<script type="text/javascript">alert("배송이 완료되었습니다"); window.location="/driver";</script>');
        console.log(date + "[Success] Driver '" + current_user + "' finished delivery service");
      }
      else if (button_status === "location_change") {
        data.location = String(current_loc);
        data.save();

        res.send('<script type="text/javascript">alert("현재 배송중인 위치가 변경되었습니다"); window.location="/deliveryDone";</script>');
        console.log(date + "[Success] Driver '" + current_user + "' changed current location");
      }
      else {
        console.log(date + "Driver '" + current_user + "' canceled delivery done");
        res.redirect('/driver');
      }
    });
  }
  else {
    res.send('<script type="text/javascript">alert("현재 위치를 입력해주세요 (첫 글자 공백 제외)"); window.location="/deliveryDone";</script>');
    console.log(date + "[Error] Input NULL in current location");
  }
});

// Order Back page rendering
app.get('/driverBack', (req, res) => {
  userDB.find({id:current_user}, 'status', (err, data) => {
    var data_check = JSON.stringify(data);

    if (data_check.includes("back")) {
      driverDB.find({driver:current_user}, (err, data) => {
        var driver_date = data.map((obj) => {
          return obj.date;
        });

        var driver_b_adr = data.map((obj) => {
          return obj.address;
        });

        var driver_b_id = data.map((obj) => {
          return obj.driver;
        });

        var driver_start_time = data.map((obj) => {
          return obj.start_time;
        })

        var driver_arrival_time = data.map((obj) => {
          return obj.arrival_time;
        })

        res.render('DriverBack', {stat_b_id:driver_b_id, stat_b_date:driver_date, stat_b_adr:driver_b_adr,
          stat_start_t:driver_start_time, stat_arrival_t:driver_arrival_time});
      });
    }
    else  {
      res.send('<script type="text/javascript">alert("접근 권한이 없습니다"); window.location="/driver";</script>');
      console.log(date + "[Fail] Driver '" + current_user + "' has no access to driver back page");
    }
  });
});

// Order Back page control
app.post('/driverBack', (req, res) => {
  button_status = req.body.button;

  if (button_status === "driver_back") {
    driverDB.findOne({driver:current_user}, (err, data) => {
      data.dv_back = "O";
      data.save();

      userDB.findOne({id:current_user}, (err, data2) => {
        data2.status = "ready";
        data2.save();
      })

      res.send('<script type="text/javascript">alert("회사 복귀처리 되었습니다"); window.location="/driver";</script>');
      console.log(date + "[Success] Driver '" + current_user + "' status is changed to ready");
    });
  }
  else {
    console.log(date + "Driver '" + current_user + "' canceled driver back");
    res.redirect('/driver');
  }
});
