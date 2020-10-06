package com.ey.backend.service;

import com.ey.backend.entity.Account;
import com.ey.backend.entity.Balance;
import com.ey.backend.entity.Cls;
import com.ey.backend.entity.Revs;
import org.springframework.stereotype.Service;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/*
* This service resolves POST and GET requests caught by the controller.
* */
@Service
public class DatabaseService implements AutoCloseable {
    private static final String JDBC_DRIVER = "com.mysql.cj.jdbc.Driver";
    private static final String DATABASE_URL = "jdbc:mysql://localhost:3306/ey?serverTimezone=UTC";

    private static final String USER = "root";
    private static final String PASSWORD = "r00tRoo7";

    private static final String INSERT_FILE = "INSERT INTO files(title) VALUES(?)";
    private static final String SELECT_FILE = "SELECT id FROM files WHERE title = ?";

    private static final String INSERT_CLASS = "INSERT INTO classes(title, file_id) VALUES(?, ?)";
    private static final String SELECT_CLASS = "SELECT id FROM classes WHERE title = ?";

    private static final String INSERT_ACCOUNT = "INSERT INTO accounts(value, file_id) VALUES(?, ?)";
    private static final String SELECT_ACCOUNT = "SELECT id FROM accounts WHERE value = ?";

    private static final String INSERT_OPENING_BALANCE =
            "INSERT INTO opening_balance(asset, passive, class_id, account_id, file_id) VALUES(?, ?, ?, ?, ?)";

    private static final String INSERT_CLOSING_BALANCE =
            "INSERT INTO closing_balance(asset, passive, class_id, account_id, file_id) VALUES(?, ?, ?, ?, ?)";

    private static final String INSERT_REVS =
            "INSERT INTO revs(debit, credit, class_id, account_id, file_id) VALUES(?, ?, ?, ?, ?)";

    private static final String SELECT_FILES = "SELECT title FROM files";

    // Select all the data from the file (the result is similar to the excel file data).
    private static final String SELECT_FILE_DATA =
            "SELECT " +
            "    accounts.value, " +
            "    opening_balance.asset AS obAsset, opening_balance.passive AS obPassive, " +
            "    revs.debit, revs.credit, " +
            "    closing_balance.asset AS cbAsset, closing_balance.passive AS cbPassive, " +
            "    classes.title " +
            "FROM opening_balance " +
            "JOIN accounts " +
            "ON opening_balance.account_id = accounts.id " +
            "JOIN revs " +
            "ON opening_balance.account_id = revs.account_id " +
            "JOIN closing_balance " +
            "ON opening_balance.account_id = closing_balance.id " +
            "JOIN classes " +
            "ON opening_balance.class_id = classes.id " +
            "JOIN files " +
            "ON accounts.file_id = files.id " +
            "WHERE files.title = ? " +
            "ORDER BY classes.title";


    private final Connection connection;

    // Get connection to the database and find the JDBC driver. Throw exceptions when failed.
    public DatabaseService() throws SQLException, ClassNotFoundException {
        this.connection = DriverManager.getConnection(DATABASE_URL, USER, PASSWORD);
        Class.forName(JDBC_DRIVER);
    }

    // Save balance to the database.
    private void postBalance(Balance balance, String query) throws SQLException {
        // Prepare statement for executing an SQL query.
        PreparedStatement statement = this.connection.prepareStatement(query);

        // Substitute balance asset, passive, class id and file id in '?' and execute the query.
        statement.setDouble(1, balance.getAsset());
        statement.setDouble(2, balance.getPassive());
        statement.setLong(3, balance.getClassId());
        statement.setLong(4, balance.getAccountId());
        statement.setLong(5, balance.getFileId());
        statement.execute();
        statement.close();
    }

    // Save a filename to the database.
    public long postFile(String filename) throws SQLException {
        // Prepare statement for executing an SQL query.
        PreparedStatement statement = this.connection.prepareStatement(INSERT_FILE);

        // Substitute filename in '?' in the query and execute it.
        statement.setString(1, filename);
        statement.execute();

        // Get generated id of this file in the database.
        statement = this.connection.prepareStatement(SELECT_FILE);
        statement.setString(1, filename);

        ResultSet resultSet = statement.executeQuery();
        resultSet.next();
        long id = resultSet.getLong("id");
        statement.close();
        return id;
    }

    // Save a class to the database.
    public long postClass(Cls cls) throws SQLException {
        // Prepare statement for executing an SQL query.
        PreparedStatement statement = this.connection.prepareStatement(INSERT_CLASS);

        // Substitute class title and file id in '?' and execute the query.
        statement.setString(1, cls.getTitle());
        statement.setLong(2, cls.getFileId());
        statement.execute();

        // Get generated id of this class in the database.
        statement = this.connection.prepareStatement(SELECT_CLASS);
        statement.setString(1, cls.getTitle());

        ResultSet resultSet = statement.executeQuery();
        resultSet.next();
        long id = resultSet.getLong("id");
        statement.close();
        return id;
    }

    // Save an account to the database.
    public long postAccount(Account account) throws SQLException {
        // Prepare statement for executing an SQL query.
        PreparedStatement statement = this.connection.prepareStatement(INSERT_ACCOUNT);

        // Substitute account value and file id in '?' and execute the query.
        statement.setInt(1, account.getValue());
        statement.setLong(2, account.getFileId());
        statement.execute();

        // Get generated id of this account in the database.
        statement = this.connection.prepareStatement(SELECT_ACCOUNT);
        statement.setInt(1, account.getValue());
        ResultSet resultSet = statement.executeQuery();
        resultSet.next();
        long id = resultSet.getLong("id");
        statement.close();
        return id;
    }

    // Save opening balance to the database.
    public void postOpeningBalance(Balance balance) throws SQLException {
        postBalance(balance, INSERT_OPENING_BALANCE);
    }

    // Save closing balance to the database.
    public void postClosingBalance(Balance balance) throws SQLException {
        postBalance(balance, INSERT_CLOSING_BALANCE);
    }

    // Save revs to the database.
    public void postRevs(Revs revs) throws SQLException {
        // Prepare statement for executing an SQL query.
        PreparedStatement statement = this.connection.prepareStatement(INSERT_REVS);

        // Substitute revs debit, credit, class id and file id in '?' and execute the query.
        statement.setDouble(1, revs.getDebit());
        statement.setDouble(2, revs.getCredit());
        statement.setLong(3, revs.getClassId());
        statement.setLong(4, revs.getAccountId());
        statement.setLong(5, revs.getFileId());
        statement.execute();
        statement.close();
    }

    // Get all the files from the database.
    public List<String> getFiles() throws SQLException {
        // Prepare statement and execute an SQL query.
        PreparedStatement statement = this.connection.prepareStatement(SELECT_FILES);
        ResultSet rs = statement.executeQuery();
        int size = 0;

        // Count the size of the result set (the amount of files in the database).
        while (rs.next()) {
            ++size;
        }

        // Create a list of files with the initial size;
        List<String> files = new ArrayList<>(size);

        // Return the result set cursor to the beginning.
        rs.absolute(0);

        // Fill in the files list.
        while (rs.next()) {
            files.add(rs.getString("title"));
        }
        statement.close();
        return files;
    }

    // Get data from the file in list-of-rows format.
    public List<String[]> getDataFromFile(String filename) throws SQLException {
        // Prepare statement for executing an SQL query.
        PreparedStatement statement = this.connection.prepareStatement(SELECT_FILE_DATA);

        // Substitute filename in '?' and execute the query.
        statement.setString(1, filename);
        ResultSet rs = statement.executeQuery();
        int size = 0;

        // Count the size of the result set (the amount of rows from the table)
        while (rs.next()) {
            ++size;
        }

        // Create a list of rows with the initial size;
        List<String[]> rows = new ArrayList<>(size);

        // Return the result set cursor to the beginning.
        rs.absolute(0);

        // Set row values of the fields.
        while (rs.next()) {
            String[] row = new String[8];
            row[0] = rs.getString("value");
            row[1] = rs.getString("obAsset");
            row[2] = rs.getString("obPassive");
            row[3] = rs.getString("debit");
            row[4] = rs.getString("credit");
            row[5] = rs.getString("cbAsset");
            row[6] = rs.getString("cbPassive");
            row[7] = rs.getString("title");

            // Add the row to the list.
            rows.add(row);
        }
        statement.close();
        return rows;
    }

    // I hope Spring is clever enough to create this bean within try-with-resources :)
    @Override
    public void close() throws Exception {
        this.connection.close();
    }
}
