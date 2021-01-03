<?php

    header('Access-Control-Allow-Origin: *');
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
    header("Access-Control-Allow-Headers: Content-Disposition, Content-Type, Content-Length, Accept-Encoding");
    header("Content-type:application/json");
    //$data = json_decode(file_get_contents("php://input"));
    include "e_c_p.php";

    $data = json_decode(file_get_contents('php://input'), true);
    
    $nombre_user=$data['user_login']["name"];
    $pasword_user=$data['user_login']["pass"];
    
    //echo "received data = ".$nombre_user." - ".$pasword_user;
    
    $nombre_user=BlockSQLInjection(strip_tags(trim($nombre_user)));
    $pasword_user=BlockSQLInjection(strip_tags(trim($pasword_user)));
    
    

	$dbtable="users";

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
    

    $stm = $conn->prepare("SELECT * FROM ".$dbtable." WHERE email=:correo");
		$stm->bindValue(":correo", $nombre_user);
		$stm->execute();
		$rows = $stm->fetchAll(PDO::FETCH_NUM);


    //// se asume que hay un error de entrada al menos que luego no lo haya 
		 $dato_respuesta= "Usuario no existe o no Registrado";
         $mensaje_de="incorrecto";
         
        

          /// se procede a recorrer los resultados //
		 foreach($rows as $row) {
                    $k_dsc=en_c_psw::decryption($row[2]);
                if(strcmp($k_dsc, $pasword_user)==0){
                    //$dato_respuesta ="cJQH~!GE{K+QOmDvco/WxcQ1^HO[,^2|>4ve-LObho9SO2J~Alzj[I=Cb?E)6FQ§".$row[1]."╚".$row[3];
                    $dato_respuesta =$row[7]."§".$row[1]."╚".$row[3];
                    $mensaje_de="correcto";
                }
                else{
                    $dato_respuesta ="Contraseña incorrecta";
                    $mensaje_de="incorrecto";
                }
                
        }

        $stm->closeCursor();

        if(strcmp($mensaje_de,"correcto") == 0){

            try{

                $stm2 = $conn->prepare("CALL add_logs_usuarios(:email_l);");
                $today = date("Y-m-d H:i:s");  
                $stm2->bindValue(":email_l", $nombre_user);
                $stm2->execute();
    
    
                /*
                DELIMITER $$
    
                                    DROP PROCEDURE IF EXISTS `add_logs_usuarios` $$
                                    CREATE DEFINER=`user_name_test`@`127.0.0.1` PROCEDURE `add_logs_usuarios`(
                                        IN email_poner VARCHAR(60),
                                        IN fecha_poner DATE
                                        )
                                        BEGIN
                                        
                                        IF email_poner IS NOT NULL AND email_poner != "" THEN
                                            INSERT INTO logs_usuarios(email_usuario,fecha_log) VALUES(email_poner,fecha_poner);
                                        END IF;
                                        
                                        END $$
    
                        DELIMITER ;
                */
                $stm2->closeCursor();
            }
            catch (PDOException $e) {
                    $mensaje_de = "incorrecto";
                    $dato_respuesta = "ERROR mysql al insertar un log ".$e->getMessage();
            
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