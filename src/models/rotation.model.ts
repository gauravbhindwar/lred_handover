import { DataTypes } from 'sequelize';

import { RequiredRotationAttributes, RotationAttributes } from '@/interfaces/model/rotation.interface';
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
import EmployeeRotation from './employeeRotation.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'rotation',
	indexes: [
		{
			fields: ['email'],
			unique: true,
			where: {
				deletedAt: null,
			},
		},
	],
})
export default class Rotation
	extends Model<RotationAttributes, RequiredRotationAttributes>
	implements RotationAttributes
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
		type: DataTypes.INTEGER,
	})
	weekOn: number;

	@Column({
		type: DataTypes.INTEGER,
	})
	weekOff: number;

	@Column({
		type: DataTypes.STRING,
	})
	description: string;

	@Column({
		type: DataTypes.BOOLEAN,
		defaultValue: false,
		allowNull: false,
	})
	isResident: boolean;

	@Column({
		type: DataTypes.STRING,
	})
	daysWorked: string;

	@Column({
		type: DataTypes.BOOLEAN,
		defaultValue: false,
		allowNull: false,
	})
	isAllDays: boolean;

	@Column({
		type: DataTypes.BOOLEAN,
		defaultValue: false,
		allowNull: false,
	})
	isWeekendBonus: boolean;

	@Column({
		type: DataTypes.BOOLEAN,
		defaultValue: false,
		allowNull: false,
	})
	isOvertimeBonus: boolean;

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

	@HasMany(() => EmployeeRotation)
	employeeRotation?: EmployeeRotation[];

	@UpdatedAt
	updatedAt: Date;

	@ForeignKey(() => User)
	@Column
	updatedBy: number;

	@DeletedAt
	deletedAt: Date;
}
