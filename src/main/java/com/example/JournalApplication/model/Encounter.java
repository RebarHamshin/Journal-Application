package com.example.JournalApplication.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalDateTime;

@Entity
public class Encounter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) Long id;
    Long patientId;
    Long practitionerId;
    Long locationId;
    LocalDateTime startTime;
    LocalDateTime endTime;
    String notes;
}