# SaludPlus API – Hybrid Persistence Architecture

## Project Overview

SaludPlus API is a backend system that replaces a legacy CSV-based storage model with a scalable and maintainable hybrid persistence architecture.

The system combines:

- PostgreSQL for relational, transactional, and integrity-critical data
- MongoDB for read-optimized patient history documents
- Node.js and Express for REST API development

This architecture ensures data consistency, high performance, and scalability.

---

# Technologies Used

- Node.js 18+
- Express.js 4.x
- PostgreSQL 12+
- MongoDB 6+
- npm
- Postman (for API testing)

---

# Architecture Decisions

## Why Hybrid Architecture?

The system manages two different types of data:

| Data Type | Requirements | Engine |
|------------|--------------|--------|
| Patients, Doctors, Insurances | Strong consistency, uniqueness, relationships | PostgreSQL |
| Appointments & Financial Data | ACID transactions, precise aggregations | PostgreSQL |
| Patient Histories (read-heavy) | Fast retrieval, no joins, flexible schema | MongoDB |

PostgreSQL acts as the **source of truth**.

MongoDB stores **denormalized read models** optimized for performance.

---

# PostgreSQL Design

## Normalization

The relational schema follows:

- 1NF – Atomic columns
- 2NF – No partial dependencies
- 3NF – No transitive dependencies

## Tables

### patients
- id (Primary Key)
- name
- email (Unique)
- phone
- address
- created_at

### doctors
- id (Primary Key)
- name
- email (Unique)
- specialty
- created_at

### insurances
- id (Primary Key)
- name (Unique)
- coverage_percentage

### appointments
- id (Primary Key)
- appointment_id (Unique)
- appointment_date
- patient_id (Foreign Key → patients.id)
- doctor_id (Foreign Key → doctors.id)
- insurance_id (Foreign Key → insurances.id)
- treatment_code
- treatment_description
- treatment_cost
- amount_paid
- created_at

## Indexes

- patients.email
- doctors.email
- appointments.appointment_date
- appointments.patient_id
- appointments.insurance_id

---

# MongoDB Design

## Collection: patient_histories

Each document stores the full appointment history of a patient.

Example structure:

```json
{
  "patientEmail": "valeria.g@mail.com",
  "patientName": "Valeria Gomez",
  "appointments": [
    {
      "appointmentId": "APT-1001",
      "date": "2024-01-07",
      "doctorName": "Dr. Carlos Ruiz",
      "doctorEmail": "c.ruiz@saludplus.com",
      "specialty": "Cardiology",
      "treatmentCode": "TRT-007",
      "treatmentDescription": "Skin Treatment",
      "treatmentCost": 200000,
      "insuranceProvider": "ProteccionMedica",
      "coveragePercentage": 60,
      "amountPaid": 80000
    }
  ]
}