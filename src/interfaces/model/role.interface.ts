import { RequiredKey } from './common.interface';

export interface IRoleCreate {
	name: string;
	assignPermissions: number[];
}

export interface RoleAttributes {
	id?: number;
	name: string;
	isViewAll: boolean;
	createdAt?: Date | string;
	updatedAt?: Date | string;
	deletedAt?: Date | string;
}

export type RequiredRoleAttributes = RequiredKey<RoleAttributes, 'name'>;
