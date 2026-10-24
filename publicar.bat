@echo off
cd /d "%~dp0"
echo.
echo  ===========================================
echo   Publicar mapas  -  renandrm.github.io/mapas
echo  ===========================================
echo.

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo  ERRO: esta pasta nao e um repositorio git.
  pause
  exit /b 1
)

set "msg=%~1"
if "%msg%"=="" set /p "msg=Descreva a mudanca (ou so Enter): "
if "%msg%"=="" set "msg=atualizacao de mapas"

echo.
echo  [1/3] Preparando arquivos...
git add -A

git diff --cached --quiet
if not errorlevel 1 (
  echo.
  echo  Nada mudou desde a ultima publicacao. Nada a fazer.
  echo.
  pause
  exit /b 0
)

echo.
echo  Arquivos que serao enviados:
git diff --cached --name-only

echo.
echo  [2/3] Registrando...
git commit -m "%msg%"
if errorlevel 1 (
  echo.
  echo  ERRO no commit. Leia a mensagem acima.
  pause
  exit /b 1
)

echo.
echo  [3/3] Enviando para o GitHub...
git push
if errorlevel 1 (
  echo.
  echo  ERRO no envio. Verifique a internet e tente de novo.
  pause
  exit /b 1
)

echo.
echo  ===========================================
echo   Pronto! Em 1 a 2 minutos o app atualiza.
echo   https://renandrm.github.io/mapas/
echo  ===========================================
echo.
pause
