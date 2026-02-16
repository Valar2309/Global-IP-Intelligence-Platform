# 🌐 Global IP Intelligence Platform

A full-stack web application built using **Spring Boot (Backend)** and **React (Frontend)** with **JWT-based authentication**.

---

## 🚀 Tech Stack

### Backend
- Java
- Spring Boot
- Spring Security
- JWT
- Maven

### Frontend
- React
- React Router
- Vite
- JavaScript

---

## 🔐 Authentication Flow

This project uses JWT-based authentication.

### Flow

1. User sends login request to `/auth/login`
2. Backend validates credentials
3. Backend generates JWT token
4. Token must be sent in protected API calls:

```
Authorization: Bearer <your_token>
```

5. Backend validates token before granting access

If token is missing or invalid, access is denied (HTTP 403).

---

## ⚙️ Running the Project

### Start Backend

```bash
cd backend
mvnw.cmd spring-boot:run
```

Backend runs at:

```
http://localhost:8081
```

---

### Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## 🧪 Testing Secure Endpoint

### Step 1 – Login

POST request to:

```
http://localhost:8081/auth/login
```

Body:

```json
{
  "username": "admin",
  "password": "password"
}
```

Response:

```json
{
  "token": "your_jwt_token_here"
}
```

---

### Step 2 – Access Protected Endpoint

GET request to:

```
http://localhost:8081/secure/hello
```

Add header:

```
Authorization: Bearer your_jwt_token_here
```

Response:

```
You accessed a protected endpoint!
```

---

