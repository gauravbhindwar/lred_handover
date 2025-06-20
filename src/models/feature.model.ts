import { DataTypes } from 'sequelize';

import { FeaturesAttributes, RequiredFeaturesAttributes } from '@/interfaces/model/feature.interface';
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
import Permission from './permission.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'features',
	indexes: [
		{
			fields: ['name'],
			unique: true,
			where: {
				deletedAt: null,
			},
		},
	],
})
export default class Feature
	extends Model<FeaturesAttributes, RequiredFeaturesAttributes>
	implements FeaturesAttributes
{
	@Column({
		primaryKey: true,
		autoIncrement: true,
		allowNull: false,
		type: DataTypes.INTEGER,
	})
	id: number;

	@Column({
		allowNull: false,
		unique: true,
		type: DataTypes.STRING,
	})
	name: string;

	@Column({
		type: DataTypes.STRING,
	})
	type: string;

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
	createdByUser: User;

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
	updatedByUser: User;

	@DeletedAt
	deletedAt: Date;

	@HasMany(() => Permission)
	permissions?: Permission[];
}
