package com.skillsage.entity;

import java.util.Arrays;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class PgVectorFloatArrayConverter implements AttributeConverter<float[], String> {

    @Override
    public String convertToDatabaseColumn(float[] vector) {
        return Arrays.toString(vector).replace("[", "'[").replace("]", "]'");
    }

    @Override
    public float[] convertToEntityAttribute(String dbData) {
        String trimmed = dbData.replaceAll("[\\[\\]']", "");
        String[] parts = trimmed.split(",");
        float[] vector = new float[parts.length];
        for (int i = 0; i < parts.length; i++) {
            vector[i] = Float.parseFloat(parts[i].trim());
        }
        return vector;
    }
}

