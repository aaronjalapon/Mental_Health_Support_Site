-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 22, 2025 at 09:34 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mentalhealthdb`
--

-- --------------------------------------------------------

--
-- Table structure for table `client`
--

CREATE TABLE `client` (
  `client_id` int(11) NOT NULL,
  `unique_id` int(50) NOT NULL,
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `contactNumber` varchar(15) NOT NULL,
  `Pronouns` enum('He/Him/His','She/Her/Hers','Others','I prefer not to say') NOT NULL,
  `Address` text NOT NULL,
  `ValidID` varchar(255) NOT NULL,
  `otp` int(50) NOT NULL,
  `Status` enum('Approved','Pending','Blocked') NOT NULL,
  `verification_status` varchar(50) NOT NULL,
  `Role` varchar(50) NOT NULL,
  `RegisterDate` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `client`
--

INSERT INTO `client` (`client_id`, `unique_id`, `firstName`, `lastName`, `username`, `password`, `email`, `contactNumber`, `Pronouns`, `Address`, `ValidID`, `otp`, `Status`, `verification_status`, `Role`, `RegisterDate`) VALUES
(2, 735682636, 'John', 'Doe', 'jDoe123', '$2y$10$C9yX7F6a6.2GW9/a3u1Pvu6GS.6g6L8CFn5aff/vo8fHJjfFW/CXG', 'kidshine19@gmail.com', '09123456789', '', 'Davao City', '1740211008_cf5d97f3786318bb.jpg', 0, 'Pending', '1', 'client', '2025-02-22');

-- --------------------------------------------------------

--
-- Table structure for table `therapists`
--

CREATE TABLE `therapists` (
  `therapist_id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `specialization` varchar(100) NOT NULL,
  `experience_years` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `bio` text DEFAULT NULL,
  `status` enum('Active','Inactive','On Leave') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `therapist_availability`
--

CREATE TABLE `therapist_availability` (
  `id` int(11) NOT NULL,
  `therapist_id` int(11) NOT NULL,
  `day` enum('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `break_start` time DEFAULT NULL,
  `break_end` time DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `client`
--
ALTER TABLE `client`
  ADD PRIMARY KEY (`client_id`);

--
-- Indexes for table `therapists`
--
ALTER TABLE `therapists`
  ADD PRIMARY KEY (`therapist_id`),
  ADD UNIQUE KEY `unique_email` (`email`);

--
-- Indexes for table `therapist_availability`
--
ALTER TABLE `therapist_availability`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_therapist_day` (`therapist_id`,`day`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `client`
--
ALTER TABLE `client`
  MODIFY `client_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `therapists`
--
ALTER TABLE `therapists`
  MODIFY `therapist_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `therapist_availability`
--
ALTER TABLE `therapist_availability`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `therapist_availability`
--
ALTER TABLE `therapist_availability`
  ADD CONSTRAINT `therapist_availability_ibfk_1` FOREIGN KEY (`therapist_id`) REFERENCES `therapists` (`therapist_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
