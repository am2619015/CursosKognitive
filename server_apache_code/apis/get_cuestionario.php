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
    

    $id_cuestionario=$data['user_login']["id_cuestionario"];
    $email_usuario = $data['user_login']["email_usuario_solicita"];
    
    //echo "received data = ".$nombre_user." - ".$pasword_user;
    

    $id_cuestionario=BlockSQLInjection(strip_tags(trim($id_cuestionario)));
    $email_usuario=BlockSQLInjection(strip_tags(trim($email_usuario)));
  
      // solo si estamos en produccion comprobamos si tenemos acceso a realizar en base al tooken cookie seteado desde jsx
      if($modo_produccion){
        if(!cookie_check::Is_Cookie_acces_Correct($email_usuario)){
            $dato_respuesta ="cookie_erronea para ".$email_usuario;
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
    $stm = $conn->prepare("CALL get_cuestionario(:id_cuestionario);"); // funcion mysql con todos los datos
    
    /* 
            retorna la lista de talleres con su nombre descripcion, videos y cuestionario ademas de la nota de un determinado estudiante, si el estudiante no existe retornara los talleres con datos null en nota ya que ese estudiante no existe y no tiene registro ahi, esto no valida si el usuario tiene acceso al curso ya que eso esta en otra clase
           DELIMITER $$

            DROP PROCEDURE IF EXISTS `get_cuestionario` $$
            CREATE DEFINER=`user_name_test`@`127.0.0.1` PROCEDURE `get_cuestionario`(
                IN id_cuest INT
                )
                BEGIN
				SELECT num_pregunta,tipo_pregunta,pregunta_txt,posibles_respuestas_txt,respuesta_correcta,imagen_va_pregunta,imagen_posible_r_1,imagen_posible_r_2,imagen_posible_r_3,imagen_posible_r_4 FROM preguntas_cuestionarios WHERE id_cuestionario = id_cuest ORDER BY num_pregunta ASC;
            END $$
 DELIMITER ;
    */

        $stm->bindValue(":id_cuestionario", $id_cuestionario);
        
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