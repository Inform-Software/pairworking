package com.syncrotess.pairworking.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.syncrotess.pairworking.model.Task;
import com.syncrotess.pairworking.model.User;
import com.syncrotess.pairworking.service.TaskRepository;
import com.syncrotess.pairworking.service.UserRepository;

@RestController
@RequestMapping("/api")
public class TaskController {

  @Autowired
  private TaskRepository taskRepo;

  @Autowired
  private UserRepository userRepo;

  @GetMapping("/tasks")
  public ResponseEntity<List<Task>> getAllTasks () {
    try {
      List<Task> tasks = new ArrayList<> ();
      taskRepo.findAll ().forEach (tasks::add);
      if (tasks.isEmpty ())
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
      else
        return new ResponseEntity<>(tasks, HttpStatus.OK);
    } catch (Exception e) {
      return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @GetMapping("/order/tasks/{category}/{order}")
  public ResponseEntity<List<Task>> getAllTasksBy (@PathVariable String category, @PathVariable String order) {
    try {
      List<Task> tasks = new ArrayList<> ();
      if (order.equals ("desc")) {
        taskRepo.findAllIgnoreCase (Sort.by(new Sort.Order(Sort.Direction.DESC, category).ignoreCase ())).forEach (tasks::add);
      } else if (order.equals ("asc")) {
        taskRepo.findAllIgnoreCase (Sort.by(new Sort.Order (Sort.Direction.ASC, category).ignoreCase ())).forEach (tasks::add);
      }
      if (tasks.isEmpty ())
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
      else
        return new ResponseEntity<>(tasks, HttpStatus.OK);
    } catch (Exception e) {
      return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @GetMapping("/tasks/{id}")
  public ResponseEntity<Task> getTaskById (@PathVariable Long id) {
    Optional<Task> taskData = taskRepo.findById (id);

    if (taskData.isPresent()) {
      return new ResponseEntity<>(taskData.get(), HttpStatus.OK);
    } else {
      return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
  }

  @PostMapping("/tasks")
  public ResponseEntity<Task> addTask(@RequestBody Task task) {
    try {
      Task t = new Task(task.getTicket(), task.getDescription(), task.getBegin(), task.getOperator(), task.getTeam());
      Task _task = taskRepo.save(t);
      String[] userlist = task.formatOperator ();
      for ( int i=0; i<userlist.length; i++) {
        User user = findUser(userlist[i]);
        if (user == null) {
          return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
        t.addOperator (user);
        user.getDoneTask().add (_task);
        userRepo.save (user);
      }


      return new ResponseEntity<>(_task, HttpStatus.CREATED);
    } catch (Exception e) {
      return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private User findUser (String username) {

    for (User user: userRepo.findAll ()) {
      if (user.getName ().equalsIgnoreCase (username) || user.getToken ().equalsIgnoreCase (username)) {
        return user;
      }
    }
    return null;
  }

  @PutMapping("/tasks/{id}")
  public ResponseEntity<Task> updateTask(@PathVariable("id") Long id, @RequestBody Task task) {
    Optional<Task> taskData = taskRepo.findById(id);

    if (taskData.isPresent()) {
      Task _task = taskData.get();
      _task.setTicket(task.getTicket());
      _task.setDescription(task.getDescription ());
      _task.setMark(task.getMark());
      _task.setBegin (task.getBegin());
      _task.setEnd (task.getEnd());
      _task.setOperator (task.getOperator ());
      _task.setTeam (task.getTeam ());
      String[] userlist = task.formatOperator ();
      for ( int i=0; i<userlist.length; i++) {
        User user = findUser(userlist[i]);
        if (user == null) {
          return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
        _task.addOperator (user);
        user.getDoneTask().add (_task);
        userRepo.save (user);
      }
      return new ResponseEntity<>(taskRepo.save(_task), HttpStatus.OK);
    } else {
      return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
  }

  @DeleteMapping("/tasks/{id}")
  public ResponseEntity<HttpStatus> deleteTask(@PathVariable("id") Long id) {
    try {
      Optional<Task> taskData = taskRepo.findById (id);
      if (taskData.isPresent () ) {
        Task task = taskData.get ();
        String[] userlist = task.formatOperator ();
        for ( int i=0; i<userlist.length; i++) {
          User user = findUser(userlist[i]);
          if (user == null) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
          }
          user.getDoneTask().clear ();
          userRepo.save (user);
        }
        task.removeOperators();
      }
      taskRepo.deleteById(id);
      return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    } catch (Exception e) {
      return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @DeleteMapping("/tasks")
  public ResponseEntity<HttpStatus> deleteAllTasks() {
    try {
      taskRepo.deleteAll();
      return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    } catch (Exception e) {
      return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}
