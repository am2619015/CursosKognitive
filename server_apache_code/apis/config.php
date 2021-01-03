<?php 
/// para desarrollo esto debe estar en false, solo cuando se esta en produccion en true, cabe señalar que en false se quita la seguridad de comprobar si el cookie  es correcto
$modo_produccion = false; // activa o desactiva la verificacion de acciones por token // el unico que no usa es login.php

////// aqui se configura el nombre de usuario que tiene acceso a la base de datos en que servidor y con que contraseña
$username="user_name_test";
$pasword="password_test";
$servername ="localhost";
$dbname="database_name";

?>