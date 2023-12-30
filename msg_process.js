// MessageProcessor

const mysql = require("mysql");
// const dbcon = require("./db_connect");

// const con = dbcon.myDBConnect();
let ev_msglog;
let ev_client;
let BN_msg;
let SN_msg;
let STN_msg;
let STP_msg;
let AU_msg;
let HB_msg;
let RJ_msg;

exports.msgLogEV2S = function(ev_msglog, ev_client) {
    let mType, mId, mAction, mPayload;
    [mType, mId, mAction, mPayload] = JSON.parse(ev_msglog);

    const sql = "INSERT INTO Message_Log (Session_id, Sender, Receiver, Message_Type, Message) VALUES ('"+mId+"', '"+ev_client+"','OCPPSRV','"+mAction+"','" +JSON.stringify(mPayload)+"')";
    console.log("SQL Ready.."+sql);
    // con.query(sql, function (err, result) {
    //   if (err) throw err;
    //   console.log("1 record inserted");
    // });
};

exports.msgLogS2EV = function(ev_msglog, ev_client) {
  let mType, mId, mAction, mPayload;

  [mType, mId, mAction, mPayload] = JSON.parse(ev_msglog);

  const sql = "INSERT INTO Message_Log (Session_id, Sender, Receiver, Message_Type, Message) VALUES ('"+mId+"', 'OCPPSRV','"+ev_client+"','"+mAction+"','" +JSON.stringify(mPayload)+"')";
  console.log("SQL Ready.."+sql);
  // con.query(sql, function (err, result) {
  //   if (err) throw err;
  //   console.log("1 record inserted");
  // });
};

exports.processBootNotification = function(BN_msg) {
    //this.msgLog(BN_msg);
    return JSON.stringify({ status: "Accepted", currentTime: new Date(), interval: 10 });
};

exports.processStatusNotification = function(SN_msg) {
  return JSON.stringify({ });
};


exports.processStartTransaction = function(STN_msg) {
  let [a, b, c, ev_payload] = JSON.parse(STN_msg);
  let ev_idTag = JSON.parse(JSON.stringify(ev_payload)).idTag;
  return JSON.stringify({ status:"Accepted", idTagInfo:ev_idTag, transactionId:1 });
};

exports.processStopTransaction = function(STP_msg) {
//  let [a, b, c, ev_payload] = JSON.parse(STP_msg);
//  let ev_idTag = JSON.parse(JSON.stringify(ev_payload)).idTag;
  return JSON.stringify({ status:"Accepted" });
};

exports.processAuthorize = function(AU_msg) {
  let [a, b, c, ev_payload] = JSON.parse(AU_msg);
  let ev_idTag = JSON.parse(JSON.stringify(ev_payload)).idTag;
  return JSON.stringify({ status:"Accepted", idTagInfo:ev_idTag });
};

exports.processHeartbeat = function(HB_msg) {
  return JSON.stringify({ currentTime: new Date() });
};

exports.processRejected = function(RJ_msg) {
  return JSON.stringify({ status: "Rejected" });
};
