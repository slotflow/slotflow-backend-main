 <div align="center">

# SlotFlow Main Backend

### The core engine behind SlotFlow.

The central backend microservice powering SlotFlow's appointment booking workflows, provider management, subscriptions, payments, account operations, and event-driven business logic.

<img src="https://img.shields.io/badge/Service-Core_Backend-6C63FF?style=for-the-badge" alt="Core Backend" />
<img src="https://img.shields.io/badge/Architecture-Microservices-6C63FF?style=for-the-badge" alt="Microservices" />
<img src="https://img.shields.io/badge/Runtime-Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
<img src="https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
<img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />

---

### Live Link & Repositories

<a href="https://slotflow.online">
  <img src="https://img.shields.io/badge/Live_Application-SlotFlow-181717?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Application" />
</a>
<a href="https://github.com/slotflow">
  <img src="https://img.shields.io/badge/GitHub-SlotFlow-181717?style=for-the-badge&logo=github&logoColor=white" alt="SlotFlow GitHub" />
</a>

### Technology Stack

<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
<img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
<img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
<img src="https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white" alt="Mongoose" />
<img src="https://img.shields.io/badge/Apache_Kafka-231F20?style=for-the-badge&logo=apachekafka&logoColor=white" alt="Apache Kafka" />
<img src="https://img.shields.io/badge/KafkaJS-231F20?style=for-the-badge&logo=apachekafka&logoColor=white" alt="KafkaJS" />
<img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
<img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
<img src="https://img.shields.io/badge/OpenTelemetry-7B3FF2?style=for-the-badge&logo=opentelemetry&logoColor=white" alt="OpenTelemetry" />
<img src="https://img.shields.io/badge/Tempo-F46800?style=for-the-badge&logo=grafana&logoColor=white" alt="Grafana Tempo" />
<img src="https://img.shields.io/badge/Loki-F46800?style=for-the-badge&logo=grafana&logoColor=white" alt="Grafana Loki" />
<img src="https://img.shields.io/badge/Prometheus-E6522C?style=for-the-badge&logo=prometheus&logoColor=white" alt="Prometheus" />
<img src="https://img.shields.io/badge/Grafana-F46800?style=for-the-badge&logo=grafana&logoColor=white" alt="Grafana" />
<img src="https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge" alt="Zod" />
<img src="https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm" />
<img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
<img src="https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white" alt="AWS" />

</div>

---

## Overview

The **SlotFlow Main Backend** is the central business logic service within the SlotFlow appointment booking platform. It manages the core application workflows that connect customers, service providers.

Built with Node.js, TypeScript, Express, and MongoDB, the service organizes business operations into modular application layers and integrates with supporting services through HTTP communication and asynchronous messaging.

Apache Kafka enables event-driven workflows across the SlotFlow ecosystem, while MongoDB provides persistent storage for application data and business records.

The service works alongside the SlotFlow API Gateway, Socket Service, Payment Service, Notification Service, and infrastructure components to support the platform's end-to-end appointment lifecycle.

---

## Core Features

### User & Account Management

- Customer and service provider account management
- Registration and email verification workflows
- Google authentication integration
- Role-based access control
- User profile management
- Provider onboarding and verification workflows
- Account status and lifecycle management

### Provider Management

- Provider profile and service information management
- Service category and specialization management
- Provider experience, pricing, and portfolio details
- Service delivery mode configuration
- Availability and working schedule management
- Provider verification and onboarding
- Provider discovery and filtering

### Appointment Management

- Appointment booking and lifecycle management
- Customer and provider appointment coordination
- Provider availability and time-slot management
- Appointment status transitions
- Booking-related validation and business rules
- Cancellation workflows
- Appointment history management

### Payment Management

- Appointment payment workflows
- Payment status tracking
- Payment record management
- Payment-related business validation
- Integration with the SlotFlow Payment Service
- Refund-related appointment workflows
- Payment event processing

### Subscription Management

- Provider subscription plans
- Subscription lifecycle management
- Subscription status tracking
- Trial and paid subscription workflows
- Subscription payment event processing
- Provider feature access based on subscription status
- Subscription-related account updates

### Event-Driven Processing

- Apache Kafka integration
- Kafka event consumption and processing
- Typed event payloads
- Event-specific business handlers
- Processed-event tracking
- Retry and failure-handling workflows
- Integration with payment, notification, and socket services

### Supporting Business Workflows

- Referral-related operations
- Customer credit management
- Booking and payment history
- Account-related business operations
- Policy and application data management
- Coordination between core business modules

---

## Technology Stack

### Runtime & Backend

<p align="left">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm" />
</p>

### Database & Messaging

<p align="left">
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white" alt="Mongoose" />
  <img src="https://img.shields.io/badge/Apache_Kafka-231F20?style=for-the-badge&logo=apachekafka&logoColor=white" alt="Apache Kafka" />
  <img src="https://img.shields.io/badge/KafkaJS-231F20?style=for-the-badge&logo=apachekafka&logoColor=white" alt="KafkaJS" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
</p>

### Authentication & Validation

<p align="left">
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge" alt="Zod" />
  <img src="https://img.shields.io/badge/Google_Authentication-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google Authentication" />
</p>

### Infrastructure & Deployment

<p align="left">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white" alt="AWS" />
</p>

---

## Architecture

The Main Backend serves as the core business processing layer of the SlotFlow platform. It coordinates account management, provider operations, appointments, subscriptions, and related workflows while communicating with supporting services.

```mermaid
flowchart TD
    Client["SlotFlow Client"] --> Gateway["SlotFlow API Gateway"]
    Gateway --> Backend["SlotFlow Main Backend"]

    Backend <--> MongoDB[("MongoDB")]
    Backend <--> Redis[("Redis")]

    Backend <--> Kafka[["Apache Kafka"]]

    Kafka <--> Payment["Payment Service"]
    Kafka <--> Notification["Notification Service"]
    Kafka <--> Socket["Socket Service"]

    Backend --> Business["Business Workflows"]
    Business --> Users["User & Provider Management"]
    Business --> Appointments["Appointment Management"]
    Business --> Subscriptions["Subscription Management"]
    Business --> Payments["Payment Management"]
```

### Architecture Principles

- Modular separation of business responsibilities
- Layered application structure
- TypeScript-based domain and application logic
- MongoDB-backed persistent business data
- Kafka-based asynchronous service communication
- Event-specific processing handlers
- Integration with supporting SlotFlow microservices
- Centralized configuration and shared utilities

---

## Event-Driven Architecture

Apache Kafka supports asynchronous communication between the Main Backend and other SlotFlow services.

The backend processes event payloads through event-specific handlers that connect incoming messages to their corresponding application use cases.

### Event Processing Capabilities

- Kafka consumer integration
- Configurable topics and consumer groups
- Event-specific payload types
- Typed event handler registration
- Application use-case execution
- Processed-event tracking
- Retry and failure-handling workflows
- Coordination with payment, notification, and socket services

### Event Processing Flow

```mermaid
flowchart TD
    Producer["Service Event Producer"] --> Kafka[["Apache Kafka"]]
    Kafka --> Consumer["Kafka Consumer"]
    Consumer --> Controller["Event Controller"]
    Controller --> Handler["Typed Event Handler"]
    Handler --> UseCase["Application Use Case"]
    UseCase --> Database[("MongoDB")]
    UseCase --> Tracking["Processed Event Tracking"]
```

This architecture keeps event transport separate from business processing and allows event-specific workflows to be maintained independently.

---

## Security & Authentication

The backend incorporates authentication, authorization, and request validation into its application workflows.

### Authentication

- Email-based registration and verification
- Google authentication integration
- JWT-based authentication
- Role-aware access control
- Authenticated account operations

### Authorization

- Customer and provider role handling
- Provider-specific business operations
- Access control for protected application workflows
- Subscription-aware provider functionality

### Request Validation

Zod and TypeScript support request validation and data contracts across relevant application boundaries.

---

## Project Structure

The backend follows a modular structure that separates presentation, application logic, domain responsibilities, infrastructure integrations, and shared components.

```text
slotflow-backend-main/
│
├── src/
│   ├── presentation/
│   ├── application/
│   ├── domain/
│   ├── infrastructure/
│   ├── shared/
│   ├── config/
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
```

The directory overview illustrates the main architectural boundaries. Keep the exact file tree aligned with the repository's current source structure.

---

## Related Services

The Main Backend works with other services in the SlotFlow ecosystem.

<p align="left">
  <a href="https://github.com/slotflow/slotflow-client">
    <img src="https://img.shields.io/badge/Frontend-slotflow--client-181717?style=for-the-badge&logo=github&logoColor=white" alt="SlotFlow Client" />
  </a>
  <a href="https://github.com/slotflow/slotflow-api-gateway">
    <img src="https://img.shields.io/badge/API_Gateway-slotflow--api--gateway-181717?style=for-the-badge&logo=github&logoColor=white" alt="SlotFlow API Gateway" />
  </a>
  <a href="https://github.com/slotflow/slotflow-socket">
    <img src="https://img.shields.io/badge/Socket_Service-slotflow--socket-181717?style=for-the-badge&logo=github&logoColor=white" alt="SlotFlow Socket Service" />
  </a>
  <a href="https://github.com/slotflow/slotflow-payment">
    <img src="https://img.shields.io/badge/Payment_Service-slotflow--payment-181717?style=for-the-badge&logo=github&logoColor=white" alt="SlotFlow Payment Service" />
  </a>
  <a href="https://github.com/slotflow/slotflow-api-notification">
    <img src="https://img.shields.io/badge/Notification_Service-slotflow--api--notification-181717?style=for-the-badge&logo=github&logoColor=white" alt="SlotFlow Notification Service" />
  </a>
  <a href="https://github.com/slotflow/slotflow-infra">
    <img src="https://img.shields.io/badge/Infrastructure-slotflow--infra-181717?style=for-the-badge&logo=github&logoColor=white" alt="SlotFlow Infrastructure" />
  </a>
</p>

---

## Project Highlights

- Central business logic service for SlotFlow
- Modular TypeScript and Node.js architecture
- Customer and provider account management
- Provider discovery and service management
- Appointment booking and lifecycle workflows
- Payment and subscription business operations
- MongoDB-backed application data
- Kafka-based event-driven processing
- Event-specific typed handlers
- Processed-event tracking and failure handling
- Integration with payment, notification, and socket services
- Authentication, authorization, and request validation

---

## License

**Proprietary — All Rights Reserved**

Copyright © 2026 SlotFlow.

The SlotFlow Main Backend source code and associated assets are proprietary property of SlotFlow Technologies Private Limited.

No permission is granted to use, copy, modify, redistribute, sublicense, or commercialize this software without explicit written permission from SlotFlow.

All rights reserved.

---

<div align="center">

### SlotFlow Main Backend

**The core engine behind SlotFlow.**

<a href="https://slotflow.online">Live Application</a>
·
<a href="https://github.com/slotflow">GitHub Organization</a>

© 2026 SlotFlow Technologies Private Limited

</div>
