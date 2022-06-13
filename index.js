require('dotenv').config();

const { main } = require("./src/functions");
console.log('DIR: ', __dirname);
// (async () => await main())();
// process.exit(1);
module.exports = { main };
