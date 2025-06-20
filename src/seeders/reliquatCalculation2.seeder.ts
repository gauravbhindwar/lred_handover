import db from '@/models';
import EmployeeRepo from '@/repository/employee.repository';
import ReliquatCalculationRepo from '@/repository/reliquatCalculation.repository';
import TimesheetRepo from '@/repository/timesheet.repository';
import { folderExistCheck, parse } from '@/utils/common.util';
import path from 'path';
import XLSX from 'xlsx';

(async function injectSettings(): Promise<void> {
	const empRepo = new EmployeeRepo();
	const TimesheetRepo1 = new TimesheetRepo();
	const reliquatCalculationRepo = new ReliquatCalculationRepo();
	// const reliquatCalculationV2Repo = new ReliquatCalculationV2Repo();

	const publicFolder = path.join(__dirname, '../../secure-file/');
	folderExistCheck(publicFolder);
	const filePath = path.join(publicFolder, 'output.xlsx');

	// Create a workbook and worksheet outside of the loop
	const finalWorkbook = XLSX.utils.book_new();
	const finalWorksheet = XLSX.utils.json_to_sheet([], {
		header: [
			'id',
			'employeeNumber',
			'loginUserId',
			'terminationDate',
			'startDate',
			'deletedAt',
			'clientId',
			'loginUserData.firstName',
			'loginUserData.lastName',
			'client.code',
		],
	});
	XLSX.utils.book_append_sheet(finalWorkbook, finalWorksheet, 'Sheet 1');

	const allData = new Set();
	const countD = await empRepo.getCount({
		where: {
			deletedAt: null,
		},
	});
	console.log(countD, 'countD');
	for (let iteration = 1; iteration <= countD; iteration++) {
		const workbook = XLSX.utils.book_new();
		const worksheet = XLSX.utils.json_to_sheet([], {
			header: [
				'id',
				'employeeNumber',
				'loginUserId',
				'terminationDate',
				'startDate',
				'deletedAt',
				'clientId',
				'loginUserData.firstName',
				'loginUserData.lastName',
				'client.code',
			],
		});
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet 1');

		const employeeData = await empRepo.getAll({
			where: {
				deletedAt: null,
			},
			limit: 3,
			offset: (iteration - 1) * 3,
		});
		const parsedEmployeeData = parse(employeeData);

		await Promise.all(
			parsedEmployeeData.map(async (reliquatData) => {
				const transaction = await db.transaction();
				try {
					console.log(
						'info',
						'------------------------- Start Reliquat Calculation Migration -------------------------',
					);

					let isExist = await TimesheetRepo1.getAllTimesheet({
						where: {
							employeeId: reliquatData.id,
						},
						order: [['startDate', 'asc']],
						transaction,
					});

					isExist = parse(isExist);

					if (isExist) {
						await reliquatCalculationRepo.deleteData({
							where: {
								employeeId: reliquatData?.id,
							},
							transaction,
							force: true,
						});

						const promises = [];

						for (const iterator of isExist) {
							const promise = new Promise(async (resolve) => {
								await reliquatCalculationRepo.addReliquatCalculationService(
									{
										employeeId: String(iterator?.employeeId),
										timesheetId: iterator?.id,
										userId: iterator?.createdBy,
									},
									transaction,
								);

								// await reliquatCalculationV2Repo.generateReliquatCalculationV2(
								// 	[iterator?.employeeId],
								// 	iterator?.id,
								// 	iterator?.createdBy,
								// );

								resolve(true);
							});
							promises.push(promise);
							await promise;
						}

						await Promise.all(promises);
					}

					transaction.commit();
					const result = await empRepo.getAllEmployee((iteration - 1) * 3);

					const keyValuePairData = result.map((row) => {
						const keyValueObject = {};
						Object.entries(row).forEach(([key, value]) => {
							keyValueObject[key] = value ?? '';
						});
						if (row.loginUserData && typeof row.loginUserData === 'object') {
							Object.entries(row.loginUserData).forEach(([key, value]) => {
								keyValueObject[`loginUserData.${key}`] = value ?? '';
							});
						}
						if (row.client && typeof row.client === 'object') {
							Object.entries(row.client).forEach(([key, value]) => {
								keyValueObject[`client.${key}`] = value ?? '';
							});
						}
						return keyValueObject;
					});

					// Append the data to the worksheet

					XLSX.utils.sheet_add_json(worksheet, keyValuePairData, {
						header: Object.keys(keyValuePairData[0]),
						skipHeader: true,
					});

					console.log(
						'info',
						'------------------------- complete Reliquat Calculation Migration -------------------------',
					);

					// Append the data to the allData Set
					keyValuePairData.forEach((entry) => allData.add(JSON.stringify(entry)));

					return null;
				} catch (error) {
					console.log('error', error);
					transaction.rollback();
				}
			}),
		);

		// Convert Set to array and write to the final worksheet
		const uniqueDataArray = Array.from(allData).map((entry: any) => JSON.parse(entry));
		XLSX.utils.sheet_add_json(finalWorksheet, uniqueDataArray, {
			header: Object.keys(uniqueDataArray[0]),
			skipHeader: true,
		});

		// Write the workbook to the file after each iteration
		XLSX.writeFile(workbook, filePath);
		console.log(`Excel file for iteration ${iteration} created successfully.`);
	}

	// Finally, write the final workbook to the file
	XLSX.writeFile(finalWorkbook, filePath);
})()
	.then(async () => {
		console.log('info', 'Reliquat Calculation Data added successfully...');
	})
	.catch((err) => {
		console.log('error', err.message);
	});
