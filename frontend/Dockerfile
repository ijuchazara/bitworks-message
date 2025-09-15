FROM node:18-alpine

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Usar nginx para servir la aplicación
FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html

# Configuración nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]