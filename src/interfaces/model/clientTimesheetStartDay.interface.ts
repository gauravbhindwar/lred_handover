export interface IClientTimesheetStartDayCreate {
	clientId: number;
	timesheetStartDay: number;
}

export interface ClientTimesheetStartDayAttributes {
	id?: number;
	clientId: number;
	timesheetStartDay: number;
	date: Date;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	updatedBy?: number;
	deletedAt?: Date | string;
}
