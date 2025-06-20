import { MessageFormation } from '@/constants/messages.constants';
import { IQueryParameters } from '@/interfaces/general/general.interface';
import { AccountUpdate } from '@/interfaces/model/account.interface';
import Account from '@/models/account.model';
import BonusType from '@/models/bonusType.model';
import Client from '@/models/client.model';
import Employee from '@/models/employee.model';
import LoginUser from '@/models/loginUser.model';
import Segment from '@/models/segment.model';
import SubSegment from '@/models/subSegment.model';
import Timesheet from '@/models/timesheet.model';
import TimesheetSchedule from '@/models/timesheetSchedule.model';
import User from '@/models/user.model';
import { getSegmentAccessForUser, getSubSegmentAccessForUser, parse } from '@/utils/common.util';
import moment from 'moment';
import { Op, Transaction } from 'sequelize';
import BaseRepository from './base.repository';

export default class AccountRepo extends BaseRepository<Account> {
	private msg = new MessageFormation('Account').message;
	constructor() {
		super(Account.name);
	}

	async getAllAccountData(query: IQueryParameters, user: User) {
		const { page, limit, clientId, endDate, sort, sortBy } = query;
		const sortedColumn = sortBy || null;
		const serviceMonth = moment(moment(endDate, 'DD-MM-YYYY')).format('MMM-YYYY');
		const subSegmentIds = getSubSegmentAccessForUser(user);
		const segmentIds = getSegmentAccessForUser(user);
		let data = await this.getAllData({
			where: { deletedAt: null, ...(clientId && { clientId: clientId }), serviceMonth: serviceMonth },
			include: [
				{
					model: Employee,
					as: 'employee',
					attributes: ['contractEndDate'],
					include: [
						{
							model: Segment,
							required: false,
							where: { ...(segmentIds?.length > 0 && { id: { [Op.in]: segmentIds } }) },
							attributes: ['name'],
						},
						{
							model: SubSegment,
							required: false,
							where: {
								...(subSegmentIds?.length > 0 && { id: { [Op.or]: { [Op.eq]: null, [Op.in]: subSegmentIds } } }),
							},
							attributes: ['name'],
						},
					],
				},
				{ model: Timesheet, required: true, attributes: ['id'] },
			],
			offset: page && limit ? (page - 1) * limit : undefined,
			limit: limit ?? undefined,
			order: [[sortedColumn ?? 'n', sort ?? 'asc']],
		});

		data = parse(data);
		const result = [];
		for (const row of data?.rows) {
			if (
				row?.employee?.segment?.name &&
				row?.affectation ==
					row?.employee?.segment?.name + (row?.employee?.subSegment?.name ? '-' + row?.employee?.subSegment?.name : '')
			)
				result.push(row);
		}
		const responseObj = {
			data: result,
			count: result.length,
			currentPage: page ?? undefined,
			limit: limit ?? undefined,
			lastPage: page && limit ? Math.ceil(data?.count / +limit) : undefined,
		};
		return responseObj;
	}

	async updateAccountDataService({ query, body, user }: { query: IQueryParameters; body: AccountUpdate; user: User }) {
		return;
		// const { employeeId, timesheetId, startDate } = query;
		// const serviceMonth = moment(moment(startDate, 'DD-MM-YYYY')).format('MMM-YYYY');
		// const isExist = await Account.findOne({
		// 	where: {
		// 		timesheetId: timesheetId,
		// 		employeeId: employeeId,
		// 		serviceMonth: serviceMonth,
		// 	},
		// });
		// if (!isExist) {
		// 	throw new HttpException(403, this.msg.notFound);
		// }
		// await Account.update(
		// 	{
		// 		invoiced: body.invoiced ?? null,
		// 		invoiceNumber: body.invoiceNumber ?? null,
		// 		toBeInvoicedBack: Number(isExist?.shouldBeInvoiced - body?.invoiced) || 0,
		// 		invoiceAmount: body.invoiceAmount ?? null,
		// 		salaryPaid: body.salaryPaid ?? null,
		// 		invoiceLodgingDate: body.invoiceLodgingDate ?? null,
		// 		dateSalaryPaid: body.dateSalaryPaid ?? null,
		// 		comments: body.comments ?? null,
		// 		isGeneratedInvoice: body.isGeneratedInvoice ?? false,
		// 		poNumber: body.poNumber ?? null,
		// 		poDate: body.poDate ?? null,
		// 		bonus1Name: body.bonus1Name ?? null,
		// 		bonus1: body.bonus1 ?? null,
		// 		poBonus1: body.poBonus1 ?? null,
		// 		invoiceNumberPOBonus1: body.invoiceNumberPOBonus1 ?? null,
		// 		bonus2Name: body.bonus2Name ?? null,
		// 		bonus2: body.bonus2 ?? null,
		// 		poBonus2: body.poBonus2 ?? null,
		// 		invoiceNumberPOBonus2: body.invoiceNumberPOBonus2 ?? null,
		// 		bonus3Name: body.bonus3Name ?? null,
		// 		bonus3: body.bonus3 ?? null,
		// 		poBonus3: body.poBonus3 ?? null,
		// 		invoiceNumberPOBonus3: body.invoiceNumberPOBonus3 ?? null,
		// 		additionalAmount: body.additionalAmount ?? null,
		// 		additionalPOBonus: body.additionalPOBonus ?? null,
		// 		additionalInvoiceNumberPO: body.additionalInvoiceNumberPO ?? null,
		// 		updatedBy: user.id,
		// 	},
		// 	{ where: { timesheetId: timesheetId, employeeId: employeeId, serviceMonth: serviceMonth } },
		// );
		// const data = await this.getAllAccountDataByIdService({ employeeId: +body.employeeId });
		// return data;
	}

	async getAllAccountDataByIdService(query: IQueryParameters, transaction: Transaction = null) {
		const { employeeId, startDate } = query;
		const serviceMonth = moment(moment(startDate, 'DD-MM-YYYY')).format('MMM-YYYY');
		let data = await Account.findOne({
			where: {
				employeeId: employeeId,
				serviceMonth: serviceMonth,
			},
			include: [
				{
					model: Employee,
					attributes: ['contractEndDate', 'id'],
				},
			],
			transaction,
		});
		data = parse(data);
		return data;
	}

	async generateAccountData(clientId: string, startDate: string, endDate: string, user: User) {
		return;
		// const monthStartDate = moment(startDate, 'DD-MM-YYYY');
		// const monthEndDate = moment(endDate, 'DD-MM-YYYY');
		// let timesheetData = await ReliquatCalculationV2.findAll({
		// 	include: [
		// 		{
		// 			model: Employee,
		// 			required: true,
		// 			attributes: ['id', 'employeeNumber'],
		// 			include: [
		// 				{ model: Segment, attributes: ['id', 'name'] },
		// 				{ model: SubSegment, attributes: ['id', 'name'] },
		// 				{
		// 					model: LoginUser,
		// 					attributes: ['firstName', 'lastName'],
		// 				},
		// 				{
		// 					model: TimesheetSchedule,
		// 					required: false,
		// 					where: {
		// 						date: {
		// 							[Op.between]: [monthStartDate.toDate(), monthEndDate.toDate()],
		// 						},
		// 					},
		// 				},
		// 			],
		// 		},
		// 	],
		// 	where: {
		// 		clientId: clientId,
		// 		[Op.or]: [
		// 			{
		// 				startDate: {
		// 					[Op.between]: [monthStartDate.toDate(), monthEndDate.toDate()],
		// 				},
		// 			},
		// 			{
		// 				endDate: {
		// 					[Op.between]: [monthStartDate.toDate(), monthEndDate.toDate()],
		// 				},
		// 			},
		// 		],
		// 	},
		// });
		// timesheetData = parse(timesheetData);

		// await Promise.all(
		// 	timesheetData.map(async (accountData) => {
		// 		await (async () => {
		// 			let salaryData = await EmployeeSalary.findOne({
		// 				where: {
		// 					employeeId: accountData.employeeId,
		// 					[Op.or]: [
		// 						{
		// 							startDate: { [Op.lte]: monthStartDate.toDate() },
		// 						},
		// 						{
		// 							endDate: { [Op.gte]: monthStartDate.toDate() },
		// 						},
		// 					],
		// 				},
		// 				attributes: ['baseSalary', 'monthlySalary', 'dailyCost', 'startDate', 'endDate'],
		// 			});
		// 			salaryData = parse(salaryData);
		// 			const daysWorked = accountData.totalWorked;
		// 			const dailyCost = salaryData?.dailyCost ?? 0;
		// 			const serviceMonth = moment(accountData.endDate).format('MMM-YYYY');
		// 			const position =
		// 				accountData?.employee?.loginUserData?.lastName + ' ' + accountData?.employee?.loginUserData?.firstName;

		// 			const affectation =
		// 				(accountData?.employee?.segment?.name ? accountData?.employee?.segment?.name : '') +
		// 				+(accountData?.employee?.subSegment?.name ? '-' + accountData?.employee?.subSegment?.name : '');
		// 			const shouldBeInvoiced = Number((daysWorked * dailyCost).toFixed(2));
		// 			await Account.findOrCreate({
		// 				where: { clientId: clientId, timesheetId: accountData.timesheetId, employeeId: accountData.employeeId },
		// 				defaults: {
		// 					clientId: Number(clientId),
		// 					timesheetId: accountData.timesheetId,
		// 					employeeId: accountData.employeeId,
		// 					n: accountData.employee.employeeNumber,
		// 					position: position,
		// 					type: 'Salary',
		// 					affectation: affectation,
		// 					serviceMonth: serviceMonth,
		// 					monthlySalaryWithHousingAndTravel: salaryData?.monthlySalary ?? 0,
		// 					daysWorked: daysWorked,
		// 					dailyCost: dailyCost,
		// 					shouldBeInvoiced: shouldBeInvoiced,
		// 					createdBy: user.id,
		// 				},
		// 			});
		// 		})();
		// 	}),
		// );
		// const result = await this.getAllAccountData(
		// 	{
		// 		clientId: Number(clientId),
		// 		startDate: monthStartDate.toDate(),
		// 		endDate: monthEndDate.toDate(),
		// 	},
		// 	user,
		// );
		// return result;
	}

	async generateAccountRelatedData(
		{
			employeeId,
			timesheetId,
			userId,
			type,
		}: {
			employeeId: string;
			timesheetId: number;
			userId: number;
			type: string;
		},
		transaction: Transaction = null,
	) {
		return;
		// try {
		// 	let isExist = await Account.findOne({
		// 		where: {
		// 			timesheetId: timesheetId,
		// 			employeeId: +employeeId,
		// 		},
		// 		transaction,
		// 	});
		// 	isExist = parse(isExist);
		// 	if (isExist?.timesheetId && type === 'createAccount') {
		// 		await Account.destroy({
		// 			where: {
		// 				employeeId: employeeId,
		// 				timesheetId: isExist?.timesheetId,
		// 				deletedAt: null,
		// 			},
		// 			force: true,
		// 			transaction,
		// 		});
		// 	}
		// 	const data = await this.getBonusData({ timesheetId, transaction });
		// 	const position =
		// 		data?.timesheetData?.employee?.loginUserData?.lastName +
		// 		' ' +
		// 		data?.timesheetData?.employee?.loginUserData?.firstName;
		// 	const affectation =
		// 		(data?.timesheetData?.employee?.segment?.name ?? '') +
		// 		'-' +
		// 		(data?.timesheetData?.employee?.subSegment?.name ?? '');
		// 	const serviceMonth = moment(data?.timesheetData?.endDate).format('MMM-YYYY');
		// 	const daysWorked =
		// 		data?.timesheetData?.employee?.timeSheetSchedule?.filter((count) => {
		// 			return (
		// 				count?.status === 'P' ||
		// 				count?.status === 'AP' ||
		// 				count?.status === 'CA' ||
		// 				(data?.timesheetData?.client?.isCountCR ? count?.status === 'CR' : '')
		// 			);
		// 		}).length ?? 0;
		// 	const dailyCost = data?.timesheetData?.employee?.dailyCost ?? 0;
		// 	const shouldBeInvoiced = daysWorked * dailyCost;
		// 	let salaryPONumber = null;
		// 	const poDate = null;
		// 	let bonus1Name = null;
		// 	let bonus1 = null;
		// 	let bonus2Name = null;
		// 	let bonus2 = null;
		// 	let bonus3Name = null;
		// 	let bonus3 = null;
		// 	let additionalBonusNames = null;
		// 	let additionalBonusPrice = null;
		// 	if (type === 'createAccount') {
		// 		if (data?.bonusArr?.length > 0) {
		// 			bonus1Name = data?.bonusArr[0]?.label ?? null;
		// 			bonus1 = data?.bonusArr[0]?.price ? +data?.bonusArr[0]?.price?.toFixed(2) : null;
		// 			bonus2Name = data?.bonusArr[1]?.label ?? null;
		// 			bonus2 = data?.bonusArr[1]?.price ? +data?.bonusArr[1]?.price?.toFixed(2) : null;
		// 			bonus3Name = data?.bonusArr[2]?.label ?? null;
		// 			bonus3 = data?.bonusArr[2]?.price ? +data?.bonusArr[2]?.price?.toFixed(2) : null;
		// 			const additionalBonusArrNames = [];
		// 			const additionalBonusArrPrice = [];
		// 			additionalBonusNames = '';
		// 			additionalBonusPrice = null;
		// 			if (data?.bonusArr?.length > 2) {
		// 				for (let i = 3; i < data?.bonusArr?.length; i++) {
		// 					additionalBonusArrNames.push(data?.bonusArr[i]?.label);
		// 					const price = data?.bonusArr[i]?.price;
		// 					additionalBonusPrice = additionalBonusPrice ?? 0 + price;
		// 				}
		// 				if (additionalBonusArrNames?.length > 0 && additionalBonusArrPrice?.length > 0) {
		// 					additionalBonusNames = additionalBonusArrNames?.join(',');
		// 				}
		// 			}
		// 		}
		// 		let resultData = [];
		// 		let accSalaryData = await Account.create(
		// 			{
		// 				clientId: data?.timesheetData?.clientId,
		// 				employeeId: data?.timesheetData?.employeeId,
		// 				timesheetId: timesheetId,
		// 				n: data?.timesheetData?.employee?.employeeNumber,
		// 				position: position,
		// 				type: 'Salary',
		// 				affectation: affectation,
		// 				serviceMonth: serviceMonth,
		// 				monthlySalaryWithHousingAndTravel: data?.timesheetData?.employee?.monthlySalary ?? 0,
		// 				daysWorked: daysWorked ?? 0,
		// 				dailyCost: dailyCost,
		// 				shouldBeInvoiced: shouldBeInvoiced,
		// 				poNumber: salaryPONumber ?? null,
		// 				poDate: poDate ?? null,
		// 				createdBy: userId,
		// 				bonus1Name: bonus1Name,
		// 				bonus1: bonus1,
		// 				bonus2Name: bonus2Name,
		// 				bonus2: bonus2,
		// 				bonus3Name: bonus3Name,
		// 				bonus3: bonus3,
		// 				additionalBonusNames: additionalBonusNames,
		// 				additionalAmount: additionalBonusPrice,
		// 			},
		// 			{ transaction },
		// 		);
		// 		accSalaryData = parse(accSalaryData);
		// 		resultData = [accSalaryData];
		// 		await createHistoryRecord(
		// 			{
		// 				tableName: tableEnum.ACCOUNT,
		// 				jsonData: parse(resultData),
		// 				status: statusEnum.CREATE,
		// 			},
		// 			transaction,
		// 		);
		// 	}
		// 	if (type === 'updateAccount') {
		// 		if (data?.bonusArr?.length > 0) {
		// 			bonus1Name = data?.bonusArr[0]?.label ?? null;
		// 			bonus1 = data?.bonusArr[0]?.price ?? null;
		// 			bonus2Name = data?.bonusArr[1]?.label ?? null;
		// 			bonus2 = data?.bonusArr[1]?.price ?? null;
		// 			bonus3Name = data?.bonusArr[2]?.label ?? null;
		// 			bonus3 = data?.bonusArr[2]?.price ?? null;
		// 			const additionalBonusArrNames = [];
		// 			if (data?.bonusArr?.length > 2) {
		// 				for (let i = 3; i < data?.bonusArr?.length; i++) {
		// 					additionalBonusArrNames.push(data?.bonusArr[i]?.label);
		// 					const price = data?.bonusArr[i]?.price;
		// 					additionalBonusPrice = additionalBonusPrice + price;
		// 				}
		// 				if (additionalBonusArrNames?.length > 0) {
		// 					additionalBonusNames = additionalBonusArrNames?.join(',');
		// 				}
		// 			}
		// 		}
		// 		await Account.update(
		// 			{
		// 				daysWorked: daysWorked,
		// 				dailyCost: dailyCost,
		// 				shouldBeInvoiced: shouldBeInvoiced,
		// 				bonus1Name: bonus1Name,
		// 				bonus1: bonus1,
		// 				bonus2Name: bonus2Name,
		// 				bonus2: bonus2,
		// 				bonus3Name: bonus3Name,
		// 				bonus3: bonus3,
		// 				additionalBonusNames: additionalBonusNames,
		// 				additionalAmount: additionalBonusPrice,
		// 			},
		// 			{ where: { employeeId: +employeeId, timesheetId: timesheetId }, transaction },
		// 		);
		// 	}

		// 	if (type === 'approveTimesheetAccount') {
		// 		let accountData = await Account.findAll({
		// 			where: {
		// 				timesheetId: timesheetId,
		// 				employeeId: employeeId,
		// 			},
		// 			transaction,
		// 		});
		// 		accountData = parse(accountData);
		// 		let accountPoData = await AccountPO.findAll({
		// 			where: {
		// 				timesheetId: timesheetId,
		// 			},
		// 			transaction,
		// 			include: [
		// 				{
		// 					model: Segment,
		// 					attributes: ['name'],
		// 				},
		// 				{
		// 					model: SubSegment,
		// 					attributes: ['name'],
		// 				},
		// 			],
		// 		});
		// 		accountPoData = parse(accountPoData);

		// 		accountPoData
		// 			?.filter((salaryFilteredData) => {
		// 				return salaryFilteredData?.type === 'Salary';
		// 			})
		// 			.map((filteredData) => {
		// 				salaryPONumber = filteredData?.poNumber;
		// 			});

		// 		const bonusDatas = accountPoData?.filter((bonusData) => {
		// 			return bonusData?.type !== 'Salary';
		// 		});
		// 		let poNumberBonus1 = null;
		// 		let poBonus1 = null;
		// 		let poNumberBonus2 = null;
		// 		let poBonus2 = null;
		// 		let poNumberBonus3 = null;
		// 		let poBonus3 = null;
		// 		if (accountData?.length > 0) {
		// 			if (accountData[0]?.bonus1Name) {
		// 				const filteredBonusData = bonusDatas?.filter((sameBonusData) => {
		// 					return sameBonusData?.type === accountData[0]?.bonus1Name.replace('-', ',');
		// 				});
		// 				if (filteredBonusData?.length > 0) {
		// 					poNumberBonus1 = filteredBonusData[0]?.poNumber;
		// 					poBonus1 = 0;
		// 					filteredBonusData.forEach((e) => {
		// 						poBonus1 += e?.dailyRate * e?.timesheetQty;
		// 					});
		// 				}
		// 			}
		// 			if (accountData[0]?.bonus2Name) {
		// 				const filteredBonusData = bonusDatas?.filter((sameBonusData) => {
		// 					return sameBonusData?.type === accountData[0]?.bonus2Name.replace('-', ',');
		// 				});
		// 				if (filteredBonusData?.length > 0) {
		// 					poNumberBonus2 = filteredBonusData[0].poNumber;
		// 					poBonus2 = 0;
		// 					filteredBonusData.forEach((e) => {
		// 						poBonus2 += e?.dailyRate * e?.timesheetQty;
		// 					});
		// 				}
		// 			}
		// 			if (accountData[0]?.bonus3Name) {
		// 				const filteredBonusData = bonusDatas?.filter((sameBonusData) => {
		// 					return sameBonusData?.type === accountData[0]?.bonus3Name.replace('-', ',');
		// 				});
		// 				if (filteredBonusData?.length > 0) {
		// 					poNumberBonus3 = filteredBonusData[0]?.poNumber;
		// 					poBonus3 = 0;
		// 					filteredBonusData?.map((e) => {
		// 						poBonus3 += e?.dailyRate * e?.timesheetQty;
		// 					});
		// 				}
		// 			}
		// 		}

		// 		await Account.update(
		// 			{
		// 				poNumber: salaryPONumber,
		// 				...(poNumberBonus1 && { poNumberBonus1: poNumberBonus1, poBonus1: poBonus1 }),
		// 				...(poNumberBonus2 && { poNumberBonus2: poNumberBonus2, poBonus2: poBonus2 }),
		// 				...(poNumberBonus3 && { poNumberBonus3: poNumberBonus3, poBonus3: poBonus3 }),
		// 			},
		// 			{ where: { employeeId: employeeId, timesheetId: timesheetId }, transaction },
		// 		);
		// 	}

		// 	if (type === 'unApproveTimesheetAccount') {
		// 		await Account.update(
		// 			{
		// 				poNumber: null,
		// 				poNumberBonus1: null,
		// 				poBonus1: null,
		// 				poNumberBonus2: null,
		// 				poBonus2: null,
		// 				poNumberBonus3: null,
		// 				poBonus3: null,
		// 			},
		// 			{ where: { employeeId: employeeId, timesheetId: timesheetId }, transaction },
		// 		);
		// 	}
		// 	return;
		// } catch (error) {
		// 	console.log({ error });
		// 	throw new Error(error);
		// }
	}

	async getBonusData({ timesheetId, transaction }: { timesheetId: number; transaction: Transaction }) {
		try {
			const timesheetDate = await Timesheet.findOne({
				where: {
					id: timesheetId,
				},
				attributes: ['startDate', 'endDate'],
				transaction,
			});
			const momentStartDate = moment(timesheetDate?.startDate);
			const momentEndDate = moment(timesheetDate?.endDate);

			let timesheetData = await Timesheet.findOne({
				where: {
					id: timesheetId,
				},
				include: [
					{
						model: Employee,
						include: [
							{
								model: LoginUser,
								attributes: ['firstName', 'lastName'],
							},
							{
								model: Segment,
								attributes: ['name'],
							},
							{
								model: SubSegment,
								attributes: ['name'],
							},
							{
								model: TimesheetSchedule,
								attributes: ['employeeId', 'status', 'date', 'overtimeHours', 'bonusCode'],
								where: {
									date: {
										[Op.between]: [momentStartDate, momentEndDate],
									},
								},
							},
						],
					},
					{
						model: Client,
						attributes: ['isCountCR'],
					},
				],
				transaction,
			});
			timesheetData = parse(timesheetData);
			let customBonus = null;
			if (timesheetData?.employee?.customBonus) {
				customBonus = JSON.parse(timesheetData?.employee?.customBonus);
			}

			if (customBonus?.data) {
				customBonus = customBonus?.data;
			}

			let bonusData = await BonusType.findAll({
				where: {
					// isActive: true,
					deletedAt: null,
				},
				transaction,
			});
			bonusData = parse(bonusData);
			const hourlyOvertimeBonus = [
				'P,DAILY',
				'P,NIGHT',
				'P,HOLIDAY',
				'CHB,DAILY',
				'CHB,NIGHT',
				'CHB,WEEKEND',
				'CHB,HOLIDAY',
				'W,WEEKEND',
				'W,NIGHT',
			];
			const bonusArr = [];
			bonusData?.forEach((bonus) => {
				if (
					timesheetData.employee?.timeSheetSchedule.some(
						(element) => element?.bonusCode?.split(',')?.indexOf(bonus?.code) >= 0,
					)
				) {
					const isExist = timesheetData.employee?.timeSheetSchedule.filter((bonusType) => {
						return bonusType?.bonusCode?.split(',')?.indexOf(bonus?.code) >= 0;
					});
					if (isExist?.length > 0) {
						if (customBonus && Object.keys(customBonus)?.length > 0) {
							const isExistingCustomBonus = customBonus?.findIndex(
								(customBonusIndex) => customBonusIndex?.label === bonus?.code,
							);
							if (isExistingCustomBonus >= 0) {
								bonusArr.push({
									label: bonus.timesheetName,
									count: isExist?.length || 0,
									price:
										Number(customBonus[isExistingCustomBonus]?.coutJournalier?.toFixed(2) || 0) *
										(isExist?.length || 0),
								});
							} else {
								bonusArr.push({
									label: bonus.timesheetName,
									price: Number(bonus.basePrice.toFixed(2)) * (isExist?.length || 0),
								});
							}
						} else {
							bonusArr.push({
								label: bonus.timesheetName,
								price: Number(bonus.basePrice.toFixed(2)) * isExist?.length,
							});
						}
					}
				}
			});

			let hourlyBonusPrice = 0;
			const respData = new Map();
			if (timesheetData.employee?.timeSheetSchedule) {
				for (const timesheetDataFilter of timesheetData.employee?.timeSheetSchedule) {
					let length = 0;
					if (hourlyOvertimeBonus.includes(`${timesheetDataFilter?.status},${timesheetDataFilter?.bonusCode}`)) {
						length = 1;
						const prevValue = respData.get(`${timesheetDataFilter?.status}-${timesheetDataFilter?.overtimeHours}`);
						if (prevValue) {
							length = prevValue?.length + 1;
						}
						respData.set(`${timesheetDataFilter?.status}-${timesheetDataFilter?.overtimeHours}`, {
							...timesheetDataFilter,
							length: length,
						});
					}
				}
			}
			const hourlyBonusArr = [];
			for (const hourlyBonusData of respData.values()) {
				hourlyBonusArr.push(hourlyBonusData);
			}
			const bonusMap = new Map();
			for (const e of hourlyBonusArr) {
				let price = 0;
				if (hourlyOvertimeBonus.includes(`${e?.status},${e?.bonusCode}`)) {
					const dailyRateMultipliedBy =
						e.bonusCode?.endsWith(',NIGHT') || e.bonusCode?.endsWith(',WEEKEND') || e.bonusCode?.endsWith(',HOLIDAY')
							? 2
							: e.bonusCode?.endsWith(',DAILY') && e?.overtimeHours < 4
							? 1.5
							: e.bonusCode?.endsWith(',DAILY') && e?.overtimeHours > 4
							? 1.75
							: 1;
					hourlyBonusPrice = (timesheetData.employee?.dailyCost / 8) * e.overtimeHours * dailyRateMultipliedBy;
					const prevValue = bonusMap.get(`${e?.status}-${e?.bonusCode}`);
					price = hourlyBonusPrice * e.length;
					if (prevValue) {
						price = prevValue?.price + hourlyBonusPrice * e.length;
					}

					bonusMap.set(`${e?.status}-${e?.bonusCode}`, {
						label: `${e?.status}-${e?.bonusCode}`,
						price: price,
					});
				}
			}
			bonusArr.push(...bonusMap.values());
			return { timesheetData, bonusArr };
		} catch (error) {
			console.log({ error });
			throw new Error(error);
		}
	}
}
