#!/bin/bash
# Script para generar tipos de Python desde el monorepo
# Uso: ./generate-python.sh ../../ai-engine/app/grpc_generated

OUT_DIR=${1:-"../../ai-engine/app/grpc_generated"}

mkdir -p "$OUT_DIR"

# Asumimos que python3 y grpcio-tools están instalados en el entorno virtual del engine
# O usamos el python global si está disponible con las herramientas
python3 -m grpc_tools.protoc -Isrc --python_out="$OUT_DIR" --grpc_python_out="$OUT_DIR" src/*.proto

# Corregir imports relativos en archivos generados (clásico problema de protoc en python)
sed -i '' 's/^import ai_engine_pb2 as ai__engine__pb2/from . import ai_engine_pb2 as ai__engine__pb2/' "$OUT_DIR"/*_pb2_grpc.py

touch "$OUT_DIR/__init__.py"

echo "✅ Tipos de Python generados en $OUT_DIR"
