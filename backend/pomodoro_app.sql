-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Waktu pembuatan: 28 Des 2024 pada 01.23
-- Versi server: 8.0.30
-- Versi PHP: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pomodoro_app`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `pomodoro_settings`
--

CREATE TABLE `pomodoro_settings` (
  `id` int NOT NULL,
  `work_duration` int DEFAULT '25',
  `short_break` int DEFAULT '5',
  `long_break` int DEFAULT '15',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `spotify_sessions`
--

CREATE TABLE `spotify_sessions` (
  `id` int NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `access_token` text NOT NULL,
  `refresh_token` text,
  `expires_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `spotify_sessions`
--

INSERT INTO `spotify_sessions` (`id`, `user_id`, `access_token`, `refresh_token`, `expires_at`) VALUES
(29, 'user123', 'BQAsP5HmHy1pdzvlEHnbWdZwC0wJvQSz__uPpn2bpTH99SW5in1dmuSO40JjcdcO2aw3nHBt5f8PfEtQg1qSyzrg1r161cSdJkDF98WpsD8vmRLZj23ruzsOp2TyRitma97R_7sx7UL4zAy7t6Hzk8_HTsL4IzrfyIQqmcMLoapeorE6p2AhWAPVaXQ496rksqKMP5dOJqniS6p4_LIV1ixg9-g', 'AQBayxe943-mTMPuBvoRls06cv2304M2LnypVux08D9nM1-Kzmv7wBDkQLRdQGjm1D8cL0p-irMM8afkQ_eB-zsQddgP1XJEF4l-7ArR9skhsg8Pa5RI9wzS2t7Dz3qLxYI', '2024-12-25 08:12:26'),

-- --------------------------------------------------------

--
-- Struktur dari tabel `tasks`
--

CREATE TABLE `tasks` (
  `id` int NOT NULL,
  `task_name` varchar(255) NOT NULL,
  `is_completed` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `tasks`
--

INSERT INTO `tasks` (`id`, `task_name`, `is_completed`, `created_at`) VALUES
(2, 'Build Pomodoro App', 1, '2024-12-25 05:29:37'),
(3, 'Study Tailwind CSS', 1, '2024-12-25 05:29:37'),
(5, 'mengaji', 0, '2024-12-25 10:47:06');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `pomodoro_settings`
--
ALTER TABLE `pomodoro_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `spotify_sessions`
--
ALTER TABLE `spotify_sessions`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `pomodoro_settings`
--
ALTER TABLE `pomodoro_settings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `spotify_sessions`
--
ALTER TABLE `spotify_sessions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT untuk tabel `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
