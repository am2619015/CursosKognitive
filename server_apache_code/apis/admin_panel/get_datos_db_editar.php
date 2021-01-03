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

    $id_estudiante=$data['user']["id"];
    $table_name=$data['user']["typo"];
    
    
    //echo "received data = ".$nombre_user." - ".$pasword_user;
    
    $email_admin=BlockSQLInjection(strip_tags(trim($email_admin)));

    $id_estudiante=BlockSQLInjection(strip_tags(trim($id_estudiante)));
    $table_name=BlockSQLInjection(strip_tags(trim($table_name)));
    
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
    
    
    $obtencion = "";
    $column_id_name = "";
        switch($table_name){
            case "users":
                $obtencion = "email,nombres,apellidos,telefono";
                $column_id_name="id";
            break;

            case "cursos":
                $obtencion = "nombre,descripcion";
                $column_id_name="id_curso";
            break;

            case "talleres":
                $obtencion = "id_curso,nombre_taller,id_cuestionario,descripcion,SUM(IF(video_1 IS NULL,0,1)+IF(video_2 IS NULL,0,1)+IF(video_3 IS NULL,0,1)+IF(video_4 IS NULL,0,1)) as num_videos,IF(material_taller IS NULL,0,1),last_taller";
                $column_id_name="id_taller";
            break;

            case "preguntas_cuestionarios":
                $obtencion = "*";
                $column_id_name="id_cuestionario";
            break;

            case "caducidad_cursos":
                $obtencion = "caducidad_acceso_curso";
                $column_id_name="manejado mas abajo con sql";
            break;
            
            default:
            $obtencion = "*";
            $column_id_name="";
        }



        if($column_id_name != ''){

            if(strcmp($table_name,"caducidad_cursos")==0){
                //$stm = $conn->prepare("SELECT * FROM users WHERE email=:correo");
                $sql = "SELECT ".$obtencion." FROM ".$table_name." WHERE id_usuario=:idu AND id_curso=:idc";
                $stm = $conn->prepare($sql); // funcion mysql con todos los datos
                
                $d_caducidad = explode("╚", $id_estudiante);    
                $stm->bindValue(":idu",$d_caducidad[0],PDO::PARAM_INT);
                $stm->bindValue(":idc",$d_caducidad[1],PDO::PARAM_INT);

            }else{
                //$stm = $conn->prepare("SELECT * FROM users WHERE email=:correo");
                $sql = "SELECT ".$obtencion." FROM ".$table_name." WHERE ".$column_id_name."=:id_buscar";
                $stm = $conn->prepare($sql); // funcion mysql con todos los datos
                
                $stm->bindValue(":id_buscar", $id_estudiante,PDO::PARAM_INT);

            }

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