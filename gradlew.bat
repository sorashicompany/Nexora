@echo off
setlocal
set "ROOT_DIR=%~dp0"
set "GRADLE_VERSION=8.9"
if not defined GRADLE_USER_HOME set "GRADLE_USER_HOME=%USERPROFILE%\.gradle"
set "CACHE_DIR=%GRADLE_USER_HOME%\nexora-bootstrap\gradle-%GRADLE_VERSION%"
set "GRADLE_BIN=%CACHE_DIR%\bin\gradle.bat"
if not exist "%GRADLE_BIN%" (
  echo Nexora: First run requires downloading Gradle %GRADLE_VERSION%.
  powershell -NoProfile -ExecutionPolicy Bypass -Command "$u='https://services.gradle.org/distributions/gradle-%GRADLE_VERSION%-bin.zip'; $z=$env:TEMP+'\\nexora-gradle.zip'; Invoke-WebRequest -UseBasicParsing $u -OutFile $z; New-Item -ItemType Directory -Force -Path '%GRADLE_USER_HOME%\\nexora-bootstrap' | Out-Null; Expand-Archive -Force $z '%GRADLE_USER_HOME%\\nexora-bootstrap'; Remove-Item $z; Move-Item -Force '%GRADLE_USER_HOME%\\nexora-bootstrap\\gradle-%GRADLE_VERSION%' '%CACHE_DIR%';"
)
if defined ANDROID_SDK_ROOT (
  echo sdk.dir=%ANDROID_SDK_ROOT%> "%ROOT_DIR%local.properties"
) else if defined ANDROID_HOME (
  echo sdk.dir=%ANDROID_HOME%> "%ROOT_DIR%local.properties"
)
call "%GRADLE_BIN%" %*
endlocal
