<?php 
header('Access-Control-Allow-Origin: https://not-example.com');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 604800');
header("Content-type: application/json");

	include "e_c_p.php";
	include "config.php";

	/*$clave_usar='passwod_emailsender';
	echo "clave a encriptar".$clave_usar."<br>";
	$clave_encriptada=en_c_psw::encryption($clave_usar);
	//echo "clave a encriptada".$clave_encriptada."<br>";

	$clave_desencriptada=en_c_psw::decryption($clave_encriptada);
	echo "clave a desencriptada".$clave_desencriptada."<br>";*/



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


        /// a futuro obtener datos desde una peticion ajax por ahora se metieron a mano
	/*$data = json_decode(file_get_contents('php://input'), true);

	$titulo_evento=$data["v_titulo"];
	$texto_evento=$data["v_texto"];
	$foto1_evento=$data["v_foto1"];
	$foto2_evento=$data["v_foto2"];
	$foto3_evento=$data["v_foto3"];
	$foto4_evento=$data["v_foto4"];


	$titulo_evento=BlockSQLInjection(strip_tags(trim($titulo_evento)));
	$texto_evento=BlockSQLInjection(strip_tags(trim($texto_evento)));
	$foto1_evento=strip_tags(trim($foto1_evento));
	$foto2_evento=strip_tags(trim($foto2_evento));
	$foto3_evento=strip_tags(trim($foto3_evento));
    $foto4_evento=strip_tags(trim($foto4_evento));*/
    
    $email = "test@admin_app_react_test.com";
    $password ="clave2021";
	$rol = "admin";
	$apellido = "";
	$nombre = "";
	$telefono = "";


    $email_f = BlockSQLInjection(strip_tags(trim($email)));
    $password_f = BlockSQLInjection(strip_tags(trim($password)));
    $rol_f = BlockSQLInjection(strip_tags(trim($rol)));
	$nom_f = BlockSQLInjection(strip_tags(trim($nombre)));
	$apell_f = BlockSQLInjection(strip_tags(trim($apellido)));
	$telf_f = BlockSQLInjection(strip_tags(trim($telefono)));

    $pass_encrypted=en_c_psw::encryption($password_f);



		try {
		$stm = $conn->prepare("INSERT INTO users(email,password,rol,nombres,apellidos,telefono) VALUES (?,?,?,?,?,?)");
		$stm->execute([$email_f,$pass_encrypted,$rol_f,$nom_f,$apell_f,$telf_f]);

		$dato_respuesta ="Usuario ".$rol_f." Ingresado con exito ".$email;
		$mensaje_de="correcto";

		$stm->closeCursor();

		}catch (PDOException $e) {
			$dato_respuesta ="Error al ingresar el usuario en la db ".$e->getCode();
			$mensaje_de="incorrecto";

			$stm->closeCursor();
		}


		
		if(strcmp($mensaje_de,"correcto") == 0){
			      /// al ingresar un nuevo usuario le entrego un random token
				  try{

					$stm2 = $conn->prepare("UPDATE users SET tkn_accs=(SELECT randomPassword()) WHERE email=:e_u");
					$stm2->bindValue(":e_u", $email_f);
					$stm2->execute();

					$dato_respuesta ="Usuario ".$rol_f." Ingresado con exito ".$email;
					$mensaje_de="correcto";

					$stm2->closeCursor();
				}
				catch (PDOException $e) {
						$mensaje_de = "incorrecto";
						$calificacion = "ERROR mysql contacte con el administrador ".$e->getMessage();
				
						$stm2->closeCursor();
				}
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




function BlockSQLInjection($str)
{
 	$search  = array("'",'"',"'",'"',";");
 	$replace = array("'", '&quot;"', '&quot;');
    return str_replace($search, $replace, $str);
}



	 ?>