-- phpMyAdmin SQL Dump
-- version 4.9.5
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 03-01-2021 a las 20:29:00
-- Versión del servidor: 10.4.15-MariaDB
-- Versión de PHP: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `database_cursos`
--
CREATE DATABASE IF NOT EXISTS `database_cursos` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `database_cursos`;

DELIMITER $$
--
-- Procedimientos
--
DROP PROCEDURE IF EXISTS `add_logs_usuarios`$$
CREATE DEFINER=`u338292151_kognitive`@`127.0.0.1` PROCEDURE `add_logs_usuarios` (IN `email_poner` VARCHAR(60))  BEGIN
                                    
                                    IF email_poner IS NOT NULL AND email_poner != "" THEN
                                    	INSERT INTO logs_usuarios(email_usuario) VALUES(email_poner);
                                    END IF;
                                    
                                    END$$

DROP PROCEDURE IF EXISTS `datos_cursos_usuario`$$
CREATE DEFINER=`u338292151_kognitive`@`127.0.0.1` PROCEDURE `datos_cursos_usuario` (IN `emai_buscar` VARCHAR(60))  BEGIN

SELECT * from cursos C JOIN (SELECT id_curso,caducidad_acceso_curso FROM caducidad_cursos AS c LEFT JOIN users AS u ON c.id_usuario=u.id WHERE id_usuario = (SELECT id FROM users WHERE email = emai_buscar)) AS RF ON C.id_curso = RF.id_curso;


END$$

DROP PROCEDURE IF EXISTS `fecha_caducidad_curso`$$
CREATE DEFINER=`u338292151_kognitive`@`127.0.0.1` PROCEDURE `fecha_caducidad_curso` (IN `emai_buscar` VARCHAR(60), IN `id_curso_buscar` VARCHAR(60))  BEGIN

      SELECT caducidad_acceso_curso from cursos C JOIN (SELECT id_curso,caducidad_acceso_curso FROM caducidad_cursos AS c LEFT JOIN users AS u ON c.id_usuario=u.id WHERE id_usuario = (SELECT id FROM users WHERE email = emai_buscar)) AS RF ON C.id_curso = RF.id_curso WHERE C.id_curso=id_curso_buscar;


END$$

DROP PROCEDURE IF EXISTS `get_cuestionario`$$
CREATE DEFINER=`u338292151_kognitive`@`127.0.0.1` PROCEDURE `get_cuestionario` (IN `id_cuest` INT)  BEGIN
				SELECT num_pregunta,tipo_pregunta,pregunta_txt,posibles_respuestas_txt,imagen_va_pregunta,imagen_posible_r_1,imagen_posible_r_2,imagen_posible_r_3,imagen_posible_r_4 FROM preguntas_cuestionarios WHERE id_cuestionario = id_cuest ORDER BY num_pregunta ASC;
            END$$

DROP PROCEDURE IF EXISTS `get_if_taller_final`$$
CREATE DEFINER=`u338292151_kognitive`@`127.0.0.1` PROCEDURE `get_if_taller_final` (IN `id_taller_buscar` INT)  BEGIN
                                    
                                    DECLARE is_taller_final INT DEFAULT 0;
                                    
                                    SELECT COUNT(*) INTO is_taller_final FROM talleres t WHERE t.id_taller=id_taller_buscar AND t.last_taller=1;
                                    
                                    IF is_taller_final >=1 THEN
										SELECT TRUE;
                                    ELSE
										SELECT FALSE;
                                    END IF;
                                    
                                    END$$

DROP PROCEDURE IF EXISTS `get_info_construir_traller`$$
CREATE DEFINER=`u338292151_kognitive`@`127.0.0.1` PROCEDURE `get_info_construir_traller` (IN `email_buscar` VARCHAR(60), IN `id_curso_buscar` INT, IN `id_taller_buscar` INT)  BEGIN

                SELECT T.id_taller,nombre_taller,descripcion,video_1,video_2,video_3,video_4,nota,id_cuestionario,material_taller FROM talleres AS T LEFT JOIN(SELECT * FROM notas AS n WHERE n.id_estudiante = (SELECT id FROM users WHERE email = email_buscar)) AS RF ON RF.id_taller = T.id_taller WHERE T.id_curso=id_curso_buscar AND T.id_taller=id_taller_buscar;
            END$$

DROP PROCEDURE IF EXISTS `get_info_send_mail_talleres`$$
CREATE DEFINER=`u338292151_kognitive`@`127.0.0.1` PROCEDURE `get_info_send_mail_talleres` (IN `id_curso_buscar` INT, IN `id_taller_buscar` INT)  BEGIN
	
					SELECT RF.nombre,nombre_taller FROM talleres AS T LEFT JOIN(SELECT * FROM cursos AS C WHERE C.id_curso=id_curso_buscar) AS RF ON RF.id_curso = T.id_curso WHERE T.id_taller=id_taller_buscar AND RF.nombre IS NOT NULL;
	
				END$$

DROP PROCEDURE IF EXISTS `get_notas_de_curso`$$
CREATE DEFINER=`u338292151_kognitive`@`127.0.0.1` PROCEDURE `get_notas_de_curso` (IN `id_curso_buscar` INT)  BEGIN
                                    
                                    DECLARE resuelto_taller_final INT DEFAULT 0;
                                    
                                    SELECT COUNT(*) INTO resuelto_taller_final FROM notas AS N LEFT JOIN talleres AS T ON N.id_taller=T.id_taller WHERE N.id_curso=id_curso_buscar AND T.last_taller=true;
                                    
                                    IF resuelto_taller_final >=1 THEN
										SELECT users.email,id_curso,ROUND( AVG(notas.nota),2 ) AS nota FROM notas LEFT JOIN users ON notas.id_estudiante = users.id WHERE notas.id_curso = 2 GROUP BY notas.id_estudiante; 
                                    ELSE
										SELECT id_estudiante,ROUND( AVG(nota),2 ) AS nota FROM notas WHERE id_curso=9999;
                                    END IF;
                                    
                                    END$$

DROP PROCEDURE IF EXISTS `get_nota_curso`$$
CREATE DEFINER=`u338292151_kognitive`@`127.0.0.1` PROCEDURE `get_nota_curso` (IN `email_buscar` VARCHAR(60), IN `id_curso_buscar` INT)  proc_get_nota_curso:BEGIN
                                    
                                    DECLARE resuelto_taller_final INT DEFAULT 0;
                                    
                                    SELECT COUNT(*) INTO resuelto_taller_final FROM notas AS N LEFT JOIN talleres AS T ON N.id_taller=T.id_taller WHERE N.id_curso=id_curso_buscar AND T.last_taller=true AND N.id_estudiante = (SELECT id FROM users WHERE email = email_buscar);
                                    
                                    IF resuelto_taller_final >=1 THEN
										SELECT id_estudiante,ROUND( AVG(nota),2 ) AS nota FROM notas WHERE id_curso=id_curso_buscar AND id_estudiante = (SELECT id FROM users WHERE email = email_buscar);
                                    ELSE
										LEAVE proc_get_nota_curso;
                                    END IF;
                                    
                                    END$$

DROP PROCEDURE IF EXISTS `get_num_intentos_restantes_taller_final`$$
CREATE DEFINER=`u338292151_kognitive`@`127.0.0.1` PROCEDURE `get_num_intentos_restantes_taller_final` (IN `email_buscar` VARCHAR(60), IN `id_curso_buscar` INT, IN `id_taller_buscar` INT)  BEGIN
                                    
                                    DECLARE is_taller_final_realizado INT DEFAULT 0;
                                    
                                    SELECT COUNT(*) INTO is_taller_final_realizado FROM intentos_talleres_finales itf WHERE itf.id_curso = id_curso_buscar AND itf.id_taller = id_taller_buscar AND itf.id_usuario = (SELECT u.id FROM users u WHERE u.email = email_buscar); 
                                    
                                    IF is_taller_final_realizado >=1 THEN
										SELECT (3-i.num_intentos) AS intentos_restantes FROM intentos_talleres_finales i WHERE i.id_curso = id_curso_buscar AND i.id_taller = id_taller_buscar AND i.id_usuario = (SELECT u.id FROM users u WHERE u.email = email_buscar); 
                                    ELSE
										SELECT 3 AS intentos_restantes;
                                    END IF;
                                    
                                    END$$

DROP PROCEDURE IF EXISTS `get_resp_cuest_num`$$
CREATE DEFINER=`u338292151_kognitive`@`127.0.0.1` PROCEDURE `get_resp_cuest_num` (IN `id_cuest` INT)  BEGIN

                SELECT respuesta_correcta FROM preguntas_cuestionarios WHERE id_cuestionario = id_cuest ORDER BY num_pregunta ASC;
            END$$

DROP PROCEDURE IF EXISTS `get_talleres_info_generalCurso`$$
CREATE DEFINER=`u338292151_kognitive`@`127.0.0.1` PROCEDURE `get_talleres_info_generalCurso` (IN `email_buscar` VARCHAR(60), IN `id_curso_buscar` INT)  BEGIN

                SELECT T.id_taller,nombre_taller,descripcion,video_1,video_2,video_3,video_4,nota,id_cuestionario FROM talleres AS T LEFT JOIN(SELECT * FROM notas AS n WHERE n.id_estudiante = (SELECT id FROM users WHERE email = email_buscar)) AS RF ON RF.id_taller = T.id_taller WHERE T.id_curso=id_curso_buscar;

            END$$

DROP PROCEDURE IF EXISTS `get_titulo_descripcion_curso_usuario`$$
CREATE DEFINER=`u338292151_kognitive`@`127.0.0.1` PROCEDURE `get_titulo_descripcion_curso_usuario` (IN `email_buscar` VARCHAR(60), IN `id_curso_buscar` INT)  BEGIN

                SELECT nombre,descripcion from cursos C JOIN (SELECT id_curso,caducidad_acceso_curso FROM caducidad_cursos AS c LEFT JOIN users AS u ON c.id_usuario=u.id WHERE id_usuario = (SELECT id FROM users WHERE email = email_buscar)) AS RF ON C.id_curso = RF.id_curso WHERE C.id_curso = id_curso_buscar;

            END$$

DROP PROCEDURE IF EXISTS `insert_or_update_NotaEstudiante`$$
CREATE DEFINER=`u338292151_kognitive`@`127.0.0.1` PROCEDURE `insert_or_update_NotaEstudiante` (IN `email_buscar` VARCHAR(60), IN `id_curso_buscar` INT, IN `id_taller_buscar` INT, IN `nota_poner` FLOAT)  BEGIN
                
                DECLARE existe_estudiante INT DEFAULT 0;
				
                SELECT COUNT(nota) INTO existe_estudiante FROM notas WHERE id_estudiante=(SELECT id FROM users WHERE email = email_buscar) AND id_taller = id_taller_buscar AND 				id_curso = id_curso_buscar;
                
                IF existe_estudiante >=1 THEN
                    IF nota_poner > (SELECT nota FROM notas WHERE id_estudiante = (SELECT id FROM users WHERE email = email_buscar) AND id_taller = id_taller_buscar AND id_curso = id_curso_buscar) THEN
					UPDATE notas SET nota = nota_poner WHERE id_estudiante=(SELECT id FROM users WHERE email = email_buscar) AND id_taller = id_taller_buscar AND id_curso = id_curso_buscar;
                    END IF;
                ELSE
                	INSERT INTO notas (id_estudiante,id_taller,id_curso,nota) VALUES ((SELECT id FROM users WHERE email = email_buscar),id_taller_buscar,id_curso_buscar,nota_poner);	
                END IF;
                
            	END$$

DROP PROCEDURE IF EXISTS `insert_or_update_num_intento_taller_final`$$
CREATE DEFINER=`u338292151_kognitive`@`127.0.0.1` PROCEDURE `insert_or_update_num_intento_taller_final` (IN `email_usuario_ingresar` VARCHAR(60), IN `id_curso_ingresar` INT, IN `id_taller_ingresar` INT)  BEGIN
				
                DECLARE id_usuario_ingresar INT DEFAULT 0;
                
                SELECT u.id INTO id_usuario_ingresar FROM users u WHERE u.email=email_usuario_ingresar;
                
                INSERT INTO intentos_talleres_finales (id_curso, id_taller, id_usuario,num_intentos) VALUES(id_curso_ingresar,id_taller_ingresar,id_usuario_ingresar,1) ON DUPLICATE KEY UPDATE num_intentos=num_intentos+1;

            END$$

DROP PROCEDURE IF EXISTS `update_user_info`$$
CREATE DEFINER=`u338292151_kognitive`@`127.0.0.1` PROCEDURE `update_user_info` (IN `email_param` VARCHAR(60), IN `nombres_param` VARCHAR(100), IN `apellidos_param` VARCHAR(100), IN `telefono_param` VARCHAR(20))  BEGIN

               UPDATE users u SET u.nombres=nombres_param,u.apellidos=apellidos_param,u.telefono=telefono_param WHERE email=email_param;
               
               SELECT email,rol,nombres,apellidos,telefono FROM users WHERE email = email_param;

            END$$

--
-- Funciones
--
DROP FUNCTION IF EXISTS `randomPassword`$$
CREATE DEFINER=`u338292151_kognitive`@`127.0.0.1` FUNCTION `randomPassword` () RETURNS VARCHAR(128) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci BEGIN

SET @chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijkmnpqrstuwxyz123456789';
SET @charLen = length(@chars);

SET @randomPassword = '';

WHILE length(@randomPassword) < 18
    DO
    SET @randomPassword = concat(@randomPassword, substring(@chars,CEILING(RAND() * @charLen),1));
END WHILE;

RETURN @randomPassword ;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `caducidad_cursos`
--

DROP TABLE IF EXISTS `caducidad_cursos`;
CREATE TABLE `caducidad_cursos` (
  `id_curso` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `caducidad_acceso_curso` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cursos`
--

DROP TABLE IF EXISTS `cursos`;
CREATE TABLE `cursos` (
  `id_curso` int(11) NOT NULL,
  `descripcion` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `imagen` longblob NOT NULL,
  `nombre` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `email_restore_password`
--

DROP TABLE IF EXISTS `email_restore_password`;
CREATE TABLE `email_restore_password` (
  `id` int(11) NOT NULL,
  `email` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token_cambio` varchar(18) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date` date NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `intentos_talleres_finales`
--

DROP TABLE IF EXISTS `intentos_talleres_finales`;
CREATE TABLE `intentos_talleres_finales` (
  `id_curso` int(11) NOT NULL,
  `id_taller` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `num_intentos` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `logs_usuarios`
--

DROP TABLE IF EXISTS `logs_usuarios`;
CREATE TABLE `logs_usuarios` (
  `id` int(11) NOT NULL,
  `email_usuario` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_log` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notas`
--

DROP TABLE IF EXISTS `notas`;
CREATE TABLE `notas` (
  `id_nota` int(11) NOT NULL,
  `id_estudiante` int(11) NOT NULL,
  `id_taller` int(11) NOT NULL,
  `id_curso` int(11) NOT NULL,
  `nota` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `preguntas_cuestionarios`
--

DROP TABLE IF EXISTS `preguntas_cuestionarios`;
CREATE TABLE `preguntas_cuestionarios` (
  `id_cuestionario` int(11) NOT NULL,
  `num_pregunta` int(11) NOT NULL,
  `tipo_pregunta` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pregunta_txt` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `posibles_respuestas_txt` varchar(700) COLLATE utf8mb4_unicode_ci NOT NULL,
  `respuesta_correcta` varchar(600) COLLATE utf8mb4_unicode_ci NOT NULL,
  `imagen_va_pregunta` longblob DEFAULT NULL,
  `imagen_posible_r_1` longblob DEFAULT NULL,
  `imagen_posible_r_2` longblob DEFAULT NULL,
  `imagen_posible_r_3` longblob DEFAULT NULL,
  `imagen_posible_r_4` longblob DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `talleres`
--

DROP TABLE IF EXISTS `talleres`;
CREATE TABLE `talleres` (
  `id_taller` int(11) NOT NULL,
  `id_curso` int(11) NOT NULL,
  `nombre_taller` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(400) COLLATE utf8mb4_unicode_ci NOT NULL,
  `video_1` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `video_2` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `video_3` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_cuestionario` int(11) NOT NULL,
  `video_4` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `material_taller` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_taller` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombres` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `apellidos` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tkn_accs` varchar(18) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `caducidad_cursos`
--
ALTER TABLE `caducidad_cursos`
  ADD PRIMARY KEY (`id_curso`,`id_usuario`),
  ADD KEY `FK_id_usuario` (`id_usuario`);

--
-- Indices de la tabla `cursos`
--
ALTER TABLE `cursos`
  ADD PRIMARY KEY (`id_curso`);

--
-- Indices de la tabla `email_restore_password`
--
ALTER TABLE `email_restore_password`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `token_cambio` (`token_cambio`);

--
-- Indices de la tabla `intentos_talleres_finales`
--
ALTER TABLE `intentos_talleres_finales`
  ADD PRIMARY KEY (`id_curso`,`id_taller`,`id_usuario`),
  ADD KEY `intentos_talleres_finales_ibfk_3` (`id_usuario`),
  ADD KEY `intentos_talleres_finales_ibfk_2` (`id_taller`);

--
-- Indices de la tabla `logs_usuarios`
--
ALTER TABLE `logs_usuarios`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `notas`
--
ALTER TABLE `notas`
  ADD PRIMARY KEY (`id_nota`),
  ADD UNIQUE KEY `nota_unica` (`id_estudiante`,`id_taller`,`id_curso`) USING BTREE,
  ADD KEY `notas_id_taller` (`id_taller`),
  ADD KEY `notas_id_curso` (`id_curso`);

--
-- Indices de la tabla `talleres`
--
ALTER TABLE `talleres`
  ADD PRIMARY KEY (`id_taller`),
  ADD KEY `fk_id_curso` (`id_curso`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `cursos`
--
ALTER TABLE `cursos`
  MODIFY `id_curso` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `email_restore_password`
--
ALTER TABLE `email_restore_password`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `logs_usuarios`
--
ALTER TABLE `logs_usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `notas`
--
ALTER TABLE `notas`
  MODIFY `id_nota` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `talleres`
--
ALTER TABLE `talleres`
  MODIFY `id_taller` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `caducidad_cursos`
--
ALTER TABLE `caducidad_cursos`
  ADD CONSTRAINT `FK_id_c` FOREIGN KEY (`id_curso`) REFERENCES `cursos` (`id_curso`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_id_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `intentos_talleres_finales`
--
ALTER TABLE `intentos_talleres_finales`
  ADD CONSTRAINT `intentos_talleres_finales_ibfk_1` FOREIGN KEY (`id_curso`) REFERENCES `cursos` (`id_curso`) ON DELETE CASCADE,
  ADD CONSTRAINT `intentos_talleres_finales_ibfk_2` FOREIGN KEY (`id_taller`) REFERENCES `talleres` (`id_taller`) ON DELETE CASCADE,
  ADD CONSTRAINT `intentos_talleres_finales_ibfk_3` FOREIGN KEY (`id_usuario`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `notas`
--
ALTER TABLE `notas`
  ADD CONSTRAINT `notas_id_curso` FOREIGN KEY (`id_curso`) REFERENCES `cursos` (`id_curso`) ON DELETE CASCADE,
  ADD CONSTRAINT `notas_id_est` FOREIGN KEY (`id_estudiante`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notas_id_taller` FOREIGN KEY (`id_taller`) REFERENCES `talleres` (`id_taller`) ON DELETE CASCADE;

--
-- Filtros para la tabla `talleres`
--
ALTER TABLE `talleres`
  ADD CONSTRAINT `fk_id_curso` FOREIGN KEY (`id_curso`) REFERENCES `cursos` (`id_curso`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
