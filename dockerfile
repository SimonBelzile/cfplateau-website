# --- Build stage ---
FROM node:20-alpine AS build
WORKDIR /app

# Force l'install des devDependencies même si l'env impose la prod
ENV NODE_ENV=development
COPY package.json package-lock.json* ./
RUN npm ci --include=dev

# Copie le code et build (on utilise npx pour éviter tout souci de droits)
COPY . .
RUN npx astro --version && npm run build   # => génère /dist

# --- Run stage ---
FROM node:20-alpine AS run
WORKDIR /app
RUN npm i -g serve@14
COPY --from=build /app/dist ./dist
ENV PORT=8080
EXPOSE 8080
CMD ["serve", "-s", "dist", "-l", "${PORT}"]
