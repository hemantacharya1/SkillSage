package com.skillsage.config;

import java.util.List;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import com.skillsage.entity.User;
import com.skillsage.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class UserDetailServiceImpl implements UserDetailsService {

	
	private final UserRepository userRepository;

	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new UsernameNotFoundException("User Not Found With This Email"));

		// Convert your User entity to Spring Security's UserDetails
		return new org.springframework.security.core.userdetails.User(user.getEmail(), user.getPassword(),
				List.of(new SimpleGrantedAuthority(user.getRole().name())));
	}

}
