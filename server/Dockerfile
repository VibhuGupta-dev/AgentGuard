FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# Install curl for compose healthchecks
RUN apk add --no-cache curl

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
