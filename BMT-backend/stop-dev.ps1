# ==========================================
# Book My Train - Local Development Stopper
# Stops all 8 backend microservices
# ==========================================

Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "Stopping Book My Train Microservices..." -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow

# 1. Stop all services listening on port 3000 (frontend) and ports 4000 to 4007 (backend)
$ports = @(3000) + (4000..4007)
foreach ($port in $ports) {
    $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($conns) {
        foreach ($conn in $conns) {
            try {
                Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
            } catch {}
        }
        Write-Host "Stopped service on port $port" -ForegroundColor Green
    }
}

# 2. Stop any remaining background service processes
$services = @("api-gateway", "user-service", "search-service", "admin-service", "notification-service", "booking-service", "payment-service", "inventory-service", "frontend")
foreach ($service in $services) {
    Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | 
        Where-Object { $_.CommandLine -like "*$service*" -and $_.Name -like "*node*" } | 
        ForEach-Object {
            Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
            Write-Host "Stopped $service process (PID $($_.ProcessId))" -ForegroundColor Green
        }
}

Write-Host "`nAll microservices stopped successfully!" -ForegroundColor Green
Write-Host "To also stop Docker (Postgres, Redis, Kafka): docker compose down" -ForegroundColor Cyan
