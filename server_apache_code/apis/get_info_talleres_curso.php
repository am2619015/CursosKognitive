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
    
    $email_estudiante=$data['user_login2']["email"];
    $id_curso=$data['user_login2']["curso_id"];
    
    
    //echo "received data = ".$nombre_user." - ".$pasword_user;
    
    $email_estudiante=BlockSQLInjection(strip_tags(trim($email_estudiante)));
    $id_curso=BlockSQLInjection(strip_tags(trim($id_curso)));
    
    
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
    $stm = $conn->prepare("CALL get_talleres_info_generalCurso(:email,:id);"); // funcion mysql con todos los datos
    
    /* 
            retorna la lista de talleres con su nombre descripcion, videos y cuestionario ademas de la nota de un determinado estudiante, si el estudiante no existe retornara los talleres con datos null en nota ya que ese estudiante no existe y no tiene registro ahi, esto no valida si el usuario tiene acceso al curso ya que eso esta en otra clase
            DELIMITER $$

            DROP PROCEDURE IF EXISTS `get_talleres_info_generalCurso` $$
            CREATE DEFINER=`user_name_test`@`127.0.0.1` PROCEDURE `get_talleres_info_generalCurso`(
                IN email_buscar VARCHAR(60),
                IN id_curso_buscar INT
                )
                BEGIN

                SELECT T.id_taller,nombre_taller,descripcion,video_1,video_2,video_3,video_4,nota FROM talleres AS T LEFT JOIN(SELECT * FROM notas AS n WHERE n.id_estudiante = (SELECT id FROM users WHERE email = email_buscar)) AS RF ON RF.id_taller = T.id_taller WHERE T.id_curso=id_curso_buscar;

            END $$

 DELIMITER ;
    */
        $stm->bindValue(":email", $email_estudiante);
		$stm->bindValue(":id", $id_curso);
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