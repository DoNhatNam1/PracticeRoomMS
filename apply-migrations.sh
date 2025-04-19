#!/bin/bash

# Chạy tất cả các file migration.sql trong thư mục migrations và thư mục con
find /migrations -name "migration.sql" | sort | while read -r migration; do
  echo "Applying migration: $migration"
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "$migration"
done