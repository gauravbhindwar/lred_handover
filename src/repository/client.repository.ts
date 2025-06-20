import { FRONTEND_URL } from '@/config';
import { MessageFormation } from '@/constants/messages.constants';
import TimesheetController from '@/controllers/timesheet.controller';
import { HttpException } from '@/exceptions/HttpException';
import { createHistoryRecord } from '@/helpers/history.helper';
import { DefaultRoles } from '@/interfaces/functional/feature.interface';
import { IQueryParameters } from '@/interfaces/general/general.interface';
import { IClientCreate } from '@/interfaces/model/client.interface';
import { statusEnum, tableEnum } from '@/interfaces/model/history.interface';
import { queueStatus } from '@/interfaces/model/queue.interface';
import db from '@/models';
import Account from '@/models/account.model';
import ClientTimesheetStartDay from '@/models/clientTimesheetStartDay.model';
import Contact from '@/models/contact.model';
import ContractTemplate from '@/models/contractTemplete.model';
import ContractTemplateVersion from '@/models/contractTempleteVersion.model';
import Employee from '@/models/employee.model';
import EmployeeContract from '@/models/employeeContract.model';
import EmployeeFile from '@/models/employeeFile.model';
import EmployeeLeave from '@/models/employeeLeave.model';
import EmployeeRotation from '@/models/employeeRotation.model';
import EmployeeSalary from '@/models/employeeSalary.model';
import EmployeeSegment from '@/models/employeeSegment.model';
import ErrorLogs from '@/models/errorLogs.model';
import ImportLog from '@/models/importLog.model';
import ImportLogItems from '@/models/importLogItem.model';
import LoginUser from '@/models/loginUser.model';
import MedicalRequest from '@/models/medicalRequest.model';
import Message from '@/models/message.model';
import MessageDetail from '@/models/messageDetail.model';
import Queue from '@/models/queue.model';
import ReliquatAdjustment from '@/models/reliquatAdjustment.model';
import ReliquatCalculation from '@/models/reliquatCalculation.model';
import ReliquatCalculationV2 from '@/models/reliquatCalculationV2.model';
import ReliquatPayment from '@/models/reliquatPayment.model';
import RequestDocument from '@/models/request.document.model';
import Request from '@/models/request.model';
import Segment from '@/models/segment.model';
import SubSegment from '@/models/subSegment.model';
import Timesheet from '@/models/timesheet.model';
import TimesheetSchedule from '@/models/timesheetSchedule.model';
import TransportCapacity from '@/models/transport.capacity.model';
import TransportDriverDocument from '@/models/transport.driver.document.model';
import TransportDriver from '@/models/transport.driver.model';
import TransportModels from '@/models/transport.models.model';
import TransportPositions from '@/models/transport.positions.model';
import TransportRequest from '@/models/transport.request.model';
import TransportRequestVehicle from '@/models/transport.request.vehicle.model';
import TransportType from '@/models/transport.type.model';
import TransportVehicleDocument from '@/models/transport.vehicle.document.model';
import TransportVehicle from '@/models/transport.vehicle.model';
import User from '@/models/user.model';
import UserClient from '@/models/userClient.model';
import UserPermission from '@/models/userPermission.model';
import UserSegment from '@/models/userSegment.model';
import UserSegmentApproval from '@/models/userSegmentApproval.model';
import { fileDelete, generateUniquePassword, getClientAccessForUser, parse } from '@/utils/common.util';
import { generateModalData } from '@/utils/generateModal';
import * as bcrypt from 'bcrypt';
import _ from 'lodash';
import moment from 'moment';
import { Op, Transaction, col, fn } from 'sequelize';
import slugify from 'slugify';
import { default as Client } from '../models/client.model';
import BaseRepository from './base.repository';
import TimesheetRepo from './timesheet.repository';
import UserRepo from './user.repository';

export default class ClientRepo extends BaseRepository<Client> {
	constructor() {
		super(Client.name);
	}

	private msg = new MessageFormation('Client').message;
	private TimesheetService = new TimesheetRepo();
	private TimesheetController = new TimesheetController();
	private userRepository = new UserRepo();

	async getAllClientService(query: IQueryParameters, user: User) {
		const { page, limit, isActive, sortBy, sort, search } = query;
		const clientIds = getClientAccessForUser(user);
		const sortedColumn = sortBy || null;
		let data = await this.getAllData({
			where: {
				deletedAt: null,
				...(isActive != undefined && { isActive: isActive }),
				...(clientIds?.length > 0 && { id: { [Op.in]: clientIds } }),
			},
			include: [
				{ model: ClientTimesheetStartDay },
				{
					model: LoginUser,
					required: true,
					where: { ...(search && { name: { [Op.iLike]: '%' + search.toLowerCase() + '%' } }) },
					attributes: ['email', 'timezone', 'name'],
				},
			],
			offset: page && limit ? (page - 1) * limit : undefined,
			limit: limit ?? undefined,
			order: [[sortedColumn ?? 'code', sort ?? 'asc']],
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

	async findAllClientForSearchDropdown(query: IQueryParameters, user: User) {
		const { isActive } = query;
		const clientIds = getClientAccessForUser(user);
		const data = await this.getAll({
			where: {
				deletedAt: null,
				...(isActive != undefined && { isActive: isActive }),
				...(clientIds?.length > 0 && { id: { [Op.in]: clientIds } }),
			},
			include: [
				{
					model: LoginUser,
					required: true,
					attributes: ['name'],
				},
			],
		});
		const dropdownData = data?.map((finalData) => {
			return {
				label: `${finalData?.loginUserData?.name}`,
				value: `${finalData?.loginUserData?.name}`,
			};
		});
		return dropdownData;
	}

	async getClientData(user: User) {
		let detailedUserData = await this.userRepository.get({
			where: { id: user?.id },
			include: [
				{
					model: UserClient,
					attributes: ['clientId'],
				},
				{
					model: UserSegment,
					attributes: ['id', 'segmentId', 'subSegmentId'],
				},
			],
			attributes: ['id', 'loginUserId', 'roleId', 'status'],
			rejectOnEmpty: false,
		});
		detailedUserData = parse(detailedUserData);
		const clientId = getClientAccessForUser(detailedUserData);
		if (user.roleData.name === DefaultRoles.Employee) {
			const employee = await Employee.findAll({ where: { loginUserId: user.loginUserId } });
			if (employee?.length > 0) {
				for (const employeeData of employee) {
					if (!clientId.includes(employeeData?.clientId)) {
						clientId.push(employeeData?.clientId);
					}
				}
			}
		}
		if (user.roleData.name === DefaultRoles.Client) {
			const client = await Client.findOne({
				where: { loginUserId: user.loginUserId },
			});
			if (client?.id && !clientId.includes(client?.id)) {
				clientId.push(client?.id);
			}
		}
		let data = await this.getAllData({
			where: { isActive: true, deletedAt: null, ...(clientId?.length > 0 && { id: { [Op.in]: clientId } }) },
			include: [
				{ model: LoginUser, required: true, attributes: ['email', 'timezone', 'name'] },
				{ model: ClientTimesheetStartDay },
			],
			attributes: [
				'id',
				'slug',
				'code',
				'startDate',
				'endDate',
				'autoUpdateEndDate',
				'isShowSalaryInfo',
				'isShowCarteChifa',
				'isShowBalance',
				'weekendDays',
				'isAllDays',
				'isShowPrices',
				'isShowNSS',
				'isCountCR',
				'isShowRotation',
			],
			order: [
				[{ model: LoginUser, as: 'loginUserData' }, 'name', 'ASC'],
				['clientTimesheetStartDay', 'date', 'asc'],
			],
		});
		data = parse(data);
		const responseObj = {
			data: data?.rows,
			count: data?.count,
		};
		return responseObj;
	}

	async getClientByIdService(id: number, transaction: Transaction = null) {
		try {
			const isFound = await Client.findOne({
				where: { id: id, deletedAt: null },
				include: [{ model: LoginUser, required: true, attributes: ['email', 'timezone', 'name'] }],
				transaction,
			});
			if (!isFound) {
				throw new HttpException(404, this.msg.notFound);
			}
			const isQueueInProcess = await Queue.findOne({
				where: {
					clientId: id,
					status: {
						[Op.or]: [
							{
								[Op.eq]: queueStatus.INPROGRESS,
							},
							{
								[Op.eq]: queueStatus.RETAKE,
							},
							{
								[Op.eq]: queueStatus.PENDING,
							},
						],
					},
				},
			});
			let data = parse(isFound);
			if (isQueueInProcess) {
				data = { ...data, isUpdateInProcess: true };
			} else {
				data = { ...data, isUpdateInProcess: false };
			}
			return data;
		} catch (error) {
			throw new Error(error);
		}
	}

	async getClientForTimesheet(id: number) {
		const isFound = await Client.findOne({
			where: { id: id, deletedAt: null },
			include: [
				{ model: LoginUser, required: true, attributes: ['email', 'timezone', 'name'] },
				{ model: ClientTimesheetStartDay },
			],
			order: [['clientTimesheetStartDay', 'date', 'asc']],
		});
		if (!isFound) {
			throw new HttpException(404, this.msg.notFound);
		}
		const data = parse(isFound);
		return data;
	}

	async getClientBySlugService(slug: string) {
		const isFound = await Client.findOne({
			where: { slug: slug, deletedAt: null },
			include: [{ model: LoginUser, required: true, attributes: ['email', 'timezone', 'name'] }],
		});
		if (!isFound) {
			throw new HttpException(404, this.msg.notFound);
		}
		const data = parse(isFound);
		return data;
	}

	async addClientService({ body, user }: { body: IClientCreate; user: User }) {
		const bodyData = _.omit(body, [
			'approvalEmail',
			'titreDeConge',
			'isShowPrices',
			'medicalEmailSubmission',
			'medicalEmailToday',
			'medicalEmailMonthly',
		]);
		bodyData.startDate = moment(moment(bodyData?.startDate).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate();
		bodyData.endDate = moment(moment(bodyData?.endDate).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate();
		if (body.email) {
			const isExistEmail = await LoginUser.findOne({ where: { email: { [Op.iLike]: body.email }, deletedAt: null } });
			if (isExistEmail) {
				throw new HttpException(200, 'Email Already Exist in this platform', {}, true);
			}
		}
		const isExist = await Client.findOne({ where: { code: body.code.toString(), createdBy: user.id } });
		if (isExist) {
			throw new HttpException(200, 'Client Code Already Exist', {}, true);
		}

		const uniqueSlug = body.name + body.code;

		const slug = slugify(uniqueSlug, { lower: true, replacement: '-' });
		const randomPassword = generateUniquePassword();
		const loginUserData = await LoginUser.create({
			email: body.email,
			name: body.name,
			timezone: body.timezone ? body.timezone : null,
			randomPassword: randomPassword,
			profileImage: body.logo ? body.logo : null,
			isMailNotification: false,
			uniqueLoginId: null,
		});
		const daysWorked = body.weekendDays ? body.weekendDays.split(',') : [];
		let isAllDays = false;

		if (daysWorked.length == 7) {
			isAllDays = true;
		}

		let data = await Client.create({
			...bodyData,
			slug,
			loginUserId: loginUserData.id,
			isShowPrices: body.isShowPrices,
			weekendDays: body.weekendDays ? body.weekendDays : '',
			isAllDays: isAllDays,
			approvalEmail: body.approvalEmail ? body.approvalEmail.toString() : null,
			titreDeConge: body.titreDeConge ? body.titreDeConge.toString() : null,
			medicalEmailSubmission: body.medicalEmailSubmission ? body.medicalEmailSubmission.toString() : '',
			medicalEmailToday: body.medicalEmailToday ? body.medicalEmailToday.toString() : '',
			medicalEmailMonthly: body.medicalEmailMonthly ? body.medicalEmailMonthly.toString() : '',
			createdBy: user.id,
		});
		data = await this.getClientByIdService(data.id);
		await ClientTimesheetStartDay.create({
			clientId: data.id,
			timesheetStartDay: data.timeSheetStartDay,
			date: moment(moment(data.startDate).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate(),
			createdBy: user.id,
		});

		// const roleData = await Role.findOne({
		// 	where: {
		// 		name: 'Client',
		// 		deletedAt: null,
		// 	},
		// 	include: {
		// 		model: RolePermission,
		// 		attributes: ['permissionId'],
		// 	},
		// });

		// if (roleData) {
		// 	const userData = await User.create({
		// 		loginUserId: loginUserData.id,
		// 		roleId: roleData.id,
		// 		status: status.ACTIVE,
		// 	});

		// 	if (userData) {
		// 		await UserClient.create({
		// 			clientId: data.id,
		// 			roleId: roleData.id,
		// 			userId: userData.id,
		// 			status: status.ACTIVE,
		// 			createdBy: user.id,
		// 		});
		// 		for (const permissions of roleData.assignedPermissions) {
		// 			await UserPermission.create({
		// 				permissionId: permissions.permissionId,
		// 				loginUserId: loginUserData.id,
		// 				roleId: roleData.id,
		// 				createdBy: user.id,
		// 			});
		// 			await UserPermission.create({
		// 				clientId: data.id,
		// 				permissionId: permissions.permissionId,
		// 				loginUserId: loginUserData.id,
		// 				roleId: roleData.id,
		// 				createdBy: user.id,
		// 			});
		// 		}
		// 		const replacement = {
		// 			username: body.name,
		// 			useremail: body.email,
		// 			password: randomPassword,
		// 			logourl: FRONTEND_URL + '/assets/images/lred-main-logo.png',
		// 			url: FRONTEND_URL,
		// 		};

		// 		// if (body.email) {
		// 		// 	await sendMail([body.email,'admin@lred.com'], 'Credentials', 'userCredentials', replacement);
		// 		// }
		// 	}
		// }

		await createHistoryRecord({
			tableName: tableEnum.CLIENT,
			jsonData: parse(data),
			status: statusEnum.CREATE,
		});

		return data;
	}

	async updateClientStatus({ body, id }: { body: IClientCreate; id: number }) {
		const isExistClient = await Client.findOne({ where: { id: id } });
		if (!isExistClient) {
			throw new HttpException(404, this.msg.notFound);
		}

		await Client.update({ isActive: body.isActive }, { where: { id: id } });
		const data = await this.getClientByIdService(id);
		return data;
	}

	async changeInEndDate(bodyData, isExistClient, transaction: Transaction = null) {
		try {
			const ed = moment(bodyData?.endDate);
			let lastApprovedDate;
			if (ed.isSameOrBefore(moment(moment().format('DD-MM-YYYY'), 'DD-MM-YYYY'))) {
				lastApprovedDate = await Timesheet.findOne({
					where: {
						clientId: isExistClient.id,
						startDate: { [Op.lte]: moment(moment().format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate() },
						status: 'APPROVED',
					},
					order: [['endDate', 'desc']],
					transaction,
				});
			} else {
				lastApprovedDate = await Timesheet.findOne({
					where: {
						clientId: isExistClient.id,
						startDate: { [Op.lt]: moment(ed.format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate() },
						status: 'APPROVED',
					},
					order: [['endDate', 'desc']],
					transaction,
				});
			}
			lastApprovedDate = parse(lastApprovedDate);
			let allEmp = await Employee.findAll({
				attributes: ['id'],
				where: {
					clientId: isExistClient.id,
				},
				transaction,
			});
			allEmp = parse(allEmp);
			await Timesheet.destroy({
				where: {
					clientId: isExistClient.id,
					startDate: {
						[Op.gte]: moment(lastApprovedDate.endDate).isSameOrBefore(bodyData?.endDate)
							? moment(lastApprovedDate?.endDate)
							: bodyData?.endDate,
					},
				},
				transaction,
			});

			await TimesheetSchedule.destroy({
				where: {
					employeeId: { [Op.in]: allEmp.map((dat) => dat.id) },
					date: {
						[Op.gt]: moment(lastApprovedDate.endDate).isSameOrBefore(bodyData?.endDate)
							? moment(lastApprovedDate?.endDate)
							: bodyData?.endDate,
					},
				},
				transaction,
			});
			return;
		} catch (error) {
			throw new Error(error);
		}
	}

	async updateClientService({ body, user, id }: { body: IClientCreate; user: User; id: number }) {
		const transaction = await db.transaction();
		try {
			await generateModalData({ user: user, percentage: 0, message: 'Updating Client' });
			const bodyData = _.omit(body, [
				'approvalEmail',
				'titreDeConge',
				'medicalEmailSubmission',
				'isShowPrices',
				'medicalEmailToday',
				'medicalEmailMonthly',
			]);
			const isExistClient = await Client.findOne({
				where: { id: id },
				include: [
					{
						model: LoginUser,
						attributes: ['email'],
					},
				],
				transaction,
			});
			if (!isExistClient) {
				throw new HttpException(404, this.msg.notFound);
			}
			bodyData.startDate = moment(moment(bodyData?.startDate).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate();
			bodyData.endDate = moment(moment(bodyData?.endDate).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate();
			if (body.email) {
				const isExistEmail = await LoginUser.findOne({
					where: { email: { [Op.iLike]: body.email }, id: { [Op.ne]: isExistClient.loginUserId }, deletedAt: null },
					transaction,
				});
				if (isExistEmail) {
					throw new HttpException(200, 'Email Already Exist in this platform', {}, true);
				}
			}

			let randomPassword: string;
			if (isExistClient?.loginUserData?.email !== bodyData?.email && !isExistClient?.loginUserData?.password) {
				randomPassword = generateUniquePassword();
			}

			// if (image?.filename) body.logo = `/logo/${image?.filename}`;
			// else if (body.logo === null || body.logo === '') body.logo = null;

			await LoginUser.update(
				{
					email: bodyData.email,
					name: bodyData.name,
					timezone: bodyData.timezone ? bodyData.timezone : null,
					profileImage: bodyData.logo ? bodyData.logo : null,
					...(randomPassword && { randomPassword: await bcrypt.hash(randomPassword, 10) }),
				},
				{ where: { id: isExistClient.loginUserId }, transaction },
			);

			const uniqueSlug = body.name + body.code;

			const slug = slugify(uniqueSlug, { lower: true, replacement: '-' });
			const daysWorked = body.weekendDays ? body.weekendDays.split(',') : [];
			let isAllDays = false;

			if (daysWorked.length == 7) {
				isAllDays = true;
			}

			await generateModalData({ user: user, percentage: 10, message: 'Updating Client' });
			await Client.update(
				{
					...bodyData,
					isShowPrices: body.isShowPrices,
					slug,
					weekendDays: body.weekendDays ? body.weekendDays : '',
					isAllDays: isAllDays,
					logo: body.logo ? body.logo : '',
					approvalEmail: body.approvalEmail ? body.approvalEmail.toString() : '',
					titreDeConge: body.titreDeConge ? body.titreDeConge.toString() : '',
					medicalEmailSubmission: body.medicalEmailSubmission ? body.medicalEmailSubmission.toString() : '',
					medicalEmailToday: body.medicalEmailToday ? body.medicalEmailToday.toString() : '',
					medicalEmailMonthly: body.medicalEmailMonthly ? body.medicalEmailMonthly.toString() : '',
					updatedBy: user.id,
				},
				{ where: { id: id }, transaction },
			);
			// fileDelete(`public${isExistClient?.logo}`);

			// if (isExistClient.autoUpdateEndDate !== bodyData.autoUpdateEndDate) {
			// 	if (bodyData.autoUpdateEndDate < isExistClient.autoUpdateEndDate) {
			// 		this.changeInEndDate(bodyData, isExistClient, transaction);
			// 	} else {
			// 		let allEmployeeData = await Employee.findAll({
			// 			attributes: ['id'],
			// 			where: {
			// 				deletedAt: null,
			// 				clientId: isExistClient.id,
			// 				[Op.or]: [
			// 					{ terminationDate: null },
			// 					{ terminationDate: { [Op.gt]: moment(moment().endOf('day')).toDate() } },
			// 				],
			// 			},
			// 		});
			// 		allEmployeeData = parse(allEmployeeData);
			// 		let tempEmployeeIds = allEmployeeData.map((e) => e.id);
			// 		await this.TimesheetController.createTimesheet(
			// 			{ clientId: isExistClient.id, employeeIds: tempEmployeeIds, user: user },
			// 			transaction,
			// 		);
			// 	}
			// }

			if (isExistClient.timeSheetStartDay !== bodyData.timeSheetStartDay) {
				let ifExist = await ClientTimesheetStartDay.findOne({
					where: { clientId: isExistClient.id, date: moment(moment().format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate() },
					transaction,
				});
				ifExist = parse(ifExist);
				if (!ifExist) {
					await ClientTimesheetStartDay.create(
						{
							clientId: isExistClient.id,
							timesheetStartDay: bodyData.timeSheetStartDay,
							date: moment(moment().format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate(),
							createdBy: user.id,
						},
						{ transaction },
					);
				} else {
					await ClientTimesheetStartDay.update(
						{
							clientId: isExistClient.id,
							timesheetStartDay: bodyData.timeSheetStartDay,
							date: moment(moment().format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate(),
							createdBy: user.id,
						},
						{
							where: { clientId: isExistClient.id, date: moment(moment().format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate() },
							transaction,
						},
					);
				}
				const diffDate = bodyData.timeSheetStartDay - isExistClient.timeSheetStartDay;

				const today = moment();
				let allEmp = await Employee.findAll({
					attributes: ['id'],
					where: {
						clientId: isExistClient.id,
					},
					transaction,
				});
				allEmp = parse(allEmp);
				await Promise.all(
					allEmp.map(async (empDat) => {
						const timeSheetData = await this.TimesheetService.getAllTimesheetByEmployeeId(empDat.id, transaction);
						await Promise.all(
							timeSheetData?.map(
								async (timesheet: {
									id: number;
									startDate: Date;
									endDate: Date;
									segmentId: number;
									subSegmentId: number;
								}) => {
									if (today.isSameOrBefore(timesheet.endDate) && today.isSameOrAfter(timesheet.startDate)) {
										await this.TimesheetService.updateTimesheetService({
											body: {
												endDate: moment(timesheet.endDate).add(diffDate, 'days').toDate(),
											},
											user,
											id: timesheet.id,
											transaction,
										});
									} else if (moment(timesheet.startDate).isAfter(today)) {
										await this.TimesheetService.updateTimesheetService({
											body: {
												startDate: moment(timesheet.startDate).add(diffDate, 'days').toDate(),
												endDate: moment(timesheet.endDate).add(diffDate, 'days').toDate(),
												// dbKey: `${moment(timesheet.startDate).add(diffDate, 'days').format('DDMMYYYY')}${empDat.id}`,
												dbKey: `${moment(timesheet.startDate, 'YYYY-MM-DD').format('DDMMYYYY')}${timesheet.segmentId}${
													timesheet.subSegmentId || ''
												}${empDat.id}`,
											},
											user,
											id: timesheet.id,
											transaction,
										});
									}
								},
							),
						);
					}),
				);
			}

			if (!moment(isExistClient.endDate).isSame(bodyData.endDate)) {
				await generateModalData({ user: user, percentage: 15, message: 'Updating Client' });
				if (moment(bodyData.endDate).isBefore(isExistClient.endDate)) {
					await generateModalData({ user: user, percentage: 20, message: 'Updating Timesheet' });
					await this.changeInEndDate(bodyData, isExistClient, transaction);
				} else {
					await generateModalData({ user: user, percentage: 20, message: 'Updating Client' });
					let allEmployeeData = await Employee.findAll({
						attributes: ['id', 'clientId'],
						where: {
							deletedAt: null,
							clientId: isExistClient.id,
							terminationDate: null,
							segmentId: {
								[Op.ne]: null,
							},
							// [Op.or]: [
							// 	{ terminationDate: null },
							// 	{ terminationDate: { [Op.gt]: moment(moment().endOf('day')).toDate() } },
							// ],
						},
						transaction,
					});
					allEmployeeData = parse(allEmployeeData);
					// const tempEmployeeIds = allEmployeeData.map((e) => e.id);
					const createData = [];
					await generateModalData({ user: user, percentage: 40, message: 'Updating Client' });
					for (const e of allEmployeeData) {
						// await this.TimesheetController.createTimesheet(
						// 	{ clientId: isExistClient.id, employeeIds: [e.id], user: user },
						// 	transaction,
						// );
						createData.push({
							employeeId: e?.id,
							clientId: e?.clientId,
							processName: 'TIMESHEET_EXTENSION',
							clientEndDate: moment(moment(bodyData.endDate).format('DD/MM/YYYY'), 'DD/MM/YYYY').toDate(),
							createdBy: user?.id,
						});
					}
					await generateModalData({ user: user, percentage: 60, message: 'Updating Client' });
					if (createData?.length > 0) {
						await Queue.bulkCreate(createData, { transaction });
					}
					// allEmployeeData.map(async (e) => {
					// 	await this.TimesheetController.createTimesheet(
					// 		{ clientId: isExistClient.id, employeeIds: [e.id], user: user },
					// 		transaction,
					// 	);
					// 	// await this.TimesheetController.createTimesheet(
					// 	// 	{ clientId: isExistClient.id, employeeIds: [tempEmployeeIds], user: user },
					// 	// 	transaction,
					// 	// );
					// });
				}
			}
			// else {
			// 	await this.TimesheetController.createTimesheet({ clientId: isExistClient.id, user: user }, transaction);
			// }
			const data = await this.getClientByIdService(id, transaction);

			if (randomPassword) {
				if (bodyData?.email) {
					const replacement = {
						username: bodyData?.name,
						useremail: bodyData?.email,
						password: randomPassword,
						logourl: FRONTEND_URL + '/assets/images/lred-main-logo.png',
					};
					// sendMail([bodyData?.email,'admin@lred.com'], 'Credentials', 'userCredentials', replacement);
				}
			}

			await createHistoryRecord(
				{
					tableName: tableEnum.CLIENT,
					jsonData: parse(data),
					status: statusEnum.UPDATE,
				},
				transaction,
			);
			await transaction.commit();
			return data;
		} catch (error) {
			console.log({ error });
			await transaction.rollback();
			throw new Error(error);
		}
	}

	async deleteClientService({ id }: { id: number }) {
		try {
			await db.transaction(async (transaction) => {
				const isFound = await Client.findOne({ where: { id: id }, transaction });

				if (!isFound) {
					throw new HttpException(404, this.msg.notFound);
				}
				const EmployeeData = await Employee.findAll({
					where: { clientId: id },
					include: [{ model: LoginUser }],
					transaction,
				});
				const EmployeeIds = [];
				for (const data of EmployeeData) {
					EmployeeIds.push(data?.loginUserData?.id);
				}
				fileDelete(`public${isFound.logo}`);

				let employeeData = await Employee.findAll({
					where: { clientId: isFound.id, deletedAt: null },
					attributes: ['id'],
				});
				employeeData = parse(employeeData);
				const clientWiseEmployeeData = [];
				for (const data of employeeData) {
					clientWiseEmployeeData.push(data.id);
				}

				let segmentData = await Segment.findAll({
					where: {
						clientId: isFound.id,
						deletedAt: null,
					},
					attributes: ['id'],
				});
				segmentData = parse(segmentData);
				const clientWiseSegmentData = [];
				for (const data of segmentData) {
					clientWiseSegmentData.push(data.id);
				}

				let requestData = await Request.findAll({
					where: {
						clientId: isFound.id,
						deletedAt: null,
					},
					attributes: ['id'],
				});
				requestData = parse(requestData);
				const clientWiseRequestData = [];
				for (const data of requestData) {
					clientWiseRequestData.push(data.id);
				}

				let importData = await ImportLog.findAll({
					where: {
						clientId: isFound.id,
						deletedAt: null,
					},
					attributes: ['id'],
				});
				importData = parse(importData);
				const clientWiseimportLogData = [];
				for (const data of importData) {
					clientWiseimportLogData.push(data.id);
				}

				let versionData = await ContractTemplate.findAll({
					where: {
						clientId: isFound.id,
						deletedAt: null,
					},
					attributes: ['id'],
				});
				versionData = parse(versionData);
				const clientWiseVersionData = [];
				for (const data of versionData) {
					clientWiseVersionData.push(data.id);
				}

				const data = await Client.destroy({ where: { id: id }, transaction });
				await Promise.all([
					LoginUser.destroy({ where: { id: isFound.loginUserId, deletedAt: null }, transaction }),
					User.destroy({ where: { loginUserId: isFound.loginUserId }, transaction }),
					LoginUser.destroy({ where: { id: EmployeeIds }, transaction }), // Delete Employee Login User
					User.findAll({ where: { loginUserId: EmployeeIds }, transaction }), // Delete Employee User
					Contact.destroy({ where: { clientId: isFound.id, deletedAt: null }, transaction }),
					UserClient.destroy({ where: { clientId: isFound.id, deletedAt: null }, transaction }),
					Segment.destroy({ where: { clientId: isFound.id, deletedAt: null }, transaction }),
					TransportCapacity.destroy({ where: { clientId: isFound.id, deletedAt: null }, transaction }),
					TransportModels.destroy({ where: { clientId: isFound.id, deletedAt: null }, transaction }),
					TransportType.destroy({ where: { clientId: isFound.id, deletedAt: null }, transaction }),
					TransportPositions.destroy({ where: { clientId: isFound.id, deletedAt: null }, transaction }),
					TransportVehicle.destroy({ where: { clientId: isFound.id, deletedAt: null }, transaction }),
					TransportDriver.destroy({ where: { clientId: isFound.id, deletedAt: null }, transaction }),
					TransportDriverDocument.destroy({ where: { clientId: isFound.id, deletedAt: null }, transaction }),
					TransportVehicleDocument.destroy({ where: { clientId: isFound.id, deletedAt: null }, transaction }),
					TransportRequest.destroy({ where: { clientId: isFound.id, deletedAt: null }, transaction }),
					TransportRequestVehicle.destroy({ where: { clientId: isFound.id, deletedAt: null }, transaction }),
					Message.destroy({ where: { clientId: isFound.id, deletedAt: null }, transaction }),
					Account.destroy({ where: { clientId: isFound.id, deletedAt: null }, transaction }),
					Employee.destroy({ where: { clientId: isFound.id, deletedAt: null }, transaction }),
					Timesheet.destroy({ where: { clientId: isFound.id, deletedAt: null }, transaction }),
					Request.destroy({ where: { clientId: isFound.id, deletedAt: null }, transaction }),
					ContractTemplate.destroy({ where: { clientId: isFound.id, deletedAt: null }, transaction }),
					ReliquatAdjustment.destroy({ where: { clientId: isFound.id, deletedAt: null }, transaction }),
					ReliquatCalculation.destroy({ where: { clientId: isFound.id, deletedAt: null }, transaction }),
					ReliquatCalculationV2.destroy({ where: { clientId: isFound.id, deletedAt: null }, transaction }),
					ReliquatPayment.destroy({ where: { clientId: isFound.id, deletedAt: null }, transaction }),
					ImportLogItems.destroy({ where: { importLogId: clientWiseimportLogData, deletedAt: null }, transaction }),
					ImportLog.destroy({ where: { clientId: isFound.id, deletedAt: null }, transaction }),
					ErrorLogs.destroy({ where: { clientId: isFound.id, deletedAt: null }, transaction }),
					TimesheetSchedule.destroy({ where: { employeeId: clientWiseEmployeeData, deletedAt: null }, transaction }),
					MedicalRequest.destroy({ where: { employeeId: clientWiseEmployeeData, deletedAt: null }, transaction }),
					EmployeeFile.destroy({ where: { employeeId: clientWiseEmployeeData, deletedAt: null }, transaction }),
					EmployeeRotation.destroy({ where: { employeeId: clientWiseEmployeeData, deletedAt: null }, transaction }),
					EmployeeSegment.destroy({ where: { employeeId: clientWiseEmployeeData, deletedAt: null }, transaction }),
					EmployeeSalary.destroy({ where: { employeeId: clientWiseEmployeeData, deletedAt: null }, transaction }),
					EmployeeLeave.destroy({ where: { employeeId: clientWiseEmployeeData, deletedAt: null }, transaction }),
					EmployeeContract.destroy({ where: { employeeId: clientWiseEmployeeData, deletedAt: null }, transaction }),
					SubSegment.destroy({ where: { segmentId: clientWiseSegmentData, deletedAt: null }, transaction }),
					RequestDocument.destroy({ where: { requestId: clientWiseRequestData, deletedAt: null }, transaction }),
					MessageDetail.destroy({ where: { employeeId: clientWiseEmployeeData, deletedAt: null }, transaction }),
					UserPermission.destroy({ where: { clientId: isFound.id, deletedAt: null }, transaction }),
					UserSegment.destroy({ where: { clientId: isFound.id, deletedAt: null }, transaction }),
					UserSegmentApproval.destroy({ where: { clientId: isFound.id, deletedAt: null }, transaction }),
					ContractTemplateVersion.destroy({
						where: { contractTemplateId: clientWiseVersionData, deletedAt: null },
						transaction,
					}),
				]);
				return data;
			});
		} catch (error) {
			// eslint-disable-next-line no-console
			console.log(error, 'err.');
			throw new HttpException(400, 'Something went wrong! Please try again', null, true);
		}
	}

	async findClientFonction(id: number, transaction: Transaction = null) {
		const isFound = await Employee.findAll({
			attributes: [[fn('DISTINCT', col('fonction')), 'fonction']],
			raw: true,
			where: { clientId: id, deletedAt: null },
			transaction,
		});
		if (!isFound) {
			throw new HttpException(404, this.msg.notFound);
		}
		const formattedArray = isFound.map((a) => String(a.fonction));
		const data = parse(formattedArray);
		return data;
	}
}
