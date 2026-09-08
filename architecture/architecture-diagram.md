# High-Level Architecture Diagram

## System Context & Interactions

```mermaid
graph TB
    subgraph Client Tier
        Browser["User Browser"]
        ReactApp["React Frontend (Vite + Tailwind CSS)\n- Role-based UI\n- Dynamic Stepper\n- Status Feedback (Loading/Success/Empty/Error)"]
        Browser --> ReactApp
    end

    subgraph Edge & Routing Tier
        VercelCDN["Vercel Edge Network\n- SPA Rewrites (vercel.json)\n- HTTPS Caching"]
        ReactApp -. Hosted on .-> VercelCDN
    end

    subgraph Application Tier (Node.js / Express on Render/Railway)
        Routes["API Routes Layer (/api/*)\n- Auth Routes\n- Request Routes\n- Approval Routes\n- Payment Routes\n- Health Check (/api/health)"]
        
        MW["Middleware Layer\n- JWT Authentication\n- RBAC (Role-Based Access Control)\n- Centralized Error Handler\n- CORS & Logging"]
        
        Controllers["Controller Layer\n- Input Validation\n- HTTP Request/Response Handling"]
        
        Services["Service Layer (Business Logic)\n- AuthService\n- RequestService\n- ApprovalService\n- PaymentService\n- VendorService"]
        
        Domain["Domain Logic\n- State Machine & Transition Rules\n- Approval Threshold Rules\n- Validation Rules"]
        
        Repositories["Repository Layer (Data Abstraction)\n- UserRepository\n- RequestRepository\n- AuditRepository"]

        Routes --> MW
        MW --> Controllers
        Controllers --> Services
        Services --> Domain
        Services --> Repositories
    end

    subgraph Integration Layer (External Simulated Services)
        TechSource["TechSource Vendor Adapter\n(Adapter Pattern)"]
        BankTransfer["Bank Transfer Payment Strategy\n(Strategy Pattern + Idempotency)"]
        AuditTrail["Audit Logger\n(Observer Pattern / EventBus)"]

        Services --> TechSource
        Services --> BankTransfer
        Services --> AuditTrail
    end

    subgraph Data Tier
        DB[("PostgreSQL Database (Supabase / Neon)\n- users\n- purchase_requests\n- approvals\n- payments\n- audit_logs")]
        Repositories --> DB
    end

    ReactApp -->|REST API calls with JWT Bearer Token| Routes
```

## Layered Backend Responsibility Matrix

| Layer | Responsibility | What it Must NOT Do |
|---|---|---|
| **Routes** | URL mapping, HTTP method routing, attaching middleware | No business logic or database queries |
| **Middleware** | JWT verification, RBAC permissions, error formatting | No entity state modification |
| **Controllers** | Parsing request parameters, schema validation, HTTP responses | No direct DB queries, no complex business orchestration |
| **Services** | Core business workflows, coordinating domain and external APIs | No direct HTTP request/response handling |
| **Domain** | Pure business rules, state transition validity, threshold calculations | No database access or network I/O |
| **Repositories** | Data access, CRUD operations, query optimization | No business validation rules |
| **Database** | Data persistence, relational integrity, constraints | N/A |

