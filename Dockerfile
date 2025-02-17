FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Create data directory
RUN mkdir -p /app/data

EXPOSE 3000

CMD ["npm", "start"] 