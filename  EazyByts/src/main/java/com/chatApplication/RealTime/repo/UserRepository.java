package com.chatApplication.RealTime.repo;


import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;


import com.chatApplication.RealTime.entity.UserEntity;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
	
	  Optional<UserEntity> findByUsername(String username);
}
