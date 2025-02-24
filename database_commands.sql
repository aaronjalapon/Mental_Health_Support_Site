
-- Create therapists table
CREATE TABLE `therapists` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `unique_id` int(50) NOT NULL,
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `contactNumber` varchar(15) NOT NULL,
  `specialization` varchar(255) NOT NULL,
  `experience_years` int(11) NOT NULL,
  `hourly_rate` decimal(10,2) NOT NULL,
  `bio` text DEFAULT NULL,
  `ValidID` varchar(255) NOT NULL,
  `license_number` varchar(50) NOT NULL,
  `verification_status` varchar(50) NOT NULL DEFAULT '0',
  `Status` enum('Approved','Blocked','Pending','OnLeave') NOT NULL DEFAULT 'Pending',
  `Role` varchar(50) NOT NULL DEFAULT 'therapist',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_id` (`unique_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `license_number` (`license_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create therapist_availability table
CREATE TABLE `therapist_availability` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `therapist_id` int(11) NOT NULL,
  `day_of_week` enum('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `break_start` time DEFAULT NULL,
  `break_end` time DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `therapist_id` (`therapist_id`),
  CONSTRAINT `fk_therapist_availability` FOREIGN KEY (`therapist_id`) REFERENCES `therapists` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert sample therapist
INSERT INTO `therapists` (
  `unique_id`,
  `firstName`,
  `lastName`,
  `username`,
  `password`,
  `email`,
  `contactNumber`,
  `specialization`,
  `experience_years`,
  `hourly_rate`,
  `bio`,
  `ValidID`,
  `license_number`,
  `verification_status`,
  `Status`,
  `Role`
) VALUES (
  87654321,
  'Jane',
  'Smith',
  'dr.jsmith',
  '$2y$10$YoHK6QnQGcgurXsb8FNN1e8TncZ6xLWaVMJcVSxIK10cpqlVR1RAG', -- hashed "password123"
  'jane.smith@mindspace.com',
  '123-456-7890',
  'Clinical Psychology',
  8,
  150.00,
  'Dr. Jane Smith is a licensed clinical psychologist with expertise in cognitive behavioral therapy.',
  '1739942932_sample_license.jpg',
  'PSY12345',
  '1',
  'Approved',
  'therapist'
);

-- Insert sample availability
INSERT INTO `therapist_availability` (
  `therapist_id`,
  `day_of_week`,
  `start_time`,
  `end_time`,
  `break_start`,
  `break_end`
) VALUES
(1, 'monday', '09:00:00', '17:00:00', '12:00:00', '13:00:00'),
(1, 'wednesday', '09:00:00', '17:00:00', '12:00:00', '13:00:00'),
(1, 'friday', '09:00:00', '17:00:00', '12:00:00', '13:00:00');
