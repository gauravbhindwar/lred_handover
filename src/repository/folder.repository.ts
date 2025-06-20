import { MessageFormation } from '@/constants/messages.constants';
import { HttpException } from '@/exceptions/HttpException';
import { createHistoryRecord } from '@/helpers/history.helper';
import { IQueryParameters } from '@/interfaces/general/general.interface';
import { FolderAttributes, IFolderCreate } from '@/interfaces/model/folder.interface';
import { statusEnum, tableEnum } from '@/interfaces/model/history.interface';
import db from '@/models';
import EmployeeFile from '@/models/employeeFile.model';
import Folder from '@/models/folder.model';
import TransportDriverDocument from '@/models/transport.driver.document.model';
import TransportVehicleDocument from '@/models/transport.vehicle.document.model';
import User from '@/models/user.model';
import { moveFile, parse } from '@/utils/common.util';
import path from 'path';
import { ModelCtor } from 'sequelize-typescript';
import BaseRepository from './base.repository';

export default class FolderRepo extends BaseRepository<Folder> {
	constructor() {
		super(Folder.name);
	}

	private msg = new MessageFormation('Folder').message;

	async getAllFolders(query: IQueryParameters) {
		const { page, limit, sortBy, sort } = query;
		const sortedColumn = sortBy || null;
		let data = await this.getAllData({
			where: { deletedAt: null },
			offset: page && limit ? (page - 1) * limit : undefined,
			limit: limit ?? undefined,
			order: [[sortedColumn ?? 'index', sort ?? 'asc']],
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

	async getFolderData() {
		let data = await this.getAllData({
			where: { deletedAt: null },
			attributes: ['id', 'name', 'index', 'typeId'],
			order: [['index', 'asc']],
		});
		data = parse(data);
		const responseObj = {
			data: data?.rows,
			count: data?.count,
		};
		return responseObj;
	}

	async getFolderById(id: number) {
		let data = await Folder.findOne({ where: { id: id, deletedAt: null } });
		if (!data) {
			throw new HttpException(404, this.msg.notFound);
		}
		data = parse(data);
		return data;
	}

	async createFolder({ body, user }: { body: IFolderCreate; user: User }) {
		const isExist = await Folder.findOne({ where: { index: body.index, name: body.name } });
		if (isExist) {
			throw new HttpException(200, this.msg.exist, {}, true);
		}
		let data = await Folder.create({ ...body, createdBy: user.id });
		data = parse(data);
		await createHistoryRecord({
			tableName: tableEnum.FOLDER,
			jsonData: parse(data),
			status: statusEnum.CREATE,
		});
		return data;
	}

	async updateFolder({ body, user, id }: { body: FolderAttributes; user: User; id: number }) {
		const isExist = await Folder.findOne({
			where: { id: id, deletedAt: null },
		});
		if (!isExist) {
			throw new HttpException(404, this.msg.notFound);
		}
		await Folder.update({ ...body, updatedBy: user.id }, { where: { id: id, deletedAt: null } });
		const updatedData = await this.getFolderById(id);
		await createHistoryRecord({
			tableName: tableEnum.FOLDER,
			jsonData: parse(updatedData),
			status: statusEnum.UPDATE,
		});
		return updatedData;
	}

	getCurrentPublicPath = async (pathData: string) => {
		return path.join(__dirname, `../../public/${pathData}`);
	};

	async deleteFolder(id: number) {
		const transaction = await db.transaction();
		try {
			const isExist = await Folder.findOne({
				where: { id: id, deletedAt: null },
				transaction,
			});
			if (!isExist) {
				throw new HttpException(404, this.msg.notFound);
			}
			const documentTypes: any = [
				{
					model: EmployeeFile,
					idField: 'id',

					fileNameField: 'fileName',
				},
				{
					model: TransportDriverDocument,
					idField: 'id',
					fileNameField: 'documentPath',
				},
				{
					model: TransportVehicleDocument,
					idField: 'id',
					fileNameField: 'documentPath',
				},
			];
			const idsToDelete = {
				EmployeeFile: [],
				TransportDriverDocument: [],
				TransportVehicleDocument: [],
			};
			const whereClause = {
				where: { folderId: id, deletedAt: null },
				paranoid: true,
				transaction,
			};

			const moveAndDeleteDocuments = async (model: ModelCtor, idField: string, fileNameField: string) => {
				const documentData = await model.findAll(whereClause);
				for (const file of documentData) {
					const sourceFilePath = await this.getCurrentPublicPath(file[fileNameField]);
					const destinationFilePath = await this.getCurrentPublicPath(`temp/${file[fileNameField]}`);
					idsToDelete[model.name].push(file[idField]);

					await moveFile(sourceFilePath, destinationFilePath);
				}
			};
			for (const type of documentTypes) {
				await moveAndDeleteDocuments(type.model, type.idField, type.fileNameField);
			}
			await Promise.all([
				EmployeeFile.destroy({ where: { id: idsToDelete.EmployeeFile }, transaction }),
				TransportDriverDocument.destroy({ where: { id: idsToDelete.TransportDriverDocument }, transaction }),
				TransportVehicleDocument.destroy({ where: { id: idsToDelete.TransportVehicleDocument }, transaction }),
			]);

			let data = await Folder.destroy({ where: { id: id }, transaction });
			data = parse(data);
			await transaction.commit();
			return data;
		} catch (error) {
			await transaction.rollback();
			throw new Error(error);
		}
	}

	async getFileCount(id: number) {
		const transaction = await db.transaction();
		try {
			const whereClause = {
				where: { folderId: id, deletedAt: null },
				paranoid: true,
				transaction,
			};
			const EmployeeFileData = await EmployeeFile.findAndCountAll(whereClause);
			const TransportDriverDocumentData = await TransportDriverDocument.findAndCountAll(whereClause);
			const TransportVehicleDocumentData = await TransportVehicleDocument.findAndCountAll(whereClause);
			await transaction.commit();
			return EmployeeFileData.count + TransportDriverDocumentData.count + TransportVehicleDocumentData.count;
		} catch (error) {
			await transaction.rollback();
			throw new Error(error);
		}
	}
}
