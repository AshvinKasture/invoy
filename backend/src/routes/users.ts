import { Router } from "express";
import { validate } from "../validators/validateRequest";
import { loginValidator } from "../validators/userValidators";
import { login } from "../controllers/userController";

const router = Router();

router.post("/login", validate(loginValidator), login);

export default router;
