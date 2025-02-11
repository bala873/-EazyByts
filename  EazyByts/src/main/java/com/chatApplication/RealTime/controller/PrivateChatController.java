package com.chatApplication.RealTime.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.chatApplication.RealTime.entity.ChatNotification;
import com.chatApplication.RealTime.entity.PrivateMessage;
import com.chatApplication.RealTime.service.PrivateMessageService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class PrivateChatController {

	private final SimpMessagingTemplate messagingTemplate;
    private final PrivateMessageService privateMessageService;

    @MessageMapping("/chat")
    public void processMessage(@Payload PrivateMessage privateMessage) {
    	PrivateMessage savedMsg = privateMessageService.save(privateMessage);
    	System.out.println("Sending message to user: " + privateMessage.getRecipientId());

        messagingTemplate.convertAndSendToUser(
                privateMessage.getRecipientId(), "/queue/messages",
                new ChatNotification(
                        savedMsg.getId(),
                        savedMsg.getSenderId(),
                        savedMsg.getRecipientId(),
                        savedMsg.getContent()
                )
        );
    }

    @GetMapping("/messages/{senderId}/{recipientId}")
    public ResponseEntity<List<PrivateMessage>> findChatMessages(@PathVariable String senderId,
                                                 @PathVariable String recipientId) {
        return ResponseEntity
                .ok(privateMessageService.findChatMessages(senderId, recipientId));
    }
}
