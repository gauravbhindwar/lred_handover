import {
	EmployeeContractAttributes,
	RequiredEmployeeContractAttributes,
} from '@/interfaces/model/employeeContract.interface';
import { DataTypes } from 'sequelize';
import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import ContractTemplate from './contractTemplete.model';
import ContractTemplateVersion from './contractTempleteVersion.model';
import Employee from './employee.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'employee_contract',
	indexes: [],
})
export default class EmployeeContract
	extends Model<EmployeeContractAttributes, RequiredEmployeeContractAttributes>
	implements EmployeeContractAttributes
{
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
		as: 'employeeDetail',
	})
	employeeDetail?: Employee;

	@Column
	newContractNumber: string;

	@Column({
		allowNull: true,
		type: DataTypes.TEXT,
	})
	description: string;

	@Column({
		allowNull: true,
		type: DataTypes.DATE,
	})
	workOrderDate: Date;

	@Column({
		allowNull: true,
		type: DataTypes.DATE,
	})
	endOfAssignmentDate: Date;

	@Column({
		allowNull: true,
		type: DataTypes.STRING,
	})
	contractorsPassport: string;

	@Column({
		allowNull: true,
		type: DataTypes.STRING,
	})
	workOrderNumber: string;

	@Column({
		allowNull: true,
		type: DataTypes.NUMBER,
	})
	remuneration: number;

	@Column({
		allowNull: true,
		type: DataTypes.NUMBER,
	})
	uniqueWorkNumber: number;

	@Column({
		allowNull: true,
		type: DataTypes.STRING,
	})
	workCurrency: string;

	@Column({
		allowNull: true,
		type: DataTypes.TEXT,
	})
	descriptionOfAssignmentAndOrderConditions: string;

	@Column({
		allowNull: true,
		type: DataTypes.TEXT,
	})
	durationOfAssignment: string;

	@Column({
		allowNull: true,
		type: DataTypes.TEXT,
	})
	workLocation: string;

	@ForeignKey(() => ContractTemplate)
	@Column
	contractTemplateId: number;

	@BelongsTo(() => ContractTemplate, {
		foreignKey: 'contractTemplateId',
		constraints: false,
		as: 'contractTemplate',
	})
	contractTemplate?: ContractTemplate;

	@ForeignKey(() => ContractTemplateVersion)
	@Column
	contractVersionId: number;

	@BelongsTo(() => ContractTemplateVersion, {
		foreignKey: 'contractVersionId',
		constraints: false,
		as: 'contractTemplateVersion',
	})
	contractTemplateVersion?: ContractTemplateVersion;

	@Column
	startDate: Date;

	@Column
	endDate: Date;

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

	readonly toJSON = () => {
		const values = Object.assign({}, this.get());
		return values;
	};
}
