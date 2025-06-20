import { MessageFormation } from '@/constants/messages.constants';
import { HttpException } from '@/exceptions/HttpException';
import { createHistoryRecord } from '@/helpers/history.helper';
import { IQueryParameters } from '@/interfaces/general/general.interface';
import { statusEnum, tableEnum } from '@/interfaces/model/history.interface';
import { ISegmentCreate } from '@/interfaces/model/segment.interface';
import db from '@/models';
import Client from '@/models/client.model';
import ClientTimesheetStartDay from '@/models/clientTimesheetStartDay.model';
import Contact from '@/models/contact.model';
import Employee from '@/models/employee.model';
import LoginUser from '@/models/loginUser.model';
import SegmentTimesheetStartDay from '@/models/segmentTimesheetStartDay.model';
import SubSegment from '@/models/subSegment.model';
import Timesheet from '@/models/timesheet.model';
import User from '@/models/user.model';
import UserSegment from '@/models/userSegment.model';
import UserSegmentApproval from '@/models/userSegmentApproval.model';
import { getSegmentAccessForUser, parse } from '@/utils/common.util';
import moment from 'moment';
import { Op } from 'sequelize';
import slugify from 'slugify';
import { default as Segment } from '../models/segment.model';
import BaseRepository from './base.repository';
import TimesheetRepo from './timesheet.repository';

export default class SegmentRepo extends BaseRepository<Segment> {
	constructor() {
		super(Segment.name);
	}

	private msg = new MessageFormation('Segment').message;
	private TimesheetService = new TimesheetRepo();

	async getAllSegmentService(query: IQueryParameters, user: User) {
		const { page, limit, clientId, sortBy, sort, search, isActive } = query;
		const sortedColumn = sortBy || null;
		const segmentIds = getSegmentAccessForUser(user);
		let data = await this.getAllData({
			include: [
				{
					model: Contact,
					attributes: ['email'],
				},
				{
					model: Employee,
					attributes: ['id', 'employeeNumber'],
					include: [{ model: LoginUser, attributes: ['firstName', 'lastName'] }],
				},
				{
					model: SubSegment,
					attributes: ['id', 'code', 'name'],
				},
			],
			where: {
				deletedAt: null,
				...(isActive !== undefined && { isActive }),
				...(segmentIds?.length > 0 && { id: { [Op.in]: segmentIds } }),
				clientId: clientId,
				...(search && {
					name: { [Op.iLike]: '%' + (typeof search === 'string' ? search.toLowerCase() : search) + '%' },
				}),
			},
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

	async getSegmentsForSearchDropdown(query: IQueryParameters, user: User) {
		const { clientId } = query;
		const segmentIds = getSegmentAccessForUser(user);
		const data = await this.getAll({
			where: {
				deletedAt: null,
				...(segmentIds?.length > 0 && { id: { [Op.in]: segmentIds } }),
				clientId: clientId,
			},
			attributes: ['name'],
		});
		const dropdownData = data?.map((finalData) => {
			return {
				label: `${finalData?.name}`,
				value: `${finalData?.name}`,
			};
		});

		return dropdownData;
	}

	async getSegmentDataService(query: IQueryParameters, user: User) {
		const { clientId, isActive } = query;
		const segmentIds = getSegmentAccessForUser(user);
		let data = await this.getAllData({
			where: {
				deletedAt: null,
				clientId: clientId,
				...(segmentIds?.length > 0 && { id: { [Op.in]: segmentIds } }),
				...(isActive === true && { isActive }),
			},
			attributes: ['id', 'name', 'isActive'],
			order: [['code', 'asc']],
		});
		data = parse(data);
		const responseObj = {
			data: data?.rows,
			count: data?.count,
		};
		return responseObj;
	}

	async getSegmentEmployeeDataService(query: IQueryParameters, user: User) {
		const { clientId, isActive } = query;
		const segmentIds = getSegmentAccessForUser(user);
		let data = await this.getAll({
			where: {
				deletedAt: null,
				clientId: clientId,
				...(segmentIds?.length > 0 && { id: { [Op.in]: segmentIds } }),
				...(isActive?.toString() === 'true' && { isActive }),
			},
			include: [
				{
					model: Employee,
					attributes: ['id', 'employeeNumber'],
					include: [{ model: LoginUser, attributes: ['firstName', 'lastName', 'name'] }],
				},
			],
			attributes: ['id', 'name'],
			order: [['code', 'asc']],
		});
		data = parse(data);
		return data;
	}

	async getSegmentDataForClientTimesheetService(id: number) {
		const isFound = await Client.findOne({
			where: { id: id, deletedAt: null },
			include: [{ model: ClientTimesheetStartDay }],
			order: [['clientTimesheetStartDay', 'date', 'asc']],
		});
		if (!isFound) {
			throw new HttpException(404, this.msg.notFound);
		}
		const data = parse(isFound);
		return data;
	}

	async getSegmentByIdService(id: number) {
		const isFound = await Segment.findOne({
			where: { id: id, deletedAt: null },
		});
		if (!isFound) {
			throw new HttpException(404, this.msg.notFound);
		}
		const data = parse(isFound);
		return data;
	}

	async getSegmentBySlugService(slug: string) {
		const isFound = await Segment.findOne({
			include: [
				{
					model: Contact,
					attributes: ['email', 'name'],
				},
			],
			where: { slug: slug, deletedAt: null },
		});
		if (!isFound) {
			throw new HttpException(404, this.msg.notFound);
		}
		const data = parse(isFound);
		return data;
	}

	async addSegmentService({ body, user }: { body: ISegmentCreate; user: User }) {
		const isExist = await Segment.findOne({ where: { code: body.code.toString(), clientId: body.clientId } });

		if (isExist) {
			throw new HttpException(200, this.msg.exist, {}, true);
		}

		const uniqueSlug = body.name + body.code;

		const slug = slugify(uniqueSlug, { lower: true, replacement: '-' });

		let data = await Segment.create({ ...body, slug, createdBy: user.id });

		data = parse(data);
		data = await this.getSegmentByIdService(data.id);
		await SegmentTimesheetStartDay.create({
			clientId: data.clientId,
			segmentId: data.id,
			timesheetStartDay: data.timeSheetStartDay,
			date: moment(moment().format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate(),
			createdBy: user.id,
		});
		await createHistoryRecord({
			tableName: tableEnum.SEGMENT,
			jsonData: parse(data),
			status: statusEnum.CREATE,
		});

		return data;
	}

	async updateSegmentService({ body, user, id }: { body: ISegmentCreate; user: User; id: number }) {
		const transaction = await db.transaction();
		let isExist = await Segment.findOne({ where: { code: body.code, id: { [Op.ne]: id }, clientId: body.clientId } });

		if (isExist) {
			throw new HttpException(200, this.msg.exist, {}, true);
		}
		isExist = await Segment.findOne({ where: { id: id, deletedAt: null } });

		if (!isExist) {
			throw new HttpException(200, this.msg.notFound, {}, true);
		}

		if (isExist?.timeSheetStartDay !== body.timeSheetStartDay) {
			let ifExist = await SegmentTimesheetStartDay.findOne({
				where: {
					segmentId: isExist.id,
					clientId: isExist.clientId,
					date: moment(moment().format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate(),
				},
				transaction,
			});
			ifExist = parse(ifExist);
			if (!ifExist) {
				await SegmentTimesheetStartDay.create({
					segmentId: isExist.id,
					clientId: isExist.clientId,
					timesheetStartDay: body.timeSheetStartDay,
					date: moment(moment().format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate(),
					createdBy: user.id,
				});
			} else {
				await SegmentTimesheetStartDay.update(
					{
						segmentId: isExist.id,
						clientId: isExist.clientId,
						timesheetStartDay: body.timeSheetStartDay,
						date: moment(moment().format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate(),
						createdBy: user.id,
					},
					{
						where: {
							segmentId: isExist.id,
							clientId: isExist.clientId,
							date: moment(moment().format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate(),
						},
						transaction,
					},
				);
			}

			const diffDate = body.timeSheetStartDay - isExist.timeSheetStartDay;
			const today = moment();
			let allEmp = await Employee.findAll({
				attributes: ['id'],
				where: {
					clientId: isExist.clientId,
					segmentId: isExist.id,
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

		const uniqueSlug = body.name + body.code;

		const slug = slugify(uniqueSlug, { lower: true, replacement: '-' });

		await Segment.update({ ...body, slug, updatedBy: user.id }, { where: { id: id } });
		const data = await this.getSegmentByIdService(id);

		await createHistoryRecord({
			tableName: tableEnum.SEGMENT,
			jsonData: parse(data),
			status: statusEnum.UPDATE,
		});

		return data;
	}

	async updateSegmentStatus({ body, id }: { body: ISegmentCreate; id: number }) {
		const isExistClient = await Segment.findOne({ where: { id: id } });
		if (!isExistClient) {
			throw new HttpException(404, this.msg.notFound);
		}

		await Segment.update({ isActive: body.isActive }, { where: { id: id } });
		await SubSegment.update({ isActive: body.isActive }, { where: { segmentId: id } });
		const data = await this.getSegmentByIdService(id);
		return data;
	}

	async deleteSegmentService({ id }: { id: number }) {
		try {
			await db.transaction(async (transaction) => {
				const isFound = await Segment.findOne({ where: { id: id } });
				if (!isFound) {
					throw new HttpException(404, this.msg.notFound);
				}
				const data = await Segment.destroy({ where: { id: id }, transaction });
				const currentDate = moment(moment().format('DD-MM-YYYY'), 'DD-MM-YYYY').toDate();

				await Promise.all([
					SubSegment.destroy({ where: { segmentId: isFound.id, deletedAt: null }, transaction }),
					Employee.update(
						{ segmentId: null, subSegmentId: null },
						{ where: { segmentId: isFound.id, deletedAt: null } },
					),
					Timesheet.update(
						{ segmentId: null, subSegmentId: null },
						{ where: { segmentId: isFound.id, deletedAt: null, startDate: { [Op.gte]: currentDate } } },
					),
					UserSegment.destroy({ where: { segmentId: isFound.id, deletedAt: null } }),
					UserSegmentApproval.destroy({ where: { segmentId: isFound.id, deletedAt: null } }),
				]);
				return data;
			});
		} catch (error) {
			throw new HttpException(400, 'Something went wrong! Please try again', null, true);
		}
	}

	async getAllSegmentsByClientIdsService(query: IQueryParameters) {
		const { clientIds } = query;
		let responseData = await this.getAllData({
			where: { ...(clientIds ? { clientId: { [Op.in]: clientIds.split(',') } } : { clientId: 0 }) },
			include: [
				{ model: Client, attributes: ['code'], include: [{ model: LoginUser, attributes: ['name'] }] },
				{
					model: SubSegment,
					attributes: ['id', 'code', 'name'],
				},
			],
			attributes: ['id', 'name'],
		});
		responseData = parse(responseData);
		return responseData?.rows;
	}
}
