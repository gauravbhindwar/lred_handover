import { DataTypes } from 'sequelize';

import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';

import { FolderAttributes, RequiredFolderAttributes } from '@/interfaces/model/folder.interface';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'folder',
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
export default class Folder extends Model<FolderAttributes, RequiredFolderAttributes> implements FolderAttributes {
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
		allowNull: false,
	})
	index: number;

	@Column({
		type: DataTypes.INTEGER,
		allowNull: false,
	})
	typeId: number;

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
