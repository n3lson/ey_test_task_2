package com.ey.backend.entity;

public class Revs {
    final private double debit;
    final private double credit;
    final private long classId;
    final private long accountId;
    final private long fileId;

    public Revs(double debit, double credit, long classId, long accountId, long fileId) {
        this.debit = debit;
        this.credit = credit;
        this.classId = classId;
        this.accountId = accountId;
        this.fileId = fileId;
    }

    public double getDebit() {
        return debit;
    }

    public double getCredit() {
        return credit;
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
