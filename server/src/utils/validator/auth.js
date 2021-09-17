const User = require("../../models/user");
const { validationResult } = require("express-validator");

const userSignUpValidator = (req, res, next) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    next();
}


/**
 * Capitalizes first letters of words in string.
 * @param {string} str String to be modified
 * @param {boolean=false} lower Whether all other letters should be lowercased
 * @return {string}
 * @usage
 *   capitalize('fix this string');     // -> 'Fix This String'
 *   capitalize('javaSCrIPT');          // -> 'JavaSCrIPT'
 *   capitalize('javaSCrIPT', true);    // -> 'Javascript'
 */
const capitalize = (str, lower = false) => {
    return (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase());
}

const userSignUpValidationSchema = {
    first_name: {
        notEmpty: true,
        errorMessage: "First Name is required",
        customSanitizer: {
            options: (value) => {
                return capitalize(value)
            }
        }
    },
    last_name: {
        notEmpty: true,
        errorMessage: "Last Name is required",
        customSanitizer: {
            options: (value) => {
                return capitalize(value, true)
            }
        }
    },
    email: {
        isEmail: {
            bail: true,
        }
    }, 
    username: {
        custom: {
            options: async (value) => {
                const userData = await User.findOne({username: value})
                if(userData) {
                    return Promise.reject("Username already in use")
                }
            }
        }
    },
    password: {
        isLength: {
            errorMessage: 'Password should be at least 7 chars long',
            // Multiple options would be expressed as an array
            options: { min: 7 },
        },
    },
}

module.exports = {
    userSignUpValidator,
    userSignUpValidationSchema
}