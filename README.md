# Crypto Alert Service

A Node.js (Fastify) service that allows users to register, log in, and create various **crypto price alerts**. The service checks cryptocurrency prices at intervals, triggers alerts when conditions are met, and logs alert history. This project also provides **Swagger** documentation and a **Postman** collection for easy API testing.

---

## Table of Contents

- [Overview](#overview)  
- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Project Structure](#project-structure)  
- [Environment Variables](#environment-variables)  
- [Installation](#installation)  
- [Docker Usage](#docker-usage)  
- [Database Migrations & Seeds](#database-migrations--seeds)  
- [API Documentation](#api-documentation)  
  - [Postman Collection](#postman-collection)  
  - [Swagger](#swagger)  
- [Testing](#testing)
- [Contributing](#contributing)  
- [License](#license)

---

## Overview

This project implements a **Crypto Price Alert** backend where users can:

- **Register** and **log in** using JWT-based authentication.  
- Create and manage alerts for different cryptos (BTC, ETH, DOGE, etc.) using conditions like `above`, `below`, `range`, or `percentage_drop`.  
- Receive notifications (currently a placeholder for email) when conditions trigger.  
- View a history of triggered alerts.

A scheduled cron job checks prices at intervals (using CoinGecko) and **triggers alerts** if conditions are met. It uses:

- **PostgreSQL** for data storage  
- **Redis** for refresh token storage & caching  
- **Sequelize** for ORM & migrations  
- **Docker Compose** to spin up containers quickly  

---

## Features

1. **Authentication**  
   - Register, login, refresh, logout  
   - JWT for access tokens, Redis for refresh tokens  

2. **Alerts**  
   - Condition types: `above`, `below`, `range`, `percentage_drop`  
   - `isActive = false` once triggered, if desired  

3. **Alert History**  
   - Logs triggered alerts, timestamps, messages  

4. **Cron-based Price Checker**  
   - Uses CoinGecko to fetch prices at intervals (via `priceChecker.js`)  
   - Supports historical price fetching for percentage checks  

5. **Docker**  
   - Dockerfile and docker-compose.yml for environment setup  

6. **API Documentation**  
   - **Swagger** in `swagger.yaml`  
   - **Postman collection** (`docs/Crypto Alert.postman_collection.json`)

---

## Tech Stack

- **Node.js** / **Fastify** for the server.  
- **PostgreSQL** as the main database.  
- **Redis** for caching and refresh tokens.  
- **Sequelize** for ORM, migrations, seeds.  
- **JWT** for authentication.  
- **Nodemailer** for (placeholder) email notifications.  
- **Docker** & **Docker Compose** for containerization.  
- **Swagger** / **Postman** for API documentation/testing.

---

## Project Structure

A simplified view of key folders/files:

```
crypto-alert-service/
├── Dockerfile
├── LICENSE
├── README.md
├── docker-compose.yml
├── docs/
│   └── Crypto Alert.postman_collection.json
├── logs/
├── package-lock.json
├── package.json
├── src/
│   ├── config/
│   │   └── config.js           # Sequelize config (dev/test/prod)
│   ├── controllers/
│   │   ├── alertController.js
│   │   ├── alertHistoryController.js
│   │   └── authController.js
│   ├── index.js                # Main entrypoint (Fastify server)
│   ├── migrations/             # Sequelize migrations
│   ├── models/                 # Sequelize models
│   ├── repositories/
│   ├── routes/
│   ├── seeders/                # Sequelize seed files
│   ├── services/
│   │   ├── priceChecker.js     # Cron job
│   │   ├── notificationService.js
│   │   ├── redisClient.js
│   │   └── ...
│   ├── utils/
│   │   └── logger.js
│   └── validations/
│       ├── alerValidation.js
│       └── authValidation.js
└── swagger.yaml                # Swagger definition
```

---

## Environment Variables

A typical `.env` might look like this:

```bash
# JWT
JWT_SECRET=yourSecretHere

# Postgres
DB_HOST=db
DB_USER=postgres
DB_PASS=example
DB_NAME=database_development
DB_PORT=5432

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Email
EMAIL_USER=example@gmail.com
EMAIL_PASS=yourpassword

# Bcrypt
SALT_ROUNDS=10

# Access / Refresh Token Expiry
ACCESS_TOKEN_EXP=45m
REFRESH_TOKEN_EXP=604800

# Server
PORT=3000
HOST=0.0.0.0
```

Load these in your code with `require('dotenv').config()` or via Docker Compose’s `env_file:` setting.

---

## Installation

### Local (non-Docker) Setup

1. **Install Dependencies**  
   ```bash
   npm install
   ```
2. **Configure Databases**  
   - PostgreSQL @ `localhost:5432`  
   - Redis @ `localhost:6379`  
3. **Create `.env`**  
   - Adjust DB_HOST, DB_USER, DB_PASS, etc.  
4. **Migrate & Seed**  
   ```bash
   npx sequelize-cli db:migrate
   npx sequelize-cli db:seed:all
   ```
5. **Start Server**  
   ```bash
   npm start
   # or node src/index.js
   ```
6. **Access** at `http://localhost:3000`.

---

## Docker Usage

1. **Build & Run**  
   ```bash
   docker-compose up --build
   ```
   This starts three containers:
   - **db** (Postgres)
   - **redis** (Redis)
   - **app** (Node.js server)

2. **Ports**  
   - App on `http://localhost:3000`  
   - Postgres on `5432`  
   - Redis on `6379`

3. **Migrations & Seeds** (if you need to run them inside the container)  
   ```bash
   docker-compose run --rm app npx sequelize-cli db:migrate
   docker-compose run --rm app npx sequelize-cli db:seed:all
   ```
4. **Stop**  
   ```bash
   docker-compose down
   ```

---

## Database Migrations & Seeds

- **Migrations** are in `src/migrations`. E.g.:
  ```bash
  npx sequelize-cli model:generate --name User --attributes email:string,password:string
  ```
- **Seeds** are in `src/seeders`. E.g.:
  ```bash
  npx sequelize-cli seed:generate --name seed-users
  ```
- **Apply**:
  ```bash
  npx sequelize-cli db:migrate
  npx sequelize-cli db:seed:all
  ```
- In Docker:
  ```bash
  docker-compose run --rm app npx sequelize-cli db:migrate
  docker-compose run --rm app npx sequelize-cli db:seed:all
  ```

---

## API Documentation

### Postman Collection

In `docs/Crypto Alert.postman_collection.json`, you’ll find a Postman collection to test:

- Auth (Register, Login, Refresh, Logout)  
- Alerts (Create, List, Delete)  
- AlertHistory (View triggered alerts)

**Usage**:  
1. Open Postman, **Import** → `Crypto Alert.postman_collection.json`  
2. Set environment variables (API base URL, tokens) if needed  
3. Make requests to your local or Docker-based server

### Swagger

A **`swagger.yaml`** file is included in the root. This provides an **OpenAPI** definition:

- You can serve it with `@fastify/swagger` or any OpenAPI viewer.  
- Endpoints, request bodies, response schemas are documented for easy reference.

---

## Testing

A small test suite is provided under `__tests__`. For instance, `alerts.init.test.js` verifies alert endpoints. To run the tests locally:

```bash
npm test
```

- Make sure you have a test database configured if tests require real DB operations.
- You can also use Docker Compose for testing, e.g. `docker-compose run --rm app npm test`.
