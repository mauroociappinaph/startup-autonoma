#!/bin/bash
# Unified Proto Generator for Startup Autónoma
# Generates TypeScript types for Backend and Python stubs for AI Engine.

set -e

# Configuración de rutas
PROTO_DIR="proto"
TS_OUT_DIR="src/generated"
PY_OUT_DIR="../../ai-engine/app/grpc_generated"

echo "🚀 Starting unified proto generation..."

# 1. Limpieza
echo "🧹 Cleaning output directories..."
rm -rf "$TS_OUT_DIR"
rm -rf "$PY_OUT_DIR"
mkdir -p "$TS_OUT_DIR"
mkdir -p "$PY_OUT_DIR"

# 2. Generación para TypeScript (Backend)
echo "📦 Generating TypeScript types..."
npx proto-loader-gen-types \
  --longs=String \
  --enums=String \
  --defaults \
  --oneofs \
  --grpcLib=@grpc/grpc-js \
  --outDir="$TS_OUT_DIR" \
  "$PROTO_DIR"/*.proto

# 3. Generación para Python (AI Engine)
echo "🐍 Generating Python stubs..."
# Buscamos el binario de python del ai-engine si existe, sino usamos el sistema
PY_BIN="../../ai-engine/.venv/bin/python3"
if [ ! -f "$PY_BIN" ]; then
    PY_BIN="python3"
fi

$PY_BIN -m grpc_tools.protoc \
    -I"$PROTO_DIR" \
    --python_out="$PY_OUT_DIR" \
    --grpc_python_out="$PY_OUT_DIR" \
    "$PROTO_DIR"/*.proto

# 4. Fix de imports en Python (clásico error de protoc)
echo "🛠️ Fixing Python imports..."
# En macOS sed requiere un string vacío para el backup
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' 's/^import \([^ ]*\)_pb2 as \([^ ]*\)__pb2/from . import \1_pb2 as \2__pb2/' "$PY_OUT_DIR"/*_pb2_grpc.py
else
    sed -i 's/^import \([^ ]*\)_pb2 as \([^ ]*\)__pb2/from . import \1_pb2 as \2__pb2/' "$PY_OUT_DIR"/*_pb2_grpc.py
fi

touch "$PY_OUT_DIR/__init__.py"

echo "✅ Proto generation complete!"
