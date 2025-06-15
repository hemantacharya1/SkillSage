package com.skillsage.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class CodeEmbeddingServiceImpl {

	@Value("${huggingface.api-token}")
	private String apiToken;

	@Value("${huggingface.model-url}")
	private String modelUrl;

	private final RestTemplate restTemplate = new RestTemplate();

	public float[] generateMeanEmbedding(String code) {
		// 1. Prepare HTTP headers
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);
		headers.setBearerAuth(apiToken);
		 headers.setAccept(List.of(MediaType.APPLICATION_JSON)); 

		// 2. Prepare body
		Map<String, String> body = Map.of("inputs", code);
		HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

		// 3. Send request
		ResponseEntity<List<List<Double>>> response = restTemplate.exchange(modelUrl, HttpMethod.POST, request,
				new ParameterizedTypeReference<>() {
				});

		List<List<Double>> embeddings = response.getBody();
		int tokenCount = embeddings.size();
		int vectorSize = embeddings.get(0).size();

		// 4. Compute mean
		float[] mean = new float[vectorSize];
		for (List<Double> tokenVec : embeddings) {
			for (int i = 0; i < vectorSize; i++) {
				mean[i] += tokenVec.get(i).floatValue();
			}
		}
		for (int i = 0; i < vectorSize; i++) {
			mean[i] /= tokenCount;
		}

		return mean;
	}
}