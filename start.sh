#!/bin/bash

# Script de inicio para Monopolio Peruano Random (Chicha Edition)
# Este script levanta el servidor backend que a su vez sirve el frontend ya compilado.

# Colores para la consola
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}====================================================${NC}"
echo -e "${CYAN}    INICIANDO MONOPOLIO PERUANO - CHICHA EDITION    ${NC}"
echo -e "${CYAN}====================================================${NC}"

# Verificar si el frontend está compilado
if [ ! -d "frontend/dist" ]; then
    echo -e "${YELLOW}[!] El frontend no está compilado. Compilando ahora...${NC}"
    cd frontend && npm run build
    cd ..
fi

# Informar la dirección local
echo -e "\n${GREEN}[+] Servidor web y WebSocket listo en:${NC} http://localhost:4000"
echo -e "${YELLOW}[!] Para jugar con tus amigos de forma remota, abre otra terminal y ejecuta:${NC}"
echo -e "    ${CYAN}cloudflared tunnel --url http://localhost:4000${NC}\n"

# Iniciar servidor backend
echo -e "${GREEN}[+] Levantando el servidor${NC}"
cd backend && npm start
