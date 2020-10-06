package com.ey.backend.entity;

public class Balance {
    private final double asset;
    private final double passive;
    private final long classId;
    private final long accountId;
    private final long fileId;

    public Balance(double asset, double passive, long classId, long accountId, long fileId) {
        this.asset = asset;
        this.passive = passive;
        this.classId = classId;
        this.accountId = accountId;
        this.fileId = fileId;
    }

    public double getAsset() {
        return asset;
    }

    public double getPassive() {
        return passive;
    }

    public long getClassId() {
        return classId;
    }

    public long getAccountId() {
        return accountId;
    }

    public long getFileId() {
        return fileId;
    }
}
