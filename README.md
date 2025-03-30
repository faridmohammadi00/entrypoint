# EntryPoint - Visitor Management System

A modern, secure, and efficient visitor management system built with Node.js, Express, and MongoDB.

## Features

- 🔐 Secure authentication and authorization
- 🏢 Building and complex management
- 👥 Visitor registration and tracking
- 📱 QR code-based check-in/out system
- 🌐 Multi-language support
- 📊 Real-time visit monitoring
- 🔍 Advanced search and filtering
- 📱 Mobile-friendly interface

## Tech Stack

- **Backend:**
  - Node.js
  - Express.js
  - TypeScript
  - MongoDB with Mongoose
  - JWT Authentication
  - QR Code Generation

- **Development Tools:**
  - Docker & Docker Compose
  - ESLint
  - Prettier
  - TypeScript

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- Docker & Docker Compose (for containerized deployment)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/faridmohammadi00/entrypoint.git
cd entrypoint
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/entrypoint
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

4. Start the development server:
```bash
npm run dev
```

## Docker Deployment

1. Build the Docker image:
```bash
docker compose build
```

2. Start the containers:
```bash
docker compose up -d
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Building Endpoints

- `POST /api/buildings` - Create a new building
- `GET /api/buildings` - Get all buildings
- `GET /api/buildings/:id` - Get building by ID
- `PUT /api/buildings/:id` - Update building
- `DELETE /api/buildings/:id` - Delete building

### Visitor Endpoints

- `POST /api/visitors` - Register a new visitor
- `GET /api/visitors` - Get all visitors
- `GET /api/visitors/:id` - Get visitor by ID
- `PUT /api/visitors/:id` - Update visitor
- `DELETE /api/visitors/:id` - Delete visitor

### Visit Endpoints

- `POST /api/visits` - Create a new visit
- `GET /api/visits` - Get all visits
- `GET /api/visits/:id` - Get visit by ID
- `PUT /api/visits/:id` - Update visit status
- `DELETE /api/visits/:id` - Delete visit

## Project Structure

## Development

### Running Tests

```bash
npm run test
```

### Code Style

This project uses ESLint and Prettier for code formatting. To format your code:

```bash
npm run lint
npm run format
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@visiteer.com or create an issue in the repository.

## Acknowledgments

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [TypeScript](https://www.typescriptlang.org/)