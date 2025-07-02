FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
# Install all dependencies so Vite is available when running the dev server
RUN npm install
COPY . .
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
