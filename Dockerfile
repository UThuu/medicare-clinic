# Stage 1: Build frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build backend
FROM maven:3.9.5-eclipse-temurin-17 AS backend-build
WORKDIR /app/backend
COPY backend/pom.xml ./
RUN mvn dependency:go-offline -B
COPY backend/src ./src
# Sao chép build của frontend vào thư mục static của Spring Boot
COPY --from=frontend-build /app/frontend/dist ./src/main/resources/static
RUN mvn clean package -DskipTests

# Stage 3: Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=backend-build /app/backend/target/clinic-0.0.1-SNAPSHOT.jar ./app.jar

# Render sẽ cung cấp biến môi trường PORT, Spring Boot sẽ dùng nó qua application-prod.properties
ENV PORT=8080
EXPOSE 8080

# Kích hoạt profile 'prod' để sử dụng application-prod.properties
ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-jar", "app.jar"]
