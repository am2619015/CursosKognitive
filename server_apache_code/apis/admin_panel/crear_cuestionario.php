<?php

    header('Access-Control-Allow-Origin: *');
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
    header("Access-Control-Allow-Headers: Content-Disposition, Content-Type, Content-Length, Accept-Encoding");
    header("Content-type:application/json");
    //$data = json_decode(file_get_contents("php://input"));
    include "../e_c_p.php";
    include "../config.php";
    include "../cookie_check.php";
    include "admin_check.php";

    $data = json_decode(file_get_contents('php://input'), true);
    
    $email_admin=$data['user']["email_admin"];

    
    $email_admin=BlockSQLInjection(strip_tags(trim($email_admin)));
    

    $dato_respuesta="";
    $mensaje_de="";
    

    // solo si estamos en produccion comprobamos si tenemos acceso a realizar en base al tooken cookie seteado desde jsx
    if($modo_produccion){
        if(!cookie_check::Is_Cookie_acces_Correct($email_admin)){
            $dato_respuesta ="cookie_erronea para ".$email_admin;
            $mensaje_de="incorrecto";
            $post_data= json_encode(
                array(	'mensaje' => $mensaje_de,
                        'codigoHTML' => $dato_respuesta)
    
            );			
    
    
            echo $post_data;
             exit;
        }
    }

    ///// compruebo siempre si ese email es admin si no es, no puedo hacer nada backend
    if(!admin_check::Is_Admin_acces_Correct($email_admin)){
        $dato_respuesta ="NO TIENE ACCESO ADMIN para ".$email_admin;
            $mensaje_de="incorrecto";
            $post_data= json_encode(
                array(	'mensaje' => $mensaje_de,
                        'codigoHTML' => $dato_respuesta)
    
            );			
    
    
            echo $post_data;
             exit;
    }

    $arreglo_preguntas=$data["user"]["preguntas"];
    $id_cuestionario = $data["user"]["id_cuest"];


    

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
    
    $num_preguntas_insertar = count($arreglo_preguntas);
    
    try{
        if($num_preguntas_insertar>0){
        //$stm = $conn->prepare("SELECT * FROM users WHERE email=:correo");

            for ($i=0; $i < $num_preguntas_insertar; $i++) { 
                
                $stm = $conn->prepare("INSERT INTO preguntas_cuestionarios(id_cuestionario,num_pregunta,tipo_pregunta,pregunta_txt,posibles_respuestas_txt,respuesta_correcta,imagen_va_pregunta,imagen_posible_r_1,imagen_posible_r_2,imagen_posible_r_3,imagen_posible_r_4) VALUES (:idc,:nump,:tipo,:pregtxt,:posibleresp,:resp,:imgvapreg,:impr1,:impr2,:impr3,:impr4)"); // funcion mysql con todos los datos
                $num_preg=$i+1;
                $stm->bindValue(":idc", $id_cuestionario,PDO::PARAM_INT);
                $stm->bindValue(":nump", $num_preg,PDO::PARAM_INT);
                $stm->bindValue(":tipo", $arreglo_preguntas[$i][0]);
                $stm->bindValue(":pregtxt", $arreglo_preguntas[$i][1]);
                $stm->bindValue(":posibleresp", $arreglo_preguntas[$i][2]);
                $stm->bindValue(":resp", $arreglo_preguntas[$i][3]);
                $stm->bindValue(":imgvapreg", $arreglo_preguntas[$i][4]);
                $stm->bindValue(":impr1", $arreglo_preguntas[$i][5]);
                $stm->bindValue(":impr2", $arreglo_preguntas[$i][6]);
                $stm->bindValue(":impr3", $arreglo_preguntas[$i][7]);
                $stm->bindValue(":impr4", $arreglo_preguntas[$i][8]);
                $stm->execute();

                    $dato_respuesta ="Cuestionario creado con exito";
                    $mensaje_de="correcto";

                $stm->closeCursor();
            }

        }
        
    }catch(PDOException $e) /// un catch por si se encuentra una excepcion
        {
            $dato_respuesta = " Error al realizar consulta ".$e->getMessage();
            $mensaje_de="incorrecto";
            
            $stm->closeCursor();
        }



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