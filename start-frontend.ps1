# Start Valence Storefront
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Starting Valence Storefront (Next.js App Router)" -ForegroundColor Cyan
Write-Host "  Local URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

$storefrontPath = Join-Path $PSScriptRoot "storefront"
Set-Location $storefrontPath

if (-not (Test-Path (Join-Path $storefrontPath "node_modules"))) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

npm run dev
