@echo off
TITLE Outbound Sniper Studio - Lanceur Rapide
echo ============================================================
echo 🎯 DEMARRAGE D'OUTBOUND SNIPER STUDIO (Mode Local & VM)
echo ============================================================

:: 1. Verification de Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas installe sur cet ordinateur.
    echo Veuillez installer Node.js depuis https://nodejs.org/ (Version 20+ recommandee).
    echo.
    pause
    exit /b
)

:: 2. Lancement du serveur Node.js en arriere-plan
echo [INFO] Demarrage du serveur local sur le port 3500...
start /b node server.js

:: 3. Temporisation 2 secondes pour laisser le serveur s'initialiser
timeout /t 2 /nobreak >nul

:: 4. Ouverture automatique dans le navigateur par defaut
echo [INFO] Ouverture de votre navigateur...
start http://localhost:3500

echo.
echo [SUCCES] L'application est active sur : http://localhost:3500
echo Laissez cette fenetre ouverte tant que vous utilisez l'application.
echo.
pause
