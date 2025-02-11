package com.chatApplication.RealTime.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "private_users")
public class PrivateUser {
	
	@Id
    private String nickName;
	private String fullName;
	private Status status;
	
	

}
