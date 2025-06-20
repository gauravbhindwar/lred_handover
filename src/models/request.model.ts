import { RequestAttributes, collectionDelivery, status } from '@/interfaces/model/request.interface';
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
import Employee from './employee.model';
import EmployeeContract from './employeeContract.model';
import RequestDocument from './request.document.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'requests',
	indexes: [
		{
			fields: ['contractNumber'],
			unique: true,
			where: {
				deletedAt: null,
			},
		},
	],
})
export default class Request extends Model<RequestAttributes> implements RequestAttributes {
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
		type: DataTypes.INTEGER,
	})
	contractNumber: string;

	@ForeignKey(() => EmployeeContract)
	@Column({
		type: DataTypes.INTEGER,
	})
	contractId: number;

	@BelongsTo(() => EmployeeContract, {
		foreignKey: 'contractId',
		constraints: false,
		as: 'contractData',
	})
	contractData?: EmployeeContract;

	@ForeignKey(() => Employee)
	@Column({
		type: DataTypes.INTEGER,
	})
	employeeId: number;

	@BelongsTo(() => Employee, {
		foreignKey: 'employeeId',
		constraints: false,
		as: 'employee',
	})
	employee?: Employee;

	@Column({
		type: DataTypes.STRING,
	})
	mobileNumber: string;

	@Column({
		type: DataTypes.STRING,
		allowNull: false,
	})
	email: string;

	@Column({
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: false,
	})
	emailDocuments: boolean;

	@Column({
		type: DataTypes.ENUM(...Object.values(collectionDelivery)),
		defaultValue: collectionDelivery.COLLECTION,
	})
	collectionDelivery: collectionDelivery;

	@Column({
		type: DataTypes.DATE,
	})
	deliveryDate: Date;

	@Column({
		type: DataTypes.INTEGER,
		allowNull: false,
	})
	documentTotal: number;

	@Column({
		type: DataTypes.ENUM(...Object.values(status)),
		defaultValue: status.NEW,
	})
	status: status;

	@Column({
		type: DataTypes.DATE,
	})
	reviewedDate: Date;

	@ForeignKey(() => User)
	@Column({
		type: DataTypes.INTEGER,
	})
	reviewedBy: number;

	@BelongsTo(() => User, {
		foreignKey: 'reviewedBy',
		constraints: false,
		as: 'reviewedByUser',
	})
	reviewedByUser?: User;

	@ForeignKey(() => Client)
	@Column
	clientId: number;

	@BelongsTo(() => Client, {
		foreignKey: 'clientId',
		constraints: false,
		as: 'client',
	})
	client?: Client;

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

	@HasMany(() => RequestDocument)
	requestDocument?: RequestDocument[];
}
