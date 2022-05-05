const {
  createConnection,
  createJob,
  MYSQL_DATABASE,
} = require("./connection_old.js");
const {
  mainTableQuery,
  segmentsTableQuery,
  pagesTableQuery,
  segmentsTableQueryAll
} = require("./queries.js");

const mainExecution = async (mysqlConnection, bigqueryConnection) => {
  const mainQuery = mainTableQuery(MYSQL_DATABASE);
  await createJob(
    { mysqlConnection, bigqueryConnection },
    "mainTable",
    "/tmp/mainTable.csv",
    mainQuery
  );

  const pagesQuery = pagesTableQuery(MYSQL_DATABASE);
  await createJob(
    { mysqlConnection, bigqueryConnection },
    "pagesTable",
    "/tmp/pagesTable.csv",
    pagesQuery
  );

  const segmentsQuery = segmentsTableQuery(MYSQL_DATABASE);
  await createJob(
    { mysqlConnection, bigqueryConnection },
    "segmentsTable",
    "/tmp/segmentsTable.csv",
    segmentsQuery
  );

  const segmentsQueryAll = segmentsTableQueryAll(MYSQL_DATABASE);
  await createJob(
    { mysqlConnection, bigqueryConnection },
    "segmentsTableAll",
    "/tmp/segmentsTableAll.csv",
    segmentsQueryAll
  );
};

const main = async (req, res) => {
  try {
    await createConnection(mainExecution);
    console.log({ msg: "Task finished" });
  } catch (e) {
    console.log({ msg: "Error", error: JSON.stringify(e) });
  }
};

module.exports = { main };
