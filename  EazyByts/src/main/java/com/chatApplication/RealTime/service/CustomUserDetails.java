package com.chatApplication.RealTime.service;

import java.util.Collection;
import java.util.Collections;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.chatApplication.RealTime.entity.UserEntity;

public class CustomUserDetails implements UserDetails {
	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		// TODO Auto-generated method stub
		return Collections.emptyList();
	}
	@Override
	public String getPassword() {
		// TODO Auto-generated method stub
		return userEntity.getPassword();
	}
	@Override
	public String getUsername() {
		// TODO Auto-generated method stub
		return userEntity.getUsername();
		
	}
	@Override
	public boolean isAccountNonExpired() {
		// TODO Auto-generated method stub
		return true;
	}
	@Override
	public boolean isAccountNonLocked() {
		// TODO Auto-generated method stub
		return true;
	}
	@Override
	public boolean isCredentialsNonExpired() {
		// TODO Auto-generated method stub
		return true;
	}
	@Override
	public boolean isEnabled() {
		// TODO Auto-generated method stub
		return true;
	}
	private final UserEntity userEntity;
	public CustomUserDetails(UserEntity userEntity) {
		super();
		this.userEntity = userEntity;
	}


}
