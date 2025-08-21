 # Pharmacy Prescription System

A comprehensive backend API for managing pharmacy prescriptions, built with Express.js, PostgreSQL, and TypeScript.

## Features

- **Patient Management**: Create, read, update, and search patient profiles
- **Prescription Management**: Handle prescriptions with status tracking (pending → filled → picked-up)
- **Inventory Management**: Track medication stock with low stock alerts
- **Wallet System**: Manage patient wallets with credit/debit operations
- **Appointment Booking**: Schedule consultations and pickup appointments
- **RESTful API**: Clean, well-documented endpoints with proper error handling
- **Data Validation**: Comprehensive input validation using Joi
- **Rate Limiting**: API protection against abuse
- **Database Relationships**: Proper foreign key constraints and associations

## Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Sequelize ORM
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting
- **Development**: ts-node, nodemon

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pharmacy-prescription-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=pharmacy_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=your_secret_key
   ```

4. **Database Setup**
   ```bash
   # Create database (run in PostgreSQL)
   createdb pharmacy_db
   
   # Run migrations
   npm run migrate
   ```

5. **Start the application**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm run build
   npm start
   ```

## Database Schema

### Tables Overview

- **patients**: Store patient information
- **medications**: Medication inventory
- **prescriptions**: Prescription records with status tracking
- **wallets**: Patient wallet balances
- **transactions**: Wallet transaction history
- **appointment_slots**: Available time slots
- **bookings**: Appointment bookings

### Key Relationships

- Patient → Wallet (1:1)
- Patient → Prescriptions (1:N)
- Patient → Bookings (1:N)
- Wallet → Transactions (1:N)
- AppointmentSlot → Bookings (1:N)

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Patients API

#### Create Patient
```http
POST /api/patients
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-15"
}
```

#### Get All Patients
```http
GET /api/patients?page=1&limit=10
```

#### Search Patients
```http
GET /api/patients/search?name=John&email=john@example.com
```

#### Get Patient by ID
```http
GET /api/patients/{id}
```

#### Update Patient
```http
PUT /api/patients/{id}
Content-Type: application/json

{
  "name": "Jane Doe",
  "phone": "+1234567891"
}
```

### Prescriptions API

#### Create Prescription
```http
POST /api/prescriptions
Content-Type: application/json

{
  "patientId": "uuid",
  "medicationName": "Paracetamol 500mg",
  "dosage": "1 tablet",
  "quantity": 30,
  "instructions": "Take twice daily after meals",
  "prescribedBy": "Dr. Smith"
}
```

#### Get All Prescriptions
```http
GET /api/prescriptions?patientId=uuid&status=pending&page=1&limit=10
```

#### Update Prescription Status
```http
PUT /api/prescriptions/{id}/status
Content-Type: application/json

{
  "status": "filled"
}
```

### Medications API

#### Create Medication
```http
POST /api/medications
Content-Type: application/json

{
  "name": "Paracetamol 500mg",
  "stockQuantity": 100,
  "unitPrice": 5.50,
  "description": "Pain relief medication"
}
```

#### Get Low Stock Medications
```http
GET /api/medications/low-stock?threshold=10
```

#### Restock Medication
```http
POST /api/medications/{id}/restock
Content-Type: application/json

{
  "quantity": 50
}
```

### Wallet API

#### Get Wallet Balance
```http
GET /api/wallets/{patientId}/balance
```

#### Add Funds
```http
POST /api/wallets/{patientId}/add-funds
Content-Type: application/json

{
  "amount": 100.00
}
```

#### Process Payment
```http
POST /api/wallets/{patientId}/payment
Content-Type: application/json

{
  "amount": 25.50,
  "description": "Prescription payment",
  "referenceId": "prescription-uuid"
}
```

#### Get Transaction History
```http
GET /api/wallets/{patientId}/transactions?type=credit&page=1&limit=10
```

### Appointments API

#### Create Appointment Slot
```http
POST /api/appointments/slots
Content-Type: application/json

{
  "date": "2024-12-25",
  "startTime": "09:00:00",
  "endTime": "09:30:00",
  "serviceType": "consultation"
}
```

#### Get Available Slots
```http
GET /api/appointments/slots/available?date=2024-12-25&serviceType=consultation
```

#### Book Appointment
```http
POST /api/appointments/book
Content-Type: application/json

{
  "patientId": "uuid",
  "slotId": "uuid",
  "notes": "Follow-up consultation"
}
```

#### Cancel Booking
```http
PUT /api/appointments/bookings/{id}/cancel
```

## Error Handling

The API uses standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "details": [
    {
      "field": "email",
      "message": "Invalid email format",
      "value": "invalid-email"
    }
  ]
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `409` - Conflict (duplicate resources)
- `429` - Too Many Requests
- `500` - Internal Server Error

## Testing

Sample data is automatically inserted when running migrations. Use these for testing:

### Sample Patients
- **John Doe**: john.doe@email.com
- **Jane Smith**: jane.smith@email.com

### Sample Medications
- **Paracetamol 500mg**: Stock 100, Price $5.50
- **Ibuprofen 400mg**: Stock 75, Price $8.20
- **Lisinopril 10mg**: Stock 8 (low stock), Price $15.75

## Features Demonstration

### 1. Patient Management
```bash
# Create a patient
curl -X POST http://localhost:3000/api/patients \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Patient","email":"test@example.com","phone":"+1234567890","dateOfBirth":"1990-01-01"}'

# Search patients
curl "http://localhost:3000/api/patients/search?name=Test"
```

### 2. Prescription Workflow
```bash
# Create prescription
curl -X POST http://localhost:3000/api/prescriptions \
  -H "Content-Type: application/json" \
  -d '{"patientId":"patient-uuid","medicationName":"Paracetamol 500mg","dosage":"1 tablet","quantity":10}'

# Update to filled (reduces stock)
curl -X PUT http://localhost:3000/api/prescriptions/prescription-uuid/status \
  -H "Content-Type: application/json" \
  -d '{"status":"filled"}'
```

### 3. Wallet Operations
```bash
# Add funds
curl -X POST http://localhost:3000/api/wallets/patient-uuid/add-funds \
  -H "Content-Type: application/json" \
  -d '{"amount":100.00}'

# Process payment
curl -X POST http://localhost:3000/api/wallets/patient-uuid/payment \
  -H "Content-Type: application/json" \
  -d '{"amount":25.50,"description":"Prescription payment"}'
```

### 4. Appointment Booking
```bash
# Create slot
curl -X POST http://localhost:3000/api/appointments/slots \
  -H "Content-Type: application/json" \
  -d '{"date":"2024-12-25","startTime":"09:00:00","endTime":"09:30:00","serviceType":"consultation"}'

# Book appointment
curl -X POST http://localhost:3000/api/appointments/book \
  -H "Content-Type: application/json" \
  -d '{"patientId":"patient-uuid","slotId":"slot-uuid","notes":"Regular checkup"}'
```

## 🚦 Rate Limiting

- **General endpoints**: 100 requests per 15 minutes
- **Sensitive operations**: 20 requests per 15 minutes

---
