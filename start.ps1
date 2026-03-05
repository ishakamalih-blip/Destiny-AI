# Start DESTINY-AI Project

Write-Host "🚀 Starting DESTINY-AI Project..." -ForegroundColor Green

# Start Backend
Write-Host "`n🔌 Starting Backend on port 8080..." -ForegroundColor Cyan
Push-Location "D:\sem6\DESTINY-AI\backend"
& "D:\sem6\DESTINY-AI\.venv\Scripts\python.exe" -m uvicorn main:app --host 127.0.0.1 --port 8080 -ErrorAction SilentlyContinue &

Start-Sleep 3

# Start Frontend
Write-Host "`n🌐 Starting Frontend on port 5173..." -ForegroundColor Cyan
Push-Location "D:\sem6\DESTINY-AI\frontend"
& npm run dev -- --port 5173 -ErrorAction SilentlyContinue &

Start-Sleep 3

# Show Links
Write-Host "`n✅ PROJECT STARTED!" -ForegroundColor Green
Write-Host "`n📍 LINKS:" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:8080" -ForegroundColor Cyan
Write-Host "Docs: http://localhost:8080/docs" -ForegroundColor Cyan
Write-Host "`n👤 Login: isha / isha" -ForegroundColor Magenta
