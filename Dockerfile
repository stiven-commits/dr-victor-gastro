# Etapa 1: Construir el proyecto
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Servir la aplicación con Nginx configurado
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Reemplazamos la configuración por defecto por la nuestra
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]