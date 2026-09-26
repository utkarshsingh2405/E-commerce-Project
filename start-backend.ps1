# Start E-Commerce Spring Boot Microservices Architecture
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "  Starting E-Commerce Spring Boot Microservices Architecture" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan

$rootDir = $PSScriptRoot

# 1. Kafka
Write-Host "`n[1/4] Starting Kafka Broker container..." -ForegroundColor Yellow
$composeFile = Join-Path $rootDir "kafka-infra\docker-compose.yml"
if (Test-Path $composeFile) {
    docker compose -f $composeFile up -d
}

# 2. Eureka Server
Write-Host "`n[2/4] Launching Eureka Server (Port 8761)..." -ForegroundColor Yellow
$eurekaPath = Join-Path $rootDir "sureka-server"
Start-Process cmd -ArgumentList "/k cd /d `"$eurekaPath`" && mvnw.cmd spring-boot:run" -WindowStyle Normal

Write-Host "Waiting 15 seconds for Eureka Registry to initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 15

# 3. Core Microservices
Write-Host "`n[3/4] Launching Core Microservices..." -ForegroundColor Yellow

$services = @(
    @{ Name = "User Service"; Path = "user-service"; Port = 8086 },
    @{ Name = "Product Service"; Path = "product-service"; Port = 8085 },
    @{ Name = "Inventory Service"; Path = "inventory-service"; Port = 8081 },
    @{ Name = "Order Service"; Path = "order-service"; Port = 8083 },
    @{ Name = "Payment Service"; Path = "payment-service"; Port = 8084 },
    @{ Name = "Notification Service"; Path = "notification-service"; Port = 8082 }
)

foreach ($svc in $services) {
    Write-Host "  - Starting $($svc.Name) on Port $($svc.Port)..." -ForegroundColor Green
    $svcPath = Join-Path $rootDir $svc.Path
    Start-Process cmd -ArgumentList "/k cd /d `"$svcPath`" && mvnw.cmd spring-boot:run" -WindowStyle Normal
}

Write-Host "`nWaiting 10 seconds before starting API Gateway..." -ForegroundColor Gray
Start-Sleep -Seconds 10

# 4. API Gateway
Write-Host "`n[4/4] Launching Spring Cloud API Gateway (Port 8080)..." -ForegroundColor Yellow
$gatewayPath = Join-Path $rootDir "api-gateway"
Start-Process cmd -ArgumentList "/k cd /d `"$gatewayPath`" && mvnw.cmd spring-boot:run" -WindowStyle Normal

Write-Host "`n===============================================================" -ForegroundColor Cyan
Write-Host "  All services initiated in dedicated windows!" -ForegroundColor Green
Write-Host "  - API Gateway:    http://localhost:8080"
Write-Host "  - Eureka Server:  http://localhost:8761"
Write-Host "===============================================================" -ForegroundColor Cyan
