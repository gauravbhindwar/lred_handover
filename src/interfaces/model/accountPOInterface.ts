export interface IAccountPOCreateAttributes {
	timesheetId: number;
	type: string;
	poNumber: string;
	dailyRate: number;
	timesheetQty: number;
	startDate: Date;
	endDate: Date;
	segmentId?: number;
	subSegmentId?: number;
	invoiceNo?: string;
	isPaid?: boolean;
	managers?: string;
}

export interface AccountPOAttributes {
	timesheetId: number;
	type: string;
	poNumber: string;
	dailyRate: number;
	timesheetQty: number;
	startDate: Date;
	endDate: Date;
	segmentId?: number;
	subSegmentId?: number;
	invoiceNo?: string;
	isPaid?: boolean;
	managers?: string;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	updatedBy?: number;
	deletedAt?: Date | string;
}
