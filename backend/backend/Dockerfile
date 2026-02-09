FROM eclipse-temurin:17-jre

# Create a non-root user
RUN groupadd app && useradd -m -g app app

WORKDIR /app

# Copy the app JAR
COPY build/libs/*.jar app.jar

# Set ownership
RUN chown -R app:app /app

# Switch to non-root user
USER app

EXPOSE 9090

# Start Spring Boot directly, no wait script
ENTRYPOINT ["java", "-jar", "app.jar"]
