import { SegmentAttributes } from '@/interfaces/model/segment.interface';
import { DataTypes } from 'sequelize';
import {
	BelongsTo,
	Column,
	CreatedAt,
	DeletedAt,
	ForeignKey,
	HasMany,
	Model,
	Table,
	UpdatedAt,
} from 'sequelize-typescript';
import Client from './client.model';
import Contact from './contact.model';
import Employee from './employee.model';
import EmployeeSegment from './employeeSegment.model';
import SubSegment from './subSegment.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'segment',
	indexes: [],
})
export default class Segment extends Model<SegmentAttributes> implements SegmentAttributes {
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

	@ForeignKey(() => Client)
	@Column
	clientId: number;

	@BelongsTo(() => Client, {
		foreignKey: 'clientId',
		constraints: false,
		as: 'client',
	})
	client?: Client;

	@ForeignKey(() => Contact)
	@Column
	contactId: number;

	@BelongsTo(() => Contact, {
		foreignKey: 'contactId',
		constraints: false,
		as: 'contact',
	})
	contact?: Contact;

	@Column({
		allowNull: false,
		type: DataTypes.STRING,
	})
	code: string;

	@Column({
		allowNull: false,
		type: DataTypes.NUMBER,
		defaultValue: 1,
	})
	timeSheetStartDay: number;

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
		allowNull: true,
		type: DataTypes.NUMBER,
	})
	vatRate: number;

	@Column({
		allowNull: true,
		type: DataTypes.TINYINT,
	})
	xeroFormat: number;

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

	@HasMany(() => EmployeeSegment)
	employeeSegment?: EmployeeSegment[];

	@HasMany(() => Employee)
	employee?: Employee[];

	@HasMany(() => SubSegment)
	subSegmentList?: SubSegment[];
}
