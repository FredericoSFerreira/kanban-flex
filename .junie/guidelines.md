# KanbanFlex Project Guidelines

## Project Overview

**KanbanFlex** is a modern, open-source Kanban board application designed for sprint management and agile workflows. The application enables teams to create and manage boards with columns and cards, supporting both authenticated and anonymous users.

### Key Features
- **Board Management**: Create and manage sprint boards with drag-and-drop functionality
- **Anonymous Access**: Support for anonymous users to access and interact with boards
- **Card Voting**: Users can vote on cards with likes and dislikes
- **Hide Mode**: Board creators can control card visibility for all users
- **Multi-language Support**: Available in English and Portuguese
- **Authentication**: Google OAuth integration and traditional login/register

## Technology Stack

### Frontend
- **Framework**: Vue.js 3 with Composition API
- **Language**: TypeScript
- **Build Tool**: Vite
- **State Management**: Pinia with persistence
- **UI Framework**: Bootstrap 5 with Bootstrap Icons
- **Routing**: Vue Router 4
- **Internationalization**: Vue i18n
- **Key Libraries**:
  - `vuedraggable` for drag-and-drop functionality
  - `lucide-vue-next` for icons
  - `sweetalert2` for notifications
  - `axios` for HTTP requests
  - `parse` for backend integration

### Backend
- **Framework**: Parse Server on Express.js
- **Language**: JavaScript (ES6 modules)
- **Database**: MongoDB
- **Authentication**: Parse Server auth + Google OAuth
- **File Storage**: AWS S3 integration
- **Caching**: Redis
- **Email**: Nodemailer with Handlebars templates
- **Security**: Helmet, CORS
- **Database Migrations**: migrate-mongo

### Development Tools
- **Testing**: Vitest (frontend), Jest (backend)
- **Linting**: ESLint
- **Type Checking**: TypeScript compiler (vue-tsc)
- **Container**: Docker with docker-compose
- **CI/CD**: GitHub Actions
- **Deployment**: Netlify (frontend)

## Project Structure

```
├── frontend (root directory)
│   ├── src/
│   │   ├── components/        # Reusable Vue components
│   │   ├── views/            # Page components
│   │   │   ├── auth/         # Authentication pages
│   │   │   └── ...           # Other views
│   │   ├── i18n/             # Internationalization
│   │   │   └── locales/      # Language files
│   │   ├── utils/            # Utility functions
│   │   └── stores/           # Pinia stores
│   ├── public/               # Static assets
│   └── dist/                 # Build output
├── backend/
│   ├── cloud/                # Parse Cloud Code
│   ├── modules/              # API modules
│   ├── middleware/           # Express middleware
│   ├── migrations/           # Database migrations
│   ├── tests/                # Test files
│   │   ├── unit/            # Unit tests
│   │   └── e2e/             # End-to-end tests
│   ├── service/              # Business logic services
│   ├── utils/                # Utility functions
│   ├── templates/            # Email templates
│   └── logs/                 # Application logs
```

## Development Workflow

### Frontend Development
1. **Setup**: `npm install`
2. **Development**: `npm run dev` (starts Vite dev server)
3. **Type Checking**: `npm run type-check`
4. **Linting**: `npm run lint`
5. **Testing**: `npm run test:unit`
6. **Build**: `npm run build`

### Backend Development
1. **Setup**: 
   ```bash
   cd backend/
   npm install
   npm install -g migrate-mongo
   ```
2. **Database**: `docker-compose up` (starts MongoDB and Redis)
3. **Migrations**: `npm run migrate`
4. **Development**: `npm run dev` (uses nodemon)
5. **Production**: `npm run start`

### Environment Configuration
- Copy `.env.sample` to `.env` in backend directory
- Configure database, AWS S3, Redis, and email settings
- Frontend environment variables in root `.env` file

## Testing Approach

### Frontend Testing
- **Framework**: Vitest with @vue/test-utils
- **Command**: `npm run test:unit`
- **Coverage**: Included in Vitest setup
- **Focus**: Component testing, utility function testing

### Backend Testing
- **Framework**: Jest with Supertest for API testing
- **Commands**:
  - `npm test` - Run all tests
  - `npm run test:unit` - Unit tests only
  - `npm run test:e2e` - End-to-end tests only
  - `npm run test:coverage` - Tests with coverage report
  - `npm run test:watch` - Watch mode
- **Coverage**: Comprehensive coverage reporting with codecov integration
- **Focus**: API endpoints, business logic, database operations

### Test Requirements for PRs
- All tests must pass before submitting pull requests
- Maintain or improve test coverage
- Add tests for new features and bug fixes

## Build and Deployment

### Frontend Build
- **Command**: `npm run build`
- **Output**: `dist/` directory
- **Deployment**: Automated via Netlify
- **Preview**: `npm run preview` (preview built app)

### Backend Deployment
- **Production**: `npm run start`
- **Docker**: Dockerfile available for containerized deployment
- **Environment**: Ensure all environment variables are configured
- **Database**: Run migrations before deployment

## Code Style and Standards

### General Guidelines
- Use TypeScript for type safety
- Follow ESLint configuration
- Use meaningful variable and function names
- Write self-documenting code with comments where necessary
- Follow Vue.js style guide for components

### Vue.js Specific
- Use Composition API for new components
- Implement proper prop validation
- Use TypeScript interfaces for complex data structures
- Follow single-file component structure

### Backend Specific
- Use ES6 modules
- Implement proper error handling
- Follow RESTful API principles
- Use async/await for asynchronous operations
- Implement proper logging

## Pre-submission Checklist

Before submitting changes:
1. ✅ Run and pass all tests (`npm test` in backend, `npm run test:unit` in frontend)
2. ✅ Ensure code passes linting (`npm run lint`)
3. ✅ Verify type checking passes (`npm run type-check`)
4. ✅ Test the application manually in development mode
5. ✅ Build successfully (`npm run build`)
6. ✅ Update documentation if needed
7. ✅ Add appropriate tests for new features or bug fixes

## Additional Notes

- The project supports both authenticated and anonymous users
- Internationalization is implemented - add translations for new text
- File uploads are handled via AWS S3 integration
- Real-time features may use Parse Server's live queries
- Security is enforced through Parse Server ACLs and custom middleware


