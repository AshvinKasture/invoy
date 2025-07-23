import { Router } from "express";
import { login, validateToken } from "../controllers/userController";
import { loginValidator } from "../validators/userValidators";
import { validate } from "../validators/validateRequest";

const router = Router();

router.post("/login", validate(loginValidator), login);
router.get("/validate-token", validateToken);

export default router;
