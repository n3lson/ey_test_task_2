package com.ey.backend.controller;

import com.ey.backend.entity.Account;
import com.ey.backend.entity.Balance;
import com.ey.backend.entity.Cls;
import com.ey.backend.entity.Revs;
import com.ey.backend.service.DatabaseService;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.List;

/*
* This class is a controller which handles
* POST and GET requests to the '/api' mapping.
* */
@CrossOrigin
@RestController
@RequestMapping("/api")
public class DatabaseController {
    DatabaseService db;

    public DatabaseController(DatabaseService db) {
        this.db = db;
    }

    @PostMapping("/files")
    public long postFile(@RequestBody String filename) throws SQLException {
        return db.postFile(filename);
    }

    @PostMapping("/classes")
    public long postClass(@RequestBody Cls cls) throws SQLException {
        return db.postClass(cls);
    }

    @PostMapping("/accounts")
    public long postAccount(@RequestBody Account account) throws SQLException {
        return db.postAccount(account);
    }

    @PostMapping("/opening-balance")
    public void postOpeningBalance(@RequestBody Balance balance) throws SQLException {
        db.postOpeningBalance(balance);
    }

    @PostMapping("/revs")
    public void postRevs(@RequestBody Revs revs) throws SQLException {
        db.postRevs(revs);
    }

    @PostMapping("/closing-balance")
    public void postClosingBalance(@RequestBody Balance balance) throws SQLException {
        db.postClosingBalance(balance);
    }

    @GetMapping("/files/titles")
    public List<String> getFiles() throws SQLException {
        return db.getFiles();
    }

    @GetMapping("/files/{filename}")
    public List<String[]> getDataFromFile(@PathVariable String filename) throws SQLException {
        return db.getDataFromFile(filename);
    }
}
