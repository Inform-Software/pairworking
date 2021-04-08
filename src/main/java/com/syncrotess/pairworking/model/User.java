package com.syncrotess.pairworking.model;

import java.util.HashSet;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name="user")
public class User {

  @Id
  @GeneratedValue(strategy=GenerationType.IDENTITY)
  private Long id;
  @Column
  private String name; // Konvention: 'vorname.nachname'
  @Column
  private String token;

  @JsonIgnore
  @ManyToMany
  @JoinTable(
    name = "coop_task",
    joinColumns = @JoinColumn(name = "user_id"),
    inverseJoinColumns = @JoinColumn(name = "task_id"))
  Set<Task> doneTask;


  public User () {

  }

  public User (String name,
               String token) {
    super ();
    this.name = name;
    this.token = token;
  }



  public Set<Task> getDoneTask () {
    if (doneTask == null) {
      doneTask = new HashSet<>();
    }
    return doneTask;
  }


  public void setDoneTask (Set<Task> doneTask) {
    this.doneTask = doneTask;
  }

  public String getToken () {
    return token;
  }


  public void setToken (String token) {
    this.token = token;
  }

  public Long getId () {
    return id;
  }

  public void setId (Long userId) {
    this.id = userId;
  }

  public String getName () {
    return name;
  }

  public void setName (String name) {
    this.name = name;
  }


}
