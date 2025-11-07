# ---- build stage ----
FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -e -DskipTests dependency:go-offline
COPY src ./src
RUN mvn -q -DskipTests package

# ---- run stage ----
FROM eclipse-temurin:25-jre
WORKDIR /app
ENV SPRING_PROFILES_ACTIVE=docker


# wait script (copied below)
COPY wait-for-db.sh /app/wait-for-db.sh
RUN chmod +x /app/wait-for-db.sh

COPY --from=build /app/target/*.jar /app/app.jar
EXPOSE 8080

ENTRYPOINT ["/app/wait-for-db.sh", "db", "1433", "java", "-jar", "/app/app.jar"]
