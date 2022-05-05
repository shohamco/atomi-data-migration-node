const mysql = require('mysql2');

const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASS,
  DB_NAME,
  BIGQUERY_PROJECTID,
  BIGQUERY_KEYFILE,
  BIGQUERY_DATASET,
  NODE_ENV
} = process.env;

// const createConnection = async () => {
//   try {
//     const conn = await mysql.createConnection({
//       host: DB_HOST,
//       port: DB_PORT,
//       user: DB_USER,
//       password: DB_PASS,
//       database: DB_NAME,
//     });
//     console.log(await conn.execute("SELECT 1"));
//     return conn;
//   } catch (e) {
//     console.log(e.message);
//   }
// }


// const querySql = (sql) => {
//   mysql.createQuery()
// }

const connection = mysql.createConnection({
  host: DB_HOST,
  port: +DB_PORT,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  charset: "utf8mb4",
  dateStrings: [
    'DATE',
    'DATETIME'
  ]
}).promise();
// connection.connect(function(err){
//   if (err) {
//     return console.error("ERROR: " + err.message);
//   }
//   console.log("Database connected");
// });

module.exports = {
  connection
}
