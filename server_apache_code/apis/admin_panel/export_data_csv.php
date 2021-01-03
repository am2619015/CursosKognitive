<?php

    header('Access-Control-Allow-Origin: *');
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
    header("Access-Control-Allow-Headers: Content-Disposition, Content-Type, Content-Length, Accept-Encoding");
    header('Content-Type: text/csv; charset=utf-8');  
    header('Content-Disposition: attachment; filename=data.csv');  
 
    include "../e_c_p.php";
    include "../config.php";
    include "../cookie_check.php";
    include "admin_check.php";

    $email_admin=$_POST["email_admin"];
    
    $curso_buscar=$_POST["curso_buscar"];


    $email_admin=BlockSQLInjection(strip_tags(trim($email_admin)));

    $curso_buscar=BlockSQLInjection(strip_tags(trim($curso_buscar)));

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


    /////////////////// creo el archivo ///////////
    $output = fopen("php://output", "w"); 
    //$array = array("ID;Email");
    $array = array('ID Nota','Email','Curso','Nota');

    fputcsv($output, $array,';');


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
        //$stm = $conn->prepare("SELECT * FROM users WHERE email=:correo");


            $sql = "SELECT notas.id_nota,users.email,id_curso,ROUND( SUM(notas.nota)/(SELECT COUNT(*) FROM talleres WHERE id_curso=:idc),2 ) AS nota FROM notas LEFT JOIN users ON notas.id_estudiante = users.id WHERE notas.id_curso = :idc GROUP BY notas.id_estudiante ORDER BY ROUND( SUM(notas.nota)/(SELECT COUNT(*) FROM talleres WHERE id_curso=:idc),2 ) DESC";
        
                $stm = $conn->prepare($sql); // funcion mysql con todos los datos
                $stm->bindValue(":idc", $curso_buscar,PDO::PARAM_INT);

                $stm->execute();

                while($row = $stm->fetch( PDO::FETCH_ASSOC )){  
                    fputcsv($output, $row,';');
                } 

                $dato_respuesta ="Obtenido datos con exito";
                $mensaje_de="correcto";

            fclose($output);  

           $stm->closeCursor();
        
    }catch(PDOException $e) /// un catch por si se encuentra una excepcion
        {
            $dato_respuesta = " Error al realizar consulta";
            $mensaje_de="incorrecto";
            
            $stm->closeCursor();
            fclose($output);  
        }



function BlockSQLInjection($str){
 	$search  = array("'",'"',"'",'"',";");
 	$replace = array("'", '&quot;"', '&quot;');
    return str_replace($search, $replace, $str);
}

?>