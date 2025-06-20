const dotEnv = require('dotenv');

dotEnv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

module.exports = {
	url: process.env.DATABASE_URL,
	dialect: 'postgres',
};
