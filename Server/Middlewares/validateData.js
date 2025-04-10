const joi=require('joi');


const signupValidation = async (req, res, next) => {
    const schema = joi.object({
        name: joi.string().min(6).max(100).required(),
        email: joi.string().email().required(),
        password: joi.string().min(4).max(8).required(), 
    });

    const { error } = schema.validate(req.body, { abortEarly: false }); 

    if (error) {
        return res.json({ 
            message: "Validation error", 
            errors: error.details.map(err => err.message) 
        });
    }
    
    next();
};




const loginValidation = async (req, res, next) => {
    const schema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(4).max(8).required(),
    });

    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
        return res.json({
            message: "Validation error",
            errors: error.details.map(err => err.message),
        });
    }

    next();
};



module.exports = {signupValidation,loginValidation};
