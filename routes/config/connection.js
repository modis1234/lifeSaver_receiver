var mysql = require("mysql");
var dbconfig = require('./database');

//var conn = mysql.createConnection(dbconfig.operation);
//풀에서 컨넥션 생성
var pool = mysql.createPool(dbconfig.operation);



module.exports = pool;