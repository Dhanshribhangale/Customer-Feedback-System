# Stage 1: Build the React app
FROM node:18-alpine AS build

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install

COPY . ./
RUN npm run build

# Stage 2: Serve the app using Nginx
FROM nginx:1.23-alpine

COPY --from=build /app/build /usr/share/nginx/html

# Optional: If using React Router, you need to configure Nginx
# to redirect all requests to index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]