import { DataTypes } from 'sequelize';

import { MedicalTypeAttributes, RequiredMedicalTypeAttributes } from '@/interfaces/model/medicalType.interface';
import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'medical_type',
	indexes: [],
})
export default class MedicalType
	extends Model<MedicalTypeAttributes, RequiredMedicalTypeAttributes>
	implements MedicalTypeAttributes
{
	@Column({
		primaryKey: true,
		autoIncrement: true,
		allowNull: false,
		type: DataTypes.INTEGER,
	})
	id: number;

	@Column({
		type: DataTypes.INTEGER,
		allowNull: false,
	})
	index: number;

	@Column({
		type: DataTypes.STRING,
		allowNull: false,
	})
	name: string;

	@Column({
		type: DataTypes.STRING,
		allowNull: false,
	})
	format: string;

	@Column({
		type: DataTypes.INTEGER,
	})
	daysBeforeExpiry: number;

	@Column({
		type: DataTypes.INTEGER,
	})
	daysExpiry: number;

	@Column({
		type: DataTypes.FLOAT,
	})
	amount: number;

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
