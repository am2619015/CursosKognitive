<?php 
//// cron task que debe ser llamada en servidor cada x tiempo se recomienda cada 24 horas
header('Access-Control-Allow-Origin: https://not-example.com');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 604800');
header("Content-type: application/json");

include "config.php";

	$dato_respuesta="";
	$mensaje_de="";

	try{ 

		//$conn= new mysqli($servername,$username,$pasword,$dbname);
		$conn = new PDO('mysql:host='.$servername.';dbname='.$dbname.";charset=utf8", $username, $pasword,[
		   PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8',
	       PDO::MYSQL_ATTR_USE_BUFFERED_QUERY => true,
	       PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
	     ]); // nuevo metodo mejorado

		//mysqli_set_charset( $conn, 'utf8'); // reemplazado a pdo

	}catch(PDOException $e) /// un catch por si se encuentra una excepcion
    {
    	$dato_respuesta ="No hay conexion con la db";
        $mensaje_de="incorrecto";
    }

      //// segunda comprobacion de si hay conexion con la db
	if(!$conn){
        $dato_respuesta ="No hay conexion con la db";
		$mensaje_de="incorrecto";
		die("Conexion error causa de :".mysqli_connect_error());
	}

		
			      /// regenero los tokens
				  try{

					$stm2 = $conn->prepare("UPDATE users SET tkn_accs=(SELECT randomPassword())");
					$stm2->execute();

					$dato_respuesta ="tokens regenerados";
					$mensaje_de="correcto";

					$stm2->closeCursor();
				}
				catch (PDOException $e) {
						$mensaje_de = "incorrecto";
						$calificacion = "ERROR mysql contacte con el administrador ".$e->getMessage();
				
						$stm2->closeCursor();
				}


		/*
		DELIMITER $$
			DROP FUNCTION IF EXISTS `randomPassword` $$
			CREATE FUNCTION randomPassword()
			RETURNS varchar(128)
			BEGIN

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


			UPDATE users SET tkn_accs=(SELECT randomPassword())
		*/
      


	$conn=null;



	$post_data= json_encode(
													array(	'mensaje' => $mensaje_de,
															'codigoHTML' => $dato_respuesta)

						);				


	echo $post_data;

	 ?>