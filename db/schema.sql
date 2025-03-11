CREATE DATABASE IF NOT EXISTS Bank;
USE Bank;

CREATE TABLE IF NOT EXISTS Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  fullName VARCHAR(255) NOT NULL,
  role ENUM('banker', 'customer') NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  accountNumber VARCHAR(20) NOT NULL UNIQUE,
  balance DECIMAL(10, 2) DEFAULT 0.00,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id)
);

CREATE TABLE IF NOT EXISTS Transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  accountId INT NOT NULL,
  type ENUM('deposit', 'withdrawal') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  balance DECIMAL(10, 2) NOT NULL,
  description VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (accountId) REFERENCES Accounts(id)
);