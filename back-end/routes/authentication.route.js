const express = require("express");
const authRouter = express.Router();
const {authenticationController} = require("../controller")

authRouter.use(express.json());


authRouter.post("/login", authenticationController.login);

module.exports = authRouter