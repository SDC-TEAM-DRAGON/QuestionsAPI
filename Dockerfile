# syntax=docker/dockerfile:1

FROM node:18-alpine
WORKDIR /QuestionsAPI
COPY . .
RUN npm install --production
CMD ["node", "index.js"]
EXPOSE 3000