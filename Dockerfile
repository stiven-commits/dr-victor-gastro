# Etapa 1: Construir el proyecto con Node (Vite)
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Servir la aplicación con Nginx
FROM nginx:alpine
# Copiamos la web compilada
COPY --from=build /app/dist /usr/share/nginx/html
# Reemplazamos la configuración de Nginx por la nuestra
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]