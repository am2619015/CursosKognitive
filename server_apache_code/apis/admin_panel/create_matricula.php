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

    $id_usuario=$data['user']["id_usuario"];
    $id_curso=$data['user']["id_curso"];
    $caducidad_curso=$data['user']["caducidad_curso"];

    //echo "received data = ".$nombre_user." - ".$pasword_user;
    
    $email_admin=BlockSQLInjection(strip_tags(trim($email_admin)));

    $id_usuario=BlockSQLInjection(strip_tags(trim($id_usuario)));
    $id_curso=BlockSQLInjection(strip_tags(trim($id_curso)));
    $caducidad_curso=BlockSQLInjection(strip_tags(trim($caducidad_curso)));

    
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
    

    try{
        if($id_usuario != ''){
        //$stm = $conn->prepare("SELECT * FROM users WHERE email=:correo");
        $stm = $conn->prepare("SELECT COUNT(*) FROM caducidad_cursos WHERE id_usuario=:id_u AND id_curso=:id_c"); // funcion mysql con todos los datos
        
            $stm->bindValue(":id_u", $id_usuario,PDO::PARAM_INT);
            $stm->bindValue(":id_c", $id_curso,PDO::PARAM_INT);
            $stm->execute();
            $rows = $stm->fetchAll(PDO::FETCH_NUM);

            $existe_user = $rows[0][0];

            if($existe_user == 0){
                $dato_respuesta ="Usuario a matricular ".$id_usuario." no existe";
                $mensaje_de="correcto";
            }else{
                $dato_respuesta ="Usuario (".$id_usuario.") ya esta matriculado a ese curso previamente, no se puede volver a matricular";
                $mensaje_de="incorrecto";
            }
            

            

            $stm->closeCursor();
        }
        
    }catch(PDOException $e) /// un catch por si se encuentra una excepcion
        {
            $dato_respuesta = " Error al realizar consulta";
            $mensaje_de="incorrecto";
            
            $stm->closeCursor();
        }

        if(strcmp($mensaje_de,"correcto") == 0){


            try{
                if($id_usuario != ''){
                    $stm2 = $conn->prepare("INSERT INTO caducidad_cursos(id_curso,id_usuario,caducidad_acceso_curso) VALUES(:idc,:idu,:cac)");
                    $rol = "estudiante";
                    $stm2->bindValue(":idc", $id_curso,PDO::PARAM_INT);
                    $stm2->bindValue(":idu", $id_usuario,PDO::PARAM_INT);
                    $stm2->bindValue(":cac", $caducidad_curso);
                    
                    $stm2->execute();

                    $dato_respuesta =" Usuario matriculado con exito ".$id_usuario;
                    $mensaje_de="correcto";

                    $stm2->closeCursor();
                }else{
                    $dato_respuesta = "Usuario a matricular no existe error obtener json";
                    $mensaje_de="incorrecto";
                    
                    $stm2->closeCursor();
                }
            }
            catch (PDOException $e) {
                    $mensaje_de = "incorrecto";
                    $dato_respuesta = "ERROR mysql v1 contacte con el administrador ".$e->getMessage();
            
                    $stm2->closeCursor();
            }

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