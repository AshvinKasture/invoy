# Validation Framework Documentation

This document describes the robust validation framework implemented using `express-validator`.

## Overview

The validation framework provides:
- **Type-safe validation** with TypeScript support
- **Comprehensive error handling** with detailed messages
- **Request sanitization** to prevent unwanted fields
- **Reusable validation chains** for common patterns
- **Custom validators** for business logic
- **Pagination and filtering** validation out of the box

## Architecture

```
src/validations/
├── index.ts              # Core validation framework
├── userValidations.ts    # User-specific validations
├── productValidations.ts # Product-specific validations
└── utils.ts             # Validation utilities and helpers
```

## Core Components

### 1. Validation Framework (`validations/index.ts`)

#### `validate(validations: ValidationChain[])`
Higher-order function that creates validation middleware.

```typescript
import { validate } from '../validations';
import { createUserValidation } from '../validations/userValidations';

router.post('/users', 
  validate(createUserValidation), 
  createUser
);
```

#### `handleValidationErrors(req, res, next)`
Middleware to process validation results and send error responses.

#### `sanitizeRequest(allowedFields: string[])`
Middleware to remove unwanted fields from request body.

```typescript
router.post('/users', 
  sanitizeRequest(['email', 'name', 'password']),
  validate(createUserValidation), 
  createUser
);
```

### 2. Validation Utilities (`validations/utils.ts`)

#### `ValidationUtils` Class
Provides static methods for common validation patterns:

- `uuid(field)` - UUID v4 validation
- `mongoId(field)` - MongoDB ObjectId validation
- `paginationLimit(min, max)` - Pagination limit validation
- `paginationOffset()` - Pagination offset validation
- `sortOrder()` - Sort order validation
- `dateField(fieldName, required)` - Date field validation
- `booleanField(fieldName, required)` - Boolean field validation
- `numericField(fieldName, options)` - Numeric field validation
- `stringField(fieldName, options)` - String field validation
- `enumField(fieldName, allowedValues, required)` - Enum validation
- `arrayField(fieldName, options)` - Array validation
- `fileField(fieldName, options)` - File upload validation

#### `ValidationPatterns` Object
Common regex patterns:

- `STRONG_PASSWORD` - Strong password pattern
- `MEDIUM_PASSWORD` - Medium password pattern
- `PHONE_INTERNATIONAL` - International phone format
- `PHONE_US` - US phone format
- `URL` - URL validation
- `ALPHANUMERIC_SPACES` - Alphanumeric with spaces
- `ALPHANUMERIC` - Alphanumeric only
- `LETTERS_ONLY` - Letters only
- `NUMBERS_ONLY` - Numbers only

#### `CommonValidations` Object
Pre-built validation chains:

- `pagination` - Standard pagination validation
- `search` - Search query validation

## Usage Examples

### Basic Validation

```typescript
import { body } from 'express-validator';
import { validate } from '../validations';

const userValidation = [
  body('email').isEmail().normalizeEmail(),
  body('name').isLength({ min: 2, max: 100 }).trim(),
  body('age').isInt({ min: 0, max: 120 })
];

router.post('/users', validate(userValidation), createUser);
```

### Using Validation Utils

```typescript
import { ValidationUtils } from '../validations/utils';

const productValidation = [
  ValidationUtils.stringField('name', { 
    required: true, 
    minLength: 2, 
    maxLength: 200 
  }),
  ValidationUtils.numericField('price', { 
    required: true, 
    min: 0.01 
  }),
  ValidationUtils.enumField('category', [
    'Electronics', 'Clothing', 'Books'
  ], true)
];
```

### Custom Validation

```typescript
import { body } from 'express-validator';

const customValidation = [
  body('email').custom(async (value) => {
    const existingUser = await User.findOne({ email: value });
    if (existingUser) {
      throw new Error('Email already exists');
    }
    return true;
  }),
  
  body('password').custom((value, { req }) => {
    if (value !== req.body.confirmPassword) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
];
```

### Conditional Validation

```typescript
import { body } from 'express-validator';

const conditionalValidation = [
  body('type').isIn(['individual', 'company']),
  
  // Only validate company name if type is 'company'
  body('companyName')
    .if(body('type').equals('company'))
    .notEmpty()
    .withMessage('Company name is required for company accounts'),
    
  // Only validate SSN if type is 'individual'
  body('ssn')
    .if(body('type').equals('individual'))
    .matches(/^\d{3}-\d{2}-\d{4}$/)
    .withMessage('SSN must be in format XXX-XX-XXXX')
];
```

## User Validations

### Create User
- Email: Required, valid email format, normalized
- Name: Required, 2-100 characters, trimmed, escaped
- Password: Required, 6-128 characters, strong password pattern
- Custom: Email uniqueness check, name restrictions

### Update User
- ID: Required, valid format
- Email: Optional, valid email format if provided
- Name: Optional, 2-100 characters if provided
- Custom: At least one field required, email uniqueness

### Query Parameters
- limit: 1-100, integer
- offset: Non-negative integer
- search: 1-100 characters, trimmed
- sortBy: name, email, createdAt, updatedAt
- sortOrder: asc, desc

## Product Validations

### Create Product
- Name: Required, 2-200 characters
- Description: Required, 10-1000 characters
- Price: Required, positive number
- Category: Required, from predefined list
- Custom: Name restrictions, category validation, price limits

### Update Product
- ID: Required, valid format
- Name: Optional, 2-200 characters if provided
- Description: Optional, 10-1000 characters if provided
- Price: Optional, positive number if provided
- Category: Optional, from predefined list if provided
- Custom: At least one field required, price limits

### Query Parameters
- limit: 1-100, integer
- offset: Non-negative integer
- category: String, trimmed
- minPrice: Non-negative number
- maxPrice: Non-negative number, greater than minPrice
- search: 1-100 characters, trimmed
- sortBy: name, price, category, createdAt, updatedAt
- sortOrder: asc, desc

## Error Responses

Validation errors return structured responses:

```json
{
  "success": false,
  "message": "Validation failed",
  "error": "Validation errors: email: Must be a valid email address, name: Name is required",
  "timestamp": "2025-07-12T18:00:00.000Z"
}
```

## Best Practices

### 1. Chain Validations Logically
```typescript
body('email')
  .isEmail()
  .withMessage('Must be a valid email')
  .normalizeEmail()
  .isLength({ max: 255 })
  .withMessage('Email too long')
```

### 2. Use Custom Messages
```typescript
body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long')
```

### 3. Sanitize Input
```typescript
body('name')
  .trim()
  .escape()
  .isLength({ min: 2, max: 100 })
```

### 4. Group Related Validations
```typescript
const userValidations = {
  create: [...],
  update: [...],
  query: [...]
};
```

### 5. Use Type Conversions
```typescript
query('limit')
  .isInt({ min: 1, max: 100 })
  .toInt() // Converts string to number
```

## Integration with Controllers

Controllers automatically receive validated and sanitized data:

```typescript
export const createUser = async (req: TypedRequest<CreateUserDto>, res: Response) => {
  // req.body is validated and sanitized
  const { email, name, password } = req.body;
  // ... implementation
};
```

## Testing Validations

```typescript
import request from 'supertest';
import app from '../app';

describe('User Validation', () => {
  it('should reject invalid email', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        email: 'invalid-email',
        name: 'John',
        password: 'password123'
      });
      
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('Must be a valid email');
  });
});
```

## Future Enhancements

1. **Database Integration**: Add validators that check against database
2. **Async Validation**: Implement async custom validators
3. **File Upload Validation**: Add comprehensive file validation
4. **Rate Limiting Integration**: Combine with rate limiting
5. **Audit Logging**: Log validation failures for security monitoring
