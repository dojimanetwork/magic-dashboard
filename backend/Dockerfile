# # Stage 1: Build the application
# FROM node:21 AS builderWORKDIR /usr/src/app
# COPY package*.json ./
# RUN npm install
# COPY . .
# RUN npm run build
# # Stage 2: Run the application
# FROM node:21-slim
# WORKDIR /usr/src/app
# COPY --from=builder /usr/src/app/dist ./dist
# COPY package*.json ./
# RUN npm install --only=production
# EXPOSE 3000
# CMD ["node", "dist/index.js"]


FROM node:18
WORKDIR /app
COPY package*.json ./
RUN yarn
COPY . .
RUN yarn run build
EXPOSE 3010
CMD ["node", "build/server.js"]