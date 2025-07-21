import { ValidationChain, body } from "express-validator";

export const loginValidator: ValidationChain[] = [
  body("username").isLength({ min: 3 }).withMessage("Invalid username"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];
