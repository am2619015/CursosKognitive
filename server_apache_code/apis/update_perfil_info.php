<?php

    header('Access-Control-Allow-Origin: *');
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
    header("Access-Control-Allow-Headers: Content-Disposition, Content-Type, Content-Length, Accept-Encoding");
    header("Content-type:application/json");
    //$data = json_decode(file_get_contents("php://input"));
    include "e_c_p.php";
    include "config.php";
    include "cookie_check.php";

    $data = json_decode(file_get_contents('php://input'), true);
    
    $email_estudiante=$data['user_perfil']["email"];
    $nombres_usuario=$data['user_perfil']["nombres"];
    $apellidos_usuario=$data['user_perfil']["apellidos"];
    $telefono_usuario=$data['user_perfil']["telefono"];
    
    //echo "received data = ".$nombre_user." - ".$pasword_user;
    
    $email_estudiante=BlockSQLInjection(strip_tags(trim($email_estudiante)));
    $nombres_usuario=BlockSQLInjection(strip_tags(trim($nombres_usuario)));
    $apellidos_usuario=BlockSQLInjection(strip_tags(trim($apellidos_usuario)));
    $telefono_usuario=BlockSQLInjection(strip_tags(trim($telefono_usuario)));
    
    // solo si estamos en produccion comprobamos si tenemos acceso a realizar en base al tooken cookie seteado desde jsx
    if($modo_produccion){
        if(!cookie_check::Is_Cookie_acces_Correct($email_estudiante)){
            $dato_respuesta ="cookie_erronea para ".$email_estudiante;
            $mensaje_de="incorrecto";
            $post_data= json_encode(
                array(	'mensaje' => $mensaje_de,
                        'codigoHTML' => $dato_respuesta)
    
            );			
    
    
            echo $post_data;
             exit;
        }
    }

    $dato_respuesta="";
	$mensaje_de="";

	try{ 

		//$conn= new mysqli($servername,$username,$pasword,$dbname);
		$conn = new PDO('mysql:host='.$servername.';dbname='.$dbname.";charset=utf8", $username, $pasword,[
		   PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8',
	       PDO::ATTR_EMULATE_PREPARES => false, 
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
    
    $db_cursos="cursos";

    //$stm = $conn->prepare("SELECT * FROM users WHERE email=:correo");
    $stm = $conn->prepare("CALL update_user_info(:email,:nombres_val,:apellidos_val,:telefono_val);"); // funcion mysql con todos los datos
    
    /* 
           actualiza la info del perfil y retorna los datos para mirarlos todo en una consulta
            DELIMITER $$

            DROP PROCEDURE IF EXISTS `update_user_info` $$
            CREATE DEFINER=`user_name_test`@`127.0.0.1` PROCEDURE `update_user_info`(
                IN email_param VARCHAR(60),
                IN nombres_param VARCHAR(100),
                IN apellidos_param VARCHAR(100),
                IN telefono_param VARCHAR(20)
                )
                BEGIN

               UPDATE users u SET u.nombres=nombres_param,u.apellidos=apellidos_param,u.telefono=telefono_param WHERE email=email_param;
               
               SELECT email,rol,nombres,apellidos,telefono FROM users WHERE email = email_param;

            END $$

 DELIMITER ;
    */
        $stm->bindValue(":email", $email_estudiante);
        $stm->bindValue(":nombres_val", $nombres_usuario);
        $stm->bindValue(":apellidos_val", $apellidos_usuario);
        $stm->bindValue(":telefono_val", $telefono_usuario);
		$stm->execute();
		$rows = $stm->fetchAll(PDO::FETCH_NUM);


    //// se asume que hay un error de entrada al menos que luego no lo haya 
		 $dato_respuesta= "Usuario no posee cursos";
         $mensaje_de="incorrecto";
         
         $array_respuesta= array();

          /// se procede a recorrer los resultados //
		 if($rows>0){
            $mensaje_de="correcto";
        }

        $dato_respuesta = json_encode($rows);

        //$conn->close();
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