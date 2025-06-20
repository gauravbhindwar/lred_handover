import Joi from 'joi';

export const RotationCreateSchema = Joi.object({
	name: Joi.string().trim().label('Name').required(),
	weekOn: Joi.number().label('Week On').allow('', null),
	weekOff: Joi.number().label('Week Off').allow('', null),
	isResident: Joi.boolean().default(false),
	daysWorked: Joi.string().trim().allow('', null).label('Days Worked'),
	isAllDays: Joi.boolean().default(false),
	isWeekendBonus: Joi.boolean().default(false),
	isOvertimeBonus: Joi.boolean().default(false),
}).options({
	abortEarly: false,
});

export const RotationUpdateSchema = Joi.object({
	name: Joi.string().trim().label('Name'),
	weekOn: Joi.number().label('Week On').allow('', null),
	weekOff: Joi.number().label('Week Off').allow('', null),
	isResident: Joi.boolean(),
	daysWorked: Joi.string().trim().allow('', null).label('Days Worked'),
	isAllDays: Joi.boolean(),
	isWeekendBonus: Joi.boolean(),
	isOvertimeBonus: Joi.boolean(),
}).options({
	abortEarly: false,
});
