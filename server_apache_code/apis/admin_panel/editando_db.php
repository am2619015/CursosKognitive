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
    
    $email_admin=$data['info_editar']["email_admin"];
    //$value_1=$data['info_editar']["value_1"];
    $table_name=$data['info_editar']["typo"];


    
    $email_admin=BlockSQLInjection(strip_tags(trim($email_admin)));
    $table_name=BlockSQLInjection(strip_tags(trim($table_name)));

    //$value_1=BlockSQLInjection(strip_tags(trim($value_1)));

    
    
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
    
    $db_cursos="cursos";

    $obtencion = "";
    $column_id_name = "";
        switch($table_name){
            case "users":
                try{
                    //$stm = $conn->prepare("SELECT * FROM users WHERE email=:correo");
                        $value_1=$data['info_editar']["dato_1"];
                        $value_2=$data['info_editar']["dato_2"];
                        $value_3=$data['info_editar']["dato_3"];
                        $value_4=$data['info_editar']["dato_4"];

                        $value_1=BlockSQLInjection(strip_tags(trim($value_1)));
                        $value_2=BlockSQLInjection(strip_tags(trim($value_2)));
                        $value_3=BlockSQLInjection(strip_tags(trim($value_3)));
                        $value_4=BlockSQLInjection(strip_tags(trim($value_4)));

                        $stm = $conn->prepare("UPDATE users u SET u.nombres=:nombres_val,u.apellidos=:apellidos_val,u.telefono=:telefono_val WHERE email=:email");
                        $stm->bindValue(":email", $value_1);
                        $stm->bindValue(":nombres_val", $value_2);
                        $stm->bindValue(":apellidos_val", $value_3);
                        $stm->bindValue(":telefono_val", $value_4);
                        $stm->execute();
            
            
                    //// se asume que hay un error de entrada al menos que luego no lo haya 
                        $dato_respuesta= "Editado con exito";
                        $mensaje_de="correcto";
                        
                        $stm->closeCursor();
            
                    }catch(PDOException $e) /// un catch por si se encuentra una excepcion
                    {
                        $dato_respuesta = " Error al realizar consulta ".$e->getMessage();
                        $mensaje_de="incorrecto";
                        
                        $stm->closeCursor();
                    }
            break;

            case "cursos":
                try{


                        $value_1=$data['info_editar']["dato_1"];
                        $value_2=$data['info_editar']["dato_2"];
                        $value_3=$data['info_editar']["dato_3"];
                        $value_4=$data['info_editar']["dato_4"];

                        $value_1=BlockSQLInjection(strip_tags(trim($value_1)));
                        $value_2=BlockSQLInjection(strip_tags(trim($value_2)));
                        $value_3=BlockSQLInjection(strip_tags(trim($value_3)));



                   
                        $stm2 = $conn->prepare("UPDATE cursos c SET c.nombre=:nombre_val,c.descripcion=:desc_val,c.imagen=:img_b WHERE id_curso=:id_c");
                        $stm2->bindValue(":id_c", $value_1,PDO::PARAM_INT);
                        $stm2->bindValue(":nombre_val", $value_2);
                        $stm2->bindValue(":desc_val", $value_3);
                        $stm2->bindValue(":img_b", $value_4);
                        $stm2->execute();
            
            
                    //// se asume que hay un error de entrada al menos que luego no lo haya 
                        $dato_respuesta= "Editado con exito";
                        $mensaje_de="correcto";
                        
                        $stm2->closeCursor();
            
                    }catch(PDOException $e) /// un catch por si se encuentra una excepcion
                    {
                        $dato_respuesta = " Error al realizar consulta ".$e->getMessage();
                        $mensaje_de="incorrecto";
                        
                        $stm2->closeCursor();
                    }
            break;


            case "caducidad_cursos":
                try{
                        $value_1=$data['info_editar']["dato_1"];
                        $value_2=$data['info_editar']["dato_2"];

                        $value_1=BlockSQLInjection(strip_tags(trim($value_1)));
                        $value_2=BlockSQLInjection(strip_tags(trim($value_2)));

                        $stm2 = $conn->prepare("UPDATE caducidad_cursos c SET c.caducidad_acceso_curso=:caduc WHERE id_usuario=:id_u AND id_curso=:id_c");
                        $d_caducidad = explode("╚", $value_1);
                        $stm2->bindValue(":id_u", $d_caducidad[0],PDO::PARAM_INT);
                        $stm2->bindValue(":id_c", $d_caducidad[1],PDO::PARAM_INT);
                        $stm2->bindValue(":caduc", $value_2);
                        $stm2->execute();
            
            
                    //// se asume que hay un error de entrada al menos que luego no lo haya 
                        $dato_respuesta= "Editado con exito puesto";
                        $mensaje_de="correcto";
                        
                        $stm2->closeCursor();
            
                    }catch(PDOException $e) /// un catch por si se encuentra una excepcion
                    {
                        $dato_respuesta = " Error al realizar consulta ".$e->getMessage();
                        $mensaje_de="incorrecto";
                        
                        $stm2->closeCursor();
                    }
            break;

            case "preguntas_cuestionarios":
                $dato_respuesta = "En construccion";
                $mensaje_de="incorrecto";
            break;

            case "talleres":
                $dato_respuesta = "En construccion";
                $mensaje_de="incorrecto";
            break;
            
            default:
            $dato_respuesta = "No existe ese caso ".$info_editar;
            $mensaje_de="incorrecto";
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