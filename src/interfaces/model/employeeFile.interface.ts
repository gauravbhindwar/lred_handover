export interface IEmployeeFileCreate {
	name: string;
	fileName: string | null;
	fileLink?: string | boolean;
	fileSize: string;
	status: number;
	folderId?: number | null;
	employeeId: number;
}

export interface EmployeeFileAttributes {
	id?: number;
	name: string;
	fileName: string | null;
	fileLink?: boolean;
	fileSize: string;
	status: number;
	folderId?: number | null;
	employeeId: number;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	updatedBy?: number;
	deletedAt?: Date | string;
}

export interface IEmployeeFileUpdate {
	newFileName: string;
	folderId: number;
}
