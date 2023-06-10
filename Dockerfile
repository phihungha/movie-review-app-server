FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
COPY prisma/ ./prisma/
RUN --mount=type=cache,target=~/.npm npm install
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

FROM node:18
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD [ "npm", "start" ]