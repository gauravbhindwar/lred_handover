import { MessageFormation } from '@/constants/messages.constants';
import { HttpException } from '@/exceptions/HttpException';
import { createHistoryRecord } from '@/helpers/history.helper';
import { IQueryParameters } from '@/interfaces/general/general.interface';
import { statusEnum, tableEnum } from '@/interfaces/model/history.interface';
import { IRoleCreate } from '@/interfaces/model/role.interface';
import Client from '@/models/client.model';
import Employee from '@/models/employee.model';
import Feature from '@/models/feature.model';
import LoginUser from '@/models/loginUser.model';
import Permission from '@/models/permission.model';
import RolePermission from '@/models/rolePermission.model';
import Segment from '@/models/segment.model';
import User from '@/models/user.model';
import UserClient from '@/models/userClient.model';
import UserPermission from '@/models/userPermission.model';
import UserSegment from '@/models/userSegment.model';
import { parse } from '@/utils/common.util';
import { Op } from 'sequelize';
import { default as Role } from '../models/role.model';
import BaseRepository from './base.repository';

export default class RoleRepo extends BaseRepository<Role> {
	constructor() {
		super(Role.name);
	}

	private msg = new MessageFormation('Role').message;

	async getAllRoleService(query: IQueryParameters) {
		const { page, limit, sortBy, sort } = query;
		const sortedColumn = sortBy || null;
		let data = await this.getAllData({
			where: { deletedAt: null, name: { [Op.ne]: 'Client' } },
			include: [
				{
					model: RolePermission,
					attributes: ['id', 'permissionId'],
					include: [
						{
							model: Permission,
							attributes: ['permissionName'],
							include: [{ model: Feature, attributes: ['name'] }],
						},
					],
				},
			],
			offset: page && limit ? (page - 1) * limit : undefined,
			limit: limit ?? undefined,
			order: [
				[sortedColumn ?? 'name', sort ?? 'asc'],
				['assignedPermissions', 'permission', 'feature', 'name', 'ASC'],
			],
		});
		data = parse(data);
		const responseObj = {
			data: data?.rows,
			count: data?.count,
			currentPage: page ?? undefined,
			limit: limit ?? undefined,
			lastPage: page && limit ? Math.ceil(data?.count / +limit) : undefined,
		};
		return responseObj;
	}

	async getRoleDataService(query: IQueryParameters) {
		try {
			const { type, roleMessageUser, clientId, segmentId, subSegmentId } = query;
			let segmentValue;
			let subSegmentValue;
			let where = null;
			let include = [];
			if (type === 'all') {
				where = {
					deletedAt: null,
				};
			} else {
				where = {
					deletedAt: null,
					...(roleMessageUser !== undefined
						? {
								name: { [Op.in]: ['manager', 'Employee'] },
						  }
						: {
								// name: {
								// 	[Op.in]: ['manager', 'Client', 'super admin', 'Admin', 'Employee', 'Preparator', 'Approvals'],
								// },
						  }),
				};
			}

			if (clientId) {
				if (segmentId && !Array.isArray(segmentId)) {
					segmentValue = Array.isArray(segmentId) ? segmentId : segmentId.toString().split(',').map(Number);
				}
				if (subSegmentId && !Array.isArray(subSegmentId)) {
					subSegmentValue = Array.isArray(subSegmentId) ? subSegmentId : subSegmentId.toString().split(',').map(Number);
				}
				include = [
					{
						model: User,
						attributes: ['id', 'loginUserId'],
						required: true,
						include: [
							{
								model: LoginUser,
								attributes: ['id'],
								include: [
									{
										model: Client,
										required: false,
										attributes: ['id'],
										where: {
											id: clientId,
										},
									},
									{
										model: Employee,
										required: false,
										attributes: ['id', 'clientId'],
										where: {
											clientId,
										},
									},
								],
							},
							{
								model: UserClient,
								required: false,
								where: {
									clientId,
								},
							},
							{
								model: UserSegment,
								required: segmentValue || subSegmentValue ? true : false,
								attributes: ['id', 'segmentId'],
								where: {
									[Op.or]: [
										{
											...(segmentValue && {
												[Op.and]: [{ segmentId: { [Op.in]: segmentValue } }, { subSegmentId: null }],
											}),
										},
										{
											...(subSegmentValue && {
												subSegmentId: { [Op.in]: subSegmentValue },
											}),
										},
									],
								},
								include: [
									{
										model: Segment,
										required: true,
										attributes: ['id', 'clientId'],
										where: {
											...(clientId && { clientId: clientId }),
										},
									},
								],
							},
						],
					},
				];
			}
			let data = await Role.findAll({
				where: where,
				attributes: ['id', 'name'],
				include: include,
			});
			data = parse(data);
			const responseObj = {
				data: data,
				count: data?.length,
			};

			return responseObj;
		} catch (error) {
			console.error(error);
		}
	}

	async getRoleByIdService(id: number) {
		const isFound = await Role.findOne({
			where: { id: id, deletedAt: null },
			attributes: ['id', 'name'],
			include: [
				{
					model: RolePermission,
					attributes: ['permissionId'],
					include: [
						{ model: Permission, attributes: ['permissionName'], include: [{ model: Feature, attributes: ['name'] }] },
					],
				},
			],
		});
		if (!isFound) {
			throw new HttpException(404, this.msg.notFound);
		}
		const data = parse(isFound);
		return data;
	}

	async addRoleService({ body, user }: { body: IRoleCreate; user: User }) {
		const isExist = await Role.findOne({ where: { name: body.name } });
		if (isExist) {
			throw new HttpException(200, this.msg.exist, {}, true);
		}
		let data = await Role.create({ name: body.name });
		data = parse(data);
		for (const element of body.assignPermissions) {
			const isExistData = await this.checkAvailableAssignedPermission(element, data.id);

			if (!isExistData) {
				await RolePermission.create({
					permissionId: element,
					roleId: data.id,
					createdBy: user.id,
				});
			}
		}
		data = await this.getRoleByIdService(data.id);

		await createHistoryRecord({
			tableName: tableEnum.ROLE,
			jsonData: parse(data),
			status: statusEnum.CREATE,
		});

		return data;
	}

	async checkAvailableAssignedPermission(permissionId: number, id: number) {
		return await RolePermission.findOne({ where: { permissionId: permissionId, roleId: id } });
	}

	async updateRoleService({ body, user, id }: { body: IRoleCreate; user: User; id: number }) {
		const isExist = await Role.findOne({ where: { name: body.name, id: { [Op.ne]: id } } });
		if (isExist) {
			throw new HttpException(200, this.msg.exist, {}, true);
		}
		let data = await Role.update({ name: body.name }, { where: { id: id } });
		const userList = await User.findAll({ where: { deletedAt: null, roleId: id } });
		for (const element of body.assignPermissions) {
			const isExistData = await this.checkAvailableAssignedPermission(element, id);

			if (!isExistData) {
				await RolePermission.create({
					permissionId: element,
					roleId: id,
					createdBy: user.id,
				});
				userList?.map(async (users) => {
					const isExistPermission = await UserPermission.findOne({
						where: { loginUserId: users.loginUserId, permissionId: element, roleId: id, deletedAt: null },
					});
					if (!isExistPermission)
						await UserPermission.create({
							permissionId: element,
							loginUserId: users.loginUserId,
							roleId: id,
							createdBy: user.id,
						});
				});
			}
		}
		const loginUserIds = userList?.map((users) => users.loginUserId);
		const removedPermission = await RolePermission.findAll({
			where: { roleId: id, permissionId: { [Op.notIn]: body.assignPermissions } },
		});
		removedPermission?.map(async (permission) => {
			await UserPermission.destroy({
				where: { loginUserId: { [Op.in]: loginUserIds }, permissionId: permission.permissionId },
			});
		});

		await RolePermission.destroy({ where: { roleId: id, permissionId: { [Op.notIn]: body.assignPermissions } } });
		data = await this.getRoleByIdService(id);

		await createHistoryRecord({
			tableName: tableEnum.ROLE,
			jsonData: parse(data),
			status: statusEnum.UPDATE,
		});

		return data;
	}

	async deleteRoleService({ id }: { id: number }) {
		const isFound = await Role.findOne({ where: { id: id } });
		if (!isFound) {
			throw new HttpException(404, this.msg.notFound);
		}
		const data = await Role.destroy({ where: { id: id } });
		return data;
	}
}
