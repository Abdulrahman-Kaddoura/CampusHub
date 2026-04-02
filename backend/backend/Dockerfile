# ---------- Stage 1: Extract layered JAR ----------
FROM eclipse-temurin:17-jre-alpine AS extractor
WORKDIR /extract
COPY build/libs/*.jar app.jar
RUN java -Djarmode=layertools -jar app.jar extract

# ---------- Stage 2: Runtime ----------
FROM eclipse-temurin:17-jre-alpine

# Alpine uses addgroup/adduser (not groupadd/useradd)
RUN addgroup -S app && adduser -S -G app app

WORKDIR /app

# Copy each layer separately — only the application/ layer changes on code updates,
# so Docker cache reuses the large dependencies/ layer on every rebuild.
COPY --from=extractor /extract/dependencies/ ./
COPY --from=extractor /extract/spring-boot-loader/ ./
COPY --from=extractor /extract/snapshot-dependencies/ ./
COPY --from=extractor /extract/application/ ./

RUN chown -R app:app /app

USER app

EXPOSE 9090

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "org.springframework.boot.loader.launch.JarLauncher"]
