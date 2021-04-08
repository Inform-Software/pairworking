package com.syncrotess.pairworking.service;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.syncrotess.pairworking.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
   List<User> findByName (String name);
   List<User> findByNameContaining (String name);
   List<User> findAll ();

   /*
   @Query("Select u from User u where u.role = 'dev'")
   List<User> findAllDevs ();

   @Query("Select u from User u where u.role = 'support'")
   List<User> findAllSupports();
   */

   @Query("SELECT DISTINCT u FROM User u INNER JOIN u.doneTask t")
   List<User> findUsersAndTasks();

   /*
   @Query(value = "select coop_task.user_id from task inner join coop_task on task.id = coop_task.task_id where coop_task.task_id = ?1",
       nativeQuery = true)
   List<User> findUsersByTaskId (Long id);
   */
}
