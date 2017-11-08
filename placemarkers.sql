

-- 
-- Установка кодировки, с использованием которой клиент будет посылать запросы на сервер
--
SET NAMES 'utf8';

-- 
-- Установка базы данных по умолчанию
--
USE placemark;

--
-- Описание для таблицы placemarkers
--
DROP TABLE IF EXISTS placemarkers;
CREATE TABLE IF NOT EXISTS placemarkers (
  id INT(11) NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) DEFAULT NULL,
  lat DECIMAL(9, 6) DEFAULT NULL,
  lon DECIMAL(9, 6) DEFAULT NULL,
  PRIMARY KEY (id)
)
ENGINE = INNODB
AUTO_INCREMENT = 17
AVG_ROW_LENGTH = 5461
CHARACTER SET utf8
COLLATE utf8_general_ci;

DELIMITER $$

--
-- Описание для функции harvesine
--
DROP FUNCTION IF EXISTS harvesine$$
CREATE FUNCTION harvesine(lat1 double, lon1 double, lat2 double, lon2 double)
  RETURNS double
return  6371 * 2 * ASIN(SQRT(POWER(SIN((lat1 - abs(lat2)) * pi()/180 / 2), 2) 
         + COS(abs(lat1) * pi()/180 ) * COS(abs(lat2) * pi()/180) * POWER(SIN((lon1 - lon2) * pi()/180 / 2), 2) ))
$$

DELIMITER ;


