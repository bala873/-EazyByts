package com.chatApplication.RealTime.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chatApplication.RealTime.entity.Message;

public interface MessageRepository  extends JpaRepository<Message, Long> {
    List<Message> findByContentContainingIgnoreCase(String keyword);
}
