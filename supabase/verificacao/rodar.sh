#!/usr/bin/env bash
# Aplica as migrações num Postgres de verdade e confere o que elas prometem.
#
# Usa as variáveis de sempre do psql (PGHOST, PGPORT, PGUSER, PGPASSWORD).
# Cria um banco novo a cada execução, põe o mínimo do Supabase
# (00_supabase_minimo.sql), aplica 0001→último **duas vezes** — as migrações
# são coladas de novo no SQL Editor, então precisam ser idempotentes — e roda
# a verificação de comportamento (10_comportamento.sql).
#
#   PGHOST=localhost PGUSER=postgres PGPASSWORD=postgres bash supabase/verificacao/rodar.sh
set -euo pipefail

aqui="$(cd "$(dirname "$0")" && pwd)"
banco="cf_verificacao_$$"
export PGOPTIONS='-c client_min_messages=warning'
psql_=(psql -v ON_ERROR_STOP=1 -q -At)

"${psql_[@]}" -d postgres -c "drop database if exists $banco" -c "create database $banco"
trap '"${psql_[@]}" -d postgres -c "drop database if exists $banco" >/dev/null' EXIT

"${psql_[@]}" -d "$banco" -f "$aqui/00_supabase_minimo.sql"

for passada in 1 2; do
  for migracao in "$aqui"/../migrations/*.sql; do
    echo "passada $passada: $(basename "$migracao")"
    "${psql_[@]}" -d "$banco" -f "$migracao" >/dev/null
  done
done

"${psql_[@]}" -d "$banco" -f "$aqui/10_comportamento.sql" | tail -n 1
