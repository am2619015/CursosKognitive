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

    $num_datos_por_pagina=$data['user']["datos_por_pagina"];
    $table_name=$data['user']["tipo_tabla"];
    //echo "received data = ".$nombre_user." - ".$pasword_user;
    
    $email_admin=BlockSQLInjection(strip_tags(trim($email_admin)));

    $num_datos_por_pagina=BlockSQLInjection(strip_tags(trim($num_datos_por_pagina)));
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
        if($num_datos_por_pagina != ''){
        //$stm = $conn->prepare("SELECT * FROM users WHERE email=:correo");
        if(strcmp($table_name,"users")==0){
            $sql = "SELECT(CEILING((SELECT COUNT(*) FROM ".$table_name." WHERE rol='estudiante')/:num_p))";
            $stm = $conn->prepare($sql); // funcion mysql con todos los datos
        }else if(strcmp($table_name,"preguntas_cuestionarios")==0){
            $sql = "SELECT(CEILING((SELECT COUNT(DISTINCT(id_cuestionario)) FROM ".$table_name.")/:num_p))";
            $stm = $conn->prepare($sql); // funcion mysql con todos los datos
        }
        else{
            $sql = "SELECT(CEILING((SELECT COUNT(*) FROM ".$table_name.")/:num_p))";
            $stm = $conn->prepare($sql); // funcion mysql con todos los datos
        }
        
        
            $stm->bindValue(":num_p", $num_datos_por_pagina);
            $stm->bindValue(':table', $table_name, PDO::PARAM_STR, strlen($table_name));
            

            $stm->execute();
            $rows = $stm->fetchAll(PDO::FETCH_NUM);

            $num_get = $rows[0][0];


                $dato_respuesta ="Numero de ╚".$num_get;
                $mensaje_de="correcto";
            

            

            $stm->closeCursor();
        }
        
    }catch(PDOException $e) /// un catch por si se encuentra una excepcion
        {
            $dato_respuesta = " Error al realizar consulta ".$e->getMessage();
            $mensaje_de="incorrecto";
            
            $stm->closeCursor();
        }

        /*if(strcmp($mensaje_de,"correcto") == 0){


            try{
                if($email != ''){
                    $stm2 = $conn->prepare("INSERT INTO users(email,password,rol,nombres,apellidos,telefono) VALUES(:e,:p,:r,:n,:a,:t)");
                    $rol = "estudiante";
                    $stm2->bindValue(":e", $email);
                    $stm2->bindValue(":p", $pass_encrypted);
                    $stm2->bindValue(":r", $rol);
                    $stm2->bindValue(":n", $nombres);
                    $stm2->bindValue(":a", $apellidos);
                    $stm2->bindValue(":t", $telefono);
                    
                    $stm2->execute();

                    $dato_respuesta =" Usuario ingresado con exito ".$email;
                    $mensaje_de="correcto";

                    $stm2->closeCursor();
                }else{
                    $dato_respuesta = "Usuario a ingresar no existe error obtener json";
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



        if(strcmp($mensaje_de,"correcto") == 0){


            try{
                if($email != ''){
                    $stm3 = $conn->prepare("UPDATE users SET tkn_accs=(SELECT randomPassword()) WHERE email=:e_u");
                    $stm3->bindValue(":e_u", $email);
                    $stm3->execute();

                    $dato_respuesta =" Accion terminada para ".$email;
                    $mensaje_de="correcto";

                    $stm3->closeCursor();
                }else{
                    $dato_respuesta = "Usuario no existe fallo obtner json";
                    $mensaje_de="incorrecto";
                    
                    $stm3->closeCursor();
                }
            }
            catch (PDOException $e) {
                    $mensaje_de = "incorrecto";
                    $dato_respuesta = "ERROR mysql v2 contacte con el administrador ".$e->getMessage();
            
                    $stm3->closeCursor();
            }

        }*/


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