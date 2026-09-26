@echo off
title E-Commerce Microservices Orchestrator
echo ===============================================================
echo   Starting E-Commerce Spring Boot Microservices Architecture
echo ===============================================================
echo.

set ROOT_DIR=%~dp0

:: 1. Kafka Messaging Infrastructure
echo [1/4] Starting Kafka Broker container via Docker Compose...
if exist "%ROOT_DIR%kafka-infra\docker-compose.yml" (
    docker compose -f "%ROOT_DIR%kafka-infra\docker-compose.yml" up -d
)
echo.

:: 2. Eureka Service Discovery Server (Must start first)
echo [2/4] Launching Eureka Discovery Server (Port 8761)...
start "Eureka Server [Port 8761]" cmd /k "title Eureka Server && cd /d "%ROOT_DIR%sureka-server" && mvnw.cmd spring-boot:run"

echo Waiting 15 seconds for Eureka Registry to initialize...
timeout /t 15 /nobreak >nul
echo.

:: 3. Core Microservices
echo [3/4] Launching Core Microservices in separate consoles...

echo  - Starting User Service (Port 8086)...
start "User Service [Port 8086]" cmd /k "title User Service && cd /d "%ROOT_DIR%user-service" && mvnw.cmd spring-boot:run"

echo  - Starting Product Service (Port 8085)...
start "Product Service [Port 8085]" cmd /k "title Product Service && cd /d "%ROOT_DIR%product-service" && mvnw.cmd spring-boot:run"

echo  - Starting Inventory Service (Port 8081)...
start "Inventory Service [Port 8081]" cmd /k "title Inventory Service && cd /d "%ROOT_DIR%inventory-service" && mvnw.cmd spring-boot:run"

echo  - Starting Order Service (Port 8083)...
start "Order Service [Port 8083]" cmd /k "title Order Service && cd /d "%ROOT_DIR%order-service" && mvnw.cmd spring-boot:run"

echo  - Starting Payment Service (Port 8084)...
start "Payment Service [Port 8084]" cmd /k "title Payment Service && cd /d "%ROOT_DIR%payment-service" && mvnw.cmd spring-boot:run"

echo  - Starting Notification Service (Port 8082)...
start "Notification Service [Port 8082]" cmd /k "title Notification Service && cd /d "%ROOT_DIR%notification-service" && mvnw.cmd spring-boot:run"

echo.
echo Waiting 10 seconds before starting API Gateway...
timeout /t 10 /nobreak >nul
echo.

:: 4. Spring Cloud API Gateway (Entry Point)
echo [4/4] Launching API Gateway (Port 8080)...
start "API Gateway [Port 8080]" cmd /k "title API Gateway && cd /d "%ROOT_DIR%api-gateway" && mvnw.cmd spring-boot:run"

echo.
echo ===============================================================
echo   All microservices launched in separate console windows!
echo   - API Gateway:    http://localhost:8080
echo   - Eureka UI:      http://localhost:8761
echo   - Product Svc:    http://localhost:8085
echo   - User Svc:       http://localhost:8086
echo   - Inventory Svc:  http://localhost:8081
echo   - Order Svc:      http://localhost:8083
echo   - Payment Svc:    http://localhost:8084
echo   - Notification:   http://localhost:8082
echo ===============================================================
pause
