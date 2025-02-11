package com.chatApplication.RealTime.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chatApplication.RealTime.entity.ChatRoom;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, String> {
	 Optional<ChatRoom> findBySenderIdAndRecipientId(String senderId, String recipientId);
}
