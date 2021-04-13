package com.syncrotess.pairworking.model;

import java.util.HashSet;
import java.util.Set;
import java.util.regex.PatternSyntaxException;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToMany;
import javax.persistence.Table;

@Entity
@Table (name = "task")
public class Task {

  @Id
  @GeneratedValue (strategy = GenerationType.IDENTITY)
  private Long   id;
  @Column
  private String ticket;
  @Column
  private String description;
  @Column
  private int    mark;         // Schulnote (1-6)
  @Column
  private String begin;
  @Column
  private String end = "offen";
  @Column
  private String operator;
  @Column
  private String team;

  @ManyToMany (mappedBy = "doneTask", fetch = FetchType.LAZY)
  Set<User>      operators;

  public Task () {

  }

  public Task (String ticket,
               String description,
               String begin,
               String operator,
               String team) {
    super ();
    this.ticket = ticket;
    this.description = description;
    this.begin = begin;
    this.operator = operator;
    this.team = team;
  }

  public void addOperator (User operator) {
    if (operators == null) {
      operators = new HashSet<> ();
    }
    operators.add (operator);
  }
  public void removeOperators () {
    operators.clear ();
  }

  public Set<User> getOperators () {
    return operators;
  }

  public String[] formatOperator () {
    try {
      String[] userlist = operator.split (",");
      for (int i = 0; i < userlist.length; i++) {
        userlist[i] = userlist[i].toLowerCase ();
        userlist[i] = userlist[i].trim ();
      }
      return userlist;
    } catch (PatternSyntaxException e) {
      return new String[] {operator};
    }

  }

  public String getOperator () {
    return operator;
  }

  public void setOperator (String operator) {
    this.operator = operator;
  }

  public String getTeam () {
    return team;
  }

  public void setTeam (String team) {
    this.team = team;
  }

  public Long getId () {
    return id;
  }

  public void setId (Long id) {
    this.id = id;
  }

  public String getBegin () {
    return begin;
  }

  public void setBegin (String begin) {
    this.begin = begin;
  }

  public String getEnd () {
    return end;
  }

  public void setEnd (String end) {
    this.end = end;
  }

  public int getMark () {
    return mark;
  }

  public void setMark (int mark) {
    this.mark = mark;
  }

  public String getTicket () {
    return ticket;
  }

  public void setTicket (String ticket) {
    this.ticket = ticket;
  }

  public String getDescription () {
    return description;
  }

  public void setDescription (String description) {
    this.description = description;
  }

}
