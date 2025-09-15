#!/usr/bin/env python3
"""
Script para iniciar todos los servicios en desarrollo local
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
    
    print("🏗️ Iniciando sistema de conversaciones IA...")
    print("Presiona Ctrl+C para detener todos los servicios\n")
    
    # Servicios Python
    services = [
        ("Auth Service", "python main.py", "services/auth", 8001),
        ("Conversation Service", "python main.py", "services/conversation", 8002),
        ("Message Service", "python main.py", "services/message", 8003),
        ("Context Service", "python main.py", "services/context", 8004),
        ("API Gateway", "python main.py", "services/gateway", 8000),
    ]
    
    threads = []
    
    # Iniciar servicios backend
    for name, command, cwd, port in services:
        thread = run_service(name, command, cwd, port)
        threads.append(thread)
        time.sleep(2)  # Esperar entre servicios
    
    # Iniciar frontend
    frontend_thread = run_service("Frontend React", "npm start", "frontend", 3000)
    threads.append(frontend_thread)
    
    print("\n✅ Todos los servicios iniciados!")
    print("📱 Frontend: http://localhost:3000")
    print("🔗 API Gateway: http://localhost:8000")
    print("\nPresiona Ctrl+C para detener...\n")
    
    # Mantener el script corriendo
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        signal_handler(None, None)

if __name__ == "__main__":
    main()