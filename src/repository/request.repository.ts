import { FRONTEND_URL } from '@/config';
import { MessageFormation } from '@/constants/messages.constants';
import { HttpException } from '@/exceptions/HttpException';
import { createHistoryRecord } from '@/helpers/history.helper';
import { sendMail } from '@/helpers/mail.helper';
import { DefaultRoles } from '@/interfaces/functional/feature.interface';
import { IQueryParameters } from '@/interfaces/general/general.interface';
import { statusEnum, tableEnum } from '@/interfaces/model/history.interface';
import { requestStatus } from '@/interfaces/model/request.document.interface';
import { IRequestCreate, status } from '@/interfaces/model/request.interface';
import Client from '@/models/client.model';
import Employee from '@/models/employee.model';
import EmployeeContract from '@/models/employeeContract.model';
import LoginUser from '@/models/loginUser.model';
import RequestDocument from '@/models/request.document.model';
import Request from '@/models/request.model';
import RequestType from '@/models/requestType.model';
import Segment from '@/models/segment.model';
import SubSegment from '@/models/subSegment.model';
import User from '@/models/user.model';
import { getSegmentAccessForUser, getSubSegmentAccessForUser, parse } from '@/utils/common.util';
import moment from 'moment';
import { Op } from 'sequelize';
import BaseRepository from './base.repository';

export default class RequestRepo extends BaseRepository<Request> {
	constructor() {
		super(Request.name);
	}

	private msg = new MessageFormation('Request').message;

	async getAllRequest(query: IQueryParameters, user: User) {
		const { page, limit, startDate, clientId, endDate, sort, sortBy, search } = query;
		const sortedColumn = sortBy || null;

		const segmentIds = getSegmentAccessForUser(user);
		const subSegmentIds = getSubSegmentAccessForUser(user);
		// End Date Convert with timestamp with timezone
		const dateWithTimezone = new Date(new Date(endDate).getTime() - new Date(endDate).getTimezoneOffset() * 60000);
		dateWithTimezone.setHours(23, 59, 59, 999); // Add Remaining minites until the end of the day
		let data = await this.getAllData({
			where: {
				...(search && {
					[Op.or]: {
						name: { [Op.iLike]: '%' + search.toLowerCase() + '%' },
						email: { [Op.iLike]: '%' + search.toLowerCase() + '%' },
					},
				}),
				...(Number(clientId) ? { clientId: clientId } : { clientId: null }),
				deletedAt: null,
				createdAt: {
					[Op.between]: [moment(startDate).toDate(), new Date(dateWithTimezone).toISOString()],
				},
			},
			include: [
				{
					model: Client,
					attributes: ['id', 'loginUserId'],
					include: [
						{
							model: LoginUser,
							attributes: ['name'],
							where: {
								...(user.roleData.name === DefaultRoles.Client && user.roleData.isViewAll
									? { id: user.loginUserId }
									: {}),
							},
						},
					],
				},
				{
					model: Employee,
					required: true,
					attributes: ['segmentId', 'subSegmentId', 'contractEndDate'],
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
				...(user.roleData.isViewAll && user.roleData.name === DefaultRoles.Employee
					? [
							{
								model: Employee,
								required: true,
								include: [
									{
										model: Segment,
										attributes: ['name', 'id'],
									},
									{
										model: SubSegment,
										required: false,
										attributes: ['name', 'id'],
									},
								],
								attributes: ['employeeNumber', 'contractEndDate'],
								where: {
									loginUserId: user.loginUserId,
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
					  ]
					: []),
			],
			offset: page && limit ? (page - 1) * limit : undefined,
			limit: limit ?? undefined,
			order: [[sortedColumn ?? 'name', sort ?? 'asc']],
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

	async getRequestById(id: number) {
		let data = await Request.findOne({
			where: {
				id: id,
				deletedAt: null,
			},
			include: [
				{
					model: RequestDocument,
					include: [
						{ model: RequestType, attributes: ['name'] },
						{
							model: User,
							attributes: ['id', 'loginUserId'],
							include: [{ model: LoginUser, attributes: ['name', 'email'] }],
						},
					],
				},
				{
					model: Client,
					attributes: ['id', 'loginUserId'],
					include: [{ model: LoginUser, attributes: ['name'] }],
				},
				{
					model: Employee,
					attributes: ['employeeNumber', 'contractEndDate'],
					include: [
						{ model: LoginUser, attributes: ['firstName', 'lastName'] },
						{ model: Segment, attributes: ['name'] },
					],
				},
				{
					model: User,
					as: 'reviewedByUser',
					attributes: ['id', 'loginUserId'],
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

	async addRequest({ body, user }: { body: IRequestCreate; user: User }) {
		const isExistContractData = await EmployeeContract.findOne({
			where: { newContractNumber: String(body.contractNumber) },
			...(user && user.roleData.name === DefaultRoles.Employee && user.roleData.isViewAll
				? { include: [{ model: Employee, where: { loginUserId: user.loginUserId } }] }
				: {}),
		});
		if (!isExistContractData) throw new HttpException(200, 'Please enter valid contract number', {}, true);

		const findContractandEmployeeId = await EmployeeContract.findOne({
			where: {
				newContractNumber: body.contractNumber.toString(),
			},
			include: [
				{
					model: Employee,
					attributes: ['clientId', 'employeeNumber'],
					include: [
						{
							model: Client,
							attributes: ['id'],
							include: [
								{
									model: LoginUser,
									attributes: ['name'],
								},
							],
						},
						{
							model: LoginUser,
							attributes: ['firstName', 'lastName'],
						},
					],
				},
			],
			attributes: ['employeeId', 'id'],
		});

		if (findContractandEmployeeId) {
			body = {
				...body,
				clientId: findContractandEmployeeId?.employeeDetail?.dataValues?.clientId,
				employeeId: findContractandEmployeeId?.employeeId,
				contractId: findContractandEmployeeId?.id,
			};
		}
		body = { ...body, documentTotal: body.requestDocument?.length };
		const documentList = body.requestDocument;
		const requestTypeIds = documentList?.map((data) => {
			return data?.documentType;
		});
		const isExistRequestTypes = await RequestType.findAll({
			where: {
				id: {
					[Op.in]: requestTypeIds,
				},
			},
		});
		let emails = [];
		let requestDocumentNamesArr = [];
		isExistRequestTypes?.map((data) => {
			const splitEmails = data?.notificationEmails?.split(',')?.map((e) => {
				return e?.trim();
			});
			emails = [...emails, ...splitEmails];
			requestDocumentNamesArr = [...requestDocumentNamesArr, data?.name];
		});
		let requestDocumentNames = '';
		if (requestDocumentNamesArr?.length > 0) {
			requestDocumentNames = requestDocumentNamesArr?.join(', ');
		}

		delete body.requestDocument;
		const requestData = await Request.create({
			...body,

			contractNumber: body.contractNumber?.toString(),
			mobileNumber: body.mobileNumber?.toString(),
			createdBy: user?.id || null,
		});

		if (documentList) {
			for (const documentLists of documentList) {
				await RequestDocument.create({
					requestId: requestData.id,
					documentType: documentLists.documentType,
					otherInfo: documentLists.otherInfo,
				});
			}
		}
		if (requestData && body?.email) {
			const replacement = {
				client: findContractandEmployeeId?.employeeDetail?.client?.loginUserData?.name,
				firstName: findContractandEmployeeId?.employeeDetail?.loginUserData?.firstName,
				lastName: findContractandEmployeeId?.employeeDetail?.loginUserData?.lastName,
				employeeNumber: findContractandEmployeeId?.employeeDetail?.employeeNumber,
				email: body?.email,
				logourl: FRONTEND_URL + '/assets/images/lred-main-logo.png',
				mailHeader: `Requested Documents Details`,
				checkReliquatUrl: '',
				message: `The request has been successfully placed for the Employee, <br><br> Contract Number: ${
					body.contractNumber
				} <br> For the Type of ${requestDocumentNames} <br> The date of request was: ${moment(
					requestData?.createdAt,
				).format('DD MMMM YYYY')} <br> The Document is requested for: ${requestData?.collectionDelivery}`,
			};
			await sendMail(
				[body?.email, 'admin@lred.com'],
				'Request Documents',
				'generalMailTemplate',
				replacement,
				null,
				emails,
			);
		}

		await createHistoryRecord({
			tableName: tableEnum.REQUESTS,
			jsonData: parse(requestData),
			status: statusEnum.CREATE,
		});

		return requestData;
	}

	async updateRequestStatus({
		body,
		user,
		id,
	}: {
		body: { status: status; requestDocumentId?: number[]; documentStatus?: string };
		user: User;
		id: number;
	}) {
		const isExistMedicalRequest = await Request.findOne({
			where: {
				id: id,
				deletedAt: null,
			},
		});

		if (!isExistMedicalRequest) {
			throw new HttpException(404, this.msg.notFound);
		}
		const isExistContractData = await EmployeeContract.findOne({
			where: { newContractNumber: isExistMedicalRequest.contractNumber },
		});
		let updateDate = {};
		switch (body.status) {
			case 'STARTED':
				if (isExistContractData) {
					updateDate = {
						status: body.status,
						reviewedBy: user.id,
						reviewedDate: new Date(),
					};
				}
				break;
			case 'DECLINED':
				updateDate = {
					status: body.status,
					reviewedBy: user.id,
					reviewedDate: new Date(),
				};
				break;
			case 'COMPLETED':
				await Promise.all(
					body.requestDocumentId?.map(async (docId: number) => {
						await RequestDocument.update(
							{
								status: body.documentStatus as requestStatus,
								completedBy: user.id,
								completedDate: new Date(),
								updatedAt: new Date(),
							},
							{ where: { id: docId } },
						);
					}),
				);

				const checkVarifyRemainingDocument = await RequestDocument.findOne({
					where: { requestId: id, completedDate: null },
				});
				if (!checkVarifyRemainingDocument) {
					updateDate = {
						status: 'COMPLETED',
						reviewedBy: user.id,
						reviewedDate: new Date(),
					};
				}
				break;
			default:
				break;
		}

		await Request.update({ ...updateDate, updatedBy: user.id }, { where: { id: id } });
		const data = await this.getRequestById(id);

		await createHistoryRecord({
			tableName: tableEnum.REQUESTS,
			jsonData: parse(data),
			status: statusEnum.UPDATE,
		});

		return data;
	}

	async deleteRequest(id: number) {
		const isExistRequest = await this.get({
			where: {
				id: id,
				deletedAt: null,
			},
		});

		if (!isExistRequest) {
			throw new HttpException(404, this.msg.notFound);
		}

		const data = await this.deleteData({ where: { id: id } });
		return data;
	}
}
