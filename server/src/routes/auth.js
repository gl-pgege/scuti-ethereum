const express = require('express');
const router = express.Router();
const { checkSchema } = require("express-validator");

const { signUp, signIn } = require("../controllers/auth");
const {userSignUpValidator, userSignUpValidationSchema} = require("../utils/validator/auth");


router.post("/sign-up", checkSchema(userSignUpValidationSchema), userSignUpValidator, signUp);
router.post("/sign-in", signIn);


module.exports = router; 