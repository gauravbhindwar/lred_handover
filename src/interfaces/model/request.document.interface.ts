export interface IRequestDocumentCreate {
	requestId?: number;
	documentType: number;
	otherInfo?: string;
	completedBy?: number;
	completedDate?: Date | string;
}

export enum requestStatus {
	ACTIVE = 'ACTIVE',
	DECLINED = 'DECLINED',
}

export interface RequestDocumentAttributes {
	id: number;
	requestId?: number;
	documentType: number;
	otherInfo?: string;
	completedBy?: number;
	status?: requestStatus;
	completedDate: Date | string;
	createdAt?: Date | string;
	updatedAt?: Date | string;
	deletedAt?: Date | string;
}
