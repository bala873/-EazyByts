package com.chatApplication.RealTime.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import com.chatApplication.RealTime.dto.UserDto;
import com.chatApplication.RealTime.service.UserService;

@Controller
public class RegistrationController {
    @Autowired
    private UserService userService;
    private AuthenticationManager authenticationManager;

    public RegistrationController(UserService userService) {
		super();
		this.userService = userService;
	}

	@PostMapping("/req/signup")
    public String saveUser(@ModelAttribute("user") UserDto userDto, Model model) {
        userService.save(userDto);
        model.addAttribute("message", "Registered Successfully");
        return "chatPage";
    }
    
	@PostMapping("/req/login")
	public String loginUser(@ModelAttribute("user") UserDto userDto, Model model) {
	    try {
	        Authentication authentication = authenticationManager.authenticate(
	            new UsernamePasswordAuthenticationToken(userDto.getUsername(), userDto.getPassword())
	        );

	        SecurityContextHolder.getContext().setAuthentication(authentication);
	        model.addAttribute("message", "Login successful");
	        return "redirect:/chatPage"; // Redirecting to chat page after successful login
	    } catch (Exception e) {
	        model.addAttribute("error", "Invalid username or password");
	        return "login"; // Return to login page with error message
	    }
	}

    @GetMapping("/chatPage")
	public String showChatpage(Model model) {
		Object user = userService.getUser();
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		 if (!(authentication instanceof AnonymousAuthenticationToken)) {
	            String username = authentication.getName();
	            model.addAttribute("username",username);
	        }
		 model.addAttribute("user",user);
		return "chatPage";
	}
}
