package com.chatApplication.RealTime.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatNotification {
	 private Long id;
	 private String senderId;
	 private String recipientId;
	 private String content;	
}
