@echo off
echo ========================================================
echo Starting FoodHub Application (Backend + Frontend)...
echo ========================================================

echo Starting Spring Boot Backend on port 8081...
start "FoodHub Backend (Port 8081)" cmd /k "cd /d %~dp0backend && set JAVA_HOME=C:\Program Files\Java\jdk-21&& mvnw spring-boot:run -Dspring-boot.run.profiles=h2"

echo Starting Vite Frontend on port 5173...
start "FoodHub Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npx vite --host 127.0.0.1"

echo.
echo Waiting 5 seconds before opening the browser...
timeout /t 5 /nobreak >nul

echo Opening browser at http://127.0.0.1:5173/login ...
start http://127.0.0.1:5173/login

echo Done! Keep the backend and frontend command windows open while using the app.
pause
