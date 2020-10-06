package com.ey.backend.entity;

public class Cls {
    private final String title;
    private final long fileId;

    public Cls(String title, long fileId) {
        this.title = title;
        this.fileId = fileId;
    }

    public String getTitle() {
        return title;
    }

    public long getFileId() {
        return fileId;
    }
}
