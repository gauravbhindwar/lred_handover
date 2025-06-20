import Joi from 'joi';

export const MedicalRequestCreateSchema = Joi.object({
	employeeId: Joi.number().label('Employee Id').required(),
	medicalTypeId: Joi.number().label('Medical Type Id').required(),
	medicalDate: Joi.string().label('Medical Date').required(),
}).options({
	abortEarly: false,
});
