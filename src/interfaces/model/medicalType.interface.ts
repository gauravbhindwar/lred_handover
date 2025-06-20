import { RequiredKey } from './common.interface';

export interface IMedicalTypeCreate {
	index: number;
	name: string;
	format: string;
	daysBeforeExpiry: number;
	daysExpiry: number;
	amount: number;
}

export interface MedicalTypeAttributes {
	id: number;
	index: number;
	name: string;
	format: string;
	amount: number;
	daysBeforeExpiry: number;
	daysExpiry: number;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	updatedBy?: number;
	deletedAt?: Date | string;
}

export type RequiredMedicalTypeAttributes = RequiredKey<MedicalTypeAttributes, 'index'>;
