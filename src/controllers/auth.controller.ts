import { MessageFormation } from '@/constants/messages.constants';
import { messageStatus } from '@/interfaces/model/message.interface';
import Client from '@/models/client.model';
import Employee from '@/models/employee.model';
import LoginUser from '@/models/loginUser.model';
import Role from '@/models/role.model';
import UserClient from '@/models/userClient.model';
import UserSegment from '@/models/userSegment.model';
import ErrorLogsRepo from '@/repository/errorLog.repository';
import LoginUserRepo from '@/repository/loginUser.repository';
import { parse } from '@/utils/common.util';
import * as bcrypt from 'bcrypt';
import { HttpException } from 'exceptions/HttpException';
import { Request, Response } from 'express';
import { status } from 'interfaces/model/user.interface';
import User from 'models/user.model';
import AuthRepo from 'repository/auth.repository';
import UserRepo from 'repository/user.repository';
import { Op } from 'sequelize';
import { catchAsync } from '../utils/catchAsync';
import generalResponse from '../utils/generalResponse';

class AuthController {
	private authRepository = new AuthRepo();
	private userRepository = new UserRepo();
	private loginUserRepository = new LoginUserRepo();
	private errorRepository = new ErrorLogsRepo();

	private msg = new MessageFormation('User').message;

	/**
	 * user login Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public login = catchAsync(async (req: Request, res: Response) => {
		const { email, password, recaptcha } = req.body;
		const verify = await this.authRepository.varifyGoogleRecaptcha(recaptcha);
		// if (!verify) {
		// 	throw new Error('reCaptcha Verification Fail');
		// }
		// let isEmployee = false;
		// const ismultipleUser = await this.userRepository.getAll({
		// 	where: { status: status.ACTIVE },
		// 	include: [
		// 		{
		// 			model: LoginUser,
		// 			attributes: ['id'],
		// 			where: { email },
		// 		},
		// 		{ model: Role, attributes: ['id', 'name'] },
		// 	],
		// });
		// const employeeRole = await Role.findOne({
		// 	where: {
		// 		name: 'Employee',
		// 	},
		// 	attributes: ['id', 'name'],
		// });
		// if (ismultipleUser?.length > 0 && ismultipleUser?.findIndex((e) => e?.roleData?.name === employeeRole?.name) >= 0) {
		// 	isEmployee = true;
		// }
		let user = await this.userRepository.get({
			where: { status: status.ACTIVE },
			include: [
				{
					model: LoginUser,
					required: true,
					where: {
						email: {
							[Op.iLike]: email,
						},
					},
					attributes: [
						'id',
						'email',
						'name',
						'password',
						'randomPassword',
						'profileImage',
						'timezone',
						'isMailNotification',
					],
					include: [
						{
							model: Employee,
							where: { terminationDate: { [Op.or]: { [Op.eq]: null, [Op.gte]: new Date() } } },
							required: false,
							attributes: ['id', 'clientId'],
						},
						{ model: Client, required: false, attributes: ['id'] },
					],
				},
				{
					model: Role,
					attributes: ['name', 'isViewAll'],
					where: {
						name: {
							[Op.ne]: 'Client',
						},
					},
					// where: {
					// 	...(isEmployee && {
					// 		id: {
					// 			[Op.ne]: employeeRole?.id,
					// 		},
					// 	}),
					// },
				},
				{
					model: UserClient,
					required: false,
					attributes: ['clientId'],
				},
				{
					model: UserSegment,
					required: false,
					attributes: ['id', 'segmentId', 'subSegmentId'],
				},
			],
			// order: [['id', 'desc']],
			attributes: ['id', 'loginUserId', 'roleId', 'status'],
			rejectOnEmpty: false,
		});
		if (user) {
			if (!user?.loginUserData?.password && !user?.loginUserData?.randomPassword) {
				await this.errorRepository.addErrorLogs({
					body: {
						type: 'auth',
						status: messageStatus.ERROR,
						isActive: status.ACTIVE,
						email: email,
						full_error: JSON.stringify(this.msg.passwordSetError),
						error_message: this.msg.passwordSetError,
					},
				});
				throw new HttpException(400, this.msg.passwordSetError);
			}
			const isMatch = await bcrypt.compare(
				password,
				user?.loginUserData?.password ? user?.loginUserData?.password : user?.loginUserData?.randomPassword,
			);
			if (isMatch) {
				user = parse(user);
				return generalResponse(
					req,
					res,
					{
						user: { ...user, client: null },
						access_token: this.authRepository.createToken(user),
						// XeroUrl: url,
					},
					this.msg.loggInSuccess,
				);
			} else {
				await this.errorRepository.addErrorLogs({
					body: {
						type: 'auth',
						status: messageStatus.ERROR,
						email: email,
						isActive: status.ACTIVE,
						full_error: JSON.stringify(this.msg.correctPasswordError),
						error_message: this.msg.correctPasswordError,
					},
				});
				throw new HttpException(400, this.msg.correctPasswordError, null, true);
			}
		} else {
			await this.errorRepository.addErrorLogs({
				body: {
					type: 'auth',
					status: messageStatus.ERROR,
					isActive: status.ACTIVE,
					email: email,
					full_error: JSON.stringify(this.msg.invalidCredentials),
					error_message: this.msg.invalidCredentials,
				},
			});
			throw new HttpException(400, this.msg.invalidCredentials, null, true);
		}
	});

	/**
	 * get Logged in Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public getLoggedIn = catchAsync(async (req: Request, res: Response) => {
		const user = req.user;
		return generalResponse(req, res, user, this.msg.getLoggInSuccess, 'success', false, 200);
	});

	/**
	 * User Validate Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public userValidate = catchAsync(async (req: Request, res: Response) => {
		const data = await this.authRepository.userValidate(req.query);
		return generalResponse(req, res, data, this.msg.fetch, 'success', false);
	});

	/**
	 * Reset Password Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public resetPassword = catchAsync(async (req: Request, res: Response) => {
		const data = await this.authRepository.resetPassword(req.body);
		return generalResponse(req, res, data, this.msg.passwordSet, 'success', true);
	});

	/**
	 * OTP Verification Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public otpVerification = catchAsync(async (req: Request, res: Response) => {
		const data = await this.authRepository.otpVerification(req.body);
		return generalResponse(req, res, data, this.msg.otpVerificationSuccess, 'success', true);
	});

	/**
	 * Resent Otp Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public resendOTP = catchAsync(async (req: Request, res: Response) => {
		const a = await this.authRepository.resendOTP(req.body);
		return generalResponse(req, res, a, this.msg.otpSentSuccess, 'success', true);
	});

	/**
	 * Change Password Api
	 * @param {Request} req
	 * @param {Response} res
	 * @returns {Promise<void>}
	 */
	public changePassword = catchAsync(async (req: Request, res: Response) => {
		const data = await this.authRepository.changePassword(req.body, (req.user as User).id);
		return generalResponse(req, res, data, this.msg.passwordChangeSuccess, 'success', true);
	});
}

export default AuthController;
