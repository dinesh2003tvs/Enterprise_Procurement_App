# Workflow Diagram: Procurement & Approval Platform

## End-to-End MVP Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Employee as Employee
    actor Manager as Manager
    actor Finance as Finance
    actor Procurement as Procurement Admin
    participant UI as React Frontend
    participant API as Backend (Express)
    participant SM as State Machine / Rules
    participant DB as PostgreSQL DB
    participant ExtVendor as TechSource API
    participant ExtPay as Payment Gateway

    Note over Employee,UI: 1. Creation & Submission
    Employee->>UI: Fill Request Form (Item, Category, Qty, Price, Justification)
    UI->>API: POST /api/requests (Authorization: Bearer <JWT>)
    API->>SM: Validate inputs & set state = DRAFT
    API->>DB: Save Purchase Request
    DB-->>API: Created (REQ-xxx)
    API-->>UI: 201 Created

    Employee->>UI: Click "Submit Request"
    UI->>API: POST /api/requests/:id/submit
    API->>SM: Transition DRAFT -> SUBMITTED
    API->>DB: Update status = SUBMITTED & record Audit Log
    API-->>UI: 200 OK (Status: SUBMITTED)

    Note over Manager,UI: 2. Manager Approval Phase
    Manager->>UI: View "Manager Approval Queue"
    UI->>API: GET /api/requests/pending-manager
    API->>DB: Query requests where status == SUBMITTED
    DB-->>API: Return pending list
    API-->>UI: Display pending requests
    Manager->>UI: Click Approve with comments
    UI->>API: POST /api/requests/:id/manager-approve { comment: "Approved" }
    API->>SM: Transition SUBMITTED -> MANAGER_APPROVED
    API->>DB: Save Approval record & update request status
    API-->>UI: 200 OK (Status: MANAGER_APPROVED)

    Note over Finance,UI: 3. Finance Approval Phase
    Finance->>UI: View "Finance Approval Queue"
    UI->>API: GET /api/requests/pending-finance
    API->>DB: Query requests where status == MANAGER_APPROVED
    DB-->>API: Return pending list
    Finance->>UI: Check Department Budget & Click Approve
    UI->>API: POST /api/requests/:id/finance-approve { comment: "Budget verified" }
    API->>SM: Transition MANAGER_APPROVED -> FINANCE_APPROVED
    API->>DB: Save Approval record & update request status
    API-->>UI: 200 OK (Status: FINANCE_APPROVED)

    Note over Procurement,UI: 4. Procurement & Vendor Assignment
    Procurement->>UI: View "Procurement Dashboard"
    UI->>API: GET /api/requests/pending-procurement
    API->>DB: Query requests where status == FINANCE_APPROVED
    DB-->>API: Return pending list
    Procurement->>UI: Select Recommended Vendor (TechSource)
    UI->>API: POST /api/requests/:id/vendor { vendor: "TechSource" }
    API->>ExtVendor: Format payload via TechSourceAdapter
    ExtVendor-->>API: Quote Confirmed (TS-1001)
    API->>SM: Transition FINANCE_APPROVED -> PROCUREMENT_STARTED
    API->>DB: Update vendor info & status
    API-->>UI: 200 OK (Status: PROCUREMENT_STARTED)

    Note over Procurement,UI: 5. Payment & Completion Phase
    Procurement->>UI: Click "Simulate Payment (Bank Transfer)"
    UI->>API: POST /api/requests/:id/payment { method: "BANK_TRANSFER", idempotencyKey: "PROCUREMENT-REQ-101" }
    API->>DB: Check if idempotencyKey exists
    alt Not yet paid
        API->>SM: Transition PROCUREMENT_STARTED -> PAYMENT_PENDING
        API->>ExtPay: Execute BankTransferStrategy
        ExtPay-->>API: Success { transactionId: "TXN-98765" }
        API->>SM: Transition PAYMENT_PENDING -> COMPLETED
        API->>DB: Save Payment, update status = COMPLETED, write Audit Log
        API-->>UI: 200 OK (Status: COMPLETED, Txn: TXN-98765)
    else Already paid (Idempotent replay)
        DB-->>API: Existing Payment Record
        API-->>UI: 200 OK (Return existing transactionId without re-charging)
    end
```

## State Machine Transition Rules

| Current Status | Action | Allowed Role | Next Status | Business Rule / Validation |
|---|---|---|---|---|
| `DRAFT` | Submit | `EMPLOYEE` | `SUBMITTED` | All required fields present, qty > 0, price > 0 |
| `DRAFT` | Cancel | `EMPLOYEE` | `CANCELLED` | Request is terminated |
| `SUBMITTED` | Cancel | `EMPLOYEE` | `CANCELLED` | Cancellation allowed before manager takes action |
| `SUBMITTED` | Approve | `MANAGER` | `MANAGER_APPROVED` | Manager belongs to org / team |
| `SUBMITTED` | Reject | `MANAGER` | `REJECTED` | Mandatory rejection comment |
| `MANAGER_APPROVED` | Approve | `FINANCE` | `FINANCE_APPROVED` | Department budget validated |
| `MANAGER_APPROVED` | Reject | `FINANCE` | `REJECTED` | Mandatory rejection comment |
| `FINANCE_APPROVED` | Assign Vendor | `PROCUREMENT_ADMIN` | `PROCUREMENT_STARTED` | Vendor selected (TechSource in MVP) |
| `PROCUREMENT_STARTED` | Pay | `PROCUREMENT_ADMIN` | `PAYMENT_PENDING` $\rightarrow$ `COMPLETED` | Valid payment strategy & idempotency key |
| `REJECTED` | Edit & Resubmit | `EMPLOYEE` | `DRAFT` or `SUBMITTED` | Request can be revived by author |
