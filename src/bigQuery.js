const { BigQuery } = require("@google-cloud/bigquery");

const { BIGQUERY_PROJECTID, BIGQUERY_KEYFILE, BIGQUERY_DATASET, NODE_ENV} = process.env;

const createBigQueryConnection = () => {
  const settings = {
    projectId: BIGQUERY_PROJECTID
  };
  if (NODE_ENV === "production") {
    settings.keyFilename = BIGQUERY_KEYFILE;
  }

  return new BigQuery(settings);
};

const bigQueryMetaData = {
  writeDisposition: "WRITE_TRUNCATE",
  autodetect: true,
  sourceFormat: "CSV",
  skipLeadingRows: 1,
  allowJaggedRows: true,
  allowQuotedNewlines: true,
  ignoreUnknownValues: true,
};

const bigqueryConnection = createBigQueryConnection();

const saveDataset = async (path, tableName) => {
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
}

module.exports = {
  saveDataset
}
