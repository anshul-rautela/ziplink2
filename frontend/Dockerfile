# Build stage: Compile the React app
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Pass build-time environment variable for React
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

# Run stage: Serve the static files with Nginx
FROM nginx:stable-alpine
# Copy the built files to the Nginx public folder
COPY --from=build /app/build /usr/share/nginx/html
# Use custom Nginx config to support React routing
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
