@echo off
echo ========================================================
echo   Compilando Yape POS Connector (APK)...
echo ========================================================
cd /d "%~dp0android-app"
call gradlew.bat assembleDebug
if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================================
    echo   [OK] APK compilado exitosamente:
    echo   %~dp0android-app\app\build\outputs\apk\debug\app-debug.apk
    echo ========================================================
) else (
    echo.
    echo [ERROR] Ocurrio un fallo al compilar el APK.
)
