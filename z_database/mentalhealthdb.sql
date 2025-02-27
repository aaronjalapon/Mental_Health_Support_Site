-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 24, 2025 at 10:50 PM
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
  `Pronouns` enum('He/Him/His','She/Her/Hers','They/Them/Theirs','I prefer not to say') NOT NULL,
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
(3, 129201451, 'Richard', 'Smith', 'richard123', '$2y$10$qkH46/DP6yw8ROZcyifaIOOcKWzD2f/y5ujVGDcgWkbt1YH48XARK', 'richardSmith@gmail.com', '09123456789', 'She/Her/Hers', 'Davao City', '1740293372_36f5743601b88ce6.jpg', 0, 'Approved', '1', 'user', '2025-02-23'),
(4, 689048998, 'Claires', 'Green', 'greenclaire', '$2y$10$.4KqG00sqIeYV.BuB0W76ubwf8MCM2Yu4cQsqwwA6/JdRIxZHtCfi', 'greenclaire@gmail.com', '09123456789', 'Others', 'Davao City', '1740406106_5cc48c5655efe7da.jpg', 0, 'Pending', '1', 'user', '2025-02-24');

-- --------------------------------------------------------

--
-- Table structure for table `testimonials`
--

CREATE TABLE `testimonials` (
  `testimonial_id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `content` text NOT NULL,
  `rating` tinyint(1) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `testimonials`
--

INSERT INTO `testimonials` (`testimonial_id`, `username`, `content`, `rating`, `created_at`) VALUES
(5, 'jDoe123', 'I want everything to work', 4, '2025-02-23 11:08:43'),
(6, 'IronHeart', 'Life is not daijoubo', 5, '2025-02-24 14:40:32'),
(7, 'Jm', 'I love Cho Miyeon', 5, '2025-02-24 14:40:48'),
(8, 'DoubleCake', 'Ayoko yung lasa ng C2 na kulay green', 5, '2025-02-24 14:41:18'),
(9, 'SungJinwoo', 'Can I aura farm here', 5, '2025-02-24 14:41:45'),
(10, 'Metalheart', 'Sometimes.... when we touch', 5, '2025-02-24 14:42:15');

-- --------------------------------------------------------

--
-- Table structure for table `therapists`
--

CREATE TABLE `therapists` (
  `therapist_id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `specialization` varchar(100) NOT NULL,
  `experience_years` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `bio` text DEFAULT NULL,
  `status` enum('Active','Inactive','On Leave') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `therapists`
--

INSERT INTO `therapists` (`therapist_id`, `first_name`, `last_name`, `specialization`, `experience_years`, `email`, `phone`, `bio`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Jane', 'Smith', 'Clinical Psychology', 8, 'janesmith@gmail.com', '09123456789', '', 'Active', '2025-02-22 15:11:55', '2025-02-23 06:03:29'),
(2, 'Robert', 'Johnson', 'Psychological Engineer', 69, 'robertjohnson@gmail.com', '09123456789', '', 'Active', '2025-02-22 15:34:21', '2025-02-23 05:06:08'),
(3, 'Philip', 'Stinger', 'Brain Technician', 666, 'philipS@gmail.com', '09123456789', 'Life is not good just die', 'Inactive', '2025-02-24 14:00:02', '2025-02-24 14:00:28');

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
-- Dumping data for table `therapist_availability`
--

INSERT INTO `therapist_availability` (`id`, `therapist_id`, `day`, `start_time`, `end_time`, `break_start`, `break_end`) VALUES
(29, 0, 'sunday', '21:00:00', '17:00:00', '12:00:00', '13:00:00'),
(30, 0, 'monday', '21:00:00', '17:00:00', '12:00:00', '13:00:00'),
(31, 0, 'tuesday', '21:00:00', '17:00:00', '12:00:00', '13:00:00'),
(32, 0, 'wednesday', '21:00:00', '17:00:00', '12:00:00', '13:00:00'),
(33, 0, 'thursday', '21:00:00', '17:00:00', '12:00:00', '13:00:00'),
(34, 0, 'friday', '21:00:00', '17:00:00', '12:00:00', '13:00:00'),
(35, 0, 'saturday', '21:00:00', '17:00:00', '12:00:00', '13:00:00'),
(260, 1, 'sunday', '21:00:00', '17:00:00', '12:00:00', '13:00:00'),
(261, 1, 'monday', '21:00:00', '17:00:00', '12:00:00', '13:00:00'),
(262, 1, 'tuesday', '21:00:00', '17:00:00', '12:00:00', '13:00:00'),
(263, 1, 'wednesday', '21:00:00', '17:00:00', '12:00:00', '13:00:00'),
(264, 1, 'thursday', '21:00:00', '17:00:00', '12:00:00', '13:00:00'),
(265, 1, 'friday', '21:00:00', '17:00:00', '12:00:00', '13:00:00'),
(266, 1, 'saturday', '21:00:00', '17:00:00', '12:00:00', '13:00:00'),
(267, 2, 'tuesday', '12:00:00', '00:00:00', '18:06:00', '18:06:00'),
(268, 2, 'wednesday', '12:00:00', '00:00:00', '18:06:00', '18:06:00'),
(269, 2, 'thursday', '12:00:00', '00:00:00', '18:06:00', '18:06:00'),
(270, 2, 'saturday', '12:00:00', '00:00:00', '18:06:00', '18:06:00'),
(277, 3, 'wednesday', '12:00:00', '21:10:00', '13:00:00', '14:00:00'),
(278, 3, 'thursday', '12:00:00', '21:10:00', '13:00:00', '14:00:00'),
(279, 3, 'friday', '12:00:00', '21:10:00', '13:00:00', '14:00:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `client`
--
ALTER TABLE `client`
  ADD PRIMARY KEY (`client_id`);

--
-- Indexes for table `testimonials`
--
ALTER TABLE `testimonials`
  ADD PRIMARY KEY (`testimonial_id`);

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
  ADD KEY `therapist_day` (`therapist_id`,`day`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `client`
--
ALTER TABLE `client`
  MODIFY `client_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `testimonials`
--
ALTER TABLE `testimonials`
  MODIFY `testimonial_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `therapists`
--
ALTER TABLE `therapists`
  MODIFY `therapist_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `therapist_availability`
--
ALTER TABLE `therapist_availability`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=280;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
