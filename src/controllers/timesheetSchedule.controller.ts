import { MessageFormation } from '@/constants/messages.constants';
import db from '@/models';
import User from '@/models/user.model';
import TimesheetRepo from '@/repository/timesheet.repository';
import TimesheetScheduleRepo from '@/repository/timesheetSchedule.repository';
import generalResponse from '@/utils/generalResponse';
import { generateModalData } from '@/utils/generateModal';
import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';

class TimesheetScheduleController {
	private TimesheetScheduleService = new TimesheetScheduleRepo();
	private TimesheetService = new TimesheetRepo();
	private msg = new MessageFormation('Timesheet').message;

	public findAllTimesheetSchedule = catchAsync(async (req: Request, res: Response) => {
		const responseData = await this.TimesheetScheduleService.getAllTimesheetScheduleDetails(
			req.query,
			req.user as User,
		);
		return generalResponse(req, res, responseData, this.msg.fetch, 'success', false);
	});

	public updateTimesheetSchedule = catchAsync(async (req: Request, res: Response) => {
		let responseData;
		const transaction = await db.transaction();
		try {
			await generateModalData({
				user: req.user as User,
				percentage: 0,
				message: 'Updating Timesheet Status',
			});
			if (req.body?.scheduleIds?.length > 0) {
				responseData = await this.TimesheetScheduleService.updateTimesheetScheduleById(
					req.body.scheduleIds,
					req.body.updateStatus,
					req.user as User,
					false,
					req.body.isBonus,
					true,
					transaction,
					req.body?.overtimeHours ||
						(req.body.updateStatus == 'CLEARFIELD' || req.body.updateStatus == 'CLEARFIELDTOP'
							? null
							: req.body?.overtimeHours),
				);
				let empids = responseData.map((dat) => dat.employeeId);
				empids = empids.filter((item, index) => empids.indexOf(item) === index);
				const date = responseData[0]?.date;
				await generateModalData({
					user: req.user as User,
					percentage: 50,
					message: 'Updating Reliquat Calculation',
				});
				await this.TimesheetService.generateReliquetResponse(req.user, empids, transaction, null, [
					...req.body.scheduleIds,
				]);
				await generateModalData({
					user: req.user as User,
					percentage: 100,
					message: 'Updating Accounts',
				});
				await this.TimesheetService.getTimesheetDataForAccount(req.user, empids, date, transaction);
			} else {
				responseData = await this.TimesheetScheduleService.updateTimesheetScheduleByEmployeeId({
					...req.body,
					user: req.user as User,
					isTimesheetApplied: true,
					transaction,
				});
				const date = responseData[0]?.date;
				await generateModalData({
					user: req.user as User,
					percentage: 50,
					message: 'Updating Reliquat Calculation',
				});
				await this.TimesheetService.generateReliquetResponse(req.user, [req.body.employeeId], transaction, null, [
					responseData[0]?.id,
				]);
				await generateModalData({
					user: req.user as User,
					percentage: 100,
					message: 'Updating Accounts',
				});
				await this.TimesheetService.getTimesheetDataForAccount(req.user, [req.body.employeeId], date, transaction);
			}
			await transaction.commit();
			return generalResponse(req, res, true, this.msg.update, 'success', true);
		} catch (error) {
			await transaction.rollback();
			return generalResponse(
				req,
				res,
				error,
				error.message ? error.message : this.msg.somethingWentWrong,
				'error',
				true,
				400,
			);
		}
	});
}

export default TimesheetScheduleController;
