export interface ISegmentCreate {
	code: string | number;
	name: string;
	timeSheetStartDay: number;
	contactId: number;
	clientId: number;
	costCentre: string;
	fridayBonus: number;
	saturdayBonus: number;
	overtime01Bonus: number;
	overtime02Bonus: number;
	vatRate: number;
	xeroFormat: number;
	slug?: string;
	isActive: boolean;
}

export interface SegmentAttributes {
	id?: number;
	code: string | number;
	name: string;
	costCentre: string;
	contactId: number;
	fridayBonus: number;
	saturdayBonus: number;
	overtime01Bonus: number;
	overtime02Bonus: number;
	timeSheetStartDay: number;
	vatRate: number;
	xeroFormat: number;
	clientId: number;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	updatedBy?: number;
	deletedAt?: Date | string;
	slug?: string;
	isActive: boolean;
}
