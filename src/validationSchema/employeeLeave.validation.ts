import Joi from 'joi';

export const EmployeeLeaveCreateSchema = Joi.object({
	employeeId: Joi.number().label('Employee Id').required(),
	startDate: Joi.string().label('Start Date').required(),
	endDate: Joi.string().label('End Date').required(),
	leaveType: Joi.string().label('Leave Type').required(),
}).options({
	abortEarly: false,
});

export const EmployeeLeaveUpdateSchema = Joi.object({
	employeeId: Joi.number().label('Employee Id'),
	startDate: Joi.string().label('Start Date'),
	endDate: Joi.string().label('End Date'),
}).options({
	abortEarly: false,
});
