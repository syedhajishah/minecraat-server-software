FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json* ./
RUN npm install --production

COPY tsconfig.json .eslintrc.js .prettierrc ./
COPY prisma ./prisma
COPY src ./src
COPY public ./public

RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/index.js"]
