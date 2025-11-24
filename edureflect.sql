-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Waktu pembuatan: 17 Nov 2025 pada 07.57
-- Versi server: 11.4.5-MariaDB-log
-- Versi PHP: 8.3.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `edureflect`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `badges`
--

CREATE TABLE `badges` (
  `id` int(11) NOT NULL,
  `badge_key` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) NOT NULL,
  `icon_emoji` varchar(10) DEFAULT '?'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `badges`
--

INSERT INTO `badges` (`id`, `badge_key`, `name`, `description`, `icon_emoji`) VALUES
(1, 'first_reflection', 'Reflektor Pemula', 'Berhasil menulis refleksi pertamamu!', '✍️'),
(2, 'streak_3', 'Mulai Konsisten', 'Berhasil refleksi 3 hari berturut-turut!', '🔥'),
(3, 'tetris_master', 'Master Tetris', 'Mencapai skor di atas 1000 poin di Tetris!', '🎮');

-- --------------------------------------------------------

--
-- Struktur dari tabel `progress_snapshots`
--

CREATE TABLE `progress_snapshots` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `day` date NOT NULL,
  `reflections_count` int(11) DEFAULT 0,
  `streak` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `progress_snapshots`
--

INSERT INTO `progress_snapshots` (`id`, `user_id`, `day`, `reflections_count`, `streak`) VALUES
(1, 1, '2025-11-11', 3, 1),
(2, 5, '2025-11-12', 3, 1),
(3, 8, '2025-11-12', 3, 4),
(4, 1, '2025-11-16', 6, 1),
(5, 8, '2025-11-16', 20, 1),
(6, 1, '2025-11-17', 2, 2);

-- --------------------------------------------------------

--
-- Struktur dari tabel `quiz_questions`
--

CREATE TABLE `quiz_questions` (
  `id` int(11) NOT NULL,
  `text` varchar(255) NOT NULL,
  `dimension` enum('V','A','K') NOT NULL,
  `order_no` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `quiz_questions`
--

INSERT INTO `quiz_questions` (`id`, `text`, `dimension`, `order_no`) VALUES
(1, 'Saya cepat memahami materi saat melihat diagram, grafik, atau peta konsep.', 'V', 1),
(2, 'Saya suka menggunakan warna dan highlight pada catatan untuk membantu mengingat materi.', 'V', 2),
(3, 'Video atau ilustrasi membantu saya memahami materi dengan lebih mudah.', 'V', 3),
(4, 'Saya lebih mudah memahami konsep setelah membuat mindmap atau catatan bergambar.', 'V', 4),
(5, 'Saya merasa nyaman belajar dengan cara menjelaskan kembali materi kepada orang lain.', 'A', 5),
(6, 'Saya suka mendengarkan penjelasan lisan, podcast, atau rekaman suara saat belajar.', 'A', 6),
(7, 'Diskusi kelompok membantu saya memahami materi dengan lebih baik.', 'A', 7),
(8, 'Saya lebih mudah mengingat materi setelah mendengarkannya dibandingkan hanya membaca.', 'A', 8),
(9, 'Saya perlu melakukan praktik langsung untuk benar-benar memahami materi.', 'K', 9),
(10, 'Belajar sambil melakukan sesuatu membuat saya lebih fokus.', 'K', 10),
(11, 'Saya lebih tertarik melakukan eksperimen sederhana dibanding membaca teori panjang.', 'K', 11),
(12, 'Saya belajar lebih efektif saat bergerak, seperti menulis, menggambar, atau menempel kertas di sekitar saya.', 'K', 12);

-- --------------------------------------------------------

--
-- Struktur dari tabel `quiz_user_results`
--

CREATE TABLE `quiz_user_results` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `score_v` int(11) NOT NULL,
  `score_a` int(11) NOT NULL,
  `score_k` int(11) NOT NULL,
  `dominant` enum('V','A','K') NOT NULL,
  `taken_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `quiz_user_results`
--

INSERT INTO `quiz_user_results` (`id`, `user_id`, `score_v`, `score_a`, `score_k`, `dominant`, `taken_at`) VALUES
(1, 1, 10, 12, 15, 'K', '2025-11-11 12:15:21'),
(10, 5, 12, 14, 16, 'K', '2025-11-12 10:04:31'),
(13, 8, 14, 11, 13, 'V', '2025-11-12 17:55:29');

-- --------------------------------------------------------

--
-- Struktur dari tabel `reflections`
--

CREATE TABLE `reflections` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `ai_feedback` text DEFAULT NULL,
  `mood` enum('low','mid','high') NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `reflections`
--

INSERT INTO `reflections` (`id`, `user_id`, `title`, `content`, `ai_feedback`, `mood`, `created_at`) VALUES
(1, 1, 'Belajar database', 'Menyambungkan ke laragon', NULL, 'high', '2025-11-11 18:44:39'),
(4, 5, 'belajar php', 'suka', NULL, 'mid', '2025-11-12 10:22:18'),
(6, 5, 'belajar database', 'aku mempelajari delete', NULL, 'high', '2025-11-12 16:21:00'),
(8, 8, 'Belajar membuat web', 'Suka aja', NULL, 'high', '2025-11-12 17:56:25'),
(10, 1, 'Belajar database', 'tidak ada kesulitan', NULL, 'high', '2025-11-16 08:52:41'),
(29, 8, 'API GEMINI', 'Mencoba menyambungkan api gemini ke web saya', NULL, 'high', '2025-11-16 12:30:04'),
(30, 8, 'API', 'Mencoba menyambungkan api gemini ke web saya', NULL, 'mid', '2025-11-16 12:32:21'),
(31, 1, 'Belajar C++', 'Belajar bahasa pemrograman', NULL, 'mid', '2025-11-16 17:17:58'),
(32, 1, 'coba', 'coba aja', NULL, 'low', '2025-11-11 17:50:35'),
(33, 1, 'Belajar bahasa py', 'ternyata lebih mudah ketimbang cpp', NULL, 'high', '2025-11-16 18:19:58'),
(34, 1, 'bahasa jerman', 'susah', NULL, 'low', '2025-11-16 18:39:23'),
(37, 1, 'belajar', 'apapun', 'Refleksi yang bagus. Konsistensi adalah kunci. Apa satu hal kecil yang kamu pelajari tentang dirimu hari ini?', 'mid', '2025-11-17 00:47:33');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `bio` text DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `game_highscore` int(11) NOT NULL DEFAULT 0,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `bio`, `avatar_url`, `game_highscore`, `password_hash`, `created_at`) VALUES
(1, 'alwi', 'alwi@mail.com', 'Programer pemula', 'uploads/avatars/user_1_1762968591.jpg', 1800, '$2y$10$QTDSm3OJ2e8k9rqeIt2ZeOLTad5gx6UfIEG.2gEp4K.CaSh1vh0ou', '2025-11-11 12:12:40'),
(5, 'daffa', 'daffa@gmail.com', 'daffa fans alwi', NULL, 200, '$2y$10$yIgho0BpXSr5Nw2p4Lnk4e7.OldVzMjfvxqsxmV4m0Rb.uQlEXsiG', '2025-11-12 10:03:46'),
(8, 'ferdy', 'ferdy@gmail.com', 'suka membaca', 'uploads/avatars/user_8_1762970252.jpg', 1700, '$2y$10$0TXguySF09CSPTnfDCNIt.GrWgLeBPIocqsLTYSaAahOSJcjs/Mee', '2025-11-12 17:55:02');

-- --------------------------------------------------------

--
-- Struktur dari tabel `user_badges`
--

CREATE TABLE `user_badges` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `badge_id` int(11) NOT NULL,
  `earned_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `user_badges`
--

INSERT INTO `user_badges` (`id`, `user_id`, `badge_id`, `earned_at`) VALUES
(1, 1, 3, '2025-11-16 09:16:43'),
(2, 8, 3, '2025-11-16 09:42:26');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `badges`
--
ALTER TABLE `badges`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `badge_key` (`badge_key`);

--
-- Indeks untuk tabel `progress_snapshots`
--
ALTER TABLE `progress_snapshots`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_day_unique` (`user_id`,`day`);

--
-- Indeks untuk tabel `quiz_questions`
--
ALTER TABLE `quiz_questions`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `quiz_user_results`
--
ALTER TABLE `quiz_user_results`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_user_result` (`user_id`);

--
-- Indeks untuk tabel `reflections`
--
ALTER TABLE `reflections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_user_reflection` (`user_id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indeks untuk tabel `user_badges`
--
ALTER TABLE `user_badges`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_badge_unique` (`user_id`,`badge_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `badge_id` (`badge_id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `badges`
--
ALTER TABLE `badges`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `progress_snapshots`
--
ALTER TABLE `progress_snapshots`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `quiz_questions`
--
ALTER TABLE `quiz_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT untuk tabel `quiz_user_results`
--
ALTER TABLE `quiz_user_results`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT untuk tabel `reflections`
--
ALTER TABLE `reflections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT untuk tabel `user_badges`
--
ALTER TABLE `user_badges`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `progress_snapshots`
--
ALTER TABLE `progress_snapshots`
  ADD CONSTRAINT `fk_user_progress` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `quiz_user_results`
--
ALTER TABLE `quiz_user_results`
  ADD CONSTRAINT `fk_user_result` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `reflections`
--
ALTER TABLE `reflections`
  ADD CONSTRAINT `fk_user_reflection` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `user_badges`
--
ALTER TABLE `user_badges`
  ADD CONSTRAINT `fk_user_badges_badge` FOREIGN KEY (`badge_id`) REFERENCES `badges` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_user_badges_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
