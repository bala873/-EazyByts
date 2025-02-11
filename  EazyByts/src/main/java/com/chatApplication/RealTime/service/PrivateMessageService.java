package com.chatApplication.RealTime.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.chatApplication.RealTime.entity.PrivateMessage;
import com.chatApplication.RealTime.repo.PrivateMessageRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor

public class PrivateMessageService {

	private final PrivateMessageRepository privateMessageRepository;
	 private final ChatRoomService chatRoomService;

	    public PrivateMessage save(PrivateMessage privateMessage) {
	        var chatId = chatRoomService
	                .getChatRoomId(privateMessage.getSenderId(), privateMessage.getRecipientId(), true)
	                .orElseThrow(); // You can create your own dedicated exception
	        privateMessage.setChatId(chatId);
	        privateMessageRepository.save(privateMessage);
	        return privateMessage;
	    }

	    public List<PrivateMessage> findChatMessages(String senderId, String recipientId) {
	        var chatId = chatRoomService.getChatRoomId(senderId, recipientId, false);
	        return chatId.map(privateMessageRepository::findByChatId).orElse(new ArrayList<>());
	    }
}
