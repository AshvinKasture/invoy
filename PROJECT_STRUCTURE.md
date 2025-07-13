# 📁 Project Structure

This document provides an overview of the Invoy project structure and organization.

## 🏗️ Root Directory Structure

```
invoy/
├── docs/                    # 📚 Comprehensive documentation
│   ├── frontend/           # Frontend-specific documentation
│   ├── backend/            # Backend-specific documentation
│   └── README.md           # Main documentation index
├── frontend/               # 🎨 React frontend application
├── backend/                # ⚙️ Node.js backend application
└── SETUP_GUIDE.md         # 🚀 Quick setup instructions
```

## 📚 Documentation Organization

The documentation has been reorganized for better clarity and navigation:

### 🎨 Frontend Documentation (`/docs/frontend/`)
- **Store Management** - Global state with React Context API
- **API Helper** - API abstraction layer and utilities  
- **Environment Configuration** - Environment variables and setup

### ⚙️ Backend Documentation (`/docs/backend/`)
- **Database Framework** - Multi-database support system
- **Architecture** - System design and components
- **Migration System** - Schema management
- **Configuration** - Setup and deployment guides

## 🎯 Quick Navigation

### For New Developers
1. **Start Here**: [Main Documentation](./docs/README.md)
2. **Frontend Setup**: [Frontend Documentation](./docs/frontend/README.md)
3. **Backend Setup**: [Backend Documentation](./docs/backend/README.md)
4. **Database Setup**: [Database Quick Start](./docs/backend/database/quick-start.md)

### For Specific Tasks
- **Frontend Development**: Check `/docs/frontend/` for React, state management, and API integration
- **Backend Development**: Check `/docs/backend/` for Node.js, database, and API development
- **Database Management**: Check `/docs/backend/database/` for schema, migrations, and configuration
- **Environment Setup**: Check environment documentation in respective frontend/backend sections

## 🔧 Development Workflow

1. **Documentation First**: Always check relevant documentation before starting
2. **Frontend**: Work in `/frontend/` directory with React/TypeScript
3. **Backend**: Work in `/backend/` directory with Node.js/Express
4. **Database**: Use migration system for schema changes
5. **Documentation**: Update docs when adding new features

## 📖 Documentation Standards

- **Comprehensive**: Each component has detailed documentation
- **Organized**: Separated by frontend/backend concerns
- **Searchable**: Clear naming and structure
- **Up-to-date**: Documentation reflects current implementation
- **Examples**: Practical usage examples included

This structure ensures that developers can quickly find relevant information and understand how different parts of the system work together.
