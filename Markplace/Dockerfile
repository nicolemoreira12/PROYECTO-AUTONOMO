FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package.json package-lock.json ./ 2>/dev/null || COPY package.json ./

# Instalar dependencias
RUN npm ci --omit=dev || npm install --production

# Copiar código fuente
COPY . .

# Build si es necesario (descomentar si usas TypeScript)
# RUN npm run build

# Exponer puerto
EXPOSE 3000

# Comando para arrancar
CMD ["npm", "start"]
