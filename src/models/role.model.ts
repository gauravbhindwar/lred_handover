import { DataTypes } from 'sequelize';

import { Column, CreatedAt, DeletedAt, HasMany, Model, Table, UpdatedAt } from 'sequelize-typescript';

import { RequiredRoleAttributes, RoleAttributes } from '@/interfaces/model/role.interface';
import RolePermission from './rolePermission.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'role',
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
export default class Role extends Model<RoleAttributes, RequiredRoleAttributes> implements RoleAttributes {
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
		type: DataTypes.BOOLEAN,
		allowNull: true,
		defaultValue: false,
	})
	isViewAll: boolean;

	@CreatedAt
	createdAt: Date;

	@UpdatedAt
	updatedAt: Date;

	@DeletedAt
	deletedAt: Date;

	@HasMany(() => RolePermission)
	assignedPermissions?: RolePermission[];

	@HasMany(() => User)
	users?: User[];
}
