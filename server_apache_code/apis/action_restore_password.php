<?php

    header('Access-Control-Allow-Origin: *');
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
    header("Access-Control-Allow-Headers: Content-Disposition, Content-Type, Content-Length, Accept-Encoding");
    header("Content-type:application/json");
    //$data = json_decode(file_get_contents("php://input"));
    include "e_c_p.php";
    include "config.php";


    $data = json_decode(file_get_contents('php://input'), true);
    
    $password=$data['user']["password"];
    $token_key=$data['user']["token_key"];
    $email_user="";
    //echo "received data = ".$nombre_user." - ".$pasword_user;
    
    $password=BlockSQLInjection(strip_tags(trim($password)));
    $token_key=BlockSQLInjection(strip_tags(trim($token_key)));
    
    $pass_encrypted=en_c_psw::encryption($password);
    
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
    

    try{
        if($token_key != ''){
        //$stm = $conn->prepare("SELECT * FROM users WHERE email=:correo");
        $stm = $conn->prepare("SELECT email from email_restore_password WHERE token_cambio=:tk"); // funcion mysql con todos los datos
        
            $stm->bindValue(":tk", $token_key);
            $stm->execute();
            $rows = $stm->fetchAll(PDO::FETCH_NUM);

            $email_user = trim($rows[0][0]," ");

            if($email_user != ''){
                $dato_respuesta ="Usuario al que restaurar su contraseña ".$email_user." a poner pass = ".$pass_encrypted;
                $mensaje_de="correcto";
            }else{
                $dato_respuesta ="Usuario con ese token no existe ";
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
                if($email_user != ''){
                    $stm2 = $conn->prepare("UPDATE users SET password=:pasw WHERE email = :correo");
                    $stm2->bindValue(":pasw", $pass_encrypted);
                    $stm2->bindValue(":correo", $email_user);
                    $stm2->execute();

                    $dato_respuesta =" Contraseña se a actualizado para ".$email_user;
                    $mensaje_de="correcto";

                    $stm2->closeCursor();
                }else{
                    $dato_respuesta = "Usuario no existe con ese token";
                    $mensaje_de="incorrecto";
                    
                    $stm2->closeCursor();
                }
            }
            catch (PDOException $e) {
                    $mensaje_de = "incorrecto";
                    $dato_respuesta = "ERROR mysql contacte con el administrador ".$e->getMessage();
            
                    $stm2->closeCursor();
            }

        }



        if(strcmp($mensaje_de,"correcto") == 0){


            try{
                if($email_user != ''){
                    $stm3 = $conn->prepare("DELETE FROM email_restore_password WHERE email=:correo");
                    $stm3->bindValue(":correo", $email_user);
                    $stm3->execute();

                    $dato_respuesta =" Accion terminada para ".$email_user;
                    $mensaje_de="correcto";

                    $stm3->closeCursor();
                }else{
                    $dato_respuesta = "Usuario no existe con ese token";
                    $mensaje_de="incorrecto";
                    
                    $stm3->closeCursor();
                }
            }
            catch (PDOException $e) {
                    $mensaje_de = "incorrecto";
                    $dato_respuesta = "ERROR mysql contacte con el administrador ".$e->getMessage();
            
                    $stm3->closeCursor();
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