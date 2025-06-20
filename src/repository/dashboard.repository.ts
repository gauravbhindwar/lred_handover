import { MessageFormation } from '@/constants/messages.constants';
import { IQueryParameters } from '@/interfaces/general/general.interface';
import Client from '@/models/client.model';
import Employee from '@/models/employee.model';
import EmployeeContract from '@/models/employeeContract.model';
import EmployeeLeave from '@/models/employeeLeave.model';
import ErrorLogs from '@/models/errorLogs.model';
import LoginUser from '@/models/loginUser.model';
import Request from '@/models/request.model';
import Role from '@/models/role.model';
import Segment from '@/models/segment.model';
import SubSegment from '@/models/subSegment.model';
import TransportDriver from '@/models/transport.driver.model';
import TransportVehicle from '@/models/transport.vehicle.model';
import User from '@/models/user.model';
import UserClient from '@/models/userClient.model';
import { getSegmentAccessForUser, getSubSegmentAccessForUser, parse } from '@/utils/common.util';
import _ from 'lodash';
import moment from 'moment';
import { Op } from 'sequelize';
import EmployeeContractRepo from './employeeContract.repository';
import ReliquatCalculationRepo from './reliquatCalculation.repository';

export default class DashboardRepo {
	private msg = new MessageFormation('Dashboard').message;
	private reliquatCalculationRepo = new ReliquatCalculationRepo();
	private employeeContractRepo = new EmployeeContractRepo();
	async getAllDashboardData(query: IQueryParameters, contractEndFilter: number, user: User) {
		const { clientId, limit, type } = query;
		const segmentIds = getSegmentAccessForUser(user);
		const subSegmentIds = getSubSegmentAccessForUser(user);
		const currentDate = moment();
		const expiryDate = moment().add(30, 'days');
		const dayWiseCount = [];
		const condition =
			type && type != 'all'
				? {
						deletedAt: null,
						clientId: clientId,
						isAdminApproved: true,
						terminationDate:
							type == 'active'
								? { [Op.or]: { [Op.eq]: null, [Op.gte]: new Date() } }
								: { [Op.not]: null, [Op.lte]: new Date() },
						segmentId: { [Op.not]: null },
				  }
				: { deletedAt: null, clientId: clientId, segmentId: { [Op.not]: null } };

		// Request Data
		let requestData = await Request.findAndCountAll({
			attributes: ['id', 'name', 'contractNumber', 'documentTotal', 'deliveryDate', 'createdAt'],
			include: [
				{
					model: Client,
					attributes: ['id'],
					include: [{ model: LoginUser, attributes: ['name'] }],
				},

				{
					model: Employee,
					required: true,
					attributes: ['segmentId', 'subSegmentId'],
					include: [{ model: Segment }, { model: SubSegment, required: false }],
					where: {
						[Op.and]: [
							{ ...(segmentIds?.length > 0 && { segmentId: { [Op.in]: segmentIds } }) },
							{
								...(subSegmentIds?.length > 0 && {
									[Op.or]: [{ subSegmentId: { [Op.in]: subSegmentIds } }, { subSegmentId: null }],
								}),
							},
						],
					},
				},
			],
			where: {
				clientId: clientId,
				deletedAt: null,
			},
			limit: limit ?? undefined,
			order: [['createdAt', 'desc']],
		});

		// Employee Select Dropdown Data

		let employeeDropdownData = await Employee.findAll({
			where: {
				...condition,
				...(segmentIds?.length > 0 && { segmentId: { [Op.in]: segmentIds } }),
				...(subSegmentIds?.length > 0 && {
					[Op.or]: [{ subSegmentId: { [Op.in]: subSegmentIds } }, { subSegmentId: null }],
				}),
			},
			attributes: ['id', 'employeeNumber', 'contractEndDate', 'contractNumber'],
			include: [
				{
					model: LoginUser,
					attributes: ['firstName', 'lastName'],
				},
			],
			order: [['createdAt', 'DESC']],
		});

		// Total Employee Count

		const employeeCount = await Employee.count({
			where: {
				...condition,
				...(segmentIds?.length > 0 && { segmentId: { [Op.in]: segmentIds } }),
				...(subSegmentIds?.length > 0 && {
					[Op.or]: [{ subSegmentId: { [Op.in]: subSegmentIds } }, { subSegmentId: null }],
				}),
			},
		});

		// Total Contract End Data
		let totalContractEndData = await this.employeeContractRepo.getAllEmployeeContractEndService(
			(query = {
				clientId,
				startDate: moment('01-01-2021', 'DD-MM-YYYY').toDate(),
				endDate: moment().add(1, 'month').toDate(),
			}),
			user,
		);

		// Total Contract End Count
		let totalContractEndCount = totalContractEndData?.length ?? 0;

		totalContractEndData = totalContractEndData
			.sort((a, b) => (a?.employeeDetail?.contractEndDate < b?.employeeDetail?.contractEndDate ? -1 : 1))
			.slice(0, 5);

		// Total Contract Count

		const totalContractCount = await EmployeeContract.count({
			where: {
				deletedAt: null,
				endDate: {
					[Op.gte]: currentDate,
				},
			},
			include: [
				{
					model: Employee,
					attributes: ['clientId'],
					where: {
						...(segmentIds?.length > 0 && { segmentId: { [Op.in]: segmentIds } }),
						...(subSegmentIds?.length > 0 && {
							[Op.or]: [{ subSegmentId: { [Op.in]: subSegmentIds } }, { subSegmentId: null }],
						}),
						clientId: clientId,
						terminationDate: null,
					},
				},
			],
		});

		// Total Medical Expiry Count and Data

		let totalMedicalExpiryCount = await Employee.findAndCountAll({
			where: {
				clientId: clientId,
				medicalCheckExpiry: {
					[Op.between]: [currentDate, expiryDate],
				},
				terminationDate: null,
				deletedAt: null,
				...(segmentIds?.length > 0 && { segmentId: { [Op.in]: segmentIds } }),
				...(subSegmentIds?.length > 0 && {
					[Op.or]: [{ subSegmentId: { [Op.in]: subSegmentIds } }, { subSegmentId: null }],
				}),
			},
			attributes: ['id', 'medicalCheckExpiry'],
			include: [
				{
					model: LoginUser,
					attributes: ['firstName', 'lastName'],
				},
			],
			limit: limit ?? undefined,
			order: [['medicalCheckExpiry', 'asc']],
		});

		// Failed Login Data

		const failedLoginData = await ErrorLogs.findAll({
			where: {
				type: 'auth',
			},
			attributes: ['createdAt', 'email', 'status'],
			order: [['createdAt', 'desc']],
			limit: limit ?? undefined,
		});

		// Contract End Graph Data
		if (contractEndFilter !== 365) {
			for (let i = 1; i <= contractEndFilter; i++) {
				const startExpiry = moment().add(i, 'days').startOf('day').toDate();
				const endExpiry = moment().add(i, 'days').endOf('day').toDate();
				let dataCount = 0;
				const employeeContractTableCount = await EmployeeContract.count({
					where: {
						endDate: {
							[Op.and]: {
								[Op.gte]: startExpiry,
								[Op.lt]: endExpiry,
							},
						},
						deletedAt: null,
					},
					include: {
						model: Employee,
						where: {
							clientId: clientId,
							terminationDate: null,
							...(segmentIds?.length > 0 && { segmentId: { [Op.in]: segmentIds } }),
							...(subSegmentIds?.length > 0 && {
								[Op.or]: [{ subSegmentId: { [Op.in]: subSegmentIds } }, { subSegmentId: null }],
							}),
						},
					},
				});
				const employeeTableCount = await Employee.count({
					where: {
						contractEndDate: {
							[Op.and]: {
								[Op.gte]: startExpiry,
								[Op.lt]: endExpiry,
							},
						},
					},
				});
				dataCount = employeeContractTableCount + employeeTableCount;

				const employeeContractEndCounts = { expiryDate: startExpiry, dataCount: dataCount };

				dayWiseCount.push(employeeContractEndCounts);
			}
		} else {
			for (let i = 0; i <= 11; i++) {
				const currentMonthName = moment().month(i).format('MMM');
				const startExpiry = moment().month(i).startOf('month').startOf('day').toDate();
				const endExpiry = moment().month(i).endOf('month').endOf('day').toDate();

				const dataCount = await EmployeeContract.count({
					where: {
						endDate: {
							[Op.and]: {
								[Op.gte]: startExpiry,
								[Op.lt]: endExpiry,
							},
						},
						deletedAt: null,
					},
					include: {
						model: Employee,
						where: {
							clientId: clientId,
							terminationDate: null,
							...(segmentIds?.length > 0 && { segmentId: { [Op.in]: segmentIds } }),
							...(subSegmentIds?.length > 0 && {
								[Op.or]: [{ subSegmentId: { [Op.in]: subSegmentIds } }, { subSegmentId: null }],
							}),
						},
					},
				});

				const employeeContractEndCounts = { expiryDate: currentMonthName, dataCount: dataCount };

				dayWiseCount.push(employeeContractEndCounts);
			}
		}

		requestData = parse(requestData);
		employeeDropdownData = parse(employeeDropdownData);
		totalContractEndCount = parse(totalContractEndCount);
		totalMedicalExpiryCount = parse(totalMedicalExpiryCount);

		return {
			requestData,
			employeeCount,
			employeeDropdownData,
			totalContractEndData: totalContractEndData,
			totalContractEndCount,
			totalContractCount,
			totalMedicalExpiryCount,
			dayWiseCount,
			failedLoginData,
			limit: limit ?? undefined,
		};
	}

	async getAllEmployeeData(query: IQueryParameters) {
		const { clientId, employeeId } = query;

		// Get Employee Details by Employee ID

		let employeeDetail = await EmployeeContract.findAll({
			where: {
				deletedAt: null,
				employeeId: employeeId,
			},
			attributes: ['newContractNumber'],
			include: [
				{
					model: Employee,
					attributes: ['id', 'medicalCheckDate', 'slug', 'medicalCheckExpiry'],
					where: {
						clientId: clientId,
						segmentId: { [Op.not]: null },
					},
					required: true,
					include: [
						{
							model: LoginUser,
							attributes: ['firstName', 'lastName'],
						},
						{
							model: Segment,
							attributes: ['name'],
						},
					],
				},
			],
		});

		// Get Balance(Reliquat Calculation)
		let reliquatCalculation = null;
		let reliquatDate = moment(moment().format('DD/MM/YYYY'), 'DD/MM/YYYY').format('DD/MM/YYYY');
		reliquatCalculation = await this.reliquatCalculationRepo.generateReliquatCalculationService({
			employeeId: String(employeeId),
			date: moment(moment().format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate(),
		});
		if (reliquatCalculation === undefined) {
			const reliquatCalculationData = await this.reliquatCalculationRepo.get({
				where: {
					employeeId: String(employeeId),
					startDate: {
						[Op.lte]: moment(moment().format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate(),
					},
				},
				order: [['startDate', 'desc']],
			});
			reliquatCalculation = reliquatCalculationData?.reliquat;
			reliquatDate = `${moment(moment(reliquatCalculationData?.startDate).format('MMM'), 'MMM').format('MMM')}-
				${moment(moment(reliquatCalculationData?.endDate).format('MMM'), 'MMM').format('MMM')}`;
		}

		// Get Employee Name By ID and Employee Leave Data

		let employeeName = await Employee.findOne({
			where: {
				clientId: clientId,
				id: employeeId,
				deletedAt: null,
				segmentId: { [Op.not]: null },
			},
			attributes: ['id', 'slug', 'contractNumber'],
			include: [
				{
					model: LoginUser,
					attributes: ['firstName', 'lastName'],
				},
				{
					model: EmployeeLeave,
					attributes: ['id', 'startDate'],
					separate: true,
					limit: 1,
					order: [['startDate', 'ASC']],
				},
				{
					model: Segment,
					attributes: ['name'],
				},
			],
		});
		employeeDetail = parse(employeeDetail);
		employeeName = parse(employeeName);
		// reliquatCalculation = parse(reliquatCalculation);
		return { employeeDetail, employeeName, reliquatCalculation, reliquatDate };
	}

	async getAllTransportData(query: IQueryParameters) {
		const { clientId, limit } = query;

		// Available Drivers Data

		let driversData = await TransportDriver.findAll({
			where: { deletedAt: null, ...(clientId && { clientId: clientId }) },
			attributes: ['id', 'unavailableDates', 'driverNo'],
		});

		driversData = parse(driversData);

		let availableDriverData = [];

		for (const data of driversData) {
			filterData(data, availableDriverData);
		}

		availableDriverData = limit && availableDriverData.splice(0, limit);

		// Available Vehicles Data

		let vehiclesData = await TransportVehicle.findAll({
			where: { deletedAt: null, ...(clientId && { clientId: clientId }) },
			attributes: ['id', 'unavailableDates', 'vehicleNo'],
		});

		vehiclesData = parse(vehiclesData);

		let availableVehicleData = [];

		for (const data of vehiclesData) {
			filterData(data, availableVehicleData);
		}

		availableVehicleData = limit && availableVehicleData.splice(0, limit);

		// Booked Driver Data

		let bookedDriverData = await TransportDriver.findAll({
			where: {
				...(clientId && { clientId: clientId }),
				deletedAt: null,
				unavailableDates: {
					[Op.or]: [{ [Op.ne]: null }, { [Op.ne]: '' }],
				},
			},
			attributes: ['id', 'driverNo', 'unavailableDates'],
			limit: limit ?? undefined,
		});

		// Booked Vehicle Data

		let bookedVehiclesData = await TransportVehicle.findAll({
			where: {
				...(clientId && { clientId: clientId }),
				deletedAt: null,
				unavailableDates: {
					[Op.or]: [{ [Op.ne]: null }, { [Op.ne]: '' }],
				},
			},
			attributes: ['id', 'vehicleNo', 'unavailableDates'],
			limit: limit ?? undefined,
		});

		bookedDriverData = parse(bookedDriverData);
		bookedVehiclesData = parse(bookedVehiclesData);

		return {
			availableDriverData,
			availableVehicleData,
			bookedDriverData,
			bookedVehiclesData,
			limit: limit ?? undefined,
		};
	}

	async getAllUserAccountsData(userAccountFilter: number, clientId: number | null) {
		const dayWiseChartCount = [];
		const findAllUser = await User.findAll({
			where: {
				deletedAt: null,
				...(clientId && {
					[Op.or]: {
						'$userClientList.clientId$': clientId,
						'$loginUserData.employee.clientId$': clientId,
						'$loginUserData.client.id$': clientId,
					},
				}),
			},
			include: [
				{
					model: LoginUser,
					required: true,
					include: [
						{
							model: Employee,
							required: false,
							where: { ...(clientId && { clientId: clientId, segmentId: { [Op.not]: null }, terminationDate: null }) },
							attributes: ['id', 'clientId'],
						},
						{ model: Client, required: false, where: { ...(clientId && { id: clientId }) }, attributes: ['id'] },
					],
				},
				{
					model: UserClient,
					as: 'userClientList',
					required: false,
					where: { ...(clientId && { clientId: clientId }) },
					attributes: ['id', 'clientId'],
				},
				{
					model: Role,
					attributes: ['id'],
					where: {
						name: { [Op.ne]: 'super admin' },
					},
					required: true,
				},
			],
		});
		const getAllUserCount = findAllUser.length ?? 0;

		// User Account Graph Data
		if (userAccountFilter !== 365) {
			for (let i = userAccountFilter - 1; i >= 0; i--) {
				const startOfDay = moment().subtract(i, 'days').startOf('day').toDate();
				const endOfDay = moment().subtract(i, 'days').endOf('day').toDate();

				const dataCount = await User.count({
					where: {
						createdAt: {
							[Op.and]: {
								[Op.gte]: startOfDay,
								[Op.lt]: endOfDay,
							},
						},
						deletedAt: null,
					},
					include: [
						{
							model: Role,
							attributes: ['id'],
							where: {
								name: { [Op.ne]: 'super admin' },
							},
							required: true,
						},
					],
				});

				const userAccountChartCount = { date: startOfDay, dataCount: dataCount };
				dayWiseChartCount.push(userAccountChartCount);
			}
		} else {
			for (let i = 0; i <= 11; i++) {
				const currentMonthName = moment().month(i).format('MMM');
				const startOfDay = moment().month(i).startOf('month').startOf('day').toDate();
				const endOfDay = moment().month(i).endOf('month').endOf('day').toDate();

				const dataCount = await User.count({
					where: {
						createdAt: {
							[Op.and]: {
								[Op.gte]: startOfDay,
								[Op.lt]: endOfDay,
							},
						},
						deletedAt: null,
					},
					include: [
						{
							model: Role,
							attributes: ['id'],
							where: {
								name: { [Op.ne]: 'super admin' },
							},
							required: true,
						},
					],
				});

				const userAccountChartCount = { date: currentMonthName, dataCount: dataCount };
				dayWiseChartCount.push(userAccountChartCount);
			}
		}
		return { dayWiseChartCount, getAllUserCount };
	}
}

const filterData = async (data, availableData) => {
	let BookedDatesDifference, splitted, startDate, endDate;
	if (!_.isEmpty(data.unavailableDates)) {
		BookedDatesDifference = [];
		data?.unavailableDates?.split(',').forEach((element) => {
			splitted = element.split('-');

			startDate = moment(splitted[0], 'DD/MM/YYYY');
			endDate = moment(splitted[1], 'DD/MM/YYYY');

			for (let m = moment(startDate); m.isSameOrBefore(endDate); m.add(1, 'days')) {
				BookedDatesDifference.push(m.format('DD/MM/YYYY'));
			}
		});

		const result = BookedDatesDifference.some((element) => {
			return element === moment().format('DD/MM/YYYY');
		});

		if (!result) {
			availableData.push(data);
		}
	} else if (_.isEmpty(data.unavailableDates)) {
		availableData.push(data);
	}
	return availableData;
};

// const getContractEndData = async ({
// 	employeeDropdownData,
// 	clientId,
// 	segmentIds,
// 	subSegmentIds,
// 	startDate,
// 	endDate,
// }: {
// 	employeeDropdownData: any[];
// 	clientId: number;
// 	segmentIds: number[];
// 	subSegmentIds: number[];
// 	startDate?: string;
// 	endDate?: string;
// }) => {
// 	const contractStartDate = startDate ? startDate : moment().toDate();
// 	const contractEndDate = endDate ? endDate : moment().add(1, 'month').toDate();
// 	const contractMap = new Map();
// 	for (const data of employeeDropdownData) {
// 		const isExistcontract = await EmployeeContract.findOne({
// 			where: {
// 				employeeId: data?.id,
// 				endDate: {
// 					[Op.between]: [contractStartDate, contractEndDate],
// 				},
// 				deletedAt: null,
// 			},
// 			attributes: ['id', 'endDate'],
// 			include: [
// 				{
// 					model: Employee,
// 					where: {
// 						clientId: clientId,
// 						terminationDate: null,
// 						...(segmentIds?.length > 0 && { segmentId: { [Op.in]: segmentIds } }),
// 						...(subSegmentIds?.length > 0 && {
// 							[Op.or]: [{ subSegmentId: { [Op.in]: subSegmentIds } }, { subSegmentId: null }],
// 						}),
// 					},
// 					attributes: ['id'],
// 					include: [{ model: LoginUser, attributes: ['firstName', 'lastName'] }],
// 				},
// 				{
// 					model: ContractTemplateVersion,
// 					attributes: ['contractTemplateId', 'versionName'],
// 					include: [
// 						{
// 							model: ContractTemplate,
// 							attributes: ['contractName'],
// 						},
// 					],
// 				},
// 			],
// 			order: [['endDate', 'desc']],
// 			limit: 1,
// 		});
// 		if (isExistcontract) {
// 			contractMap.set(`${data?.id}`, {
// 				endDate: isExistcontract?.endDate,
// 				id: isExistcontract?.id,
// 				contractName: isExistcontract?.contractTemplateVersion?.contractTemplate?.contractName,
// 				employeeDetail: {
// 					id: data?.id,
// 					loginUserData: {
// 						firstName: data?.loginUserData?.firstName,
// 						lastName: data?.loginUserData?.lastName,
// 					},
// 				},
// 			});
// 		} else if (moment(data?.contractEndDate).isBetween(moment().toDate(), moment().add(1, 'month').toDate())) {
// 			contractMap.set(`${data?.id}`, {
// 				endDate: data?.contractEndDate,
// 				employeeDetail: {
// 					id: data?.id,
// 					loginUserData: {
// 						firstName: data?.loginUserData?.firstName,
// 						lastName: data?.loginUserData?.lastName,
// 					},
// 				},
// 			});
// 		}
// 	}
// 	const totalContractData = [];
// 	totalContractData?.push(...contractMap.values());
// 	let totalContractEndData = totalContractData.sort((a, b) => (a.endDate < b.endDate ? -1 : 1)).slice(0, 5);
// 	totalContractEndData = parse(totalContractEndData);
// 	const totalContractEndCount = totalContractData?.length;
// 	return { data: totalContractEndData, totalContractEndCount };
// };
