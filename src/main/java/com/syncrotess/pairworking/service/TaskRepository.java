package com.syncrotess.pairworking.service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.syncrotess.pairworking.model.Task;

public interface TaskRepository extends JpaRepository<Task, Long> {

  @Query(value = "SELECT t FROM Task t")
  List<Task> findAllIgnoreCase (Sort sort);


}
