@echo off
echo =======================================================================
echo CareerCompass AI - Push Feature Branch to GitHub
echo Branch: feat/interview-prep-and-tracker-enhancements
echo =======================================================================
echo.
echo Option 1: Pushing directly to origin (if collaborator access granted)...
git push -u origin feat/interview-prep-and-tracker-enhancements
if %errorlevel% neq 0 (
    echo.
    echo -------------------------------------------------------------------
    echo Direct push was rejected (permission 403).
    echo Standard Open Source GitHub Fork workflow:
    echo 1. Go to https://github.com/HARICHARAN8/CareerCompass-AI
    echo 2. Click "Fork" in the top-right corner to your GitHub account.
    echo 3. Enter your GitHub username when prompted below to push to your fork:
    echo -------------------------------------------------------------------
    echo.
    set /p GH_USER="Enter your GitHub username (e.g. Nipunbhadane123): "
    if defined GH_USER (
        git remote remove fork 2>nul
        git remote add fork https://github.com/%GH_USER%/CareerCompass-AI.git
        echo Pushing to https://github.com/%GH_USER%/CareerCompass-AI.git ...
        git push -u fork feat/interview-prep-and-tracker-enhancements
        if %errorlevel% equ 0 (
            echo.
            echo SUCCESS! Branch pushed to your fork.
            echo Now open this link to raise your PR:
            echo https://github.com/HARICHARAN8/CareerCompass-AI/compare/main...%GH_USER%:CareerCompass-AI:feat/interview-prep-and-tracker-enhancements
        )
    )
)
echo.
pause
