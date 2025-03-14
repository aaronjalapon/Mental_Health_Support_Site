-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 13, 2025 at 02:07 AM
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
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `appointment_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `therapist_id` int(11) NOT NULL,
  `appointment_date` date NOT NULL,
  `appointment_time` time NOT NULL,
  `session_type` enum('video','voice','chat') NOT NULL,
  `status` enum('pending','upcoming','completed','cancelled','reschedule_pending','reschedule_requested','cancellation_pending','cancellation_requested') NOT NULL DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `cancellation_reason` text DEFAULT NULL,
  `cancellation_by` enum('therapist','client') DEFAULT NULL,
  `reschedule_notes` text DEFAULT NULL,
  `reschedule_by` enum('therapist','client') DEFAULT NULL,
  `proposed_date` date DEFAULT NULL,
  `proposed_time` time DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(5, 469102382, 'Annika', 'Dumalogdog', 'annikangs', '$2y$10$Dpv6P8PwG1VEgS9Jq4o2LOy4nJKfPkGtRqc024SA6cbKUp7f//dGO', 'a.dumalogdog.547692@umindanao.edu.ph', '09123456789', 'They/Them/Theirs', 'Davao City', '1740447980_715644717626391a.jpg', 0, 'Approved', '1', 'client', '2025-02-25'),
(8, 87204975, 'Claire', 'Green', 'greenclaire', '$2y$10$ZFxkMZFatdxjWEqiFWDNducdhV1ybBjepRvc8iZh8u6lKuokEeLkm', 'greenclaire@gmail.com', '09123456789', 'They/Them/Theirs', 'Davao City', '1740465251_27ff3be4eadd91f0.jpg', 0, 'Approved', '1', 'client', '2025-02-25'),
(13, 1426136559, 'Kids', 'Kid', 'kid123', '$2y$10$i/WZcbdUSwavWxWZX/L8guEQx77zquqHbeGLB7xV5wVPwEojL8pdW', 'johnDoe@gmail.com', '09123456789', 'They/Them/Theirs', 'Matina, Davao City', '1741065740_3b0f983446a29a47.jpg', 0, 'Approved', '1', 'client', '2025-03-04'),
(17, 947464385, 'Jane', 'Smith', 'jane', '$2y$10$V0rIPRK55KGe6cX90km0qeLN1Z//DxpxtG.6ZoBXfGHcGVe/u1GBy', 'janesmith@gmail.com', '09123456789', 'They/Them/Theirs', 'Matina, Davao City', '1741796390_aec6d37ef93451c2.png', 0, 'Pending', '1', 'client', '2025-03-13'),
(24, 870267291, 'Chris', 'Tucks', 'christuckin', '$2y$10$7foGFK60tq9xicfmT5dNpe8JflnfNDmkp2PY9Gq6mONkg7X2f8IMK', 'kidshine19@gmail.com', '09123456789', 'She/Her/Hers', 'Matina, Davao City', '1741826774_a1ed2bc2846feac3.png', 0, 'Approved', '1', 'client', '2025-03-13');

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `comment_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `meditation_videos`
--

CREATE TABLE `meditation_videos` (
  `video_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `youtube_id` varchar(50) NOT NULL,
  `category` enum('beginner','stress','sleep','mindfulness','anxiety','focus') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `meditation_videos`
--

INSERT INTO `meditation_videos` (`video_id`, `title`, `description`, `youtube_id`, `category`, `created_at`, `updated_at`) VALUES
(1, 'Beginner\'s Meditation', 'Perfect for those new to meditation. Learn the basics of mindfulness and breathing techniquess.', 'inpok4MKVLM', 'beginner', '2025-03-12 15:40:18', '2025-03-12 23:25:01'),
(2, 'Stress Relief', 'Release tension and find calm with guided stress relief meditation sessions.', 'z6X5oEIg6Ak', 'stress', '2025-03-12 15:40:18', '2025-03-12 15:40:18'),
(3, 'Sleep Meditation', 'Peaceful meditations to help you relax and prepare for restful sleep.', 'aEqlQvczMJQ', 'sleep', '2025-03-12 15:40:18', '2025-03-12 15:40:18'),
(4, 'Mindfulness Practice', 'Develop present-moment awareness and enhance your mindfulness practice.', 'ZToicYcHIOU', 'mindfulness', '2025-03-12 15:40:18', '2025-03-12 15:40:18'),
(5, 'Anxiety Relief', 'Calm your anxious thoughts and find inner peace with these targeted meditation practices.', 'O-6f5wQXSu8', 'anxiety', '2025-03-12 15:40:18', '2025-03-12 15:40:18'),
(6, 'Focus & Concentration', 'Enhance your focus and mental clarity through concentration meditation techniques.', 'ez3GgRqhNvA', 'focus', '2025-03-12 15:40:18', '2025-03-12 15:40:18');

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`post_id`, `user_id`, `content`, `created_at`) VALUES
(1, 1630821502, 'asdasd', '2025-03-05 10:11:13'),
(2, 1630821502, 'asdasd', '2025-03-05 10:11:16'),
(3, 1630821502, 'asdasd', '2025-03-05 10:12:50'),
(4, 1630821502, 'asdasd', '2025-03-05 10:14:28'),
(5, 1630821502, 'adasdas', '2025-03-05 10:19:57'),
(6, 1630821502, 'asdasda', '2025-03-05 10:24:17'),
(7, 1630821502, 'asdasda', '2025-03-05 10:24:21'),
(8, 1630821502, 'asdasda', '2025-03-05 10:24:43'),
(9, 1630821502, 'asdasda', '2025-03-05 10:27:05'),
(10, 1630821502, 'asd', '2025-03-05 10:35:43'),
(11, 1630821502, 'dasdasdas', '2025-03-05 10:35:46'),
(12, 1630821502, 'asdasd', '2025-03-05 11:05:43'),
(13, 1630821502, 'asdasd', '2025-03-05 11:05:50'),
(14, 1630821502, 'asd', '2025-03-05 11:08:32'),
(15, 1630821502, 'asd', '2025-03-05 11:08:43'),
(16, 1630821502, 'asd', '2025-03-05 11:08:45'),
(17, 1630821502, 'asd', '2025-03-05 11:15:29'),
(18, 1630821502, 'asds', '2025-03-05 11:15:32'),
(19, 1630821502, 'dasds', '2025-03-05 11:16:05'),
(20, 1630821502, 'asdas', '2025-03-05 11:17:11'),
(21, 1630821502, 'fasdfadsfadsfsd', '2025-03-05 11:17:15'),
(22, 1630821502, '2', '2025-03-05 11:17:54'),
(23, 1630821502, '2', '2025-03-05 11:17:56'),
(24, 1630821502, 'dasd', '2025-03-05 11:18:15'),
(25, 1630821502, 'dasd', '2025-03-05 11:18:17'),
(26, 1630821502, 'adasd', '2025-03-05 11:19:15'),
(27, 1630821502, 'dasdasd', '2025-03-05 11:19:49'),
(28, 1630821502, 'asdsa', '2025-03-05 11:22:30'),
(29, 1630821502, 'asdsa', '2025-03-05 11:22:40'),
(30, 1630821502, 'asdasd', '2025-03-05 11:22:44'),
(31, 1630821502, 'asdasdas', '2025-03-05 11:22:56'),
(32, 1630821502, 'asdasd', '2025-03-05 11:23:15'),
(33, 1630821502, 'asdas', '2025-03-05 11:30:33'),
(34, 1630821502, 'asdasd', '2025-03-05 11:30:35'),
(35, 1630821502, 'fasdfasdf', '2025-03-05 11:30:37'),
(36, 1630821502, 'asdasd', '2025-03-05 11:33:49'),
(37, 1630821502, 'dasdasd', '2025-03-05 11:33:52'),
(38, 1630821502, 'asdasd', '2025-03-05 11:36:34'),
(39, 1630821502, 'dasd', '2025-03-05 11:37:37'),
(40, 1630821502, 'asdasd', '2025-03-05 11:38:41'),
(41, 1630821502, 'asdasd', '2025-03-05 11:38:52');

-- --------------------------------------------------------

--
-- Table structure for table `reactions`
--

CREATE TABLE `reactions` (
  `reaction_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reactions`
--

INSERT INTO `reactions` (`reaction_id`, `post_id`, `user_id`, `created_at`) VALUES
(3, 2, 1630821502, '2025-03-05 10:14:00');

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
(6, 'IronHeart', 'Life is not daijoubo yes I am left', 5, '2025-02-24 14:40:32'),
(7, 'Jm', 'I love Cho Miyeon yeppey', 5, '2025-02-24 14:40:48'),
(8, 'DoubleCake', 'Ayoko yung lasa ng C2 na kulay green', 5, '2025-02-24 14:41:18'),
(9, 'SungJinwoo', 'Can I aura farm here', 5, '2025-02-24 14:41:45'),
(10, 'Metalheart', 'Mindspace is the best', 5, '2025-02-24 14:42:15');

-- --------------------------------------------------------

--
-- Table structure for table `therapists`
--

CREATE TABLE `therapists` (
  `therapist_id` int(11) NOT NULL,
  `unique_id` varchar(50) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
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

INSERT INTO `therapists` (`therapist_id`, `unique_id`, `first_name`, `last_name`, `username`, `password`, `specialization`, `experience_years`, `email`, `phone`, `bio`, `status`, `created_at`, `updated_at`) VALUES
(2, '67c9ec78b8c9b', 'Robert', 'Johnson', 'robert', '$2y$10$DFwklh6BjSqZemAF7mnpHOQHiMvF3B70KKHQ9vccTouEbFzbbfv7.', 'Psychological Engineer', 69, 'robertjohnson@gmail.com', '09123456789', '', 'Active', '2025-03-06 18:42:01', '2025-03-06 18:42:01'),
(3, '67c9ef10c61e6', 'Ben', 'Tennyson', 'bentong', '$2y$10$9IyO3pA5.w7gduxlLHRyIOJA/u8X9tWQRIEZo2sS0m8p740CmOANG', 'Alien Mind Universe Traveller', 66, 'ben100@gmail.com', '09123456789', '', 'Active', '2025-03-06 18:53:05', '2025-03-06 18:53:05'),
(10, '67cdb24818dc3', 'Aaron', 'Jalapon', 'aaron123', '$2y$10$VUGQCdDyI02pNPeaCRJIPe29N5WnNL/JyRKOnUVlM02IJkqwBg.yG', 'Computer Science Major in Mind Controlling', 666, 'aaron69@gmail.com', '09123456789', 'I am God of mind fucking', 'Active', '2025-03-09 15:22:48', '2025-03-09 15:22:48');

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
(64, 2, 'sunday', '09:00:00', '17:00:00', '12:00:00', '13:00:00'),
(65, 2, 'monday', '09:00:00', '17:00:00', '12:00:00', '13:00:00'),
(66, 2, 'tuesday', '09:00:00', '17:00:00', '12:00:00', '13:00:00'),
(67, 2, 'wednesday', '09:00:00', '17:00:00', '12:00:00', '13:00:00'),
(68, 2, 'thursday', '09:00:00', '17:00:00', '12:00:00', '13:00:00'),
(69, 2, 'friday', '09:00:00', '17:00:00', '12:00:00', '13:00:00'),
(92, 67, 'sunday', '09:00:00', '12:00:00', '00:00:00', '00:00:00'),
(93, 67, 'monday', '09:00:00', '12:00:00', '00:00:00', '00:00:00'),
(94, 67, 'tuesday', '09:00:00', '12:00:00', '00:00:00', '00:00:00'),
(95, 67, 'wednesday', '09:00:00', '12:00:00', '00:00:00', '00:00:00'),
(96, 67, 'thursday', '09:00:00', '12:00:00', '00:00:00', '00:00:00'),
(97, 67, 'friday', '09:00:00', '12:00:00', '00:00:00', '00:00:00'),
(98, 67, 'saturday', '09:00:00', '12:00:00', '00:00:00', '00:00:00'),
(122, 10, 'sunday', '09:00:00', '17:00:00', '12:00:00', '13:00:00'),
(123, 10, 'wednesday', '09:00:00', '17:00:00', '12:00:00', '13:00:00'),
(124, 10, 'saturday', '09:00:00', '17:00:00', '12:00:00', '13:00:00'),
(131, 3, 'sunday', '09:00:00', '13:00:00', '00:00:00', '00:00:00'),
(132, 3, 'monday', '09:00:00', '13:00:00', '00:00:00', '00:00:00'),
(133, 3, 'tuesday', '09:00:00', '13:00:00', '00:00:00', '00:00:00'),
(134, 3, 'wednesday', '09:00:00', '13:00:00', '00:00:00', '00:00:00'),
(135, 3, 'thursday', '09:00:00', '13:00:00', '00:00:00', '00:00:00'),
(136, 3, 'friday', '09:00:00', '13:00:00', '00:00:00', '00:00:00'),
(137, 3, 'saturday', '09:00:00', '13:00:00', '00:00:00', '00:00:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`appointment_id`);

--
-- Indexes for table `client`
--
ALTER TABLE `client`
  ADD PRIMARY KEY (`client_id`);

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`comment_id`),
  ADD KEY `post_id` (`post_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `meditation_videos`
--
ALTER TABLE `meditation_videos`
  ADD PRIMARY KEY (`video_id`);

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`post_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `reactions`
--
ALTER TABLE `reactions`
  ADD PRIMARY KEY (`reaction_id`),
  ADD UNIQUE KEY `unique_reaction` (`post_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

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
  ADD UNIQUE KEY `unique_email` (`email`),
  ADD UNIQUE KEY `unique_username` (`username`);

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
-- AUTO_INCREMENT for table `appointments`
--
ALTER TABLE `appointments`
  MODIFY `appointment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `client`
--
ALTER TABLE `client`
  MODIFY `client_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `comment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `meditation_videos`
--
ALTER TABLE `meditation_videos`
  MODIFY `video_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `post_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `reactions`
--
ALTER TABLE `reactions`
  MODIFY `reaction_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `testimonials`
--
ALTER TABLE `testimonials`
  MODIFY `testimonial_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `therapists`
--
ALTER TABLE `therapists`
  MODIFY `therapist_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `therapist_availability`
--
ALTER TABLE `therapist_availability`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=138;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
