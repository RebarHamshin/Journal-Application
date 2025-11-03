package com.example.JournalApplication.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
public class Condition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) Long id;
    @Column(nullable = false) Long patientId;
    @Column(nullable = false) String condition;
    String display;
    LocalDate onsetDate;
    Long assertedByPractitionerId;
}
