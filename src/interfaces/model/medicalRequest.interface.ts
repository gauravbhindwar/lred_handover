import { RequiredKey } from './common.interface';

export enum medicalRequestStatus {
	ACTIVE = 'ACTIVE',
	CANCELLED = 'CANCELLED',
}

export interface IMedicalRequestCreate {
	employeeId: number;
	medicalTypeId: number;
	medicalDate: Date | string;
}

export interface MedicalRequestAttributes {
	id: number;
	reference: string;
	employeeId: number;
	medicalTypeId: number;
	medicalDate: Date;
	medicalExpiry: Date;
	status: string;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	updatedBy?: number;
	deletedAt?: Date | string;
}

export type RequiredMedicalRequestAttributes = RequiredKey<MedicalRequestAttributes, 'reference'>;
