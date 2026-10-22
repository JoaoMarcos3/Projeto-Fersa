@echo off
REM Carrega .env (se existir) e sobe o backend.
REM Uso: run.cmd

if not exist .env (
  echo Aviso: .env nao encontrado. Copie .env.example para .env e preencha os valores.
  exit /b 1
)

for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
  echo %%A| findstr /r "^#" >nul || set "%%A=%%B"
)

mvn spring-boot:run
