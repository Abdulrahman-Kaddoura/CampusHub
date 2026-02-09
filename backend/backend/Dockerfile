FROM eclipse-temurin:17-jre

RUN groupadd app && useradd -m -g app app

WORKDIR /app

COPY build/libs/*.jar app.jar

#COPY src/main/resources/application-local.properties /app/application.properties

RUN chown -R app:app /app

USER app

EXPOSE 9090

ENTRYPOINT ["java", "-jar", "app.jar"]
