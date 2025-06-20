import { MessageFormation } from '@/constants/messages.constants';
import { HttpException } from '@/exceptions/HttpException';
import { IQueryParameters } from '@/interfaces/general/general.interface';
import Employee from '@/models/employee.model';
import EmployeeFile from '@/models/employeeFile.model';
import Folder from '@/models/folder.model';
import LoginUser from '@/models/loginUser.model';
import TransportDriverDocument from '@/models/transport.driver.document.model';
import TransportVehicleDocument from '@/models/transport.vehicle.document.model';
import User from '@/models/user.model';
import { fileDelete, folderExistCheck, parse } from '@/utils/common.util';
import path from 'path';
import { Op } from 'sequelize';

export default class ApproveDeletedFileRepo {
	private msg = new MessageFormation('Approve Deleted File').message;

	async getAllApproveDeletedFileService(query: IQueryParameters) {
		const { sortBy, sort, clientId } = query;
		const sortedColumn = sortBy || null;
		let employeeFileData = await EmployeeFile.findAll({
			where: {
				status: 1,
			},
			paranoid: false,
			attributes: ['id', 'name', 'folderId', 'fileSize', 'fileName', 'status', 'deletedAt'],
			include: [
				{
					model: Folder,
					attributes: ['name', 'typeId', 'id'],
				},
				{
					model: Employee,
					attributes: ['employeeNumber', 'clientId', 'contractEndDate'],
					where: { ...(clientId && { clientId: clientId }) },
					include: [
						{
							model: LoginUser,
							attributes: ['firstName', 'lastName'],
						},
					],
				},
				{
					model: User,
					as: 'updatedByUser',
					attributes: ['id'],
					include: [{ model: LoginUser, attributes: ['email'] }],
				},
			],

			order: [[sortedColumn ?? 'name', sort ?? 'asc']],
		});

		let transportVehicleData = await TransportVehicleDocument.findAll({
			where: {
				deletedAt: {
					[Op.ne]: null,
				},
				...(clientId ? { clientId: clientId } : {}),
			},
			paranoid: false,
			attributes: ['id', 'folderId', 'documentSize', 'documentPath', 'documentName', 'deletedAt'],
			include: {
				model: Folder,
				where: {
					typeId: 2,
				},
				attributes: ['name', 'typeId', 'id'],
			},

			order: [[sortedColumn ?? 'documentName', sort ?? 'asc']],
		});

		let transportDriverData = await TransportDriverDocument.findAll({
			where: {
				deletedAt: {
					[Op.ne]: null,
				},
				...(clientId ? { clientId: clientId } : {}),
			},
			paranoid: false,
			attributes: ['id', 'folderId', 'documentSize', 'documentPath', 'documentName', 'deletedAt'],
			include: {
				model: Folder,
				where: {
					typeId: 2,
				},
				attributes: ['name', 'typeId', 'id'],
			},
			order: [[sortedColumn ?? 'documentName', sort ?? 'asc']],
		});
		employeeFileData = parse(employeeFileData);
		transportVehicleData = parse(transportVehicleData);
		transportDriverData = parse(transportDriverData);

		const item = [...employeeFileData, ...transportVehicleData, ...transportDriverData];
		const data = this.sortItems(item);
		return { data };
	}

	sortItems(item: (TransportVehicleDocument | TransportDriverDocument | EmployeeFile)[]) {
		return item.sort((a: { folderId: number }, b: { folderId: number }) => a.folderId - b.folderId);
	}

	async deleteApproveDeletedFileService(query: IQueryParameters) {
		const { folderId, imageId } = query;

		const isEmployeeFound = await EmployeeFile.findOne({
			paranoid: false,
			where: {
				id: imageId,
				folderId: folderId,
			},
		});

		const isTransportDriverFound = await TransportDriverDocument.findOne({
			paranoid: false,
			where: {
				id: imageId,
				folderId: folderId,
			},
		});

		const isTransportVehicleFound = await TransportVehicleDocument.findOne({
			paranoid: false,
			where: {
				id: imageId,
				folderId: folderId,
			},
		});

		let data;

		if (isEmployeeFound) {
			const publicFolder = path.join(__dirname, '../../secure-file');
			folderExistCheck(publicFolder);
			const filePath = path.join(publicFolder, `${isEmployeeFound.fileName}`);
			fileDelete(filePath);
			data = await EmployeeFile.destroy({
				where: {
					id: imageId,
				},
				force: true,
			});
		} else if (isTransportDriverFound) {
			const publicFolder = path.join(__dirname, '../../secure-file');
			folderExistCheck(publicFolder);
			const filePath = path.join(publicFolder, `${isTransportDriverFound.documentPath}`);
			fileDelete(filePath);
			data = await TransportDriverDocument.destroy({
				where: {
					id: imageId,
				},
				force: true,
			});
		} else if (isTransportVehicleFound) {
			const publicFolder = path.join(__dirname, '../../secure-file');
			folderExistCheck(publicFolder);
			const filePath = path.join(publicFolder, `${isTransportVehicleFound.documentPath}`);
			fileDelete(filePath);
			data = await TransportVehicleDocument.destroy({
				where: {
					id: imageId,
				},
				force: true,
			});
		} else {
			throw new HttpException(400, this.msg.notFound, true);
		}
		return data;
	}

	async restoreApproveDeletedFileService(query: IQueryParameters) {
		const { folderId, imageId } = query;

		const isEmployeeFound = await EmployeeFile.findOne({
			paranoid: false,
			where: {
				id: imageId,
				folderId: folderId,
			},
		});

		const isTransportDriverFound = await TransportDriverDocument.findOne({
			paranoid: false,
			where: {
				id: imageId,
				folderId: folderId,
			},
		});

		const isTransportVehicleFound = await TransportVehicleDocument.findOne({
			paranoid: false,
			where: {
				id: imageId,
				folderId: folderId,
			},
		});

		let data;

		if (isEmployeeFound) {
			data = await EmployeeFile.update(
				{
					deletedAt: null,
					status: 0,
				},
				{
					paranoid: false,
					where: {
						id: imageId,
					},
				},
			);
		} else if (isTransportDriverFound) {
			data = await TransportDriverDocument.update(
				{
					deletedAt: null,
				},
				{
					paranoid: false,
					where: {
						id: imageId,
					},
				},
			);
		} else if (isTransportVehicleFound) {
			data = await TransportVehicleDocument.update(
				{
					deletedAt: null,
				},
				{
					paranoid: false,
					where: {
						id: imageId,
					},
				},
			);
		} else {
			throw new HttpException(400, this.msg.notFound, true);
		}
		return data;
	}

	async checkDataService(folderId: string, imageId: string) {
		const isEmployeeFound = await EmployeeFile.findOne({
			paranoid: false,
			where: {
				id: imageId,
				folderId: folderId,
			},
		});

		const isTransportDriverFound = await TransportDriverDocument.findOne({
			paranoid: false,
			where: {
				id: imageId,
				folderId: folderId,
			},
		});

		const isTransportVehicleFound = await TransportVehicleDocument.findOne({
			paranoid: false,
			where: {
				id: imageId,
				folderId: folderId,
			},
		});

		return isEmployeeFound || isTransportDriverFound || isTransportVehicleFound;
	}
}
