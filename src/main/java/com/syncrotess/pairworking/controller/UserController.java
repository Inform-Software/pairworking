

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.syncrotess.pairworking.model.User;
import com.syncrotess.pairworking.service.UserRepository;

@RestController
@RequestMapping("/api")
public class UserController {

  @Autowired
  private UserRepository userRepository;

  /*
  @RequestMapping("/devs")
  public ResponseEntity<List<User>> getAllDevs() {
    try {
      List<User> devs = new ArrayList<>();
      userRepository.findAllDevs().forEach (devs::add);
      if (devs.isEmpty ()) {
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
      }
      return new ResponseEntity<>(devs, HttpStatus.OK);
    } catch (Exception e) {
      return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  @RequestMapping("/supports")
  public ResponseEntity<List<User>> getAllSupports() {
    try {
      List<User> supports = new ArrayList<>();
      userRepository.findAllSupports().forEach (supports::add);
      if (supports.isEmpty ()) {
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
      }
      return new ResponseEntity<>(supports, HttpStatus.OK);
    } catch (Exception e) {
      return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }
  */


  @RequestMapping("/users")
  public ResponseEntity<Iterable<User>> getAllUsers(@RequestParam(required=false) String name) {
    try {
      List<User> users = new ArrayList<>();

      if (name == null)
        userRepository.findAll (Sort.by(new Sort.Order(Sort.Direction.ASC, "name"))).forEach (users::add);
      else
        userRepository.findByNameContaining(name).forEach (users::add);

      if (users.isEmpty () ) {
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
      }
      return new ResponseEntity<>(users, HttpStatus.OK);
    } catch (Exception e) {
      return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /*
  @RequestMapping("/operators/{id}")
  public ResponseEntity<Iterable<User>> getUsersByTaskId(@PathVariable("id") Long id) {
    List<User> users = new ArrayList<>();
    userRepository.findUsersByTaskId (id).forEach(users::add);
    if (users.isEmpty ()) {
      return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    return new ResponseEntity<>(users, HttpStatus.OK);
  }
  */

  @GetMapping("/users/{id}")
  public ResponseEntity<User> getUserById(@PathVariable("id") Long userId) {
    Optional<User> userData = userRepository.findById(userId);

    if (userData.isPresent()) {
      return new ResponseEntity<>(userData.get(), HttpStatus.OK);
    } else {
      return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
  }

  @PostMapping("/users")
  public ResponseEntity<User> addUser(@RequestBody User user) {
    try {
      User _user = userRepository
          .save(new User(user.getName(), user.getToken ()));
      return new ResponseEntity<>(_user, HttpStatus.CREATED);
    } catch (Exception e) {
      return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @PutMapping("/users/{id}")
  public ResponseEntity<User> updateUser(@PathVariable("id") Long userId, @RequestBody User user) {
    Optional<User> userData = userRepository.findById(userId);

    if (userData.isPresent()) {
      User _user = userData.get();
      _user.setName(user.getName());
      _user.setToken(user.getToken());
      return new ResponseEntity<>(userRepository.save(_user), HttpStatus.OK);
    } else {
      return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
  }

  @DeleteMapping("/users/{id}")
  public ResponseEntity<HttpStatus> deleteUser(@PathVariable("id") Long userId) {
    try {
      userRepository.deleteById(userId);
      return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    } catch (Exception e) {
      return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @DeleteMapping("/users")
  public ResponseEntity<HttpStatus> deleteAllUsers() {
    try {
      userRepository.deleteAll();
      return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    } catch (Exception e) {
      return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}
