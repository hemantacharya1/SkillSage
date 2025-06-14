package com.skillsage.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.skillsage.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
	Optional<User> findByEmail(String email);

}
