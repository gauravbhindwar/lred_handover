export interface IBonusTypeCreate {
	code: string;
	name: string;
	basePrice: number;
	timesheetName: string;
	isActive: boolean;
	dailyCost: number;
}

export interface BonusTypeAttributes {
	id?: number;
	code: string;
	name: string;
	basePrice: number;
	timesheetName: string;
	isActive?: boolean;
	dailyCost?: number;
	createdAt?: Date | string;
	createdBy?: number;
	updatedAt?: Date | string;
	updatedBy?: number;
	deletedAt?: Date | string;
}
