FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline || true
COPY src src
RUN mvn package -DskipTests

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
RUN apt-get update && \
    apt-get install -y --no-install-recommends libreoffice-writer libreoffice-core fonts-liberation && \
    rm -rf /var/lib/apt/lists/*
COPY --from=build /app/target/*.jar app.jar
ENV JAVA_OPTS="-Xms64m -Xmx256m --add-opens java.base/sun.security.util=ALL-UNNAMED --add-opens java.base/java.io=ALL-UNNAMED"
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
