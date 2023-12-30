const WebSocket = require("ws");

const msg_process = require("./msg_process");
//const dbcon = require("./db_connect");

let clientId;
const PORT = 3002;
const OCPP_PROTOCOL_1_6 = "ocpp1.6";
const CALL_MESSAGE = 2; // Client-to-Server
const CALLRESULT_MESSAGE = 3; // Server-to-Client
const CALLERROR_MESSAGE = 4; // Server-to-Client

/*DB Connection start
const con = dbcon.myDBConnect();
con.connect(function(err) {
  if (err) throw err;
  console.info("MySQL Connected at OCPP");
});
DB Connection end
*/

const BOOT_NOTIFICATION = 'BootNotification';
const STATUS_NOTIFICATION = 'StatusNotification';
const START_TRANSACTION = 'StartTransaction';
const STOP_TRANSACTION = 'StopTransaction';
const AUTHORIZE = 'Authorize';
const HEARTBEAT = 'Heartbeat';

const wsOption = {
  port: PORT,
  handleProtocols: (protocols, req) => {
    if (!protocols.has(OCPP_PROTOCOL_1_6)) return [""];

    return [OCPP_PROTOCOL_1_6];
  },
  verifyClient: (info, callback) => {
    clientId = info.req.url.split("/")[1];

    if (clientId == null || clientId == undefined || clientId == "undefined") {
      console.log("Invalid clientid, returning 404");
      return callback(false, 404, "Invalid clientid");
    }
    console.log("Valid clientid "+clientId);
    return callback(true);
  },
};

/**
 * initServer
 * This function is to initialize WebSocket server and bind
 * all the necessory events
 */
const initServer = () => {
  const server = new WebSocket.Server(wsOption, () => {
    console.info("Server is listening on port", PORT);
  });


  server.on("error", (ws, req) => {
    console.error(ws, req);
  });

  server.on("connection", (socket, req) => {
    socket.on("error", (err) => {
      console.error(err, socket.readyState);
    });

    socket.on("message", (msg) => {
      onMessage(msg, socket);
    });

    socket.on("close", (err) => {
      console.info("connection closed");
    });
  });
};

/**
 * onMessage
 * This function will handle all the incoming messages from Charge Point
 * @param {String} message Payload
 * @param {Server} socket Webserver object
 */
const onMessage = (message, socket) => {
  let msgType, msgId, action, payload;
    console.log('Received Msg..'+message);

  try {
    [msgType, msgId, action, payload] = JSON.parse(message);
    console.log('JSON Message parsed..'+message);
    console.log('msgType..'+msgType);
    console.log('msgId..'+msgId);
    console.log('action..'+action);
    console.log('payload..'+JSON.stringify(payload));
    console.log('idTag..'+ JSON.parse(JSON.stringify(payload)).idTag);
    msg_process.msgLogEV2S(message, clientId);


  } catch (err) {
    console.error(`Failed to parse message: "${message}", ${err}`);
  }

  if (msgType == CALL_MESSAGE) {
    switch (action) {
      case BOOT_NOTIFICATION:
        sendMessage(
          CALLRESULT_MESSAGE,
          msgId,
          action,
          msg_process.processBootNotification(message),
          socket
        );
        break;
      case STATUS_NOTIFICATION:
        sendMessage(
          CALLRESULT_MESSAGE,
          msgId,
          action,
          msg_process.processStatusNotification(message),
          socket
        );
        break;
        case START_TRANSACTION:
          sendMessage(
            CALLRESULT_MESSAGE,
            msgId,
            action,
            msg_process.processStartTransaction(message),
            socket
          );
        break;
        case STOP_TRANSACTION:
          sendMessage(
            CALLRESULT_MESSAGE,
            msgId,
            action,
            msg_process.processStopTransaction(message),
            socket
          );
        break;
        case AUTHORIZE:
          sendMessage(
            CALLRESULT_MESSAGE,
            msgId,
            action,
            msg_process.processAuthorize(message),
            socket
          );
        break;

        case HEARTBEAT:
          sendMessage(
            CALLRESULT_MESSAGE,
            msgId,
            action,
            msg_process.processHeartbeat(message),
            socket
          );
        break;

        default:
        sendMessage(
          CALLERROR_MESSAGE,
          msgId,
          action,
          msg_process.processRejected(message),
          socket
        );
        break;
    }
  }
};

/**
 * sendMessage
 * This function takes care of sending message to the Charge Point
 * @param {Number} msgType Message type code
 * @param {String} msgId Unique message id
 * @param {String} command Action name
 * @param {json} payload Json object
 * @param {Server} socket Webserver
 */
const sendMessage = (msgType, msgId, command, payload, socket) => {
  let msgtoLog = JSON.stringify([msgType, msgId, command, JSON.parse(payload)]);
  let msgtoSend = JSON.stringify([msgType, msgId, JSON.parse(payload)]);
  
  console.log("Ready to send msgType:"+msgType);
  console.log("Ready to send msgId:"+msgId);
  console.log("Ready to send payload:"+payload);

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(msgtoSend);
    msg_process.msgLogS2EV(msgtoLog, clientId);
    console.log("Socket ready to send msg "+msgtoSend);
  } else {
    console.log("Socket not ready, returning without sending");
  }
};

initServer();
