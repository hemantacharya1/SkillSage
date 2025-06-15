package com.skillsage.config;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GeminiService {
	
	private final RestTemplate restTemplate = new RestTemplate();
    private final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    
    @Value("${gemini.api.key}")
    private String apiKey;

    public String generateResponse(String prompt) {
        String url = GEMINI_API_URL + "?key=" + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = Map.of(
            "contents", new Object[] {
                Map.of("parts", new Object[] {
                    Map.of("text", prompt)
                })
            }
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                var candidates = (java.util.List<Map<String, Object>>) response.getBody().get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    var content = (Map<String, Object>) candidates.get(0).get("content");
                    var parts = (java.util.List<Map<String, Object>>) content.get("parts");
                    return (String) parts.get(0).get("text");
                }
            }
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }

        return "No response from Gemini.";
    }
}
