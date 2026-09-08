# Design Decisions & Architectural Pattern Rationales

This document outlines the rationale behind every major architectural and pattern decision implemented across the Enterprise Procurement Platform, following the required Capstone specification format.

---

## 1. Vendor Integration

- **Problem**: 
  Different third-party procurement vendors (`TechSource`, `OfficeMart`, `EnterpriseSupply`) expose incompatible API schemas, parameter names, and authentication standards (e.g. `productCode` & `units` vs. `sku` & `quantityRequested` vs. nested `item.code` & `item.qty`).
- **Chosen Approach**: 
  **Adapter Pattern** (`TechSourceAdapter`, `OfficeMartAdapter`, `EnterpriseSupplyAdapter` extending a unified `VendorAdapter` interface).
- **Reason**: 
  Shields the core procurement service from vendor-specific payload variations. Adding new vendors or changing existing external vendor contracts requires modifying only that vendor's adapter, leaving core procurement workflows untouched.
- **Alternative Considered**: 
  Large procedural `switch/case` or `if/else` block inside the procurement service.
- **Impact**: 
  Achieves the Open-Closed Principle (OCP). The procurement domain code remains clean, cohesive, and extensible.

---

## 2. Payment Processing & Multi-Method Support

- **Problem**: 
  Enterprise procurement requires supporting diverse settlement mechanisms (`Bank Transfer`, `Corporate Card`, `Digital Payment`), each executing distinct authorization workflows, protocol formats, and provider endpoints while maintaining strict duplicate prevention.
- **Chosen Approach**: 
  **Strategy Pattern** combined with **Idempotency Keys** (`BankTransferStrategy`, `CorporateCardStrategy`, `DigitalPaymentStrategy` implementing a common `PaymentStrategy` interface).
- **Reason**: 
  Decouples the execution algorithm of individual payment gateways from the payment orchestration service. The idempotency key ensures that retrying a failed or timed-out network call will return the existing successful transaction rather than charging twice.
- **Alternative Considered**: 
  Hardcoding payment calls in a monolithic payment controller with conditional branches for each payment type.
- **Impact**: 
  Any payment method can be swapped, mocked, or enhanced without altering the order closure lifecycle.

---

## 3. Purchase Request Lifecycle & State Management

- **Problem**: 
  Purchase requests undergo multi-stage approvals across multiple actors (`Employee`, `Manager`, `Finance`, `Procurement`). Uncontrolled or out-of-order state mutations (e.g. attempting to complete an unapproved request or cancelling an order already dispatched to vendors) cause financial discrepancies and compliance violations.
- **Chosen Approach**: 
  **Finite State Machine (FSM) / State Pattern** (`domain/stateMachine.js`).
- **Reason**: 
  Centralizes valid transitions into a single source of truth. Invalid transitions are rejected deterministically before any database write or side effect can take place.
- **Alternative Considered**: 
  Ad-hoc boolean checks scattered across individual route handlers and database queries.
- **Impact**: 
  Eliminates race conditions and invalid transitions. Simplifies auditing and debugging of status history.

---

## 4. Notifications and Audit Trails

- **Problem**: 
  Every approval, rejection, payment, or state change must generate audit records and dispatch stakeholder notifications without creating tight coupling or blocking critical transactional workflows if external notification channels (Email, SMS) fail.
- **Chosen Approach**: 
  **Observer Pattern / Domain EventBus** (`events/eventBus.js`).
- **Reason**: 
  Core services emit domain events (e.g., `REQUEST_SUBMITTED`, `MANAGER_APPROVED`). Separate subscribers (`AuditHandler`, `NotificationHandler`) consume events independently. Notification delays or network drops do not stall database transactions.
- **Alternative Considered**: 
  Synchronous in-line calls to email/audit routines inside controllers.
- **Impact**: 
  Ensures graceful degradation. Even if an external notification fails, the failure is logged and the core procurement process continues unimpeded.

---

## 5. Resilience & External Service Fault Tolerance

- **Problem**: 
  External services (Budget service, third-party vendor APIs, banking gateways) suffer from intermittent latencies, HTTP 500 errors, and timeouts (e.g., simulated 20% failure and 10% timeout on budget checks).
- **Chosen Approach**: 
  **Resilience Suite: Timeout, Retry with Exponential Backoff, and Circuit Breaker** (`utils/circuitBreaker.js`, `utils/retryWithBackoff.js`).
- **Reason**: 
  A Circuit Breaker prevents the application from repeatedly hammering a down service. The 3-state machine (`CLOSED`, `OPEN`, `HALF-OPEN`) allows the service to recover gracefully while returning immediate fallback responses to the user.
- **Alternative Considered**: 
  Unbounded retry loops or unhandled promises that hang threads and crash the server.
- **Impact**: 
  High availability, predictable response times, and resilience against cascading microservice failures.

---

## 6. Centralized Error Handling & Uniform Error Contract

- **Problem**: 
  Unstandardized error formats (raw database errors, stack traces, inconsistent JSON payloads) confuse frontend clients and leak implementation details.
- **Chosen Approach**: 
  **Custom Domain Exceptions + Centralized Express Error Middleware**.
  All errors follow the specification contract:
  ```json
  {
    "success": false,
    "code": "ERROR_CODE",
    "message": "Human readable description"
  }
  ```
- **Reason**: 
  Guarantees consistent parsing on the frontend, clean mapping to HTTP status codes (400, 401, 403, 404, 500), and automated logging of unexpected exceptions.
- **Alternative Considered**: 
  Ad-hoc `try/catch` blocks in every controller returning arbitrary JSON structures.
- **Impact**: 
  Predictable frontend state management, effortless error toast messaging, and secure error boundaries.

---

## 7. Cloud Deployment Architecture

- **Problem**: 
  Deploying a multi-tier enterprise application (React SPA, Node.js API, PostgreSQL database) with continuous deployment, high uptime, and zero infrastructure cost.
- **Chosen Approach**: 
  - **Frontend**: Vercel (Edge CDN, automatic build on push, `vercel.json` SPA rewrites).
  - **Backend**: Render / Railway (Managed Node.js container with `/api/health` probes and environment secret management).
  - **Database**: Supabase / Neon (Serverless PostgreSQL with SSL connection pooling).
- **Reason**: 
  Free, enterprise-grade cloud providers with native GitHub continuous integration. Code pushed to GitHub automatically triggers verified builds without manual server configuration.
- **Alternative Considered**: 
  Manual self-hosted VPS (DigitalOcean / AWS EC2) requiring OS updates, reverse proxies, and continuous maintenance.
- **Impact**: 
  Zero cost, instant deployment on `git push`, high performance, and rapid review turnaround.
