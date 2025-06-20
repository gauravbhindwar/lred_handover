import { DataTypes } from 'sequelize';

import {
	BeforeCreate,
	BeforeUpdate,
	Column,
	CreatedAt,
	DeletedAt,
	HasMany,
	HasOne,
	Model,
	Table,
	UpdatedAt,
} from 'sequelize-typescript';

import { passwordHook } from '@/hooks/user.hook';
import { LoginUserAttributes } from '../interfaces/model/user.interface';
import Client from './client.model';
import Employee from './employee.model';
import User from './user.model';
import UserPermission from './userPermission.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'login_user',
	defaultScope: { attributes: { exclude: ['code'] } },
	scopes: { withCode: { attributes: { exclude: [] } } },
	indexes: [],
})
export default class LoginUser extends Model<LoginUserAttributes> implements LoginUserAttributes {
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
	email: string;

	@Column
	firstName: string;

	@Column
	lastName: string;

	@Column
	name: string;

	@Column(DataTypes.TEXT)
	password: string;

	@Column(DataTypes.TEXT)
	randomPassword: string;

	@Column({
		unique: true,
		allowNull: true,
		type: DataTypes.TEXT,
	})
	uniqueLoginId: string;

	@Column
	birthDate: Date;

	@Column
	placeOfBirth: string;

	@Column
	gender: string;

	@Column
	code: string;

	@Column
	phone: string;

	@Column
	profileImage: string;

	@Column
	timezone: string;

	@Column
	isMailNotification: boolean;

	@CreatedAt
	createdAt: Date;

	@UpdatedAt
	updatedAt: Date;

	@DeletedAt
	deletedAt: Date;

	@HasOne(() => User)
	user?: User[];

	@HasMany(() => UserPermission)
	assignedUserPermission?: UserPermission[];

	@HasMany(() => Employee)
	employee?: Employee[];

	@HasMany(() => Client)
	client?: Client[];

	@BeforeCreate
	@BeforeUpdate
	static beforeCreateHook = async (user: LoginUser) => {
		await passwordHook(user);
	};

	readonly toJSON = () => {
		const values = Object.assign({}, this.get());
		return values;
	};
}
