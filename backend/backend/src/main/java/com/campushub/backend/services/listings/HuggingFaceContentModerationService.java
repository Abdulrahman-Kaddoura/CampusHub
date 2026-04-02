package com.campushub.backend.services.listings;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class HuggingFaceContentModerationService {

    private static final Logger log = LoggerFactory.getLogger(HuggingFaceContentModerationService.class);
    private static final String MODERATION_MODEL_URL = "https://api-inference.huggingface.co/models/unitary/toxic-bert";

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Value("${app.ai.huggingface.api-token:}")
    private String apiToken;

    @Value("${app.ai.huggingface.moderation-threshold:0.7}")
    private double moderationThreshold;

    /**
     * Returns true if the text is appropriate (not toxic), false if it should be blocked.
     * Fails open: returns true if the API token is not configured or the API call fails,
     * so listings are never blocked solely due to AI service downtime.
     */
    public boolean isAppropriate(String text) {
        if (text == null || text.isBlank()) {
            return true;
        }
        if (apiToken == null || apiToken.isBlank()) {
            log.debug("Hugging Face API token not configured; skipping content moderation.");
            return true;
        }

        try {
            String requestBody = objectMapper.writeValueAsString(
                    objectMapper.createObjectNode().put("inputs", text)
            );

            HttpRequest request = HttpRequest.newBuilder(URI.create(MODERATION_MODEL_URL))
                    .timeout(Duration.ofSeconds(15))
                    .header("Authorization", "Bearer " + apiToken)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                log.warn("Content moderation API returned status {}; allowing listing through.", response.statusCode());
                return true;
            }

            JsonNode root = objectMapper.readTree(response.body());
            return parseModerationResult(root);

        } catch (Exception e) {
            log.warn("Content moderation API call failed; allowing listing through. Reason: {}", e.getMessage());
            return true;
        }
    }

    private boolean parseModerationResult(JsonNode root) {
        // Response format: [[{"label": "toxic", "score": 0.95}, {"label": "non_toxic", "score": 0.05}]]
        JsonNode results = root.isArray() && !root.isEmpty() ? root.get(0) : root;

        if (results == null || !results.isArray()) {
            log.warn("Unexpected moderation response format; allowing listing through.");
            return true;
        }

        for (JsonNode labelScore : results) {
            String label = labelScore.path("label").asText("");
            double score = labelScore.path("score").asDouble(0.0);
            if ("toxic".equalsIgnoreCase(label) && score >= moderationThreshold) {
                log.info("Content flagged as toxic with score {}; blocking listing.", score);
                return false;
            }
        }
        return true;
    }
}
