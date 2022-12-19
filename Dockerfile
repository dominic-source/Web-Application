FROM node:14.15.1
WORKDIR /code
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production
COPY . .
CMD ["node", "app.js"]
CMD sleep 30
