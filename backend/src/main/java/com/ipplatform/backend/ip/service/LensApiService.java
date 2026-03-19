package com.ipplatform.backend.ip.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ipplatform.backend.ip.exception.ExternalApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.util.*;

/**
 * Calls Lens.org Patent & Scholarly APIs.
 *
 * POST https://api.lens.org/patent/search
 * POST https://api.lens.org/scholarly/search
 */
@Service
public class LensApiService {

    private static final Logger log = LoggerFactory.getLogger(LensApiService.class);

    // Fields Lens.org accepts in the "include" array for patent search
    private static final List<String> PATENT_INCLUDE = List.of(
            "lens_id", "jurisdiction", "doc_number", "kind",
            "date_published", "doc_key", "lang",
            "biblio", "abstract", "legal_status", "publication_type");

    private static final List<String> SCHOLARLY_INCLUDE = List.of(
            "lens_id", "title", "authors", "year_published",
            "scholarly_citations_count", "abstract", "source",
            "external_ids", "publication_type", "fields_of_study");

    private static final List<String> PATENT_DETAIL_INCLUDE = List.of(
            "lens_id", "jurisdiction", "doc_number", "kind",
            "date_published", "lang", "biblio", "abstract",
            "legal_status", "publication_type", "description");

    @Value("${ip.api.lens.base-url:https://api.lens.org}")
    private String baseUrl;

    @Value("${ip.api.lens.api-key}")
    private String apiKey;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public LensApiService(WebClient.Builder builder, ObjectMapper objectMapper) {
        this.webClient = builder.build();
        this.objectMapper = objectMapper;
    }

    // ── Patent Search ─────────────────────────────────────────────────────────

    /**
     * Search patents. Optionally filter by jurisdiction (e.g. "US", "EP", "CN").
     */
    public JsonNode searchPatents(String query, String jurisdiction, int page, int size) {
        Map<String, Object> body = buildPatentBody(query, jurisdiction, page, size);
        return callLens("/patent/search", body, "patent");
    }

    // ── Scholarly Search ──────────────────────────────────────────────────────

    public JsonNode searchScholarly(String query, int page, int size) {
        Map<String, Object> body = Map.of(
                "query", Map.of("query_string", Map.of("query", query)),
                "from", page * size,
                "size", size,
                "include", SCHOLARLY_INCLUDE);
        return callLens("/scholarly/search", body, "scholarly");
    }

    // ── Patent Detail ─────────────────────────────────────────────────────────

    /**
     * Fetch full patent by Lens ID. Returns the single patent node (not wrapped in
     * data[]).
     */
    public JsonNode getPatentByLensId(String lensId) {
        Map<String, Object> body = Map.of(
                "query", Map.of("term", Map.of("lens_id", lensId)),
                "size", 1,
                "include", PATENT_DETAIL_INCLUDE);
        JsonNode result = callLens("/patent/search", body, "patent");
        JsonNode data = result.path("data");
        if (data.isEmpty()) {
            throw new ExternalApiException("Lens.org", 404, "Patent not found: " + lensId);
        }
        return data.get(0);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Builds the Lens.org request body.
     * If jurisdiction is provided (non-blank), wraps the query in a bool/must
     * filter.
     */
    private Map<String, Object> buildPatentBody(String query, String jurisdiction, int page, int size) {
        Object lensQuery;

        if (jurisdiction != null && !jurisdiction.isBlank()) {
            // bool query: full-text match + jurisdiction term filter
            lensQuery = Map.of(
                    "bool", Map.of(
                            "must", List.of(
                                    Map.of("query_string", Map.of("query", query)),
                                    Map.of("term", Map.of("jurisdiction", jurisdiction.toUpperCase())))));
        } else {
            lensQuery = Map.of("query_string", Map.of("query", query));
        }

        return Map.of(
                "query", lensQuery,
                "from", page * size,
                "size", size,
                "include", PATENT_INCLUDE);
    }

    private JsonNode callLens(String path, Map<String, Object> body, String apiType) {
        String url = baseUrl + path;
        log.info("Lens.org {} search → {}", apiType, url);
        try {
            String raw = webClient.post()
                    .uri(url)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .onStatus(s -> !s.is2xxSuccessful(), response -> response.bodyToMono(String.class).flatMap(err -> {
                        log.error("Lens.org {} error: {}", response.statusCode(), err);
                        return Mono.error(new ExternalApiException(
                                "Lens.org", response.statusCode().value(), err));
                    }))
                    .bodyToMono(String.class)
                    .block();

            return objectMapper.readTree(raw);

        } catch (ExternalApiException e) {
            throw e;
        } catch (WebClientResponseException e) {
            throw new ExternalApiException("Lens.org", e.getStatusCode().value(),
                    e.getResponseBodyAsString());
        } catch (Exception e) {
            throw new ExternalApiException("Lens.org",
                    "Failed to contact Lens.org: " + e.getMessage(), e);
        }
    }
}
