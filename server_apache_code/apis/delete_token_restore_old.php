<?php

    header('Access-Control-Allow-Origin: *');
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
    header("Access-Control-Allow-Headers: Content-Disposition, Content-Type, Content-Length, Accept-Encoding");
    header("Content-type:application/json");
    //$data = json_decode(file_get_contents("php://input"));
    include "e_c_p.php";
    include "config.php";
    include "cookie_check.php";


    /// CRON TASK QUE CORRE CADA 2 HORAS

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
    }else{
        $dato_respuesta ="Conexion con db";
		$mensaje_de="correcto";
    }
    

    try{
        //SELECT DATEDIFF('2020-10-30', '2020-10-01') AS 'Result'
        //ELIMINA TODOS LOS TOKENES DE RESTAURAR CONTRASEÑAS QUE SEAN MAYORES A UN DIA, ESTO LO HACE UN CRON CADA HORA
        $stm = $conn->prepare("DELETE FROM email_restore_password WHERE DATEDIFF(date, now())>=1"); // funcion mysql con todos los datos

           // $tk_e="";
            
            //$stm->bindValue(":tkn_empty", $tk_e);
            $stm->execute();
        
            $dato_respuesta = " Eliminado correctamente";
            $mensaje_de="correcto";

            $stm->closeCursor();
        
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

?>