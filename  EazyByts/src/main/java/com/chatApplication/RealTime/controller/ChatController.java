package com.chatApplication.RealTime.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import com.chatApplication.RealTime.entity.ChatRoom;
import com.chatApplication.RealTime.entity.Message;
import com.chatApplication.RealTime.entity.PrivateMessage;
import com.chatApplication.RealTime.repo.ChatRoomRepository;
import com.chatApplication.RealTime.repo.MessageRepository;
import com.chatApplication.RealTime.repo.PrivateMessageRepository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Controller
//@RequestMapping("/chat")
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageRepository messageRepository;
    private final PrivateMessageRepository privateMessageRepository;
    private final ChatRoomRepository chatRoomRepository;

    public ChatController(SimpMessagingTemplate messagingTemplate, MessageRepository messageRepository,
                          PrivateMessageRepository privateMessageRepository, ChatRoomRepository chatRoomRepository) {
        this.messagingTemplate = messagingTemplate;
        this.messageRepository = messageRepository;
        this.privateMessageRepository = privateMessageRepository;
        this.chatRoomRepository = chatRoomRepository;
    }

    // Group Chat: Send a message to all users
    @MessageMapping("chat.sendMessage")
    @SendTo("/topic/public")
    public Message sendMessage(@Payload Message message) {
    	message.setTimestamp(new Date());
        message.setRead(false);
        messageRepository.save(message);
    	return message;
    }
    @MessageMapping("chat.addUser")
    @SendTo("/topic/public")
    public Message addUser(@Payload Message message,SimpMessageHeaderAccessor headerAccessor) {
    	headerAccessor.getSessionAttributes().put("username", message.getSender());
    	return message;
    }
    

    // Private Chat: Send a message to a specific user
//    @MessageMapping("/private")
//    public void sendPrivateMessage(@Payload PrivateMessage message) {
//        message.setTimestamp(new Date());
//        message.setRead(false);
//        privateMessageRepository.save(message);
//        messagingTemplate.convertAndSendToUser(message.getRecipient(), "/queue/messages", message);
//    }
//
    // Create a new chat room
    @PostMapping("/group")
    public ChatRoom createChatRoom(@RequestBody ChatRoom chatRoom) {
        return chatRoomRepository.save(chatRoom);
    }
//
//  
//
//    // Search messages by keyword
    @GetMapping("/search")
    public List<Message> searchMessages(@RequestParam String keyword) {
        return messageRepository.findByContentContainingIgnoreCase(keyword);
    }
//
//    // Get all private messages for a user
//    @GetMapping("/privateMessages")
//    public List<PrivateMessage> getPrivateMessages(@RequestParam String recipient) {
//        return privateMessageRepository.findByRecipient(recipient);
//    }
}