# ==========================================
# Book My Train - Local Development Launcher
# Starts all 8 backend microservices in separate PowerShell windows
# ==========================================

$services = @(
    "api-gateway",
    "user-service",
    "search-service",
    "admin-service",
    "notification-service",
    "booking-service",
    "payment-service",
    "inventory-service",
    "frontend"
)

Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "Starting Book My Train Microservices & Frontend..." -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow

foreach ($service in $services) {
    $serviceDir = Join-Path $PSScriptRoot $service
    if (Test-Path $serviceDir) {
        Write-Host "Launching $service (npm run dev)..." -ForegroundColor Cyan
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$serviceDir'; Write-Host '=== $service ===' -ForegroundColor Green; npm run dev"
    } else {
        Write-Host "Directory $service not found, skipping." -ForegroundColor Red
    }
}

Write-Host "`nAll services & frontend have been launched!" -ForegroundColor Green
Write-Host "👉 Open in Chrome: http://localhost:3000" -ForegroundColor Yellow
Write-Host "API Gateway: http://localhost:4000/api" -ForegroundColor Green

#   .\start-dev.ps1  or Ctrl+Shift+B
#   .\stop-dev.ps1