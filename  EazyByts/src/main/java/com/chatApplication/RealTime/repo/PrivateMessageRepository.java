package com.chatApplication.RealTime.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chatApplication.RealTime.entity.PrivateMessage;

public interface PrivateMessageRepository extends JpaRepository<PrivateMessage, String> {
    List<PrivateMessage> findByChatId(String chatId);
}
