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
    
    $email_estudiante=$data['info_taller']["email"];
    $id_curso = $data['info_taller']["curso_id"];
    $id_taller=$data['info_taller']["taller_id"];
    
    
    //echo "received data = ".$nombre_user." - ".$pasword_user;
    
    $email_estudiante=BlockSQLInjection(strip_tags(trim($email_estudiante)));
    $id_curso=BlockSQLInjection(strip_tags(trim($id_curso)));
    $id_taller=BlockSQLInjection(strip_tags(trim($id_taller)));
    
    
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
    $stm = $conn->prepare("CALL get_num_intentos_restantes_taller_final(:email,:id1,:id2);"); // funcion mysql con todos los datos
    
    /* 
            retorna numero de intentos finales de un taller
            
DELIMITER $$
                                DROP PROCEDURE IF EXISTS `get_num_intentos_restantes_taller_final` $$
                                CREATE DEFINER=`user_name_test`@`127.0.0.1` PROCEDURE `get_num_intentos_restantes_taller_final`(
                                    IN email_buscar VARCHAR(60),
                                    IN id_curso_buscar INT,
                                    IN id_taller_buscar INT
                                    )
                                    BEGIN
                                    
                                    DECLARE is_taller_final_realizado INT DEFAULT 0;
                                    
                                    SELECT COUNT(*) INTO is_taller_final_realizado FROM intentos_talleres_finales itf WHERE itf.id_curso = id_curso_buscar AND itf.id_taller = id_taller_buscar AND itf.id_usuario = (SELECT u.id FROM users u WHERE u.email = email_buscar); 
                                    
                                    IF is_taller_final_realizado >=1 THEN
										SELECT (3-i.num_intentos) AS intentos_restantes FROM intentos_talleres_finales i WHERE i.id_curso = id_curso_buscar AND i.id_taller = id_taller_buscar AND i.id_usuario = (SELECT u.id FROM users u WHERE u.email = email_buscar); 
                                    ELSE
										SELECT 3 AS intentos_restantes;
                                    END IF;
                                    
                                    END $$

                    DELIMITER ;
    */
        $stm->bindValue(":email", $email_estudiante);
        $stm->bindValue(":id1", $id_curso);                            
		$stm->bindValue(":id2", $id_taller);
		$stm->execute();
		$rows = $stm->fetchAll(PDO::FETCH_NUM);


    //// se asume que hay un error de entrada al menos que luego no lo haya 
		 $dato_respuesta= "Error no se encontro ese taller";
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