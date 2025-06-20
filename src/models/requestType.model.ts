import { DataTypes } from 'sequelize';

import { RequestTypeAttributes, RequiredRequestTypeAttributes } from '@/interfaces/model/requestType.interface';
import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'request_type',
	indexes: [],
})
export default class RequestType
	extends Model<RequestTypeAttributes, RequiredRequestTypeAttributes>
	implements RequestTypeAttributes
{
	@Column({
		primaryKey: true,
		autoIncrement: true,
		allowNull: false,
		type: DataTypes.INTEGER,
	})
	id: number;

	@Column({
		type: DataTypes.STRING,
		allowNull: false,
	})
	name: string;

	@Column({
		type: DataTypes.TEXT,
	})
	notificationEmails: string;

	@Column({
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: true,
	})
	isActive: boolean;

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

	@ForeignKey(() => User)
	@Column
	updatedBy: number;

	@DeletedAt
	deletedAt: Date;
}
