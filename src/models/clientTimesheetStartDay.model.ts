import { ClientTimesheetStartDayAttributes } from '@/interfaces/model/clientTimesheetStartDay.interface';
import { DataTypes } from 'sequelize';
import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import Client from './client.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'client_timesheet_start_day',
	indexes: [],
})
export default class ClientTimesheetStartDay
	extends Model<ClientTimesheetStartDayAttributes>
	implements ClientTimesheetStartDayAttributes
{
	@Column({
		primaryKey: true,
		autoIncrement: true,
		allowNull: false,
		type: DataTypes.INTEGER,
	})
	id: number;

	@ForeignKey(() => Client)
	@Column
	clientId: number;

	@BelongsTo(() => Client, {
		foreignKey: 'clientId',
		constraints: false,
		as: 'client',
	})
	client?: Client;

	@Column
	timesheetStartDay: number;

	@Column({
		allowNull: true,
		type: DataTypes.DATE,
	})
	date: Date;

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
