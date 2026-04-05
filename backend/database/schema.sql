-- writing queries to create the relational schemas of our banking-wallet database

create database if not exists banking_wallet_db; -- this helps us to avoid accidental script failure

use banking_wallet_db;

create table users(
	userID bigint primary key auto_increment,
    name varchar(50) not null,
    email varchar(50) not null unique,
    phone varchar(10) not null unique,
    status varchar(10) not null,
    createdAt timestamp not null default current_timestamp
) engine = InnoDB;

create table accounts(
	accountID bigint primary key auto_increment,
    userID bigint not null,
    accountNumber varchar(50) not null unique,
    accountType varchar(10) not null,
    balance decimal(20,4) not null check (balance>=0),
    status varchar(10) not null,
    createdAt timestamp not null default current_timestamp,
    
    foreign key (userID) references users(userID)
);

create table transactionStatus(
	statusID int not null primary key auto_increment,
    statusName varchar(50) not null
);

create table transactions(
	transactionID bigint primary key auto_increment,
    fromAccountID bigint not null,
    toAccountID bigint not null,
	amount decimal(20,2) not null check (amount>0),
    transactionType varchar(10) not null, -- here transaction type is always = 'TRANSFER', later we can add 'WITHDRAWAL' AND 'DEPOSIT' feature
    statusID int not null,
    createdAt timestamp not null default current_timestamp,
    
    check (toAccountID <> fromAccountID), -- since column level CHECK constraint is not allowed to reference another column
    
    foreign key (fromAccountID) references accounts(accountID),
    foreign key (toAccountID) references accounts(accountID),
    foreign key (statusID) references transactionStatus(statusID)
);
-- this schema explicitly enforces that all transactions are TRANSFERS only
-- hence transactionType will always be equal to 'transfer'
-- future advancement: to include withdraw/deposit features

create table ledgerEntries(
	ledgerID bigint primary key auto_increment,
    transactionID bigint not null,
    accountID bigint not null,
    entryType varchar(50) not null check (entryType = 'DEBIT' or entryType = 'CREDIT'),
    amount decimal(20,5) not null check (amount>0),
    createdAt timestamp not null default current_timestamp,
    
    foreign key (transactionID) references transactions(transactionID),
    foreign key (accountID) references accounts(accountID)
);

create table auditLog(
	logID bigint primary key auto_increment,
    entityName varchar(50) not null,
    entityID bigint not null,
    action varchar(50) not null,
    performedBy bigint not null,
    createdAt timestamp not null default current_timestamp
);

CREATE TABLE beneficiaries (
    beneficiaryID   BIGINT PRIMARY KEY AUTO_INCREMENT,
    userID          BIGINT NOT NULL,
    accountNumber   VARCHAR(50) NOT NULL,
    nickname        VARCHAR(50),
    addedType       VARCHAR(10) NOT NULL,
    createdAt       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (userID) REFERENCES users(userID),
    UNIQUE KEY unique_user_account (userID, accountNumber)
) ENGINE = InnoDB;
