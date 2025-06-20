import { DataTypes } from 'sequelize';
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

import { ClientAttributes } from '@/interfaces/model/client.interface';
import ClientTimesheetStartDay from './clientTimesheetStartDay.model';
import LoginUser from './loginUser.model';
import SegmentTimesheetStartDay from './segmentTimesheetStartDay.model';
import User from './user.model';

@Table({
	timestamps: true,
	paranoid: true,
	tableName: 'client',
	indexes: [],
})
export default class Client extends Model<ClientAttributes> implements ClientAttributes {
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
	slug: string;

	@Column({
		allowNull: false,
		type: DataTypes.STRING,
	})
	code: string;

	@ForeignKey(() => LoginUser)
	@Column
	loginUserId: number;

	@BelongsTo(() => LoginUser, {
		foreignKey: 'loginUserId',
		constraints: false,
		as: 'loginUserData',
	})
	loginUserData?: LoginUser;

	@Column({
		allowNull: false,
		type: DataTypes.STRING,
	})
	country: string;

	@Column({
		type: DataTypes.STRING,
	})
	contractN: string;

	@Column({
		type: DataTypes.TEXT,
	})
	contractTagline: string;

	@Column({
		defaultValue: true,
		type: DataTypes.BOOLEAN,
	})
	isActive: boolean;

	@Column({
		allowNull: false,
		type: DataTypes.DATE,
	})
	startDate: Date;

	@Column({
		allowNull: false,
		type: DataTypes.DATE,
	})
	endDate: Date;

	@Column
	autoUpdateEndDate: number;

	@Column({
		allowNull: false,
		type: DataTypes.NUMBER,
		defaultValue: 1,
	})
	timeSheetStartDay: number;

	@Column
	approvalEmail: string;

	@Column({
		type: DataTypes.BOOLEAN,
		defaultValue: false,
	})
	isShowPrices: boolean;

	@Column({
		type: DataTypes.BOOLEAN,
		defaultValue: false,
	})
	isShowCostCenter: boolean;

	@Column({
		type: DataTypes.BOOLEAN,
		defaultValue: true,
	})
	isCountCR: boolean;

	@Column({
		type: DataTypes.BOOLEAN,
		defaultValue: false,
	})
	isShowCatalogueNo: boolean;

	@Column
	titreDeConge: string;

	@Column({
		type: DataTypes.BOOLEAN,
		defaultValue: false,
	})
	isResetBalance: boolean;

	@Column({
		type: DataTypes.NUMBER,
		allowNull: false,
		defaultValue: 0,
	})
	startMonthBack: number;

	@Column
	medicalEmailSubmission: string;

	@Column
	medicalEmailToday: string;

	@Column
	medicalEmailMonthly: string;

	@Column({
		type: DataTypes.STRING,
		allowNull: true,
	})
	weekendDays: string;

	@Column({
		type: DataTypes.STRING,
		allowNull: true,
	})
	address: string;

	@Column({
		type: DataTypes.STRING,
		allowNull: true,
	})
	currency: string;

	@Column({
		type: DataTypes.BOOLEAN,
		defaultValue: false,
		allowNull: false,
	})
	isAllDays: boolean;

	@Column({
		type: DataTypes.BOOLEAN,
		defaultValue: false,
	})
	isShowSegmentName: boolean;

	@Column({
		type: DataTypes.BOOLEAN,
		defaultValue: false,
	})
	isShowNSS: boolean;

	@Column({
		type: DataTypes.BOOLEAN,
		defaultValue: false,
	})
	isShowCarteChifa: boolean;

	@Column({
		type: DataTypes.BOOLEAN,
		defaultValue: false,
	})
	isShowSalaryInfo: boolean;

	@Column({
		type: DataTypes.BOOLEAN,
		defaultValue: false,
	})
	isShowRotation: boolean;

	@Column({
		type: DataTypes.BOOLEAN,
		defaultValue: false,
	})
	isShowBalance: boolean;

	@Column
	logo: string;

	@Column
	stampLogo: string;

	@Column
	segment: string;

	@Column
	subSegment: string;

	@Column
	bonusType: string;

	@Column({
		type: DataTypes.STRING,
	})
	oldClientId: string;

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

	@HasMany(() => ClientTimesheetStartDay)
	clientTimesheetStartDay?: ClientTimesheetStartDay[];

	@HasMany(() => SegmentTimesheetStartDay)
	segmentTimesheetStartDay?: SegmentTimesheetStartDay[];

	@UpdatedAt
	updatedAt: Date;

	@ForeignKey(() => User)
	@Column
	updatedBy: number;

	@DeletedAt
	deletedAt: Date;
}
