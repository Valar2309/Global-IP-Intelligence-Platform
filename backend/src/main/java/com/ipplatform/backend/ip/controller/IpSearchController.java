package com.ipplatform.backend.ip.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.ipplatform.backend.ip.service.LensApiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * GET /api/search
 *
 * Params:
 * q - search query (required)
 * type - PATENT | SCHOLARLY | ALL (default: PATENT)
 * jurisdiction - optional ISO code e.g. US, EP, CN, IN
 * page - 0-based (default: 0)
 * size - max 50 (default: 10)
 *
 * Returns flat response:
 * {
 * "total": 728,
 * "page": 0,
 * "size": 10,
 * "results": [
 * {
 * "lensId": "003-170-156-004-288",
 * "title": "Vaccine nanotechnology",
 * "jurisdiction": "CN",
 * "datePublished": "2010-10-13",
 * "applicants": ["MASSACHUSETTS INST TECHNOLOGY"],
 * "inventors": ["VON ANDRIAN ULRICH H"],
 * "abstract": "The present invention...",
 * "patentStatus": "DISCONTINUED",
 * "publicationType":"PATENT_APPLICATION",
 * "docNumber": "101861165"
 * }
 * ]
 * }
 *
 * This endpoint is PUBLIC — no JWT required (see SecurityConfig).
 */
@RestController
@RequestMapping("/api/search")
public class IpSearchController {

    private final LensApiService lensApiService;

    public IpSearchController(LensApiService lensApiService) {
        this.lensApiService = lensApiService;
    }

    @GetMapping
    public ResponseEntity<ObjectNode> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "PATENT") String type,
            @RequestParam(required = false) String jurisdiction,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        size = Math.min(size, 50);

        ObjectNode response = JsonNodeFactory.instance.objectNode();
        response.put("page", page);
        response.put("size", size);
        ArrayNode results = response.putArray("results");

        switch (type.toUpperCase()) {
            case "SCHOLARLY" -> {
                JsonNode raw = lensApiService.searchScholarly(q, page, size);
                response.put("total", raw.path("total").asLong(0));
                raw.path("data").forEach(n -> results.add(flattenScholarly(n)));
            }
            case "ALL" -> {
                int half = Math.max(1, size / 2);
                JsonNode patents = lensApiService.searchPatents(q, jurisdiction, page, half);
                JsonNode scholarly = lensApiService.searchScholarly(q, page, half);
                response.put("total",
                        patents.path("total").asLong(0) + scholarly.path("total").asLong(0));
                patents.path("data").forEach(n -> results.add(flattenPatent(n)));
                scholarly.path("data").forEach(n -> results.add(flattenScholarly(n)));
            }
            default -> { // PATENT
                JsonNode raw = lensApiService.searchPatents(q, jurisdiction, page, size);
                response.put("total", raw.path("total").asLong(0));
                raw.path("data").forEach(n -> results.add(flattenPatent(n)));
            }
        }

        return ResponseEntity.ok(response);
    }

    // ── Mappers ───────────────────────────────────────────────────────────────

    /**
     * Maps a raw Lens.org patent node to a flat, frontend-friendly object.
     */
    private ObjectNode flattenPatent(JsonNode n) {
        ObjectNode out = JsonNodeFactory.instance.objectNode();
        out.put("lensId", text(n, "lens_id"));
        out.put("jurisdiction", text(n, "jurisdiction"));
        out.put("docNumber", text(n, "doc_number"));
        out.put("kind", text(n, "kind"));
        out.put("datePublished", text(n, "date_published"));
        out.put("publicationType", text(n, "publication_type"));

        JsonNode biblio = n.path("biblio");

        // Title — pick first English title, fallback to first available
        out.put("title", extractTitle(biblio));

        // Applicants
        ArrayNode applicants = out.putArray("applicants");
        biblio.path("parties").path("applicants")
                .forEach(a -> applicants.add(a.path("extracted_name").path("value").asText(
                        a.path("name").asText(""))));

        // Inventors
        ArrayNode inventors = out.putArray("inventors");
        biblio.path("parties").path("inventors")
                .forEach(i -> inventors.add(i.path("extracted_name").path("value").asText(
                        i.path("name").asText(""))));

        // Abstract — pick first English abstract, fallback to first
        out.put("abstract", extractAbstract(n));

        // Legal status
        JsonNode ls = n.path("legal_status");
        out.put("patentStatus", ls.path("patent_status").asText(""));
        out.put("legalStatusCode", ls.path("legal_status_code").asText(""));

        return out;
    }

    /**
     * Maps a raw Lens.org scholarly node to a flat, frontend-friendly object.
     */
    private ObjectNode flattenScholarly(JsonNode n) {
        ObjectNode out = JsonNodeFactory.instance.objectNode();
        out.put("lensId", text(n, "lens_id"));
        out.put("type", "SCHOLARLY");
        out.put("title", text(n, "title"));
        out.put("datePublished", n.path("year_published").asText(""));
        out.put("citationsCount", n.path("scholarly_citations_count").asInt(0));
        out.put("publicationType", text(n, "publication_type"));

        // Authors
        ArrayNode authors = out.putArray("authors");
        n.path("authors").forEach(a -> authors.add(a.path("display_name").asText(a.path("name").asText(""))));

        // Abstract
        out.put("abstract", n.path("abstract").asText(""));

        return out;
    }

    // ── Utility ───────────────────────────────────────────────────────────────

    private String text(JsonNode node, String field) {
        return node.path(field).asText("");
    }

    private String extractTitle(JsonNode biblio) {
        JsonNode titles = biblio.path("invention_title");
        if (titles.isMissingNode() || titles.isEmpty())
            return "";
        // Prefer English
        for (JsonNode t : titles) {
            if ("en".equalsIgnoreCase(t.path("lang").asText(""))) {
                return t.path("text").asText("");
            }
        }
        return titles.get(0).path("text").asText("");
    }

    private String extractAbstract(JsonNode patent) {
        JsonNode abstracts = patent.path("abstract");
        if (abstracts.isMissingNode() || abstracts.isEmpty())
            return "";
        for (JsonNode a : abstracts) {
            if ("en".equalsIgnoreCase(a.path("lang").asText(""))) {
                return a.path("text").asText("");
            }
        }
        return abstracts.get(0).path("text").asText("");
    }
}
