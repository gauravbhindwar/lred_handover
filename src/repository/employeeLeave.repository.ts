import { FRONTEND_URL, SERVER_URL } from '@/config';
import { MessageFormation } from '@/constants/messages.constants';
import { HttpException } from '@/exceptions/HttpException';
import { createHistoryRecord } from '@/helpers/history.helper';
import { sendMail } from '@/helpers/mail.helper';
import { DefaultRoles } from '@/interfaces/functional/feature.interface';
import { IQueryParameters } from '@/interfaces/general/general.interface';
import {
	EmployeeLeavePdfAttributes,
	IEmployeeLeaveCreate,
	employeeLeaveStatus,
} from '@/interfaces/model/employeeLeave.interface';
import { statusEnum, tableEnum } from '@/interfaces/model/history.interface';
import AccountPO from '@/models/accountPO.model';
import Client from '@/models/client.model';
import Employee from '@/models/employee.model';
import EmployeeLeave from '@/models/employeeLeave.model';
import LoginUser from '@/models/loginUser.model';
import Segment from '@/models/segment.model';
import SubSegment from '@/models/subSegment.model';
import Timesheet from '@/models/timesheet.model';
import TimesheetSchedule from '@/models/timesheetSchedule.model';
import User from '@/models/user.model';
import { fileDelete, folderExistCheck, parse } from '@/utils/common.util';
import { pdf } from '@/utils/puppeteer.pdf';
import moment from 'moment';
import path from 'path';
import { Op, Transaction } from 'sequelize';
import BaseRepository from './base.repository';
import ReliquatCalculationRepo from './reliquatCalculation.repository';
import TimesheetRepo from './timesheet.repository';
import TimesheetScheduleRepo from './timesheetSchedule.repository';

export default class EmployeeLeaveRepo extends BaseRepository<EmployeeLeave> {
	constructor() {
		super(EmployeeLeave.name);
	}

	private dateFormat = 'DD-MM-YYYY';
	private msg = new MessageFormation('EmployeeLeave').message;
	private TimesheetService = new TimesheetRepo();
	private TimesheetScheduleService = new TimesheetScheduleRepo();
	private reliquatCalculationRepo = new ReliquatCalculationRepo();
	async getAllEmployeeLeaveTypes(query: IQueryParameters, user: User) {
		const { page, limit, employeeId, sortBy, sort } = query;
		const currentDate = moment();
		const sortedColumn = sortBy || null;
		let data = await this.getAllData({
			where: {
				employeeId: employeeId || 0,
				deletedAt: null,
			},
			include: [
				...(user.roleData.isViewAll && user.roleData.name === DefaultRoles.Employee
					? [
							{
								model: Employee,
								where: { loginUserId: user.loginUserId },
							},
					  ]
					: []),
				{
					model: User,
					as: 'createdByUser',
					attributes: ['id', 'loginUserId'],
					include: [{ model: LoginUser, attributes: ['name', 'email'] }],
				},
				{
					model: User,
					as: 'updatedByUser',
					attributes: ['id', 'loginUserId'],
					include: [{ model: LoginUser, attributes: ['name', 'email'] }],
				},
			],
			offset: page && limit ? (page - 1) * limit : undefined,
			limit: limit ?? undefined,
			order: [[sortedColumn ?? 'startDate', sort ?? 'desc']],
		});

		data = parse(data);
		const dataLeave = await Promise.all(
			data?.rows.map(async (row) => {
				const temp: any = { ...row };
				const inputDate = moment(temp.startDate, 'YYYY-MM-DD');
				const monthDiff = currentDate.diff(inputDate, 'months');
				const dataOfMonth = monthDiff < 6;
				temp.employeeLeaveFlag = dataOfMonth;
				return temp;
			}),
		);
		const responseObj = {
			data: dataLeave,
			count: data?.count,
			currentPage: page ?? undefined,
			limit: limit ?? undefined,
			lastPage: page && limit ? Math.ceil(data?.count / +limit) : undefined,
		};

		return responseObj;
	}

	async getEmployeeLeavePdfData(id: number, transaction: Transaction = null) {
		let data = await EmployeeLeave.findOne({
			where: {
				id: id,
				deletedAt: null,
			},
			attributes: ['employeeId', 'reference', 'startDate', 'endDate', 'createdAt', 'status', 'updatedAt', 'leaveType'],
			transaction,
			include: [
				{
					model: User,
					as: 'createdByUser',
					attributes: ['id'],
					include: [{ model: LoginUser, attributes: ['name', 'email'] }],
				},
				{
					model: User,
					as: 'updatedByUser',
					attributes: ['id'],
					include: [{ model: LoginUser, attributes: ['name', 'email'] }],
				},
				{
					model: Employee,
					attributes: ['fonction', 'address', 'employeeNumber'],
					include: [
						{
							model: Segment,
							attributes: ['id', 'name'],
						},
						{
							model: SubSegment,
							attributes: ['id', 'name'],
						},
						{
							model: LoginUser,
							attributes: ['firstName', 'lastName', 'email'],
						},
						{
							model: Client,
							attributes: ['id', 'titreDeConge', 'stampLogo'],
							include: [
								{
									model: LoginUser,
									attributes: ['name'],
								},
							],
						},
					],
				},
			],
		});

		let dateDeReprise = [];

		if (!data) {
			throw new HttpException(404, this.msg.notFound);
		}
		let reliquatCalculationData;
		if (data) {
			reliquatCalculationData = await this.reliquatCalculationRepo.generateReliquatCalculationService(
				{
					employeeId: String(data.employeeId),
					date: data.endDate,
				},
				transaction,
			);

			dateDeReprise = await EmployeeLeave.findAll({
				where: {
					employeeId: data.employeeId,
					endDate: {
						[Op.ne]: data.endDate,
						[Op.lt]: data.startDate,
					},
					deletedAt: null,
				},
				transaction,
				attributes: ['id', 'endDate'],
				order: [['endDate', 'desc']],
				limit: 1,
			});
		}

		data = parse(data);
		reliquatCalculationData = reliquatCalculationData ?? null;
		dateDeReprise = parse(dateDeReprise);
		const dateDeRepriseEndDate =
			dateDeReprise.length > 0 ? moment(dateDeReprise[0].endDate).format('DD MMMM YYYY') : null;
		const debutDeConge = moment(data.startDate).format('DD MMMM YYYY');
		const dateDuRetour = moment(data.endDate).add(1, 'days').format('DD MMMM YYYY');
		const droitDeConge =
			data.endDate && data.startDate ? moment(data.endDate).add(1, 'days').diff(data.startDate, 'days') : null;
		const lieuDeSejour = data.employeeDetail.address ? data.employeeDetail.address : null;
		const createdAt = moment(data.createdAt).format('DD MMMM YYYY');
		const createdAtTime = moment(data.createdAt).format('LT');
		const updatedAt = data?.status === 'CANCELLED' ? moment(data.updatedAt).format('DD MMMM YYYY') : null;
		const updatedAtTime = data?.status === 'CANCELLED' ? moment(data.updatedAt).format('LT') : null;
		return {
			...data,
			reliquatCalculationData,
			dateDeRepriseEndDate,
			debutDeConge,
			dateDuRetour,
			droitDeConge,
			lieuDeSejour,
			createdAt,
			createdAtTime,
			updatedAt,
			updatedAtTime,
		};
	}

	async getEmployeeLeaveById(id: number) {
		let data = await EmployeeLeave.findOne({
			where: {
				id: id,
				deletedAt: null,
			},
			include: [
				{
					model: User,
					as: 'createdByUser',
					attributes: ['loginUserId'],
					include: [{ model: LoginUser, attributes: ['name', 'email'] }],
				},
			],
		});
		if (!data) {
			throw new HttpException(404, this.msg.notFound);
		}
		data = parse(data);
		return data;
	}

	async addEmployeeLeave({ body, user }: { body: IEmployeeLeaveCreate; user: User }, transaction: Transaction = null) {
		try {
			const leaveStartDate = moment(moment(body.startDate).format('DD/MM/YYYY'), 'DD/MM/YYYY').toDate();
			const leaveEndDate = moment(moment(body.endDate).format('DD/MM/YYYY'), 'DD/MM/YYYY').toDate();
			body = { ...body, startDate: leaveStartDate, endDate: leaveEndDate };
			const findEmployeeLeaveData = await EmployeeLeave.findAndCountAll({
				where: { employeeId: body.employeeId },
				transaction,
			});
			const formId = findEmployeeLeaveData.count + 1;

			let contractNumber = '';
			const isEmployee = await Employee.findOne({
				where: { id: body.employeeId, deletedAt: null },
				include: [{ model: LoginUser, attributes: ['id', 'email', 'firstName', 'lastName'] }],
				transaction,
			});
			if (isEmployee && (isEmployee?.contractNumber || isEmployee?.employeeNumber)) {
				contractNumber = isEmployee?.contractNumber ? isEmployee?.contractNumber : isEmployee?.employeeNumber;
			} else {
				const tempNumber = await EmployeeLeave.findOne({ order: [['createdAt', 'DESC']], transaction });
				contractNumber = tempNumber ? tempNumber?.id.toString() : '1';
			}

			const year = new Date(body.startDate).getFullYear();

			const reference = formId + '/' + contractNumber + '/' + year + '/LRED'; // [FormNo]/[ContractNumber]/[Year]/LRED

			const totalDays = moment(new Date(body.endDate)).diff(new Date(body.startDate), 'days'); // Total Leave Days

			const isExistEmployeeWithSameLeave = await EmployeeLeave.findOne({
				where: {
					status: {
						[Op.not]: employeeLeaveStatus.CANCELLED,
					},
					employeeId: body.employeeId,
					[Op.or]: {
						reference: reference,
						[Op.and]: {
							[Op.or]: [
								{
									startDate: {
										[Op.between]: [body.startDate, body.endDate],
									},
								},
								{
									endDate: {
										[Op.between]: [body.startDate, body.endDate],
									},
								},
								{
									startDate: {
										[Op.lte]: body.startDate,
									},
									endDate: {
										[Op.gte]: body.endDate,
									},
								},
							],
						},
					},
					deletedAt: null,
				},
				transaction,
				include: [
					{
						model: User,
						as: 'createdByUser',
						attributes: ['id'],
						include: [{ model: LoginUser, attributes: ['email'] }],
					},
				],
			});

			if (isExistEmployeeWithSameLeave) {
				throw new HttpException(200, this.msg.exist, {}, true);
			}
			let data = await EmployeeLeave.create(
				{
					...body,
					reference: reference,
					segmentId: isEmployee?.segmentId,
					rotationId: isEmployee?.rotationId,
					employeeContractEndDate: isEmployee?.contractEndDate,
					totalDays: totalDays,
					createdBy: user.id,
				},
				{ transaction },
			);
			data = parse(data);
			//ADD LEAVE QUERY FOR TIMESHEET
			// TimesheetSchedule.update({status:},{
			// 	where:
			// })

			// ***************************Employee Leave Email Functionality***************************

			if (data) {
				let employeeLeaveDetails: EmployeeLeavePdfAttributes = await this.getEmployeeLeavePdfData(data.id, transaction);
				employeeLeaveDetails = parse(employeeLeaveDetails);
				await this.updateTimesheetAndAccounts({ body: employeeLeaveDetails, user }, transaction);
				const reliquatCalculationData = await this.reliquatCalculationRepo.generateReliquatCalculationService(
					{
						employeeId: String(employeeLeaveDetails.employeeId),
						date: moment(employeeLeaveDetails.endDate).toDate(),
					},
					transaction,
				);
				employeeLeaveDetails = { ...employeeLeaveDetails, reliquatCalculationData };
				const date = moment(employeeLeaveDetails?.createdAt).format('D MMMM YYYY');
				employeeLeaveDetails.date = date;

				let emails = [];
				const pdfName = `${moment().unix()}-titre-de-conge.pdf`;
				const resizeHeaderFooter = false;
				const footerContent = `Submitted by ${employeeLeaveDetails?.createdByUser?.loginUserData?.name} on ${
					employeeLeaveDetails?.createdAt
				} at ${employeeLeaveDetails?.createdAtTime} ${
					employeeLeaveDetails?.status === 'CANCELLED'
						? `, cancelled by ${employeeLeaveDetails?.updatedByUser?.loginUserData?.name} on ${employeeLeaveDetails?.updatedAt} at ${employeeLeaveDetails?.updatedAtTime}`
						: ''
				}`;
				const stampLogo =
					employeeLeaveDetails?.employeeDetail?.client?.stampLogo !== null
						? SERVER_URL + employeeLeaveDetails?.employeeDetail?.client?.stampLogo
						: null;
				await pdf(
					employeeLeaveDetails,
					`${pdfName}`,
					'employeeLeavePdf',
					false,
					resizeHeaderFooter,
					stampLogo,
					footerContent,
				);
				if (
					employeeLeaveDetails?.employeeDetail?.client?.titreDeConge &&
					employeeLeaveDetails?.employeeDetail?.client?.titreDeConge !== ''
				) {
					emails = employeeLeaveDetails?.employeeDetail?.client?.titreDeConge?.split(',');
				}
				if (isEmployee?.loginUserData?.email && !emails.includes(isEmployee?.loginUserData?.email)) {
					emails.push(isEmployee?.loginUserData?.email);
				}
				if (!emails.includes('admin@lred.com')) {
					emails.push('admin@lred.com');
				}

				const replacement = {
					client: employeeLeaveDetails?.employeeDetail?.client?.loginUserData?.name,
					firstName: employeeLeaveDetails?.employeeDetail?.loginUserData?.firstName,
					lastName: employeeLeaveDetails?.employeeDetail?.loginUserData?.lastName,
					employeeNumber: employeeLeaveDetails?.employeeDetail?.employeeNumber,
					email: employeeLeaveDetails?.employeeDetail?.loginUserData?.email,
					mailHeader: `Employee Leave Details`,
					logourl: FRONTEND_URL + '/assets/images/lred-main-logo.png',
					checkReliquatUrl: '',
					message: `Please find attached Titre de Congé for ${
						employeeLeaveDetails?.employeeDetail?.loginUserData?.firstName
					} ${employeeLeaveDetails?.employeeDetail?.loginUserData?.firstName}. <br>Reference: ${
						data?.reference
					} <br>${moment(data?.startDate).format('DD MMMM YYYY')}-${moment(data.endDate)
						.add(1, 'days')
						.format('DD MMMM YYYY')} <br>Submitted By <a href="mailto:${
						employeeLeaveDetails?.createdByUser?.loginUserData?.email
					}">${employeeLeaveDetails?.createdByUser?.loginUserData?.email}</a> <br>LRED Timesheet System`,
				};
				const publicFolder = path.join(__dirname, '../../secure-file/');
				folderExistCheck(publicFolder);
				const filePath = path.join(publicFolder, `employeeLeavePdf/${pdfName}`);
				if (emails && emails.length > 0) {
					await sendMail(emails, 'Leave Details', 'generalMailTemplate', replacement, [{ path: filePath }]);
				} else {
					fileDelete(filePath);
				}
			}

			// *****************************************************************************************

			await createHistoryRecord({
				tableName: tableEnum.EMPLOYEE_LEAVE,
				jsonData: parse(data),
				status: statusEnum.CREATE,
			});

			return data;
		} catch (error) {
			throw new Error(error);
		}
	}

	// updateEmployeeLeave
	async updateEmployeeLeave(
		{ body, user, id }: { body: IEmployeeLeaveCreate; user: User; id: number },
		transaction: Transaction = null,
	) {
		try {
			const isExistEmployeeLeave = await EmployeeLeave.findOne({
				where: {
					id: id,
					deletedAt: null,
				},
				include: [
					{
						model: User,
						as: 'createdByUser',
						attributes: ['id'],
						include: [{ model: LoginUser, attributes: ['email'] }],
					},
					{
						model: Employee,
						attributes: ['employeeNumber', 'loginUserId', 'clientId'],
						include: [
							{ model: LoginUser, attributes: ['firstName', 'lastName', 'email'] },
							{
								model: Client,
								attributes: ['id', 'titreDeConge'],
								include: [{ model: LoginUser, attributes: ['name'] }],
							},
						],
					},
				],
				transaction,
			}).then((dat) => parse(dat));
			if (!isExistEmployeeLeave) {
				throw new HttpException(404, this.msg.notFound);
			}
			const oldLeaveStartDate = moment(
				moment(isExistEmployeeLeave.startDate).format('DD-MM-YYYY'),
				'DD-MM-YYYY',
			).toDate();
			const oldLeaveEndDate = moment(moment(isExistEmployeeLeave.endDate).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate();
			const oldLeaveData = await TimesheetSchedule.findAll({
				where: {
					date: {
						[Op.or]: {
							[Op.between]: [oldLeaveStartDate, oldLeaveEndDate],
							[Op.eq]: oldLeaveStartDate,
							[Op.eq]: oldLeaveEndDate,
						},
					},
					employeeId: isExistEmployeeLeave.employeeId,
				},
				transaction,
			});
			const oldDataIds = oldLeaveData.map((e) => e.id);
			const newLeaveData = await TimesheetSchedule.findAll({
				where: {
					date: {
						[Op.or]: {
							[Op.between]: [body.startDate, body.endDate],
							[Op.eq]: body.startDate,
							[Op.eq]: body.endDate,
						},
					},
					employeeId: isExistEmployeeLeave.employeeId,
				},
				transaction,
			});
			const newDataIds = newLeaveData.map((e) => e.id);
			const finalUpdateIds = [];
			oldDataIds.forEach((element) => {
				if (!newDataIds.includes(element)) {
					finalUpdateIds.push(element);
				}
			});
			await TimesheetSchedule.update(
				{ status: 'P', isLeaveForTitreDeConge: false },
				{
					where: {
						id: { [Op.in]: finalUpdateIds },
						employeeId: isExistEmployeeLeave.employeeId,
					},
					transaction,
				},
			);

			// ***************************Update Employee Leave Email Functionality***************************
			const leaveStartDate = moment(moment(body.startDate).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate();
			const leaveEndDate = moment(moment(body.endDate).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate();
			body = { ...body, startDate: leaveStartDate, endDate: leaveEndDate };
			const updateEmployeeLeave = await EmployeeLeave.update(
				{ ...body, updatedBy: user.id, updatedAt: moment(moment().format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate() },
				{ where: { id: id, status: employeeLeaveStatus.ACTIVE }, transaction },
			);
			let employeeLeaveDetails: EmployeeLeavePdfAttributes;
			if (updateEmployeeLeave) {
				employeeLeaveDetails = await this.getEmployeeLeavePdfData(id, transaction);
				employeeLeaveDetails = parse(employeeLeaveDetails);
				await this.updateTimesheetAndAccounts({ body: employeeLeaveDetails, user }, transaction);
				const reliquatCalculationData = await this.reliquatCalculationRepo.generateReliquatCalculationService(
					{
						employeeId: String(employeeLeaveDetails.employeeId),
						date: moment(employeeLeaveDetails.endDate).toDate(),
					},
					transaction,
				);
				employeeLeaveDetails = { ...employeeLeaveDetails, reliquatCalculationData };
				const date = moment(moment().format('DD-MM-YYYY'), 'DD-MM-YYYY').format('D MMMM YYYY');
				employeeLeaveDetails.date = date;
				let emails = [];
				const pdfName = `${moment().unix()}-titre-de-conge.pdf`;
				const resizeHeaderFooter = false;
				const footerContent = `Submitted by ${employeeLeaveDetails.createdByUser.loginUserData.name} on ${
					employeeLeaveDetails.createdAt
				} at ${employeeLeaveDetails.createdAtTime} ${
					employeeLeaveDetails.status === 'CANCELLED'
						? `, cancelled by ${employeeLeaveDetails.updatedByUser.loginUserData.name} on ${employeeLeaveDetails.updatedAt} at ${employeeLeaveDetails.updatedAtTime}`
						: ''
				}`;
				const stampLogo =
					employeeLeaveDetails?.employeeDetail?.client?.stampLogo !== null
						? SERVER_URL + employeeLeaveDetails?.employeeDetail?.client?.stampLogo
						: null;
				await pdf(
					employeeLeaveDetails,
					`${pdfName}`,
					'employeeLeavePdf',
					false,
					resizeHeaderFooter,
					stampLogo,
					footerContent,
				);

				if (
					employeeLeaveDetails?.employeeDetail?.client?.titreDeConge &&
					employeeLeaveDetails?.employeeDetail?.client?.titreDeConge !== ''
				) {
					emails = employeeLeaveDetails.employeeDetail.client.titreDeConge.split(',');
					// emails.unshift(isExistEmployeeLeave?.loginUserData?.email);
				}
				if (
					employeeLeaveDetails?.employeeDetail?.loginUserData?.email &&
					!emails.includes(employeeLeaveDetails?.employeeDetail?.loginUserData?.email)
				) {
					emails.push(employeeLeaveDetails?.employeeDetail?.loginUserData?.email);
				}
				if (!emails.includes('admin@lred.com')) {
					emails.push('admin@lred.com');
				}

				const replacement = {
					client: employeeLeaveDetails.employeeDetail.client.loginUserData.name,
					firstName: employeeLeaveDetails.employeeDetail.loginUserData.firstName,
					lastName: employeeLeaveDetails.employeeDetail.loginUserData.lastName,
					employeeNumber: employeeLeaveDetails.employeeDetail.employeeNumber,
					email: employeeLeaveDetails.employeeDetail.loginUserData.email,
					mailHeader: `Employee Leave Details`,
					logourl: FRONTEND_URL + '/assets/images/lred-main-logo.png',
					checkReliquatUrl: '',
					message: `Please find attached Titre de Congé for ${
						employeeLeaveDetails.employeeDetail.loginUserData.firstName
					} ${employeeLeaveDetails.employeeDetail.loginUserData.firstName}. <br>Reference: ${
						isExistEmployeeLeave.reference
					} <br>${moment(isExistEmployeeLeave.startDate).format('DD MMMM YYYY')}-${moment(isExistEmployeeLeave.endDate)
						.add(1, 'days')
						.format('DD MMMM YYYY')} <br>Submitted By <a href="mailto:${
						employeeLeaveDetails.createdByUser.loginUserData.email
					}">${employeeLeaveDetails.createdByUser.loginUserData.email}</a> <br>LRED Timesheet System`,
				};
				const publicFolder = path.join(__dirname, '../../secure-file/');
				folderExistCheck(publicFolder);
				const filePath = path.join(publicFolder, `employeeLeavePdf/${pdfName}`);
				if (emails && emails.length > 0) {
					sendMail(emails, 'Leave Details', 'generalMailTemplate', replacement, [{ path: filePath }]);
				} else {
					fileDelete(filePath);
				}
			}

			// *****************************************************************************************

			await createHistoryRecord({
				tableName: tableEnum.EMPLOYEE_LEAVE,
				jsonData: parse(isExistEmployeeLeave),
				status: statusEnum.UPDATE,
			});
			return employeeLeaveDetails;
		} catch (error) {
			throw new Error(error);
		}
	}
	// updateTimesheetsAndAccounts

	async updateTimesheetAndAccounts(
		{ body, user }: { body: IEmployeeLeaveCreate; user: User },
		transaction: Transaction = null,
	) {
		try {
			const timesheetData = await Timesheet.findAll({
				where: {
					employeeId: body.employeeId,
					[Op.and]: {
						[Op.or]: [
							{
								startDate: {
									[Op.between]: [body.startDate, body.endDate],
								},
							},
							{
								endDate: {
									[Op.between]: [body.startDate, body.endDate],
								},
							},
							{
								startDate: {
									[Op.lte]: body.startDate,
								},
								endDate: {
									[Op.gte]: body.endDate,
								},
							},
						],
					},
				},
				include: [
					{
						model: Client,
						attributes: ['id', 'isCountCR'],
					},
				],
				transaction,
			});

			let responseData;

			if (timesheetData?.length > 0) {
				for (const timesheet of timesheetData) {
					let getTimesheetScheduleData = await TimesheetSchedule.findAll({
						where: {
							date: {
								[Op.or]: {
									[Op.between]: [timesheet.startDate, timesheet.endDate],
									[Op.eq]: timesheet.startDate,
									[Op.eq]: timesheet.endDate,
								},
							},
							employeeId: body?.employeeId,
						},
						order: [['date', 'asc']],
						transaction,
					});
					getTimesheetScheduleData = parse(getTimesheetScheduleData);
					const isTimesheetApproved = timesheet?.status === 'APPROVED';
					const timesheetScheduleData = getTimesheetScheduleData.filter(
						(data: { status: string; date: Date | string }) =>
							moment(data?.date).isBetween(body.startDate, body.endDate, null, '[]'),
					);
					const timesheetUpdateIds = timesheetScheduleData.map((e) => {
						return e.id;
					});
					const timesheetScheduleIdMap = new Map();
					for (const data of timesheetScheduleData) {
						const key = `${data?.status}-${data?.isLeaveForTitreDeConge}`;
						const isExist = timesheetScheduleIdMap.get(key);
						if (isExist) {
							timesheetScheduleIdMap.set(key, [...isExist, data?.id]);
						} else {
							timesheetScheduleIdMap.set(key, [data?.id]);
						}
					}
					if (isTimesheetApproved && timesheetScheduleData.length > 0) {
						for (const timesheetSchedule of timesheetScheduleIdMap.entries()) {
							const oldStatus = timesheetSchedule[0]?.split('-')[0];
							switch (oldStatus) {
								case 'P': {
									if (body.leaveType === 'CR') {
										await TimesheetSchedule.update(
											{
												status: 'CR',
												isLeaveForTitreDeConge: true,
												bonusCode: null,
												updatedBy: user.id,
											},
											{ where: { id: { [Op.in]: timesheetSchedule[1] } }, transaction },
										);
									}
									break;
								}
								case 'CR': {
									if (body.leaveType === 'P') {
										await TimesheetSchedule.update(
											{
												status: 'P',
												isLeaveForTitreDeConge: true,
												bonusCode: null,
												updatedBy: user.id,
											},
											{ where: { id: { [Op.in]: timesheetSchedule[1] } }, transaction },
										);
									}
									break;
								}
								default:
									break;
							}
							let empids = getTimesheetScheduleData.map((dat) => dat.employeeId);
							empids = empids.filter((item, index) => empids.indexOf(item) === index);

							await this.TimesheetService.generateReliquetResponse(
								user,
								empids,
								transaction,
								null,
								timesheetSchedule[1],
							);
						}
					} else {
						responseData = await this.TimesheetScheduleService.updateTimesheetScheduleById(
							timesheetUpdateIds,
							body.leaveType,
							user as User,
							false,
							false,
							false,
							transaction,
						);

						// const date = responseData[0]?.date;

						// await this.TimesheetService.getTimesheetDataForAccount(user as User, [body?.employeeId], date, transaction);
						await this.TimesheetService.generateReliquetResponse(user as User, [body?.employeeId], transaction, null, [
							responseData[0]?.id,
						]);
					}
				}
			}

			// if (timesheetData?.length > 0) {
			// 	const isTimesheetApproved = timesheetData?.findIndex((data) => {
			// 		return data?.status === 'APPROVED';
			// 	});

			// if (isTimesheetApproved >= 0 && timesheetScheduleData.status === 'P') {

			// 	const timesheetId = timesheetData[isTimesheetApproved]?.id;
			// 	const isCountCR = timesheetData[isTimesheetApproved]?.client?.isCountCR;
			// 	const timesheetStartDate = timesheetData[isTimesheetApproved]?.startDate;
			// 	const timesheetEndDate = timesheetData[isTimesheetApproved]?.endDate;
			// 	await this.updateAccountPos(
			// 		{
			// 			body,
			// 			timesheetId,
			// 			isCountCR,
			// 			timesheetStartDate,
			// 			timesheetEndDate,
			// 		},
			// 		transaction,
			// 	);
			// }
			// }
		} catch (error) {
			throw new Error(error);
		}
	}

	async updateAccountPos(
		{
			body,
			timesheetId,
			isCountCR,
			timesheetStartDate,
			timesheetEndDate,
		}: {
			body: IEmployeeLeaveCreate;
			timesheetId: number;
			isCountCR: boolean;
			timesheetStartDate: Date;
			timesheetEndDate: Date;
		},
		transaction: Transaction = null,
	) {
		try {
			const timesheetData = await TimesheetSchedule.findAll({
				where: {
					employeeId: body?.employeeId,
					date: {
						[Op.or]: {
							[Op.between]: [timesheetStartDate, timesheetEndDate],
							[Op.eq]: timesheetEndDate,
						},
					},
				},
				transaction,
			});
			if (timesheetData?.length > 0) {
				const status = timesheetData?.filter((presentDays) => {
					return (
						(presentDays.status === 'P' || (isCountCR ? presentDays.status === 'CR' : '')) &&
						(presentDays?.bonusCode === null || presentDays?.bonusCode === 'O1' || presentDays?.bonusCode === 'O2')
					);
				});
				const totalPresentDays = status?.length || 0;
				await AccountPO.update(
					{
						timesheetQty: totalPresentDays,
					},
					{
						where: {
							timesheetId: timesheetId,
							type: 'Salary',
						},
						transaction,
					},
				);
			}
			return;
		} catch (error) {
			throw error;
		}
	}

	async updateEmployeeLeaveStatus({ user, id }: { user: User; id: number }, transaction: Transaction = null) {
		const isExistEmployeeLeave = await EmployeeLeave.findOne({
			where: {
				id: id,
				deletedAt: null,
			},
			transaction,
			include: [
				{
					model: User,
					as: 'createdByUser',
					attributes: ['id'],
					include: [{ model: LoginUser, attributes: ['email'] }],
				},
				{
					model: Employee,
					attributes: ['employeeNumber', 'loginUserId', 'clientId'],
					include: [
						{ model: LoginUser, attributes: ['firstName', 'lastName', 'email'] },
						{
							model: Client,
							attributes: ['id', 'titreDeConge'],
							include: [{ model: LoginUser, attributes: ['name'] }],
						},
					],
				},
			],
		}).then((dat) => parse(dat));

		if (!isExistEmployeeLeave) {
			throw new HttpException(404, this.msg.notFound);
		}

		const employeeStatus = await EmployeeLeave.update(
			{ status: employeeLeaveStatus.CANCELLED, updatedBy: user.id },
			{ where: { id: id, status: employeeLeaveStatus.ACTIVE }, transaction },
		);

		let employeeLeaveDetails: EmployeeLeavePdfAttributes;
		if (employeeStatus) {
			employeeLeaveDetails = await this.getEmployeeLeavePdfData(id);
			employeeLeaveDetails = parse(employeeLeaveDetails);
			await this.updateTimesheetAndAccounts(
				{
					body: {
						employeeId: employeeLeaveDetails.employeeId,
						startDate: employeeLeaveDetails.startDate,
						leaveType: 'P',
						endDate: employeeLeaveDetails.endDate,
					},
					user: user,
				},
				transaction,
			);
			const reliquatCalculationData = await this.reliquatCalculationRepo.generateReliquatCalculationService(
				{
					employeeId: String(employeeLeaveDetails.employeeId),
					date: moment(employeeLeaveDetails.endDate).toDate(),
				},
				transaction,
			);
			employeeLeaveDetails = { ...employeeLeaveDetails, reliquatCalculationData };
			const date = moment(moment().format('DD-MM-YYYY'), 'DD-MM-YYYY').format('D MMMM YYYY');
			employeeLeaveDetails.status = employeeLeaveStatus.CANCELLED;
			employeeLeaveDetails.date = date;
			const pdfName = `${moment().unix()}-titre-de-conge.pdf`;
			const stampLogo =
				employeeLeaveDetails?.employeeDetail?.client?.stampLogo !== null
					? SERVER_URL + employeeLeaveDetails?.employeeDetail?.client?.stampLogo
					: null;
			await pdf(employeeLeaveDetails, `${pdfName}`, 'employeeLeavePdf', false, false, stampLogo);
			let emails = [];
			if (
				employeeLeaveDetails?.employeeDetail?.client?.titreDeConge &&
				employeeLeaveDetails?.employeeDetail?.client?.titreDeConge !== ''
			) {
				emails = employeeLeaveDetails?.employeeDetail?.client?.titreDeConge.split(',');
				// emails.unshift(isExistEmployeeLeave.employeeDetail.loginUserData.email);
			}
			if (
				employeeLeaveDetails?.employeeDetail?.loginUserData?.email &&
				!emails.includes(employeeLeaveDetails?.employeeDetail?.loginUserData?.email)
			) {
				emails.push(employeeLeaveDetails?.employeeDetail?.loginUserData?.email);
			}
			if (!emails.includes('admin@lred.com')) {
				emails.push('admin@lred.com');
			}

			const replacement = {
				client: isExistEmployeeLeave.employeeDetail.client.loginUserData.name,
				firstName: isExistEmployeeLeave.employeeDetail.loginUserData.firstName,
				lastName: isExistEmployeeLeave.employeeDetail.loginUserData.lastName,
				employeeNumber: isExistEmployeeLeave.employeeDetail.employeeNumber,
				email: isExistEmployeeLeave.employeeDetail.loginUserData.email,
				mailHeader: `Employee Leave Details`,
				logourl: FRONTEND_URL + '/assets/images/lred-main-logo.png',
				checkReliquatUrl: '',
				message: `The attached Titre de Congé for ${isExistEmployeeLeave.employeeDetail.loginUserData.firstName} ${
					isExistEmployeeLeave.employeeDetail.loginUserData.lastName
				} has been cancelled. <br>Reference: ${isExistEmployeeLeave.reference} <br>${moment(
					isExistEmployeeLeave.startDate,
				).format('DD MMMM YYYY')}-${moment(isExistEmployeeLeave.endDate)
					.add(1, 'days')
					.format('DD MMMM YYYY')} <br>Submitted By <a href="mailto:${
					isExistEmployeeLeave.createdByUser.loginUserData.email
				}">${isExistEmployeeLeave.createdByUser.loginUserData.email}</a> <br>LRED Timesheet System`,
			};
			const publicFolder = path.join(__dirname, '../../secure-file/');
			folderExistCheck(publicFolder);
			const filePath = path.join(publicFolder, `employeeLeavePdf/${pdfName}`);
			if (emails && emails.length > 0) {
				sendMail(emails, 'Leave Details', 'generalMailTemplate', replacement, [{ path: filePath }]);
			} else {
				fileDelete(filePath);
			}
		}
		return isExistEmployeeLeave;
	}

	async getEmployeeLastLeaveByEmployeeId(id: number) {
		try {
			let data = await EmployeeLeave.findOne({
				where: {
					employeeId: id,
					deletedAt: null,
				},
				include: [
					{
						model: Employee,
						attributes: ['terminationDate'],
					},
				],
				order: [['createdAt', 'DESC']],
			});
			data = parse(data);
			let reliquatCalculation = null;
			reliquatCalculation = await this.reliquatCalculationRepo.generateReliquatCalculationService({
				employeeId: String(id),
				date: moment(moment(data?.endDate).format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate(),
			});
			const finalData = { ...data, reliquatCalculation };
			return finalData;
		} catch (error) {
			throw new Error(error);
		}
	}
}
