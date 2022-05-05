const { createObjectCsvWriter } = require("csv-writer");
const { connection } = require('./connection');
const reportConfig = require('../config.json');
const queries = require('./queries');

const createCSV = async ({path, fields, rows}) => {
  const header = fields.map(field => ({
    id: field.name, title: field.name
  }));
  await createObjectCsvWriter({ path, header, fieldDelimiter: ';' }).writeRecords(rows);
}


const main = async (_, __) => {
  try {
    await connection.query(queries.setReportDate('2022-04-05'));

    for (const key in reportConfig) {
      if (key in queries && typeof queries[key] === "function") {
        const [rows, fields] = await connection.query(queries[key](reportConfig[key]));
        await createCSV({ path: `./tmp/${key}.csv`, fields, rows });
      }
    }
    console.log('Finished');
  } catch (e) {
    console.error(e.message);
  } finally {
    connection.end();
  }
}

module.exports = {
  main
}
