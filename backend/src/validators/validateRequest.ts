
import { Request, Response, NextFunction } from 'express';
import { ValidationChain, validationResult } from 'express-validator';

const validateRequest = (req: Request, res: Response, next: NextFunction) => {
    // Check for validation errors
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }

    // If no errors, continue to next middleware
    next();
};

export const validate = (validationChains: ValidationChain[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Execute all validation chains
        for (const validationChain of validationChains) {
            await validationChain.run(req);
        }

        validateRequest(req, res, next);
    };
};