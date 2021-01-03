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
    
    $nombre_user=$data['user_login']["name"];
    //$pasword_user=$data['user_login']["pass"];
    
    //echo "received data = ".$nombre_user." - ".$pasword_user;
    
    $nombre_user=BlockSQLInjection(strip_tags(trim($nombre_user)));

     // solo si estamos en produccion comprobamos si tenemos acceso a realizar en base al tooken cookie seteado desde jsx
     if($modo_produccion){
      if(!cookie_check::Is_Cookie_acces_Correct($nombre_user)){
          $dato_respuesta ="cookie_erronea para ".$nombre_user;
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
    $stm = $conn->prepare("CALL datos_cursos_usuario(:correo);"); // funcion mysql con todos los datos
    
    /* 
      CREATE DEFINER=`user_name_test`@`127.0.0.1` PROCEDURE `datos_cursos_usuario`(
      IN emai_buscar VARCHAR(60)
      )
      BEGIN

      SELECT * from cursos C JOIN (SELECT id_curso,caducidad_acceso_curso FROM caducidad_cursos AS c LEFT JOIN users AS u ON c.id_usuario=u.id WHERE id_usuario = (SELECT id FROM users WHERE email = emai_buscar)) AS RF ON C.id_curso = RF.id_curso;


      END
    */
    
		$stm->bindValue(":correo", $nombre_user);
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