#!/usr/bin/env python3
"""
Script para iniciar todos los servicios en Docker
"""
import subprocess
import threading
import time
import os
import signal
import sys

processes = []

def run_service(name, command, cwd=None, port=None):
    """Ejecuta un servicio en un hilo separado"""
    def target():
        try:
            print(f"🚀 Iniciando {name}" + (f" en puerto {port}" if port else ""))
            process = subprocess.Popen(command, shell=True, cwd=cwd)
            processes.append(process)
            process.wait()
        except Exception as e:
            print(f"❌ Error en {name}: {e}")
    
    thread = threading.Thread(target=target, daemon=True)
    thread.start()
    return thread

def signal_handler(sig, frame):
    """Maneja la señal de interrupción para cerrar todos los procesos"""
    print("\n🛑 Cerrando servicios...")
    for process in processes:
        try:
            process.terminate()
        except:
            pass
    sys.exit(0)

def main():
    signal.signal(signal.SIGINT, signal_handler)
    
    print("🐳 Iniciando servicios en Docker...")
    
    # Servicios Python
    services = [
        ("Auth Service", "python services/auth/main.py", None, 8001),
        ("Conversation Service", "python services/conversation/main.py", None, 8002),
        ("Message Service", "python services/message/main.py", None, 8003),
        ("Context Service", "python services/context/main.py", None, 8004),
        ("API Gateway", "python services/gateway/main.py", None, 8000),
    ]
    
    threads = []
    
    # Iniciar servicios backend
    for name, command, cwd, port in services:
        thread = run_service(name, command, cwd, port)
        threads.append(thread)
        time.sleep(2)  # Esperar entre servicios
    
    print("\n✅ Todos los servicios iniciados!")
    print("🔗 API Gateway: http://localhost:8000")
    
    # Mantener el script corriendo
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        signal_handler(None, None)

if __name__ == "__main__":
    main()