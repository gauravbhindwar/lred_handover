import { EmployeeFileAttributes } from '@/interfaces/model/employeeFile.interface';
import { DataTypes } from 'sequelize';
import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import Employee from './employee.model';
import Folder from './folder.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'employee_file',
	indexes: [],
})
export default class EmployeeFile extends Model<EmployeeFileAttributes> implements EmployeeFileAttributes {
	@Column({
		primaryKey: true,
		autoIncrement: true,
		allowNull: false,
		type: DataTypes.INTEGER,
	})
	id: number;

	@ForeignKey(() => Employee)
	@Column
	employeeId: number;

	@BelongsTo(() => Employee, {
		foreignKey: 'employeeId',
		constraints: false,
		as: 'employee',
	})
	employee?: Employee;

	@ForeignKey(() => Folder)
	@Column({
		allowNull: true,
		type: DataTypes.INTEGER,
	})
	folderId: number;

	@BelongsTo(() => Folder, {
		foreignKey: 'folderId',
		constraints: false,
		as: 'folder',
	})
	folder?: Folder;

	@Column({
		allowNull: true,
		type: DataTypes.STRING,
	})
	name: string;

	@Column({
		allowNull: true,
		type: DataTypes.BOOLEAN,
	})
	fileLink: boolean;

	@Column({
		allowNull: true,
		type: DataTypes.STRING,
	})
	fileName: string;

	@Column({
		allowNull: true,
		type: DataTypes.STRING,
	})
	fileSize: string;

	@Column({
		allowNull: true,
		type: DataTypes.NUMBER,
	})
	status: number;

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

	@BelongsTo(() => User, {
		foreignKey: 'updatedBy',
		constraints: false,
		as: 'updatedByUser',
	})
	updatedByUser?: User;

	@DeletedAt
	deletedAt: Date;
}
