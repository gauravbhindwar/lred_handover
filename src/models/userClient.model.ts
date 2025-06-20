import { DataTypes } from 'sequelize';

import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';

import { status, UserClientAttributes } from '../interfaces/model/user.interface';
import Client from './client.model';
import Role from './role.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'user_client',
	indexes: [],
})
export default class UserClient extends Model<UserClientAttributes> implements UserClientAttributes {
	@Column({
		primaryKey: true,
		autoIncrement: true,
		allowNull: false,
		type: DataTypes.INTEGER,
	})
	id: number;

	@ForeignKey(() => User)
	@Column({
		allowNull: false,
		type: DataTypes.INTEGER,
	})
	userId: number;

	@BelongsTo(() => User, {
		foreignKey: 'userId',
		constraints: false,
		as: 'userData',
	})
	userData?: User;

	@ForeignKey(() => Client)
	@Column({
		allowNull: false,
		type: DataTypes.INTEGER,
	})
	clientId: number;

	@BelongsTo(() => Client, {
		foreignKey: 'clientId',
		constraints: false,
		as: 'clientData',
	})
	clientData?: Client;

	@ForeignKey(() => Role)
	@Column
	roleId: number;

	@BelongsTo(() => Role, {
		foreignKey: 'roleId',
		constraints: false,
		as: 'roleData',
	})
	roleData?: Role;

	@Column({
		type: DataTypes.ENUM(...Object.values(status)),
		defaultValue: status.ACTIVE,
	})
	status: status;

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
