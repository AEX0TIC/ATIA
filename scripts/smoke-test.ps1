<#
Simple smoke-test for ATIA services (PowerShell).
Usage: .\scripts\smoke-test.ps1 [-BaseUrl "http://localhost:8080"]

Checks:
 - GET /health
 - POST /api/v1/analyze with a sample payload

This script is safe to run locally. It only prints responses.
#>

param(
    [string]$BaseUrl = "http://localhost:8080"
)

Write-Host "Running ATIA smoke tests against $BaseUrl`n"

function Test-Health {
    $url = "$BaseUrl/health"
    Write-Host "GET $url"
    try {
        $resp = Invoke-RestMethod -Uri $url -UseBasicParsing -Method Get -ErrorAction Stop
        Write-Host "Health OK:`n" -ForegroundColor Green
        $resp | ConvertTo-Json -Depth 5 | Write-Host
    } catch {
        Write-Host "Health check failed:`n$($_.Exception.Message)" -ForegroundColor Red
        exit 2
    }
}

function Test-Analyze {
    $url = "$BaseUrl/api/v1/analyze"
    Write-Host "`nPOST $url"

    $payload = @{ indicator = "8.8.8.8"; type = "ip" }
    $body = $payload | ConvertTo-Json

    try {
        $resp = Invoke-RestMethod -Uri $url -Method Post -ContentType 'application/json' -Body $body -UseBasicParsing -ErrorAction Stop
        Write-Host "Analyze response:`n" -ForegroundColor Green
        $resp | ConvertTo-Json -Depth 10 | Write-Host
    } catch {
        Write-Host "Analyze request failed:`n$($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Test-Health
Test-Analyze

Write-Host "`nSmoke tests finished"
