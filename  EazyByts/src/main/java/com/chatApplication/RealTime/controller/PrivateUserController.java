package com.chatApplication.RealTime.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import com.chatApplication.RealTime.entity.PrivateUser;
import com.chatApplication.RealTime.service.PrivateUserService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class PrivateUserController {

	private final PrivateUserService privateUserService;
	
	@MessageMapping("/user.addUser")
    @SendTo("/user/public")
    public PrivateUser addUser(@Payload PrivateUser user) {
		System.out.println(user.getFullName());
		System.out.println(user.getStatus());
        privateUserService.saveUser(user);
        return user;
    }

    @MessageMapping("/user.disconnectUser")
    @SendTo("/user/public")
    public PrivateUser disconnectUser(@Payload PrivateUser user) {
   
        privateUserService.disconnect(user);
        return user;
    }

    @GetMapping("/users")
    public ResponseEntity<List<PrivateUser>> findConnectedUsers() {
        return ResponseEntity.ok(privateUserService.findConnectedUsers());
    }
}



