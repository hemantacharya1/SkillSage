package com.skillsage.exception;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import jakarta.servlet.http.HttpServletRequest;

@ControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ExceptionResponse> handleValidationExceptions(MethodArgumentNotValidException ex,
			HttpServletRequest request) {

		String errorMessage = ex.getBindingResult().getFieldErrors().stream()
				.map(e -> e.getField() + ": " + e.getDefaultMessage()).findFirst().orElse("Validation error");

		ExceptionResponse response = ExceptionResponse.builder().timestamp(LocalDateTime.now())
				.status(HttpStatus.BAD_REQUEST.value()).error("Validation Failed").message(errorMessage)
				.path(request.getRequestURI()).stackTrace(getStackTraceAsString(ex)).build();

		return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
	}

	@ExceptionHandler(BadRequestException.class)
	public ResponseEntity<?> handleBadRequestExceptions(BadRequestException ex, HttpServletRequest request) {
		ExceptionResponse response = ExceptionResponse.builder().timestamp(LocalDateTime.now())
				.status(HttpStatus.BAD_REQUEST.value()).error("Bad Request").message(ex.getMessage())
				.path(request.getRequestURI()).stackTrace(getStackTraceAsString(ex)).build();

		return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ExceptionResponse> handleAllOtherExceptions(Exception ex, HttpServletRequest request) {

		ExceptionResponse response = ExceptionResponse.builder().timestamp(LocalDateTime.now())
				.status(HttpStatus.INTERNAL_SERVER_ERROR.value()).error("Internal Server Error")
				.message(ex.getMessage()).path(request.getRequestURI()).stackTrace(getStackTraceAsString(ex)).build();

		return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
	}

	private String getStackTraceAsString(Exception ex) {
		StringWriter sw = new StringWriter();
		ex.printStackTrace(new PrintWriter(sw));
		return sw.toString();
	}
}
