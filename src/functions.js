const { createObjectCsvWriter } = require("csv-writer");
const moment = require('moment');
const { connection } = require('./connection');
const { saveDataset } = require('./bigQuery');
const reportConfig = require('../config.json');
const queries = require('./queries');

const createCSV = async ({path, fields, rows}) => {
  const header = fields.map(field => ({
    id: field.name, title: field.name
  }));
  await createObjectCsvWriter({ path, header, fieldDelimiter: ';' }).writeRecords(rows);
}


const main = async (reportDate = null) => {
  try {
    const date = reportDate || moment().subtract(2, 'days').format('YYYY-MM-DD');
    console.log('report date: ', date);
    await connection.query(queries.setReportDate(date));

    for (const key in reportConfig) {
      if (key in queries && typeof queries[key] === "function") {
        console.log('Report: ', key);
        const [rows, fields] = await connection.query(queries[key](reportConfig[key]));
        const path = `/tmp/${key}.csv`;
        await createCSV({ path, fields, rows });
        await saveDataset(path, key);
        console.log('Done');
      }
    }
    console.log('Finished');
  } catch (e) {
    console.error(e.message);
  } finally {
    await connection.end();
  }
}

module.exports = {
  main
}
