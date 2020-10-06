package com.ey.backend.entity;

public class Account {
    private final int value;
    private final long fileId;

    public Account(int value, long fileId) {
        this.value = value;
        this.fileId = fileId;
    }

    public int getValue() {
        return value;
    }

    public long getFileId() {
        return fileId;
    }
}
