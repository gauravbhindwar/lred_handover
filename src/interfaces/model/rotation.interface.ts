import { RequiredKey } from './common.interface';

export interface IRotationCreate {
	name: string;
	weekOn: number;
	weekOff: number;
	description: string;
	isResident: boolean;
	daysWorked: string;
	isAllDays: boolean;
	isWeekendBonus: boolean;
	isOvertimeBonus: boolean;
}

export interface RotationAttributes {
	id: number;
	name: string;
	weekOn: number;
	weekOff: number;
	description: string;
	isResident: boolean;
	daysWorked: string;
	isAllDays: boolean;
	isWeekendBonus: boolean;
	isOvertimeBonus: boolean;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	updatedBy?: number;
	deletedAt?: Date | string;
}

export type RequiredRotationAttributes = RequiredKey<RotationAttributes, 'name'>;
