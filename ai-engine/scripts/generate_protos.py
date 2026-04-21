import subprocess
from pathlib import Path


def generate_protos():
    # Rutas relativas
    root_dir = Path(__file__).parent.parent.parent
    proto_dir = root_dir / "protos"
    output_dir = root_dir / "ai-engine" / "app" / "grpc"
    
    # Crear directorio de salida si no existe
    output_dir.mkdir(parents=True, exist_ok=True)
    
    proto_file = proto_dir / "ai_engine.proto"
    
    print(f"🚀 Generando código Python desde {proto_file}...")
    
    command = [
        "python3", "-m", "grpc_tools.protoc",
        f"-I{proto_dir}",
        f"--python_out={output_dir}",
        f"--grpc_python_out={output_dir}",
        str(proto_file)
    ]
    
    try:
        subprocess.run(command, check=True)
        # Crear __init__.py para que sea un paquete válido
        (output_dir / "__init__.py").touch()
        print(f"✅ Código generado exitosamente en {output_dir}")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error al generar protos: {e}")

if __name__ == "__main__":
    generate_protos()
