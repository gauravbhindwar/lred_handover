import { RequiredKey } from './common.interface';

export interface IContractTemplateVersionCreate {
	id?: number;
	versionName?: string;
	description: string;
	clientId?: number;
	contractTemplateId: number;
	versionNo: number;
	isActive: boolean;
}
export interface ContractTemplateVersionAttributes {
	id?: number;
	contractTemplateId: number;
	clientId: number;
	versionName?: string;
	versionNo: number;
	description?: string;
	isActive: boolean;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	updatedBy?: number;
	deletedAt?: Date | string;
}

export type RequiredContractTemplateVersionAttributes = RequiredKey<ContractTemplateVersionAttributes, 'id'>;
