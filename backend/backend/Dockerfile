FROM eclipse-temurin:17-jre

USER root
RUN apt-get update && apt-get install -y netcat && rm -rf /var/lib/apt/lists/*

RUN groupadd app && useradd -m -g app app

WORKDIR /app

COPY build/libs/*.jar app.jar

COPY wait-for-postgres.sh /app/wait-for-postgres.sh
RUN chmod +x /app/wait-for-postgres.sh && chown -R app:app /app

USER app

EXPOSE 9090

CMD ["/app/wait-for-postgres.sh", "postgres:5432", "java", "-jar", "app.jar"]
