import {
	ImportLogItemAttributes,
	RequiredImportLogItemAttributes,
	importLogStatus,
} from '@/interfaces/model/importLogItem.interface';
import { DataTypes } from 'sequelize';
import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import ImportLog from './importLog.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: false,
	tableName: 'import_log_items',
	indexes: [],
})
export default class ImportLogItems
	extends Model<ImportLogItemAttributes, RequiredImportLogItemAttributes>
	implements ImportLogItemAttributes
{
	@Column({
		primaryKey: true,
		autoIncrement: true,
		allowNull: false,
		type: DataTypes.INTEGER,
	})
	id: number;

	@Column({
		allowNull: false,
		type: DataTypes.STRING,
	})
	description: string;

	@ForeignKey(() => ImportLog)
	@Column
	importLogId: number;

	@BelongsTo(() => ImportLog, {
		foreignKey: 'importLogId',
		constraints: false,
		as: 'ImportLogData',
	})
	ImportLogData?: ImportLog;

	@Column({
		type: DataTypes.ENUM(...Object.values(importLogStatus)),
		defaultValue: importLogStatus.OK,
	})
	status: importLogStatus;

	@CreatedAt
	createdAt: Date;

	@ForeignKey(() => User)
	@Column
	createdBy: number;

	@BelongsTo(() => User, {
		foreignKey: 'createdBy',
		constraints: false,
		as: 'createdByUser',
	})
	createdByUser?: User;

	@UpdatedAt
	updatedAt: Date;

	@DeletedAt
	deletedAt: Date;

	readonly toJSON = () => {
		const values = Object.assign({}, this.get());
		return values;
	};
}
