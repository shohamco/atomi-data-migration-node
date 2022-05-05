const { BigQuery } = require("@google-cloud/bigquery");
const mysql = require("mysql2");
const { createObjectCsvWriter: createCsvWriter } = require("csv-writer");
const fs = require("fs");
const fsPromises = fs.promises;

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

const MYSQL_CONFIG = {
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  charset: "utf8mb4",
};

// const BIGQUERY_PROJECTID = "<PROJECT_ID>";
// const BIGQUERY_KEYFILE = "<PROJECT_SERVICE_ACC_KEY>"; // ex: ./atomi-337708-7211c3913d89.json
// const BIGQUERY_DATASET = "<DATASET_ID>";

const createBigQueryConnection = () => {
  const settings = {};
  settings.projectId = BIGQUERY_PROJECTID;
  if (NODE_ENV === "production") {
    settings.keyFilename = BIGQUERY_KEYFILE;
  }

  return new BigQuery(settings);
};

const createConnection = async (executeFunction) => {
  const bigqueryConnection = createBigQueryConnection();
  const mysqlConnection = await mysql.createConnection(MYSQL_CONFIG);

  await mysqlConnection.connect();

  await executeFunction(mysqlConnection, bigqueryConnection);

  await mysqlConnection.end();
};

const queryMySQL = (mysql, queryString) =>
  new Promise((resolve, reject) => {
    mysql.query(queryString, function (error, results, fields) {
      if (error) {
        console.error('Here is error', error);
        reject(error);
      }
      else resolve({ results: JSON.parse(JSON.stringify(results)), fields });
    });
  });

const createJob = async (
  { mysqlConnection, bigqueryConnection },
  tableName,
  path,
  query
) => {
  const { results, fields } = await queryMySQL(mysqlConnection, query);

  const mappedFields = fields.map((item) => ({ id: item.name, title: item.name }));

  console.log(JSON.stringify(mappedFields));
  console.log(results.length);
  console.log(results[0], results[1]);

  await createCsvWriter({
    path,
    header: mappedFields,
  }).writeRecords(results);

  const bigQueryMetaData = {
    writeDisposition: "WRITE_TRUNCATE",
    autodetect: true,
    sourceFormat: "CSV",
    skipLeadingRows: 1,
    allowJaggedRows: true,
    allowQuotedNewlines: true,
    ignoreUnknownValues: true,
  };

  try {
    await bigqueryConnection
        .dataset(BIGQUERY_DATASET)
        .table(tableName)
        .createLoadJob(path, bigQueryMetaData)
        .catch(err => {
          console.error('BigQuery:', err);
        });
  } catch(e) {
    console.error('BigQuery', e);
  }

  await fsPromises.unlink(path);
};

module.exports = {
  MYSQL_CONFIG,
  BIGQUERY_PROJECTID,
  BIGQUERY_KEYFILE,
  BIGQUERY_DATASET,
  createBigQueryConnection,
  createConnection,
  queryMySQL,
  createJob,
};
