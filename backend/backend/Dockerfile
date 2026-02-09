FROM eclipse-temurin:17-jre

RUN groupadd app && useradd -m -g app app

WORKDIR /app

COPY build/libs/*.jar app.jar

COPY wait-for-postgres.sh /app/wait-for-postgres.sh

RUN chmod +x /app/wait-for-postgres.sh \
    && chown -R app:app /app

USER app

EXPOSE 9090

ENTRYPOINT ["/app/wait-for-postgres.sh", "java", "-jar", "app.jar"]
