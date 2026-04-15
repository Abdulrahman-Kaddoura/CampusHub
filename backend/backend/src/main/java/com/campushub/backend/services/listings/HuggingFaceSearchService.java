package com.campushub.backend.services.listings;

import com.campushub.backend.dtos.listing.AiSearchResultDTO;
import com.campushub.backend.models.listings.Listing;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class HuggingFaceSearchService {

    private static final String INFERENCE_BASE_URL = "https://router.huggingface.co/hf-inference/models/";

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Value("${app.ai.huggingface.api-token:}")
    private String apiToken;

    @Value("${app.ai.huggingface.model:sentence-transformers/all-MiniLM-L6-v2}")
    private String model;

    public List<AiSearchResultDTO> rankListings(String query, List<Listing> listings) throws IOException, InterruptedException {
        System.out.println("[HF Search] rankListings called — query: \"" + query + "\", listings count: " + (listings == null ? 0 : listings.size()));

        if (query == null || query.isBlank() || listings == null || listings.isEmpty()) {
            System.out.println("[HF Search] Returning empty — query or listings are null/empty.");
            return List.of();
        }
        if (apiToken == null || apiToken.isBlank()) {
            System.out.println("[HF Search] ERROR — HuggingFace API token is not configured.");
            throw new IllegalStateException("Hugging Face API token is not configured");
        }

        System.out.println("[HF Search] Embedding query: \"" + query + "\"");
        double[] queryEmbedding = embedText(query);
        System.out.println("[HF Search] Query embedding done, dimensions: " + queryEmbedding.length);

        List<AiSearchResultDTO> ranked = new ArrayList<>();

        for (Listing listing : listings) {
            String listingText = toListingText(listing);
            if (listingText.isBlank()) {
                System.out.println("[HF Search] Skipping listing " + listing.getListingId() + " — no text.");
                continue;
            }
            double[] listingEmbedding = embedText(listingText);
            double score = cosineSimilarity(queryEmbedding, listingEmbedding);
            System.out.println("[HF Search] Listing " + listing.getListingId() + " (\"" + listing.getTitle() + "\") score: " + score);
            ranked.add(new AiSearchResultDTO(listing.getListingId(), score));
        }

        List<AiSearchResultDTO> sorted = ranked.stream()
                .sorted(Comparator.comparingDouble(AiSearchResultDTO::getScore).reversed())
                .toList();

        System.out.println("[HF Search] Ranking complete. Top result: " + (sorted.isEmpty() ? "none" : sorted.get(0).getListingId() + " score=" + sorted.get(0).getScore()));
        return sorted;
    }

    private String toListingText(Listing listing) {
        String title = listing.getTitle() == null ? "" : listing.getTitle();
        String description = listing.getDescription() == null ? "" : listing.getDescription();
        String category = (listing.getCategory() != null && listing.getCategory().getName() != null)
                ? listing.getCategory().getName()
                : "";
        return (title + "\n" + description + "\n" + category).trim();
    }

    private double[] embedText(String text) throws IOException, InterruptedException {
        String encodedModel = URLEncoder.encode(model, StandardCharsets.UTF_8);
        URI uri = URI.create(INFERENCE_BASE_URL + encodedModel);

        System.out.println("[HF Search] POST " + uri + " | text length: " + text.length() + " chars");

        String requestBody = objectMapper.writeValueAsString(
                objectMapper.createObjectNode()
                        .put("inputs", text)
                        .set("options", objectMapper.createObjectNode().put("wait_for_model", true))
        );

        HttpRequest request = HttpRequest.newBuilder(uri)
                .timeout(Duration.ofSeconds(30))
                .header("Authorization", "Bearer " + apiToken)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        long start = System.currentTimeMillis();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        long elapsed = System.currentTimeMillis() - start;
        System.out.println("[HF Search] Response status: " + response.statusCode() + " (" + elapsed + "ms) | body length: " + response.body().length() + " chars");

        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            System.out.println("[HF Search] ERROR body: " + response.body());
            throw new IOException("Hugging Face request failed with status " + response.statusCode() + ": " + response.body());
        }

        JsonNode root = objectMapper.readTree(response.body());
        return parseEmbedding(root);
    }

    private double[] parseEmbedding(JsonNode root) throws IOException {
        if (!root.isArray() || root.isEmpty()) {
            throw new IOException("Unexpected Hugging Face embedding format");
        }

        JsonNode first = root.get(0);
        if (first != null && first.isNumber()) {
            return toVector(root);
        }

        if (first != null && first.isArray()) {
            int dimensions = first.size();
            double[] averaged = new double[dimensions];
            int rows = 0;

            for (JsonNode tokenVector : root) {
                if (!tokenVector.isArray() || tokenVector.size() != dimensions) {
                    continue;
                }
                rows++;
                for (int i = 0; i < dimensions; i++) {
                    averaged[i] += tokenVector.get(i).asDouble();
                }
            }

            if (rows == 0) {
                throw new IOException("No valid embedding rows returned");
            }

            for (int i = 0; i < dimensions; i++) {
                averaged[i] /= rows;
            }
            return averaged;
        }

        throw new IOException("Unsupported Hugging Face embedding response");
    }

    private double[] toVector(JsonNode arrayNode) {
        double[] vector = new double[arrayNode.size()];
        for (int i = 0; i < arrayNode.size(); i++) {
            vector[i] = arrayNode.get(i).asDouble();
        }
        return vector;
    }

    private double cosineSimilarity(double[] a, double[] b) {
        int size = Math.min(a.length, b.length);
        if (size == 0) {
            return 0;
        }

        double dot = 0;
        double normA = 0;
        double normB = 0;

        for (int i = 0; i < size; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        if (normA == 0 || normB == 0) {
            return 0;
        }

        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
