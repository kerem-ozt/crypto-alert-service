const Joi = require('joi');

const createAlertSchema = Joi.object({
  symbol: Joi.string().required().messages({
    'any.required': 'Symbol is required',
  }),
  conditionType: Joi.string().valid('above', 'below', 'range', 'percentage_drop').required(),
  threshold: Joi.number().optional(),   
  rangeLow: Joi.number().optional(),
  rangeHigh: Joi.number().optional(),
  percentChange: Joi.number().optional(),
  timeWindow: Joi.string().optional(),   
});

module.exports = {
  createAlertSchema,
};
