package com.chatApplication.RealTime.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;


import com.chatApplication.RealTime.entity.PrivateUser;
import com.chatApplication.RealTime.entity.Status;

public interface PrivateUserRepository extends JpaRepository<PrivateUser, String> {
	
	List<PrivateUser> findAllByStatus(Status status);
}
