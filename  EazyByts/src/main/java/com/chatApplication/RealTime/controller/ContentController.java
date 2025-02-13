package com.chatApplication.RealTime.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;

import com.chatApplication.RealTime.dto.UserDto;
import com.chatApplication.RealTime.service.UserService;

@Controller
public class ContentController {

	@GetMapping("/")
	public String Home() {
		return "index";
	}
	
	
	@GetMapping("/login")
	public String login() {
		return "login";
	}
	
	@GetMapping("/logout")
	public String logout () {
		return "redirect:/";
	}
	
	@GetMapping("/req/signup")
	public String signup(Model model) {
		model.addAttribute("user",new UserDto());
		return "signup";
	}
	
	
	
	@GetMapping("/group")
    public String groupChat() {
        return "group"; // Name of your Thymeleaf template for group chat
    }
	@GetMapping("/private")
    public String privateChat() {
        return "private"; // Name of your Thymeleaf template for private chat
    }
}
