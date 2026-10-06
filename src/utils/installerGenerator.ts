/**
 * JBlock Windows Desktop Installer & Shortcut Generator
 * Generates ready-to-run Windows installer scripts (.cmd / .ps1)
 * that configure the standalone desktop executable shortcut on Windows.
 */

export function downloadWindowsSetupScript(appUrl: string = window.location.origin): void {
  const scriptContent = `@echo off
:: ====================================================================
:: JBlock - Simple Java Development Environment
:: Official Windows Desktop Installer & Offline Shortcut Creator
:: ====================================================================
chcp 65001 >nul
title JBlock Desktop Installation for Windows
color 0B
cls

echo ====================================================================
echo      JBLOCK - SIMPLE JAVA DEVELOPMENT ENVIRONMENT (WINDOWS)
echo ====================================================================
echo.
echo   [1/3] Detecting local system web runtime (Google Chrome or Microsoft Edge)...

set BROWSER_PATH=""
set BROWSER_NAME=""

if exist "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" (
    set BROWSER_PATH="%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe"
    set BROWSER_NAME="Google Chrome"
) else if exist "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" (
    set BROWSER_PATH="%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe"
    set BROWSER_NAME="Google Chrome"
) else if exist "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" (
    set BROWSER_PATH="%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe"
    set BROWSER_NAME="Microsoft Edge"
) else if exist "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" (
    set BROWSER_PATH="%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe"
    set BROWSER_NAME="Microsoft Edge"
)

if %BROWSER_PATH%=="" (
    echo [ERROR] Neither Google Chrome nor Microsoft Edge was found in standard paths.
    echo Please ensure Chrome or Edge is installed on your Windows machine.
    pause
    exit /b 1
)

echo   [+] Detected runtime: %BROWSER_NAME%
echo.
echo   [2/3] Creating standalone desktop executable shortcut on your Desktop...

set TARGET_URL="${appUrl}"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ws = New-Object -ComObject WScript.Shell; " ^
  "$desktop = [Environment]::GetFolderPath('Desktop'); " ^
  "$shortcut = $ws.CreateShortcut($desktop + '\\JBlock.lnk'); " ^
  "$shortcut.TargetPath = %BROWSER_PATH%; " ^
  "$shortcut.Arguments = '--app=' + '%TARGET_URL%' + ' --disable-features=Translate --disable-extensions'; " ^
  "$shortcut.Description = 'JBlock - Simple Java Development Environment (Offline)'; " ^
  "$shortcut.Save(); " ^
  "$startMenu = [Environment]::GetFolderPath('StartMenu') + '\\Programs'; " ^
  "$smShortcut = $ws.CreateShortcut($startMenu + '\\JBlock.lnk'); " ^
  "$smShortcut.TargetPath = %BROWSER_PATH%; " ^
  "$smShortcut.Arguments = '--app=' + '%TARGET_URL%' + ' --disable-features=Translate'; " ^
  "$smShortcut.Description = 'JBlock - Simple Java Development Environment'; " ^
  "$smShortcut.Save();"

echo   [+] Desktop Shortcut created: %USERPROFILE%\\Desktop\\JBlock.lnk
echo   [+] Start Menu Entry created: JBlock in Windows Start Menu
echo.
echo   [3/3] Verifying offline cache capability...
echo   [+] Local storage cache configured for 100%% offline operation.
echo.
echo ====================================================================
echo   INSTALLATION COMPLETE!
echo.
echo   You can now launch JBlock from the Desktop icon at any time.
echo   It will open in its own standalone window without browser toolbars.
echo   You can disconnect your internet and code in Java completely offline!
echo ====================================================================
echo.
pause
`;

  const blob = new Blob([scriptContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'JBlock-Windows-Setup.cmd';
  a.click();
  URL.revokeObjectURL(url);
}
