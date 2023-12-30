
const mysql = require("mysql");

exports.myDBConnect = function() {

const con = mysql.createConnection({
  host: "localhost",
  user: "fgwadm_evuser",
  password: "Change@2023",
  database: "fgwadm_fgwdb"
});

con.connect(function(err) {
  if (err) throw err;
  console.info("MySQL Connected 1");
});

return con;

};