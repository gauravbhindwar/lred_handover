import { MessageFormation } from '@/constants/messages.constants';
import { HttpException } from '@/exceptions/HttpException';
import { IQueryParameters } from '@/interfaces/general/general.interface';
import { medicalRequestStatus } from '@/interfaces/model/medicalRequest.interface';
import AccountPO from '@/models/accountPO.model';
import BonusType from '@/models/bonusType.model';
import Employee from '@/models/employee.model';
import EmployeeBonus from '@/models/employeeBonus.model';
import EmployeeCatalogueNumber from '@/models/employeeCatalogueNumber.model';
import LoginUser from '@/models/loginUser.model';
import MedicalRequest from '@/models/medicalRequest.model';
import MedicalType from '@/models/medicalType.model';
import Segment from '@/models/segment.model';
import SubSegment from '@/models/subSegment.model';
import Timesheet from '@/models/timesheet.model';
import User from '@/models/user.model';
import { getSegmentAccessForUser, getSubSegmentAccessForUser, parse } from '@/utils/common.util';
import { isNull } from 'lodash';
import moment from 'moment';
import { Op, Transaction } from 'sequelize';

export default class AccountPORepo {
	private msg = new MessageFormation('AccountPO').message;

	async getAllSegmentsData(query: IQueryParameters, user: User) {
		try {
			const { clientId, startDate, endDate } = query;
			let { segment, subSegment } = query;
			const filterStartDate = moment(startDate, 'DD-MM-YYYY').toDate();
			const filterEndDate = moment(endDate, 'DD-MM-YYYY').toDate();
			const subSegmentIds = getSubSegmentAccessForUser(user);
			const segmentIds = getSegmentAccessForUser(user);
			if (segment === '') {
				segment = null;
			}
			if (subSegment === '') {
				subSegment = null;
			}

			const sendData = {
				segment: segment,
				subSegment: subSegment,
				clientId: +clientId,
				startDate: filterStartDate,
				endDate: filterEndDate,
				timesheetAttribute: ['id'],
				employeeAttribute: ['id'],
				segmentAttribute: ['id', 'name', 'code'],
			};
			const getTypeOfInclude = await this.fetchTypeOfInclude(sendData);
			let segmentsData = await AccountPO.findAll({
				where: {
					...getTypeOfInclude?.where,
					...(segmentIds.length && { segmentId: { [Op.in]: segmentIds } }),
					...(subSegmentIds.length && { subSegmentId: { [Op.or]: { [Op.eq]: null, [Op.in]: subSegmentIds } } }),
				},
				attributes: ['segmentId', 'subSegmentId'],
				include: getTypeOfInclude?.include,
				order: [['segmentData', 'name', 'asc']],
			});
			segmentsData = parse(segmentsData);
			const segmentSet = new Set();
			segmentsData = segmentsData.filter((item) => {
				if (item?.segmentId && !item?.subSegmentId && !segmentSet.has(item.segmentId)) {
					segmentSet.add(item.segmentId);
					return true;
				} else if (item?.segmentId && item?.subSegmentId && !segmentSet.has(`${item.segmentId}-${item.subSegmentId}`)) {
					segmentSet.add(`${item.segmentId}-${item.subSegmentId}`);
					return true;
				} else if (!item?.segmentId && !segmentSet.has(0)) {
					segmentSet.add(0);
					return true;
				}
				return false;
			});
			return segmentsData;
		} catch (error) {
			throw new Error(error);
		}
	}

	// async getAllAccountSummaryData(query: IQueryParameters) {
	// 	const { page, limit, clientId, startDate, endDate, sort, sortBy } = query;
	// 	const sortedColumn = sortBy || null;

	// 	const filterStartDate = moment(startDate, 'DD-MM-YYYY').toDate();
	// 	const filterEndDate = moment(endDate, 'DD-MM-YYYY').toDate();

	// 	const serviceMonth = moment(moment(endDate, 'DD-MM-YYYY')).format('MMM-YY');
	// 	let data = await AccountPO.findAndCountAll({
	// 		where: { deletedAt: null },
	// 		include: [
	// 			{
	// 				model: Timesheet,
	// 				where: {
	// 					...(clientId && { clientId: clientId }),
	// 					deletedAt: null,
	// 					startDate: filterStartDate,
	// 					endDate: filterEndDate,
	// 					status: 'APPROVED',
	// 				},
	// 				attributes: ['status', 'id'],
	// 				include: [
	// 					{
	// 						model: Employee,
	// 						attributes: ['employeeNumber', 'monthlySalary', 'dailyCost'],
	// 						required: true,
	// 						include: [
	// 							{
	// 								model: LoginUser,
	// 								attributes: ['firstName', 'lastName'],
	// 							},
	// 							{
	// 								model: Segment,
	// 								attributes: ['name', 'id'],
	// 							},
	// 							{
	// 								model: SubSegment,
	// 								attributes: ['name', 'id'],
	// 							},
	// 						],
	// 					},
	// 				],
	// 			},
	// 		],
	// 		offset: page && limit ? (page - 1) * limit : undefined,
	// 		limit: limit ?? undefined,
	// 		order: [[sortedColumn ?? 'poNumber', sort ?? 'asc']],
	// 	});

	// 	data = parse(data);

	// 	const responseObj = {
	// 		data: data?.rows.map((item) => ({ ...item, serviceMonth })),
	// 		count: data?.count,
	// 		currentPage: page ?? undefined,
	// 		limit: limit ?? undefined,
	// 		lastPage: page && limit ? Math.ceil(data?.count / +limit) : undefined,
	// 	};
	// 	return responseObj;
	// }

	async getAllAccountPOData(clientId: number, query: IQueryParameters, user: User) {
		try {
			const { startDate, endDate } = query;
			const filterStartDate = moment(startDate, 'DD-MM-YYYY').toDate();
			const filterEndDate = moment(endDate, 'DD-MM-YYYY').toDate();

			let accountPODetails: any = await this.fetchAllAccountPOData(clientId, filterStartDate, filterEndDate, user);
			accountPODetails = parse(accountPODetails);

			const respAccountData = new Map();
			const bonusData = await BonusType.findAll({
				where: {
					// isActive: true,
					deletedAt: null,
				},
			});
			for (const accountData of accountPODetails) {
				let employeeCatalogueNumber =
					accountData?.timesheet?.employee?.employeeCatalogueNumber?.[0]?.catalogueNumber ?? null;
				if (accountData?.timesheet?.employee?.employeeCatalogueNumber?.length > 1) {
					employeeCatalogueNumber = accountData?.timesheet?.employee?.employeeCatalogueNumber[1]?.catalogueNumber;
				}
				if (accountData?.type !== 'Salary') {
					const customBonus = JSON.parse(accountData?.timesheet?.employee?.customBonus);
					if (customBonus?.data && customBonus?.data?.length > 0) {
						if (accountData.type === 'R' || accountData.type === 'Rig') {
							const isExistCustomBonus = customBonus?.data?.findIndex((e) => e.label === 'R' || e.label === 'Rig');
							if (isExistCustomBonus >= 0) {
								employeeCatalogueNumber = customBonus?.data[isExistCustomBonus]?.catalogueNumber;
							}
						} else {
							const isExistBonus = bonusData.findIndex((e) => e.timesheetName === accountData.type);
							if (isExistBonus >= 0) {
								const bonus = bonusData[isExistBonus];
								const isExistCustomBonus = customBonus?.data?.findIndex((e) => e.label === bonus.code);
								if (isExistCustomBonus >= 0) {
									employeeCatalogueNumber = customBonus?.data[isExistCustomBonus]?.catalogueNumber;
								}
							}
						}
					}
				}
				// const prevValue =
				// 	Number(
				// 		respAccountData.get(
				// 			`${accountData.type}:${accountData?.segmentData?.id ?? -1}:${accountData?.subSegmentData?.id ?? -1}`,
				// 		) || 0,
				// 	) +
				// 	accountData.timesheetQty * accountData.dailyRate;
				// respAccountData.set(
				// 	`${accountData.type}:${accountData?.segmentData?.id ?? -1}:${accountData?.subSegmentData?.id ?? -1}`,
				// 	prevValue,
				// );
				const prevValue = respAccountData.get(
					`${accountData.type}:${accountData?.segmentData?.id ?? -1}:${accountData?.subSegmentData?.id ?? -1}:${
						accountData?.managers
					}:${accountData?.timesheet?.employee.fonction ?? null}:${employeeCatalogueNumber}:${accountData.dailyRate}`,
				);
				const rate = Number(prevValue?.rate || 0) + accountData.timesheetQty * accountData.dailyRate;
				const timesheetQty = Number(prevValue?.timesheetQty || 0) + accountData?.timesheetQty;
				// let manager: string;
				// if (prevValue?.manager) {
				// 	const splitManager = prevValue?.manager?.split(',');
				// 	if (!splitManager?.includes(accountData?.managers)) {
				// 		manager = `${prevValue?.manager},${accountData?.managers}`;
				// 	} else {
				// 		manager = prevValue?.manager;
				// 	}
				// } else {
				// 	manager = accountData?.managers;
				// }
				const dataObj = {
					rate: rate,
					dailyRate: accountData?.dailyRate,
					timesheetQty: timesheetQty,
					segmentName: accountData?.segmentData?.name ?? null,
					subSegmentName: accountData?.subSegmentData?.name ?? null,
					type: accountData?.type,
					manager: accountData?.managers,
					catalogueNumber: employeeCatalogueNumber,
					fonction: accountData?.timesheet?.employee.fonction,
				};
				respAccountData.set(
					`${accountData.type}:${accountData?.segmentData?.id ?? -1}:${accountData?.subSegmentData?.id ?? -1}:${
						accountData?.managers
					}:${accountData?.timesheet?.employee.fonction ?? null}:${employeeCatalogueNumber}:${accountData.dailyRate}`,
					dataObj,
				);
			}

			// let segmentsData = await this.getUserClientSegmentData(clientId, filterStartDate, filterEndDate);
			// segmentsData = parse(segmentsData);

			const finalCalculatedData = [];
			for (const [key, value] of respAccountData.entries()) {
				const stringArr = key.split(':');
				// let managerData = segmentsData.filter((manager) => {
				// 	if (stringArr[1] >= 0 || stringArr[2] >= 0) {
				// 		return (
				// 			manager['segmentData.id'] === +stringArr[1] &&
				// 			(manager['subSegmentData.id'] || null) === (+stringArr[2] || null)
				// 		);
				// 	} else {
				// 		return manager['clientData.id'] === clientId;
				// 	}
				// });
				// managerData = managerData.map((manager) => manager['userData.loginUserData.name']);

				const obj = {
					type: value?.type,
					segmentData: +stringArr[1] ? { id: +stringArr[1], name: value?.segmentName } : null,
					subSegmentData: +stringArr[2] ? { id: +stringArr[2], name: value?.subSegmentName } : null,
					position: value?.fonction ?? null,
					total: value?.rate,
					managers: value?.manager,
					catalogueNumber: value?.catalogueNumber,
					dailyRate: value?.dailyRate,
					timesheetQty: value?.timesheetQty,
					// managerData: managerData,
				};
				finalCalculatedData.push(obj);
			}
			accountPODetails = finalCalculatedData;
			return accountPODetails;
		} catch (error) {
			console.log({ error });
		}
	}

	async getAllAccountPODataByEmployee(clientId: number, query: IQueryParameters, user: User) {
		const startDate = moment(query.startDate, 'DD-MM-YYYY').toDate();
		const endDate = moment(query.endDate, 'DD-MM-YYYY').toDate();

		let accountPODetails = await this.fetchAllAccountPOData(
			clientId,
			startDate,
			endDate,
			user,
			query.segment,
			query.subSegment,
		);
		accountPODetails = parse(accountPODetails);
		const bonusData = await BonusType.findAll({
			where: {
				// isActive: true,
				deletedAt: null,
			},
		});
		for (const accountData of accountPODetails) {
			if (accountData['timesheet']['employee']['employeeCatalogueNumber']?.length > 1) {
				accountData['timesheet']['employee']['employeeCatalogueNumber'] = {
					catalogueNumber:
						accountData['timesheet']['employee']['employeeCatalogueNumber']?.[1]?.catalogueNumber ?? null,
				};
			} else {
				accountData['timesheet']['employee']['employeeCatalogueNumber'] = {
					catalogueNumber:
						accountData['timesheet']['employee']['employeeCatalogueNumber']?.[0]?.catalogueNumber ?? null,
				};
			}
			// if (accountData?.type !== 'Salary') {
			// 	const customBonus = JSON.parse(accountData['timesheet']['employee']['customBonus']);
			// 	if (customBonus?.data && customBonus?.data?.length > 0) {
			// 		if (accountData.type === 'R' || accountData.type === 'Rig') {
			// 			const isExistCustomBonus = customBonus?.data?.findIndex((e) => e.label === 'R' || e.label === 'Rig');
			// 			if (isExistCustomBonus >= 0) {
			// 				accountData['timesheet']['employee']['employeeCatalogueNumber'] = {
			// 					catalogueNumber: customBonus?.data[isExistCustomBonus]?.catalogueNumber,
			// 				};
			// 			}
			// 		} else {
			// 			const isExistBonus = bonusData.findIndex((e) => e.timesheetName === accountData.type);
			// 			if (isExistBonus >= 0) {
			// 				const bonus = bonusData[isExistBonus];
			// 				const isExistCustomBonus = customBonus?.data?.findIndex((e) => e.label === bonus.code);
			// 				if (isExistCustomBonus >= 0) {
			// 					accountData['timesheet']['employee']['employeeCatalogueNumber'] = {
			// 						catalogueNumber: customBonus?.data[isExistCustomBonus]?.catalogueNumber,
			// 					};
			// 				}
			// 			}
			// 		}
			// 	}
			// }
		}
		return accountPODetails;
		// let segmentsData = [];
		// let type = '';
		// if ((query.segment && query.segment !== '') || (query.subSegment && query.subSegment !== '')) {
		// 	type = 'segSubSeg';
		// 	segmentsData = await this.getUserClientSegmentData(
		// 		clientId,
		// 		startDate,
		// 		endDate,
		// 		query.segment,
		// 		query.subSegment,
		// 		type,
		// 	);
		// }

		// if (clientId && !query?.segment && !query?.subSegment) {
		// 	type = 'client';
		// 	segmentsData = await this.getUserClientSegmentData(
		// 		clientId,
		// 		startDate,
		// 		endDate,
		// 		query.segment,
		// 		query.subSegment,
		// 		type,
		// 	);
		// }
		// segmentsData = parse(segmentsData);
		// let managerNames = [];
		// if (segmentsData.length > 0) {
		// 	managerNames = segmentsData.map((dat) => dat['userData.loginUserData.name']);
		// }
		// return { accountPODetails, managerNames };
	}

	// async getUserClientSegmentData(
	// 	clientId: number,
	// 	startDate: Date,
	// 	endDate: Date,
	// 	segment?: string,
	// 	subSegment?: string,
	// 	type?: string,
	// ) {
	// 	const userClientData = await UserClient.findAll({
	// 		where: {
	// 			clientId: clientId,
	// 			deletedAt: null,
	// 		},
	// 		attributes: [[fn('DISTINCT', col('userId')), 'userId']],
	// 		raw: true,
	// 		include: [
	// 			{
	// 				model: Role,
	// 				attributes: [],
	// 				required: true,
	// 				where: {
	// 					name: 'manager',
	// 				},
	// 			},
	// 		],
	// 	});
	// 	const userIDs = userClientData.map((userClient) => userClient.userId);
	// 	let segmentsData = [];
	// 	let include = [];
	// 	let where = {};
	// 	let attributes = [];
	// 	if (type === 'client') {
	// 		where = {
	// 			userId: userIDs,
	// 			deletedAt: null,
	// 			segmentId: null,
	// 			subSegmentId: null,
	// 			clientId: clientId,
	// 		};
	// 		include = [
	// 			{
	// 				model: User,
	// 				required: true,
	// 				attributes: [],
	// 				as: 'userData',
	// 				include: [
	// 					{
	// 						model: LoginUser,
	// 						attributes: ['name'],
	// 					},
	// 				],
	// 			},
	// 		];
	// 	} else if (type === 'segSubSeg') {
	// 		attributes = [[fn('DISTINCT', col('segmentData.id')), 'segmentId']];
	// 		if (segment && !isNull(segment) && subSegment && !isNull(subSegment)) {
	// 			where = {
	// 				userId: userIDs,
	// 				deletedAt: null,
	// 			};
	// 			include = [
	// 				{
	// 					model: Segment,
	// 					as: 'segmentData',
	// 					attributes: ['id', 'name', 'code'],
	// 					paranoid: false,
	// 					where: {
	// 						clientId: clientId,
	// 						code: segment,
	// 						deletedAt: {
	// 							[Op.or]: {
	// 								[Op.eq]: null,
	// 								[Op.between]: [startDate, endDate],
	// 								[Op.and]: {
	// 									[Op.gt]: startDate,
	// 									[Op.gt]: endDate,
	// 								},
	// 							},
	// 						},
	// 					},
	// 				},
	// 				{
	// 					model: User,
	// 					required: true,
	// 					attributes: [],
	// 					as: 'userData',
	// 					include: [
	// 						{
	// 							model: LoginUser,
	// 							attributes: ['name'],
	// 						},
	// 					],
	// 				},
	// 				{
	// 					model: SubSegment,
	// 					attributes: ['id', 'name', 'code'],
	// 					as: 'subSegmentData',
	// 					where: {
	// 						code: subSegment,
	// 						deletedAt: {
	// 							[Op.or]: {
	// 								[Op.eq]: null,
	// 								[Op.between]: [startDate, endDate],
	// 								[Op.and]: {
	// 									[Op.gt]: startDate,
	// 									[Op.gt]: endDate,
	// 								},
	// 							},
	// 						},
	// 					},
	// 				},
	// 			];
	// 		} else if (segment && !isNull(segment) && !subSegment && !isNull(subSegment)) {
	// 			include = [
	// 				{
	// 					model: Segment,
	// 					as: 'segmentData',
	// 					attributes: ['id', 'name', 'code'],
	// 					paranoid: false,
	// 					where: {
	// 						clientId: clientId,
	// 						code: segment,
	// 						deletedAt: {
	// 							[Op.or]: {
	// 								[Op.eq]: null,
	// 								[Op.between]: [startDate, endDate],
	// 								[Op.and]: {
	// 									[Op.gt]: startDate,
	// 									[Op.gt]: endDate,
	// 								},
	// 							},
	// 						},
	// 					},
	// 				},
	// 				{
	// 					model: User,
	// 					required: true,
	// 					attributes: [],
	// 					as: 'userData',
	// 					include: [
	// 						{
	// 							model: LoginUser,
	// 							attributes: ['name'],
	// 						},
	// 					],
	// 				},
	// 			];
	// 			where = {
	// 				userId: userIDs,
	// 				deletedAt: null,
	// 			};
	// 		}
	// 	} else {
	// 		where = {
	// 			userId: userIDs,
	// 			deletedAt: null,
	// 		};
	// 		include = [
	// 			{
	// 				model: Segment,
	// 				as: 'segmentData',
	// 				attributes: ['id', 'name', 'code'],
	// 				paranoid: false,
	// 				required: false,
	// 				where: {
	// 					clientId: clientId,
	// 					...(segment && { code: segment }),
	// 					deletedAt: {
	// 						[Op.or]: {
	// 							[Op.eq]: null,
	// 							[Op.between]: [startDate, endDate],
	// 							[Op.and]: {
	// 								[Op.gt]: startDate,
	// 								[Op.gt]: endDate,
	// 							},
	// 						},
	// 					},
	// 				},
	// 			},
	// 			{
	// 				model: User,
	// 				required: true,
	// 				attributes: [],
	// 				as: 'userData',
	// 				include: [
	// 					{
	// 						model: LoginUser,
	// 						attributes: ['name'],
	// 					},
	// 				],
	// 			},
	// 			{
	// 				model: SubSegment,
	// 				attributes: ['id', 'name', 'code'],
	// 				as: 'subSegmentData',
	// 				required: false,
	// 				where: {
	// 					...(subSegment && { code: subSegment }),
	// 					deletedAt: {
	// 						[Op.or]: {
	// 							[Op.eq]: null,
	// 							[Op.between]: [startDate, endDate],
	// 							[Op.and]: {
	// 								[Op.gt]: startDate,
	// 								[Op.gt]: endDate,
	// 							},
	// 						},
	// 					},
	// 				},
	// 			},
	// 			{
	// 				model: Client,
	// 				attributes: ['id'],
	// 				required: false,
	// 			},
	// 		];
	// 		attributes = [[fn('DISTINCT', col('segmentData.id')), 'segmentId']];
	// 	}
	// 	segmentsData = await UserSegment.findAll({
	// 		where: where,
	// 		attributes: attributes,
	// 		raw: true,
	// 		include: include,
	// 	});
	// 	return segmentsData;
	// }

	async getAccountPODataByID(id: number, transaction: Transaction = null) {
		let data = await AccountPO.findOne({
			where: {
				id: id,
				deletedAt: null,
			},
			transaction,
		});
		data = parse(data);
		return data;
	}

	async updatePaymentStatus({ id, user }: { id: number; user: User }, transaction: Transaction = null) {
		let isExist = await this.getAccountPODataByID(id, transaction);
		isExist = parse(isExist);

		if (!isExist) {
			throw new HttpException(404, this.msg.notFound, {}, true);
		}

		await AccountPO.update({ isPaid: true, updatedBy: user?.id }, { where: { id: id }, transaction });
		const data = await this.getAccountPODataByID(id, transaction);
		return data;
	}

	async fetchAllAccountPOData(
		clientId: number,
		startDate: Date,
		endDate: Date,
		user: User,
		segment?: string,
		subSegment?: string,
	) {
		if (segment === '') {
			segment = null;
		}
		if (subSegment === '') {
			subSegment = null;
		}
		const sendData = {
			segment: segment,
			subSegment: subSegment,
			clientId: clientId,
			startDate: startDate,
			endDate: endDate,
			timesheetAttribute: ['id', 'startDate', 'endDate'],
			employeeAttribute: ['id', 'employeeNumber', 'fonction', 'customBonus'],
			segmentAttribute: ['id', 'name'],
		};
		const subSegmentIds = getSubSegmentAccessForUser(user);
		const segmentIds = getSegmentAccessForUser(user);
		const getTypeOfInclude = await this.fetchTypeOfInclude(sendData);
		const accountPODetails = await AccountPO.findAll({
			where: {
				...getTypeOfInclude?.where,
				...(segmentIds.length && { segmentId: { [Op.in]: segmentIds } }),
				...(subSegmentIds.length && { subSegmentId: { [Op.or]: { [Op.eq]: null, [Op.in]: subSegmentIds } } }),
				[Op.or]: {
					type: {
						[Op.ne]: 'Medical',
					},
					dailyRate: {
						[Op.gt]: 0,
					},
				},
			},
			attributes: [
				'id',
				'type',
				'poNumber',
				'dailyRate',
				'timesheetQty',
				'isPaid',
				'invoiceNo',
				'managers',
				'startDate',
				'endDate',
			],
			paranoid: false,
			include: getTypeOfInclude?.include,
			order: [
				['timesheet', 'employee', 'loginUserData', 'lastName'],
				['timesheet', 'employee', 'employeeCatalogueNumber', 'startDate', 'desc'],
			],
		});
		const result = parse(accountPODetails);

		let index = 0;
		for (const item of result) {
			if (item?.type !== 'Salary' && item?.type !== 'Medical') {
				const catalogueNumberIndex = item?.timesheet?.employee?.employeeBonus?.findIndex((e) => {
					return (
						e?.bonus?.name === item?.type &&
						moment(moment(e.startDate).format('DD/MM/YYYY'), 'DD/MM/YYYY').isSameOrBefore(
							moment(moment(item?.endDate).format('DD/MM/YYYY'), 'DD/MM/YYYY'),
						) &&
						(e.endDate === null ||
							moment(moment(e.endDate).format('DD/MM/YYYY'), 'DD/MM/YYYY').isSameOrAfter(
								moment(moment(item?.startDate).format('DD/MM/YYYY'), 'DD/MM/YYYY'),
							))
					);
				});
				if (item?.timesheet?.employee?.employeeCatalogueNumber?.length > 0) {
					item.timesheet.employee.employeeCatalogueNumber = [
						{
							startDate: null,
							catalogueNumber: item?.timesheet?.employee?.employeeBonus?.[catalogueNumberIndex]?.catalogueNumber,
						},
					];
				}
			}
			const medicalRequestData = await MedicalRequest.findAll({
				where: {
					employeeId: item.timesheet.employee.id,
					status: medicalRequestStatus.ACTIVE,
					medicalDate: { [Op.between]: [startDate, endDate] },
				},
				include: [{ model: MedicalType, where: { amount: { [Op.not]: null } } }],
			});
			let total = 0;
			for (const medicalRequest of medicalRequestData) {
				total += medicalRequest.medicalTypeData.amount;
			}
			result[index]['medicalTotal'] = total;
			index++;
		}
		return result;
	}

	async fetchTypeOfInclude(data: {
		segment: string;
		subSegment: string;
		clientId: number;
		startDate: Date;
		endDate: Date;
		timesheetAttribute: string[];
		employeeAttribute: string[];
		segmentAttribute: string[];
	}) {
		let include = [];
		let where = {};
		if (data?.segment && !isNull(data?.segment) && data?.subSegment && !isNull(data?.subSegment)) {
			include = [
				{
					model: Timesheet,
					where: {
						clientId: data?.clientId,
						deletedAt: null,
						startDate: {
							[Op.or]: {
								[Op.between]: [data?.startDate, data?.endDate],
								[Op.eq]: data?.startDate,
							},
						},
						endDate: {
							[Op.or]: {
								[Op.between]: [data?.startDate, data?.endDate],
								[Op.eq]: data?.endDate,
							},
						},
						status: 'APPROVED',
					},
					attributes: data?.timesheetAttribute,
					include: [
						{
							model: Employee,
							attributes: data?.employeeAttribute,
							required: true,
							include: [
								{
									model: LoginUser,
									attributes: ['firstName', 'lastName'],
								},
								{
									model: EmployeeCatalogueNumber,
									attributes: ['startDate', 'catalogueNumber'],
									required: false,
									where: {
										startDate: {
											[Op.or]: {
												[Op.between]: [data?.startDate, data.endDate],
												[Op.lte]: data?.startDate,
												[Op.eq]: null,
											},
										},
									},
								},
								{
									model: EmployeeBonus,
									required: false,
									where: {
										startDate: {
											[Op.lte]: data?.endDate,
										},
										endDate: {
											[Op.or]: {
												[Op.eq]: null,
												[Op.gte]: data?.startDate,
											},
										},
									},
									include: [
										{
											model: BonusType,
											attributes: ['id', 'name', 'code', 'timesheetName'],
										},
									],
								},
							],
						},
					],
				},
				{
					model: Segment,
					attributes: data?.segmentAttribute,
					as: 'segmentData',
					required: true,
					paranoid: false,
					where: {
						code: data?.segment,
						deletedAt: {
							[Op.or]: {
								[Op.eq]: null,
								[Op.between]: [data?.startDate, data?.endDate],
								[Op.and]: {
									[Op.gt]: data?.startDate,
									[Op.gt]: data?.endDate,
								},
							},
						},
					},
				},
				{
					model: SubSegment,
					attributes: data?.segmentAttribute,
					as: 'subSegmentData',
					required: true,
					paranoid: false,
					where: {
						code: data?.subSegment,
						deletedAt: {
							[Op.or]: {
								[Op.eq]: null,
								[Op.between]: [data?.startDate, data?.endDate],
								[Op.and]: {
									[Op.gt]: data?.startDate,
									[Op.gt]: data?.endDate,
								},
							},
						},
					},
				},
			];
			where = {
				deletedAt: null,
			};
		} else if (data?.segment && !isNull(data?.segment) && !data?.subSegment) {
			include = [
				{
					model: Timesheet,
					where: {
						clientId: data?.clientId,
						deletedAt: null,
						startDate: {
							[Op.or]: {
								[Op.between]: [data?.startDate, data?.endDate],
								[Op.eq]: data?.startDate,
							},
						},
						endDate: {
							[Op.or]: {
								[Op.between]: [data?.startDate, data?.endDate],
								[Op.eq]: data?.endDate,
							},
						},
						status: 'APPROVED',
					},
					attributes: data?.timesheetAttribute,
					include: [
						{
							model: Employee,
							attributes: data?.employeeAttribute,
							required: true,
							include: [
								{
									model: LoginUser,
									attributes: ['firstName', 'lastName'],
								},
								{
									model: EmployeeCatalogueNumber,
									required: false,
									where: {
										startDate: {
											[Op.or]: {
												[Op.between]: [data?.startDate, data.endDate],
												[Op.lte]: data?.startDate,
												[Op.eq]: null,
											},
										},
									},
								},
								{
									model: EmployeeBonus,
									required: false,
									where: {
										startDate: {
											[Op.lte]: data?.endDate,
										},
										endDate: {
											[Op.or]: {
												[Op.eq]: null,
												[Op.gte]: data?.startDate,
											},
										},
									},
									include: [
										{
											model: BonusType,
											attributes: ['id', 'name', 'code', 'timesheetName'],
										},
									],
								},
							],
						},
					],
				},
				{
					model: Segment,
					attributes: data?.segmentAttribute,
					as: 'segmentData',
					required: true,
					paranoid: false,
					where: {
						code: data?.segment,
						deletedAt: {
							[Op.or]: {
								[Op.eq]: null,
								[Op.between]: [data?.startDate, data?.endDate],
								[Op.and]: {
									[Op.gt]: data?.startDate,
									[Op.gt]: data?.endDate,
								},
							},
						},
					},
				},
			];
			where = {
				deletedAt: null,
				...(isNull(data?.segment) && { segmentId: null }),
				...(isNull(data?.subSegment) && { subSegmentId: null }),
			};
		} else {
			include = [
				{
					model: Timesheet,
					where: {
						clientId: data?.clientId,
						deletedAt: null,
						startDate: {
							[Op.or]: {
								[Op.between]: [data?.startDate, data?.endDate],
								[Op.eq]: data?.startDate,
							},
						},
						endDate: {
							[Op.or]: {
								[Op.between]: [data?.startDate, data?.endDate],
								[Op.eq]: data?.endDate,
							},
						},
						status: 'APPROVED',
					},
					attributes: data?.timesheetAttribute,
					include: [
						{
							model: Employee,
							attributes: data?.employeeAttribute,
							required: true,
							include: [
								{
									model: LoginUser,
									attributes: ['firstName', 'lastName'],
								},
								{
									model: EmployeeCatalogueNumber,
									required: false,
									where: {
										startDate: {
											[Op.or]: {
												[Op.between]: [data?.startDate, data.endDate],
												[Op.lte]: data?.startDate,
												[Op.eq]: null,
											},
										},
									},
								},
								{
									model: EmployeeBonus,
									required: false,
									where: {
										startDate: {
											[Op.lte]: data?.endDate,
										},
										endDate: {
											[Op.or]: {
												[Op.eq]: null,
												[Op.gte]: data?.startDate,
											},
										},
									},
									include: [
										{
											model: BonusType,
											attributes: ['id', 'name', 'code', 'timesheetName'],
										},
									],
								},
							],
						},
					],
				},
				{
					model: Segment,
					attributes: data?.segmentAttribute,
				},
				{
					model: SubSegment,
					attributes: data?.segmentAttribute,
					required: false,
				},
			];
			where = {
				deletedAt: null,
				...(isNull(data?.segment) && { segmentId: null }),
				...(isNull(data?.subSegment) && { subSegmentId: null }),
			};
		}

		return { include, where };
	}
}
