export interface ITransportDriverDocumentCreate {
	clientId?: number;
	driverId: number;
	folderId: number;
	documentName: string;
	documentPath: string;
	documentSize: number;
	issueDate: Date | string;
	expiryDate: Date | string;
}

export interface TransportDriverDocumentAttributes {
	id: number;
	clientId?: number;
	driverId: number;
	folderId: number;
	documentName: string;
	documentPath: string;
	documentSize: number;
	issueDate: Date | string;
	expiryDate: Date | string;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	updatedBy?: number;
	deletedAt?: Date | string;
}
