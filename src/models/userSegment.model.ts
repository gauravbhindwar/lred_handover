import { DataTypes } from 'sequelize';

import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';

import { UserSegmentAttributes } from '../interfaces/model/user.interface';
import Client from './client.model';
import Segment from './segment.model';
import SubSegment from './subSegment.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'user_segment',
	indexes: [],
})
export default class UserSegment extends Model<UserSegmentAttributes> implements UserSegmentAttributes {
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
		type: DataTypes.INTEGER,
	})
	clientId: number;

	@BelongsTo(() => Client, {
		foreignKey: 'clientId',
		constraints: false,
		as: 'clientData',
	})
	clientData?: Client;

	@ForeignKey(() => Segment)
	@Column
	segmentId: number;

	@BelongsTo(() => Segment, {
		foreignKey: 'segmentId',
		constraints: false,
		as: 'segmentData',
	})
	segmentData?: Segment;

	@ForeignKey(() => SubSegment)
	@Column
	subSegmentId: number;

	@BelongsTo(() => SubSegment, {
		foreignKey: 'subSegmentId',
		constraints: false,
		as: 'subSegmentData',
	})
	subSegmentData?: SubSegment;

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
