import fs from 'fs';
import path from 'path';
import { ModelCtor, Sequelize } from 'sequelize-typescript';
import { DATABASE_URL, NODE_ENV } from '../config';

let db: Sequelize;

const initSequelize = () => {
	const _basename = path.basename(module.filename);
	const sequelize = new Sequelize(DATABASE_URL, {
		dialect: 'postgres',
		// dialectOptions: {
		// 	ssl: {
		// 		require: true,
		// 		rejectUnauthorized: false,
		// 	},
		// },
		logging: NODE_ENV === 'development' && console.log,
		// logging: false,
		pool: {
			max: 5,
			min: 0,
			acquire: 30000,
			idle: 10000,
		},
	});

	const _models = fs
		.readdirSync(__dirname)
		.filter((file: string) => {
			return (
				file !== _basename &&
				file !== 'interfaces' &&
				!file.endsWith('.d.ts') &&
				(file.slice(-3) === '.js' || file.slice(-3) === '.ts')
			);
		})
		.map((file: string) => {
			const model: ModelCtor = require(path.join(__dirname, file))?.default;
			return model;
		});

	sequelize.addModels(_models);
	return sequelize;
};

if (!db) {
	db = initSequelize();
}

export default db;
