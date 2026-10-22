#!/usr/bin/env bash
# Carrega .env (se existir) e sobe o backend.
# Uso: ./run.sh
set -e
cd "$(dirname "$0")"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
else
  echo "Aviso: .env não encontrado. Copie .env.example para .env e preencha os valores."
  exit 1
fi

mvn spring-boot:run
