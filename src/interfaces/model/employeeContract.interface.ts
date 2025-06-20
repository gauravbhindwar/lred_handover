import { RequiredKey } from './common.interface';

export interface IEmployeeContractCreate {
	employeeId: number;
	contractVersionId: number;
	contractTemplateId?: number;
	newContractNumber?: string;
	description?: string;
	startDate: Date | string;
	endDate: Date | string;
	pdfPath?: string;
	type?: string;
	workOrderDate?: Date | string | null;
	contractorsPassport?: string | number | null;
	endOfAssignmentDate?: Date | string | null;
	descriptionOfAssignmentAndOrderConditions?: string | null;
	durationOfAssignment?: string | null;
	workLocation?: string | null;
	workOrderNumber?: string | number | null;
	remuneration?: number | null;
	uniqueWorkNumber?: number | null;
	workCurrency?: string | null;
}
export interface EmployeeContractAttributes {
	id?: number;
	employeeId: number;
	contractVersionId: number;
	contractTemplateId?: number;
	newContractNumber?: string;
	description?: string;
	startDate: Date | string;
	endDate: Date | string;
	workOrderDate?: Date | string | null;
	contractorsPassport?: string | number | null;
	endOfAssignmentDate?: Date | string | null;
	descriptionOfAssignmentAndOrderConditions?: string | null;
	durationOfAssignment?: string | null;
	workLocation?: string | null;
	workOrderNumber?: string | number | null;
	remuneration?: number | null;
	uniqueWorkNumber?: number | null;
	workCurrency?: string | null;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	updatedBy?: number;
	pdfPath?: string;
	deletedAt?: Date | string;
}

export type RequiredEmployeeContractAttributes = RequiredKey<EmployeeContractAttributes, 'id'>;
