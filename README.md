# Spring Boot E-Commerce Microservices

A backend for an online store, built as a set of independently deployable Spring Boot microservices rather than a single monolith. Services communicate synchronously over REST (via Feign, resolved through Eureka) and asynchronously via Kafka events, and all client traffic enters through a single API Gateway.

## Table of Contents

- [Architecture](#architecture)
- [Services](#services)
- [Tech Stack](#tech-stack)
- [Request Flow: Placing an Order](#request-flow-placing-an-order)
- [Security](#security)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Configuration Reference](#configuration-reference)
- [Known Limitations / Roadmap](#known-limitations--roadmap)

## Architecture

```
                        ┌─────────────────┐
                        │   Eureka Server  │  (sureka-server, :8761)
                        │  Service Registry│
                        └────────▲─────────┘
                                 │ registers
        ┌────────────────────────────────────────────────────┐
        │                                                      │
        ▼                                                      │
┌───────────────┐   JWT auth + RBAC    ┌─────────────────────────────────┐
│    Client      │ ───────────────────▶│         API Gateway (:8080)      │
└───────────────┘                      │  Spring Cloud Gateway (WebFlux)  │
                                        └───────────┬─────────────────────┘
                                   routes by path, load-balanced (lb://)
                     ┌──────────────┬───────────────┼───────────────┬──────────────┐
                     ▼              ▼               ▼               ▼              
            ┌────────────────┐ ┌────────────┐ ┌───────────────┐ ┌────────────┐
            │  user-service  │ │  product-  │ │  inventory-   │ │  order-    │
            │     :8086      │ │  service   │ │  service      │ │  service   │
            │  (user_db)     │ │  :8085     │ │  :8081        │ │  :8083     │
            │                │ │ (product_db)│ │ (inventory_db)│ │ (order_db) │
            └────────────────┘ └────────────┘ └───────▲───────┘ └─────┬──────┘
                                                        │ order-event   │
                                                        │  (Kafka)      │
                                                        └───────────────┘
                                                  Feign: order → inventory
                                                  (stock check, pre-order)

  ┌────────────────┐        Feign (confirm/fail, commit/rollback)
  │ payment-service │ ───────────────────────────────────────────▶ order-service / inventory-service
  │     :8084        │◀────────── Razorpay webhook (signed) ──── Razorpay
  │  (payment_db)     │
  └─────────┬────────┘
            │ Kafka: Notification-topic (email/SMS events)
            ▼
  ┌────────────────────┐
  │ notification-service │  (:8082) — sends Email (SMTP) or SMS (Twilio)
  └────────────────────┘
```

## Services

| Service | Port | Database | Responsibility |
|---|---|---|---|
| **sureka-server** | 8761 | – | Eureka service registry; every other service registers here so peers can be found by logical name instead of hardcoded host/port. |
| **api-gateway** | 8080 | – | Single entry point for all clients. Validates JWTs, enforces role-based access control, routes requests to the right service, and load-balances across instances. |
| **user-service** | 8086 | `user_db` | Registration, login, and JWT issuance. Owns its own Spring Security filter chain as a defense-in-depth layer independent of the gateway. |
| **product-service** | 8085 | `product_db` | Product catalogue, categories, search/filter/pagination, and product image upload/serving. |
| **inventory-service** | 8081 | `inventory_db` | Stock levels per SKU. Exposes a stock-check endpoint (called synchronously) and consumes order events from Kafka to decrement stock asynchronously. |
| **order-service** | 8083 | `order_db` | Places orders: checks stock via Feign, persists the order, and publishes an `order-event` to Kafka. |
| **payment-service** | 8084 | `payment_db` | Creates payment orders via Razorpay and handles Razorpay's signed webhook to confirm or fail orders/inventory reservations. |
| **notification-service** | 8082 | – | Consumes notification events from Kafka and sends Email (Spring Mail/SMTP) or SMS (Twilio) depending on event type. |
| **kafka-infra** | – | – | `docker-compose.yml` for a local single-node Kafka broker (KRaft mode, no ZooKeeper) on port 9092. |

## Tech Stack

- **Language / Framework:** Java, Spring Boot (services on 3.5.x and 4.0.x)
- **API Gateway:** Spring Cloud Gateway (WebFlux) + Spring Cloud LoadBalancer
- **Service Discovery:** Spring Cloud Netflix Eureka
- **Inter-service calls:** Spring Cloud OpenFeign
- **Messaging:** Apache Kafka (Spring Kafka), JSON serialization
- **Persistence:** Spring Data JPA + MySQL (one schema per service)
- **Security:** Spring Security + JJWT (HMAC-signed JWTs)
- **Payments:** Razorpay Java SDK
- **Notifications:** Spring Mail (SMTP), Twilio SDK
- **Build:** Maven (each service is an independent Maven module with its own `mvnw`)

## Request Flow: Placing an Order

1. Client sends `POST /api/order` through the **api-gateway** with a `Bearer` JWT.
2. Gateway's `JwtGatewayFilter` validates the token, checks the caller's role against the route/method, and forwards the request with `X-User-Id` / `X-User-Role` headers added.
3. **order-service** calls **inventory-service** synchronously via `InventoryFeignClient` (`GET /api/inventory/{skuCode}`) to check stock. If out of stock, the order is rejected immediately.
4. If in stock, order-service saves an `Order` row (status `CREATED`) and publishes an `OrderPlacedEvent` to the Kafka topic `order-event`.
5. **inventory-service**'s `OrderEventConsumer` (group `inventory-group`) consumes the event and calls `updateStock()`, which decrements stock — guarded by a `ProcessedOrder` idempotency check so a redelivered Kafka message never double-decrements stock.
6. Separately, **payment-service** creates a Razorpay payment order for the client to pay. When Razorpay sends its signed webhook (`payment.captured` / `payment.failed`), `RazorpayWebhookService` verifies the signature, then calls **order-service** (`confirm`/`fail`) and **inventory-service** (`commit`/`rollback`) via Feign to finalize or roll back the transaction.
7. **notification-service** consumes events from `Notification-topic` and sends a confirmation Email or SMS.

## Security

- **Authentication:** JWTs are issued by user-service on login/registration (`app.jwt.secret`, 24h expiry) and contain the user id (subject), email, and role as claims.
- **Gateway-level enforcement:** `JwtGatewayFilter` (a global filter, order `-1`) validates the token and checks a role → HTTP method → allowed path-prefix map (`ADMIN`, `USER`) before forwarding the request. Public routes (`/api/users/register`, `/api/users/login`, `/products/images`) bypass this check.
- **Defense in depth:** user-service also runs its own Spring Security filter chain (`SecurityConfig` + `JwtAuthenticationFilter`), so it doesn't rely solely on the gateway having validated the caller.
- **Downstream trust:** the gateway injects `X-User-Id` / `X-User-Role` headers for downstream services to read. These are not currently re-verified by every downstream service, so services should ideally sit on a network only reachable through the gateway.

## Getting Started

### Prerequisites
- Java 17+ and Maven
- MySQL running locally (`root`/`root`, default in each service's config)
- Docker (for the local Kafka broker)

### 1. Start infrastructure
```bash
# Kafka (KRaft mode, single broker, port 9092)
cd kafka-infra
docker compose up -d

# Create the per-service MySQL schemas
mysql -u root -p -e "CREATE DATABASE user_db; CREATE DATABASE product_db; CREATE DATABASE inventory_db; CREATE DATABASE order_db; CREATE DATABASE payment_db;"
```

### 2. Start the registry
```bash
cd sureka-server
./mvnw spring-boot:run
# Eureka dashboard: http://localhost:8761
```

### 3. Start the business services (any order, once Eureka is up)
```bash
cd user-service        && ./mvnw spring-boot:run &
cd product-service     && ./mvnw spring-boot:run &
cd inventory-service   && ./mvnw spring-boot:run &
cd order-service       && ./mvnw spring-boot:run &
cd payment-service     && ./mvnw spring-boot:run &
cd notification-service&& ./mvnw spring-boot:run &
```

### 4. Start the gateway last
```bash
cd api-gateway
./mvnw spring-boot:run
# All client traffic now goes through http://localhost:8080
```

### 5. Configure secrets
Before running for real, set your own values for:
- `app.jwt.secret` / `jwt.secret` (user-service and api-gateway — must match)
- `razorpay.key`, `razorpay.secret`, `razorpay.webhook-secret` (payment-service)
- `spring.mail.username` / `password` (notification-service — SMTP)
- `twilio.account-sid`, `twilio.auth-token`, `twilio.from-number` (notification-service)

> **Never commit real secrets.** The checked-in `application.yml`/`application.properties` files contain placeholder/test values for local development only.

## API Reference

All paths below are called **through the gateway** (`http://localhost:8080`) unless noted.

### User Service — `/api/users`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/users/register` | Public | Create a new user account |
| POST | `/api/users/login` | Public | Authenticate and receive a JWT |
| GET | `/api/users/{id}` | Required | Fetch a user by id |

### Product Service — `/api/products`, `/api/categories`
| Method | Path | Description |
|---|---|---|
| GET | `/api/products` | Paginated product list (`page`, `size`, `sortBy`, `sortDir`) |
| GET | `/api/products/{id}` | Get product by id |
| GET | `/api/products/search?keyword=` | Search products |
| GET | `/api/products/filter` | Filter by category/price range |
| POST | `/api/products` | Create a product |
| PUT | `/api/products/{id}` | Update a product |
| DELETE | `/api/products/{id}` | Delete a product |
| POST | `/api/products/{id}/upload-image` | Upload a product image (multipart) |
| GET | `/products/images/{fileName}` | Serve an uploaded product image (public) |
| GET / POST / PUT / DELETE | `/api/categories[/{id}]` | Standard category CRUD |

### Inventory Service — `/api/inventory`
| Method | Path | Description |
|---|---|---|
| GET | `/api/inventory/{skuCode}` | Check stock for a SKU |
| POST | `/api/inventory` | Add inventory for a SKU |

### Order Service — `/api/order`
| Method | Path | Description |
|---|---|---|
| POST | `/api/order` | Place a new order (checks stock, publishes `order-event`) |

> **Note:** the gateway route predicate is currently `Path=/api/orders/**` (plural) while the controller is mapped at `/api/order` (singular) — double-check this when wiring the gateway route.

### Payment Service — `/api/payments`, `/api/payment`
| Method | Path | Description |
|---|---|---|
| POST | `/api/payments` | Create a payment (Razorpay order) for an order |
| GET | `/api/payments/order/{orderId}` | Get payment status by order id |
| PUT | `/api/payments/{paymentId}/status` | Manually update a payment's status |
| POST | `/api/payment/webhook/razorpay` | Razorpay webhook receiver (signature-verified) |

> **Note:** there is currently no route declared for `PAYMENT-SERVICE` in the gateway's `application.yml`; payment endpoints would need to be called directly or the route added.

## Configuration Reference

| Property | Service | Purpose |
|---|---|---|
| `eureka.client.service-url.defaultZone` | all business services | Where to register with Eureka (`http://localhost:8761/eureka`) |
| `spring.kafka.bootstrap-servers` | order, inventory, notification | Kafka broker address (`localhost:9092`) |
| `app.jwt.secret`, `app.jwt.expiration-ms` | user-service | JWT signing key and token lifetime |
| `jwt.secret`, `jwt.expiration-ms` | api-gateway | JWT verification key (must match user-service's secret) |
| `razorpay.key` / `secret` / `webhook-secret` | payment-service | Razorpay API credentials and webhook signature secret |
| `twilio.account-sid` / `auth-token` / `from-number` | notification-service | Twilio SMS credentials |
| `spring.mail.*` | notification-service | SMTP settings for email notifications |

## Known Limitations / Roadmap

These are honest gaps in the current implementation, useful to know if you're extending the project:

- **No circuit breaker / retry** around Feign calls (order → inventory, payment → order/inventory) — a downstream outage currently surfaces as an unhandled exception rather than a graceful fallback.
- **Race condition** between the synchronous stock check in order-service and the asynchronous decrement in inventory-service: two orders can both pass the "in stock" check before either decrement runs.
- **No compensating event** back to order-service/notification-service when `updateStock()` fails due to insufficient stock after the event is consumed.
- **Missing gateway route** for `PAYMENT-SERVICE`, and a path mismatch between the gateway's order route (`/api/orders/**`) and order-service's actual mapping (`/api/order`).
- **No distributed tracing** (e.g. OpenTelemetry/Zipkin) across the REST + Kafka hops, which would help debug cross-service issues.
- **No centralized config server** — each service manages its own `application.yml`/`.properties` independently.
- **Webhook idempotency**: Razorpay signature verification prevents forged events but doesn't yet dedupe legitimately retried webhook deliveries.

## License

Add your license here.
