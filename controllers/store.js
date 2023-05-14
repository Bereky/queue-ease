const path = require("path");
const csvtojson = require("csvtojson");
const stores = require("../models/stores");
const shop = require("../models/shops");
var mongoose = require("mongoose");
const users = require("../models/UserModel");
//const accountSid = process.env.TWILIO_ACCOUNT_SID;
//const authToken = process.env.TWILIO_AUTH_TOKEN;
//const client = require('twilio')(accountSid, authToken);
const dotenv = require("dotenv");

exports.checkstore = async (req, res, next) => {
  try {
    const userid = req.body.userid;
    console.log(userid);
    const result = await stores.findById(userid);
    console.log(result);
    if (result.shopid) {
      const doc = await shop.findById(result.shopid);
      console.log(doc);
      res.json(doc);
    } else {
      res.status(301).json("not found");
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.makestore = async (req, res, next) => {
  try {
    mongoose.Types.ObjectId.isValid(req.params.id);
    const result = await stores.findById(req.params.id);
    console.log(result);
    if (!result) {
      res.json("User not Found");
      res.status = 404;
    } else {
      const name = req.body.name;
      const Address = req.body.Address;
      const long = req.body.long;
      const latti = req.body.latti;
      const counter = req.body.counter;
      const ShopCounter = req.body.ShopCounter;
      const countertime = req.body.countertime;
      const avgtime = req.body.avgtime;
      const queueassign = req.body.queueassign;
      const opentime = req.body.opentime;
      const closetime = req.body.closetime;

      const shopExist = await shop.findById(result.shopid);

      if (shopExist) {
        const updateShop = await shop.findByIdAndUpdate(
          {
            _id: result.shopid,
          },
          {
            $set: {
              name: name,
              Address: Address,
              long: long,
              latti: latti,
              counter: counter,
              ShopCounter: ShopCounter,
              countertime: countertime,
              avgtime: avgtime,
              queueassign: queueassign,
              opentime: opentime,
              closetime: closetime,
            },
          },
          { new: true }
        );

        if (updateShop) {
          res.json(updateShop);
        }
      } else {
        newshop = new shop({
          name: name,
          Address: Address,
          long: long,
          latti: latti,
          counter: counter,
          ShopCounter: ShopCounter,
          countertime: countertime,
          avgtime: avgtime,
          queueassign: queueassign,
          opentime: opentime,
          closetime: closetime,
        });
        await newshop.save();
        result.shopid = newshop._id;
        await result.save();
        res.json(newshop);
      }
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.adduser = async (req, res, next) => {
  try {
    const shopid = req.body.shopid;
    const userid = req.body.userid;
    const time = req.body.time;
    result = await shop.findOne({ _id: shopid });
    if (!result) {
      res.json("no shop exist");
      console.log("no shop exist");
    } else {
      ans = await users.findById(userid);
      if (!ans) {
        console.log("no user exist");
        return res.json("no user exist");
      }
      var mini = result.ShopCounter[0] * result.avgtime[0];
      var counter = 0,
        i;
      let tt = 1;
      for (var j = 0; j < result.counter; j++) {
        if (result.ShopCounter[j] * result.avgtime[j] == 0) {
          result.avgtime[j]++;
          counter = j;
          console.log(j);
          tt = 0;
        }
      }
      await result.save();
      if (tt) {
        for (i = 0; i < result.counter; i++) {
          if (result.ShopCounter[i] * result.avgtime[i] < mini) {
            mini = result.ShopCounter[i] * result.avgtime[i];
            counter = i;
          }
        }
      }
      result.ShopCounter[counter]++;
      var pos = result.ShopCounter[counter];
      result.queue.push({ _id: userid, counter, time, pos });
      await result.save();
      /* client.messages.create({
                body:`We Have Assigned You Counter No ${counter+1}, Your waiting time ${mini}min .And your current postion is ${pos}  ^_^`,
                from:"+12136422814",
                to:`+91${ans.mobileno}`
            }).then(message=>console.log('message send'))
            .catch(err=>console.log(err)) */
      res.json({ counter: counter });
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.removeuser = async (req, res, next) => {
  try {
    const shopid = req.body.shopid;
    let userid = req.body.userid;
    const counter = req.body.counter - 1;
    let time = req.body.time;
    result = await shop.findOne({ _id: shopid });
    if (!result) {
      res.json("no shop exist");
      console.log("no shop exist");
    } else {
      if (result.countertime[counter] == 0) {
        result.countertime[counter] = time;
        await result.save();
      } else {
        if (result.avgtime[counter] == 0) {
          result.avgtime[counter] = time - result.countertime[counter];
          await result.save();
        } else {
          result.avgtime[counter] =
            (result.avgtime[counter] + (time - result.countertime[counter])) /
            2;
        }
        result.countertime[counter] = time;
        await result.save();
      }
      // console.log(result.queue.length);
      if (result.queue.length) {
        for (var i = 0; i < result.queue.length; i++) {
          if (result.queue[i].counter == counter) {
            if (userid == 0) {
              userid = result.queue[i]._id;
            }
            await shop.updateOne(
              { _id: shopid },
              {
                $pull: {
                  queue: { _id: userid },
                },
              },
              { safe: true }
            );
            result.ShopCounter[counter]--;
            await result.save();
            break;
          }
        }
      }
      res.status(201).json("user removed");
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.nearby = async (req, res, next) => {
  try {
    const long = req.body.long;
    const latti = req.body.latti;
    const result = await shop.find();
    var arr = [];
    for (var i = 0; i < result.length; i++) {
      arr.push({
        dist:
          Math.abs(long - result[i].long) + Math.abs(latti - result[i].latti),
        shop: result[i],
      });
    }
    arr.sort((a, b) => (a.dist > b.dist ? 1 : b.dist > a.dist ? -1 : 0));
    res.status(201).json(arr);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.details = async (req, res, next) => {
  try {
    const shopid = req.params.id;
    result = await shop.findById(shopid);
    res.status(201).json(result);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.joinedqueue = async (req, res, next) => {
  try {
    const userid = req.body.userid;
    result = await shop.find();
    console.log(result.length);
    var arr = [];
    for (var i = 0; i < result.length; i++) {
      for (var j = 0; j < result[i].queue.length; j++) {
        if (result[i].queue[j]._id == userid) {
          var cnt = result[i].queue[j].counter;
          var po = result[i].queue[j].pos;
          arr.push({
            _id: result[i]._id,
            timeleft: result[i].queue[j].time + po * result[i].avgtime[cnt],
            counter: result[i].queue[j].counter,
          });
        }
      }
    }
    res.status(201).json(arr);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.loadML = async (req, res, next) => {
  // For uploading bulk contact in contact model
  try {
    var options = {
      host: "https://6c7a-2405-205-1482-fa00-85f6-a648-8097-5f93.in.ngrok.io",
      path: "/customer",
    };
    var request = https.request(options, function (res) {
      var data = "";
      res.on("data", function (chunk) {
        data += chunk;
      });
      res.on("end", function () {
        console.log(data);
      });
    });
    request.on("error", function (e) {
      console.log(1);
    });
    request.end();
  } catch (err) {
    next(err);
  }
};
