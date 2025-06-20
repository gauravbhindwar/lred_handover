import { RequiredKey } from './common.interface';

export interface IReliquatCalculationCreate {
	id?: number;
	employeeId: string[] | null;
	calculateEquation?: string | null;
	calculationDataJSON: string;
	timesheetId: number;
	clientId: number;
	totalTakenLeave?: number;
	reliquatPaymentValue?: number;
	reliquatAdjustmentValue?: number;
	earned?: number;
	presentDay?: number;
	absenseDay?: number;
	weekendBonus?: number;
	overtimeBonus?: number;
	totalWorked?: number;
	weekend?: number;
	annualLeave?: number;
	overtime?: number;
	reliquat?: number;
	reliquatValue?: number;
	reliquatPayment?: number;
	reliquatAdjustment?: number;
	calculation?: number;
	startDate?: Date | string;
	endDate?: Date | string;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	deletedAt?: Date | null;
}
export interface ReliquatCalculationAttributes {
	id?: number;
	employeeId: number;
	timesheetId: number;
	reliquatValue?: number;
	clientId: number;
	leave?: number;
	presentDay?: number;
	absenseDay?: number;
	annualLeave?: number;
	weekendBonus?: number;
	overtimeBonus?: number;
	totalTakenLeave: number;
	earned?: number;
	totalWorked?: number;
	weekend?: number;
	reliquatPaymentValue?: number;
	reliquatPayment?: number;
	reliquatAdjustmentValue?: number;
	reliquatAdjustment?: number;
	overtime?: number;
	reliquat?: number;
	calculateEquation?: string;
	calculationDataJSON: string;
	calculation?: number;
	startDate?: Date | string;
	endDate?: Date | string;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	deletedAt?: Date | null;
}

export type RequiredReliquatCalculationAttributes = RequiredKey<ReliquatCalculationAttributes, 'id'>;
