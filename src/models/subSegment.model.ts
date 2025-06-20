import { SubSegmentAttributes } from '@/interfaces/model/subSegment.interface';
import { DataTypes } from 'sequelize';
import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import Segment from './segment.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'sub_segment',
	indexes: [],
})
export default class SubSegment extends Model<SubSegmentAttributes> implements SubSegmentAttributes {
	@Column({
		primaryKey: true,
		autoIncrement: true,
		allowNull: false,
		type: DataTypes.INTEGER,
	})
	id: number;

	@Column({
		type: DataTypes.STRING,
	})
	slug: string;

	@ForeignKey(() => Segment)
	@Column
	segmentId: number;

	@BelongsTo(() => Segment, {
		foreignKey: 'segmentId',
		constraints: false,
		as: 'segment',
	})
	segment?: Segment;

	@Column({
		allowNull: false,
		type: DataTypes.STRING,
	})
	code: string;

	@Column({
		allowNull: false,
		type: DataTypes.STRING,
	})
	name: string;

	@Column({
		allowNull: true,
		type: DataTypes.STRING,
	})
	costCentre: string;

	@Column({
		allowNull: true,
		type: DataTypes.NUMBER,
	})
	fridayBonus: number;

	@Column({
		allowNull: true,
		type: DataTypes.NUMBER,
	})
	saturdayBonus: number;

	@Column({
		allowNull: true,
		type: DataTypes.NUMBER,
	})
	overtime01Bonus: number;

	@Column({
		allowNull: true,
		type: DataTypes.NUMBER,
	})
	overtime02Bonus: number;

	@Column({
		defaultValue: true,
		type: DataTypes.BOOLEAN,
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
