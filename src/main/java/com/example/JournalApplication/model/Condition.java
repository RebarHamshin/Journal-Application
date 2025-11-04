package com.example.JournalApplication.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "[condition]")
public class Condition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @Column(name = "code", length = 50, nullable = false)
    private String code;

    @Column(name = "display")
    private String display;

    @Column(name = "onset_date")
    private LocalDate onsetDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asserted_by_practitioner_id")
    private Practitioner assertedByPractitioner;


}
