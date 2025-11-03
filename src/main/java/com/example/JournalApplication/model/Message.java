package com.example.JournalApplication.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalDateTime;

@Entity
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) Long id;
    Long senderUserId;
    Long receiverUserId;
    String content;
    LocalDateTime sentAt;
    boolean read;
}