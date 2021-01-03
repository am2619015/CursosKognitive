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
    
    $id_cuestionario=$data['user_login']["id_cuestionario"];
    $respuestas_cuestionario=$data['user_login']["respuestas_cuestionario"]; 
    $cod_acceso = $data['user_login']["cod_acc"]; 
    $email_v = $data['user_login']["email_user"];
    $id_curso_v = $data['user_login']["id_curso"]; 
    $id_taller_v = $data['user_login']["id_t"]; 
    
    
    //echo "received data = ".$nombre_user." - ".$pasword_user;
    
    //$id_cuestionario=BlockSQLInjection(strip_tags(trim($id_cuestionario)));
    //$respuestas_cuestionario=BlockSQLInjection(strip_tags(trim($respuestas_cuestionario)));
    
    /*if (strcmp($cod_acceso, 'cJQH~!GE{K+QOmDvco/WxcQ1^HO[,^2|>4ve-LObho9SO2J~Alzj[I=Cb?E)6FQ') !== 0) {
        $post_data_error= json_encode(
            array(	'mensaje' => "Error no posee acceso",
                    'codigoHTML' => 0)

        );			


        echo $post_data_error;
        exit;
    }*/

    
     // solo si estamos en produccion comprobamos si tenemos acceso a realizar en base al tooken cookie seteado desde jsx
     if($modo_produccion){
        if(!cookie_check::Is_Cookie_acces_Correct($email_v)){
            $dato_respuesta ="cookie_erronea para ".$email_v;
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
    

    //$stm = $conn->prepare("SELECT * FROM users WHERE email=:correo");
    $stm = $conn->prepare("CALL get_resp_cuest_num(:id_cuest);"); // funcion mysql con todos los datos
    
    /* 
            DELIMITER $$

            DROP PROCEDURE IF EXISTS `get_resp_cuest_num` $$
            CREATE DEFINER=`user_name_test`@`127.0.0.1` PROCEDURE `get_resp_cuest_num`(
                IN id_cuest INT
                )
                BEGIN

                SELECT respuesta_correcta FROM preguntas_cuestionarios WHERE id_cuestionario = id_cuest ORDER BY num_pregunta ASC;
            END $$

 DELIMITER ;
    */
        $stm->bindValue(":id_cuest", $id_cuestionario);
        
        $stm->execute();

		$rows = $stm->fetchAll(PDO::FETCH_NUM);


    //// se asume que hay un error de entrada al menos que luego no lo haya 
		 $dato_respuesta= "Usuario no posee cursos";
         $mensaje_de="incorrecto";
         
         $array_respuesta= array();
         $calificacion = 0;
         $num_preguntas = 0;

          /// se procede a recorrer los resultados //
		 if($rows>0){
            $mensaje_de="correcto";

            $count = 0;
            $num_preguntas=count($rows);

            $calificado_sobre = 20;
            $puntos_por_pregunta = $calificado_sobre/$num_preguntas;

            foreach ($rows as $row) {
               // echo "respuseta ".$count." de ".$row[0]."<br/>";
                

                $r_c = $row[0];
                if (strpos($r_c, '╚') !== false) {
                    $r_c="╚".$r_c;
                }


                if(strcmp(trim($respuestas_cuestionario[$count]), trim($r_c)) === 0){
                    $calificacion+=$puntos_por_pregunta;
                }

                $count++;

            }

        }

        $dato_respuesta = json_encode($rows);
        

        $stm->closeCursor();

            /// insercion o actualziacion de notas ///
        try{

            $stm2 = $conn->prepare("CALL insert_or_update_NotaEstudiante(:e_u,:id_c,:id_t,:nota_t);");
            $stm2->bindValue(":e_u", $email_v);
            $stm2->bindValue(":id_c", $id_curso_v);
            $stm2->bindValue(":id_t", $id_taller_v);
            $stm2->bindValue(":nota_t", $calificacion);
            $stm2->execute();
        }
        catch (PDOException $e) {
                $mensaje_de = "incorrecto";
                $calificacion = "ERROR mysql contacte con el administrador ".$e->getMessage();
        
        }


        /* dos funciones solo la ultima implementada pero muestra como realzia si existe estudiante lo actualiza y si no existe inserta la nota y solo si la nota es mayor que la anterior
        DELIMITER $$

                                DROP PROCEDURE IF EXISTS `insert_or_update_NotaEstudiante` $$
                                CREATE DEFINER=`user_name_test`@`127.0.0.1` PROCEDURE `insert_or_update_NotaEstudiante`(
                                    IN email_buscar VARCHAR(60),
                                    IN id_curso_buscar INT,
                                    IN id_taller_buscar INT,
                                    IN nota_poner FLOAT
                                    )
                                    BEGIN
                                    
                                    DECLARE existe_estudiante INT DEFAULT 0;
                                    
                                    SELECT COUNT(nota) INTO existe_estudiante FROM notas WHERE id_estudiante=(SELECT id FROM users WHERE email = email_buscar) AND id_taller = id_taller_buscar AND 				id_curso = id_curso_buscar;
                                    
                                    IF existe_estudiante >=1 THEN
                                        UPDATE notas SET nota = nota_poner WHERE id_estudiante=(SELECT id FROM users WHERE email = email_buscar) AND id_taller = id_taller_buscar AND id_curso = id_curso_buscar;
                                    ELSE
                                        INSERT INTO notas (id_estudiante,id_taller,id_curso,nota) VALUES ((SELECT id FROM users WHERE email = email_buscar),id_taller_buscar,id_curso_buscar,nota_poner);	
                                    END IF;
                                    
                                    END $$

                    DELIMITER ;




                    DELIMITER $$

                                DROP PROCEDURE IF EXISTS `insert_or_update_NotaEstudiante` $$
                                CREATE DEFINER=`user_name_test`@`127.0.0.1` PROCEDURE `insert_or_update_NotaEstudiante`(
                                    IN email_buscar VARCHAR(60),
                                    IN id_curso_buscar INT,
                                    IN id_taller_buscar INT,
                                    IN nota_poner FLOAT
                                    )
                                    BEGIN
                                    
                                    DECLARE existe_estudiante INT DEFAULT 0;
                                    
                                    SELECT COUNT(nota) INTO existe_estudiante FROM notas WHERE id_estudiante=(SELECT id FROM users WHERE email = email_buscar) AND id_taller = id_taller_buscar AND 				id_curso = id_curso_buscar;
                                    
                                    IF existe_estudiante >=1 THEN
                                        IF nota_poner > (SELECT nota FROM notas WHERE id_estudiante = (SELECT id FROM users WHERE email = email_buscar) AND id_taller = id_taller_buscar AND id_curso = id_curso_buscar) THEN
                                        UPDATE notas SET nota = nota_poner WHERE id_estudiante=(SELECT id FROM users WHERE email = email_buscar) AND id_taller = id_taller_buscar AND id_curso = id_curso_buscar;
                                        END IF;
                                    ELSE
                                        INSERT INTO notas (id_estudiante,id_taller,id_curso,nota) VALUES ((SELECT id FROM users WHERE email = email_buscar),id_taller_buscar,id_curso_buscar,nota_poner);	
                                    END IF;
                                    
                                    END $$

                    DELIMITER ;
        */








        //$conn2->close();
        $conn=null;


        $post_data= json_encode(
            array(	'mensaje' => $mensaje_de,
                    'codigoHTML' => $calificacion)

        );			


        echo $post_data;





function BlockSQLInjection($str)
{
 	$search  = array("'",'"',"'",'"',";");
 	$replace = array("'", '&quot;"', '&quot;');
    return str_replace($search, $replace, $str);
}


?>