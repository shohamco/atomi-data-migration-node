require('dotenv').config();

const { main } = require("./src/functions");
(async () => await main())();
// process.exit(1);
// module.exports = { main };
