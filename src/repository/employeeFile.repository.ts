import { MessageFormation } from '@/constants/messages.constants';
import { HttpException } from '@/exceptions/HttpException';
import { createHistoryRecord } from '@/helpers/history.helper';
import { secureFileToken } from '@/helpers/secureFolder.helper';
import { IQueryParameters } from '@/interfaces/general/general.interface';
import { IEmployeeFileCreate, IEmployeeFileUpdate } from '@/interfaces/model/employeeFile.interface';
import { statusEnum, tableEnum } from '@/interfaces/model/history.interface';
import EmployeeFile from '@/models/employeeFile.model';
import Folder from '@/models/folder.model';
import User from '@/models/user.model';
import { fileDelete, folderExistCheck, parse } from '@/utils/common.util';
import path from 'path';
import BaseRepository from './base.repository';

export default class EmployeeFileRepo extends BaseRepository<EmployeeFile> {
	constructor() {
		super(EmployeeFile.name);
	}

	private msg = new MessageFormation('EmployeeFile').message;

	async getAllEmployeeFileService(query: IQueryParameters) {
		const { page, limit, employeeId, sortBy, sort } = query;
		const sortedColumn = sortBy || null;
		let data = await this.getAllData({
			include: [
				{
					model: Folder,
					attributes: ['name', 'id'],
				},
			],
			where: { status: 0, deletedAt: null, employeeId: employeeId },
			offset: page && limit ? (page - 1) * limit : undefined,
			limit: limit ?? undefined,
			order: [[sortedColumn ?? 'name', sort ?? 'asc']],
		});
		data = parse(data);
		const dataFile = await Promise.all(
			data?.rows.map(async (row) => {
				const temp = { ...row };
				temp.fileName = await secureFileToken(row.fileName);

				return temp;
			}),
		);
		const responseObj = {
			data: dataFile,
			count: data?.count,
			currentPage: page ?? undefined,
			limit: limit ?? undefined,
			lastPage: page && limit ? Math.ceil(data?.count / +limit) : undefined,
		};
		return responseObj;
	}

	async getEmployeeFileByIdService(id: number) {
		const isFound = await EmployeeFile.findOne({
			where: { id: id, deletedAt: null },
		});
		if (!isFound) {
			throw new HttpException(404, this.msg.notFound);
		}
		const data = parse(isFound);
		data.fileName = await secureFileToken(data.fileName);
		return data;
	}

	async addEmployeeFileService({ body, user }: { body: IEmployeeFileCreate; user: User }) {
		let data = await EmployeeFile.create({
			...body,
			fileLink: body.fileLink === true ? true : false,
			createdBy: user.id,
		});
		data = parse(data);

		await createHistoryRecord({
			tableName: tableEnum.EMPLOYEE_FILE,
			jsonData: parse(data),
			status: statusEnum.CREATE,
		});

		return data;
	}

	async updateEmployeeFileService({ body, user, id }: { body: IEmployeeFileUpdate; user: User; id: number }) {
		const isExist = await EmployeeFile.findOne({ where: { id: id, deletedAt: null } });
		if (!isExist) {
			throw new HttpException(403, this.msg.notFound);
		}
		const updatedData = await EmployeeFile.update(
			{ ...body, name: body.newFileName, updatedBy: user.id },
			{ where: { id: id } },
		);
		if (updatedData) {
			const data = await this.getEmployeeFileByIdService(id);

			await createHistoryRecord({
				tableName: tableEnum.EMPLOYEE_FILE,
				jsonData: parse(data),
				status: statusEnum.UPDATE,
			});

			return data;
		}
	}

	async deleteEmployeeFileService({ id }: { id: number }) {
		const isFound = await EmployeeFile.findOne({
			where: { id: id },
			include: [{ model: Folder, attributes: ['id', 'typeId'] }],
		});
		if (!isFound) {
			throw new HttpException(404, this.msg.notFound);
		}
		const data = await EmployeeFile.update({ deletedAt: new Date(), status: 1 }, { where: { id: id } });
		if (isFound?.folder?.typeId != 2) {
			const publicFolder = path.join(__dirname, '../../secure-file');
			folderExistCheck(publicFolder);
			const filePath = path.join(publicFolder, `${isFound.fileName}`);
			fileDelete(filePath);
		}
		return data;
	}
}
