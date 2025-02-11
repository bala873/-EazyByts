package com.chatApplication.RealTime.service;




import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.chatApplication.RealTime.entity.UserEntity;
import com.chatApplication.RealTime.repo.UserRepository;

@Service
public class CustomUserDetailService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository; // Assuming you have a UserRepository
    public CustomUserDetailService(UserRepository userRepository) {
		super();
		this.userRepository = userRepository;
	}
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Fetch user from the database
        UserEntity user = userRepository.findByUsername(username).orElseThrow(() -> new 
        		UsernameNotFoundException("User not found with username: " + username));
            

        return new CustomUserDetails(user);
//        // Return a Spring Security User object
//        return new org.springframework.security.core.userdetails.User(
//            user.getUsername(),
//            user.getPassword(),
//            Collections.emptyList() // Add roles/authorities if needed
//        );
    }
}
