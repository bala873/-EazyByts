package com.chatApplication.RealTime.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.chatApplication.RealTime.entity.PrivateUser;
import com.chatApplication.RealTime.entity.Status;
import com.chatApplication.RealTime.repo.PrivateUserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PrivateUserService {

	private final PrivateUserRepository privateUserRepository;
	
	 public void saveUser(PrivateUser user) {
	        user.setStatus(Status.ONLINE);
	        privateUserRepository.save(user);
	    }

	    public void disconnect(PrivateUser user) {
	        var storedUser = privateUserRepository.findById(user.getFullName()).orElse(null);
	        if (storedUser != null) {
	            storedUser.setStatus(Status.OFFLINE);
	            privateUserRepository.save(storedUser);
	        }
	    }

	    public List<PrivateUser> findConnectedUsers() {
	        return privateUserRepository.findAllByStatus(Status.ONLINE);
	    }
}
