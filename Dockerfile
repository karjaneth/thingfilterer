FROM node:carbon

EXPOSE 80

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install --production

COPY src src

ENTRYPOINT ["npm", "start"]
