import { HistoryAttributes, statusEnum } from '@/interfaces/model/history.interface';
import { DataTypes } from 'sequelize';
import { Column, CreatedAt, Model, Table, UpdatedAt } from 'sequelize-typescript';

@Table({
	timestamps: true,
	paranoid: false,
	tableName: 'history',
	indexes: [],
})
export default class History extends Model<HistoryAttributes> implements HistoryAttributes {
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
	tableName: string;

	@Column({
		type: DataTypes.JSONB,
		allowNull: false,
	})
	jsonData: JSON;

	@Column({
		type: DataTypes.ENUM('CREATE', 'UPDATE'),
		allowNull: false,
		defaultValue: 'CREATE',
	})
	status: statusEnum;

	@CreatedAt
	createdAt?: Date;

	@UpdatedAt
	updatedAt?: Date;
}
