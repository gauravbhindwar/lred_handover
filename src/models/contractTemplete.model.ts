import {
	ContractTemplateAttributes,
	RequiredContractTemplateAttributes,
} from '@/interfaces/model/contractTemplete.interface';
import { DataTypes } from 'sequelize';
import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import Client from './client.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'contract_template',
	indexes: [],
})
export default class ContractTemplate
	extends Model<ContractTemplateAttributes, RequiredContractTemplateAttributes>
	implements ContractTemplateAttributes
{
	@Column({
		primaryKey: true,
		autoIncrement: true,
		allowNull: false,
		type: DataTypes.INTEGER,
	})
	id: number;

	@Column
	contractName: string;

	@ForeignKey(() => Client)
	@Column({
		allowNull: true,
		type: DataTypes.INTEGER,
	})
	clientId: number;

	@BelongsTo(() => Client, {
		foreignKey: 'clientId',
		constraints: false,
		as: 'client',
	})
	client?: Client;

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

	readonly toJSON = () => {
		const values = Object.assign({}, this.get());
		return values;
	};
}
