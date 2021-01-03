<?php

    header('Access-Control-Allow-Origin: *');
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
    header("Access-Control-Allow-Headers: Content-Disposition, Content-Type, Content-Length, Accept-Encoding");
    header("Content-type:application/json");

    include "../e_c_p.php";
    include "../config.php";
    include "../cookie_check.php";
    include "admin_check.php";

    $data = json_decode(file_get_contents('php://input'), true);

    $email_admin=$_POST["email_admin"];

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

    $overwrt = $_POST["sobrescribirfiles"];

    ///// si el archivo ya existe no me importa se actualiza por el nuevo de tener el mismo nombre, esto es por si mas de un taller quieren usar el mismo video
    //// lo idea seria que cada taller tenga sus propios videos 
    //// Colocados de tal forma que si por alguna razon uno de ellos falla su subida, no se suben los demas y se da por fallo el proceso
    if(Insert_File("../../content/materiales/","material",$overwrt)){
        $dato_respuesta ="Archivo subido correctamente";
        $mensaje_de="correcto";

        if(Insert_File("../../content/","video1",$overwrt)){
            $dato_respuesta ="Archivo subido correctamente";
            $mensaje_de="correcto";
                if(Insert_File("../../content/","video2",$overwrt)){
                    $dato_respuesta ="Archivo subido correctamente";
                    $mensaje_de="correcto";
                        if(Insert_File("../../content/","video3",$overwrt)){
                            $dato_respuesta ="Archivo subido correctamente";
                            $mensaje_de="correcto";
                                if(Insert_File("../../content/","video4",$overwrt)){
                                    $dato_respuesta ="Archivo subido correctamente";
                                    $mensaje_de="correcto";
                                }else{
                                    $dato_respuesta ="No se pudo suibir el archivo video4";
                                    $mensaje_de="incorrecto";
                                
                                }
                        }else{
                            $dato_respuesta ="No se pudo suibir el archivo video3";
                            $mensaje_de="incorrecto";
                        
                        }
                }else{
                    $dato_respuesta ="No se pudo suibir el archivo video2";
                    $mensaje_de="incorrecto";
                
                }

        }else{
            $dato_respuesta ="No se pudo suibir el archivo video1";
            $mensaje_de="incorrecto";
           
        }
    }else{
        $dato_respuesta ="No se pudo suibir el archivo material";
        $mensaje_de="incorrecto";
       
    }

    //// solo si es correcto la insercion de todos los archivos, pruedo proceder a la creacion del taller en la base de datos

    if(strcmp($mensaje_de,"correcto") == 0){


        $num_videos = $_POST["num_videos"];

        $video1ND=NULL;
        if(isset($_FILES["video1"]['name'])){
            $video1ND=$_FILES["video1"]['name'];
        }
        $video2ND=NULL;
        if(isset($_FILES["video2"]['name'])){
            $video2ND=$_FILES["video2"]['name'];
        }
        $video3ND=NULL;
        if(isset($_FILES["video3"]['name'])){
            $video3ND=$_FILES["video3"]['name'];
        }
        $video4ND=NULL;
        if(isset($_FILES["video4"]['name'])){
            $video4ND=$_FILES["video4"]['name'];
        }
        $materialND=NULL;
        if(isset($_FILES["material"]['name'])){
            $materialND="https://cursos.kognitivecapsa.com/content/materiales/".$_FILES["material"]['name'];
        }


        $id_curso_taller=$_POST["id_curso"];
        $nombre_taller=$_POST["nombre_taller"];
        $descripcion_taller=$_POST["descripcion_taller"];
        $cuestionario_taller=$_POST["cuestionario_taller"];
        $taller_3_intentos=$_POST["taller_3_intentos"];


        $id_curso_taller=BlockSQLInjection(strip_tags(trim($id_curso_taller)));
        $nombre_taller=BlockSQLInjection(strip_tags(trim($nombre_taller)));
        $descripcion_taller=BlockSQLInjection(strip_tags(trim($descripcion_taller)));
        $cuestionario_taller=BlockSQLInjection(strip_tags(trim($cuestionario_taller)));
        $taller_3_intentos=BlockSQLInjection(strip_tags(trim($taller_3_intentos)));
    

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
        if($nombre_taller != ''){
 

            $stm = $conn->prepare("INSERT INTO talleres(id_curso,nombre_taller,descripcion,video_1,video_2,video_3,video_4,material_taller,id_cuestionario,last_taller) VALUES(:idcur,:nt,:dt,:v1,:v2,:v3,:v4,:mt,:idcues,:la)"); // funcion mysql con todos los datos

    
            $stm->bindValue(":idcur", $id_curso_taller,PDO::PARAM_INT);
            $stm->bindValue(':nt', $nombre_taller);
            $stm->bindValue(':dt', $descripcion_taller);
            $stm->bindValue(':v1', $video1ND);
            $stm->bindValue(':v2', $video2ND);
            $stm->bindValue(':v3', $video3ND);
            $stm->bindValue(':v4', $video4ND);
            $stm->bindValue(':mt', $materialND);
            $stm->bindValue(':idcues', $cuestionario_taller,PDO::PARAM_INT);
            $stm->bindValue(':la', $taller_3_intentos,PDO::PARAM_INT);
            
            $stm->execute();

                $dato_respuesta ="Taller Creado con exito";
                $mensaje_de="correcto";
        
            $stm->closeCursor();
        }
        
    }catch(PDOException $e) /// un catch por si se encuentra una excepcion
        {
            $dato_respuesta = " Error al realizar consulta ".$e->getMessage();
            $mensaje_de="incorrecto";
            
            $stm->closeCursor();
        }











    }
    


    $post_data= json_encode(
        array(	'mensaje' => $mensaje_de,
                'codigoHTML' => $dato_respuesta)

    );

    echo $post_data;
    exit;
/*
if(isset($_FILES['material']['name'])){
    // file name
    $filename = $_FILES['material']['name'];
 
    // Location
    $location = '../../content/materiales/'.$filename;
 
    // file extension
    $file_extension = pathinfo($location, PATHINFO_EXTENSION);
    $file_extension = strtolower($file_extension);
 
    // Valid extensions
    $valid_ext = array("pdf","doc","docx","jpg","png","jpeg","mp4","avi","mpg","mpeg","wmv");
 
   
    if(in_array($file_extension,$valid_ext)){
       // Upload file
       if(move_uploaded_file($_FILES['material']['tmp_name'],$location)){
          $response = 1;
       } 
    }
 
    $post_data= json_encode(
        array(	'mensaje' => $response,
                'codigoHTML' => "Nada por ahora")

    );			


    echo $post_data;
    exit;
    }*/
    //// dependiendo de si se pide sobreescribir lo realiza o no
    function Insert_File($direccion,$nombre_file,$sobreescribir){
        if(isset($_FILES[$nombre_file]['name'])){
            // file name
            $filename = $_FILES[$nombre_file]['name'];
         
            // Location
            $location = $direccion."".$filename;
         
            // file extension
            $file_extension = pathinfo($location, PATHINFO_EXTENSION);
            $file_extension = strtolower($file_extension);
         
            // Valid extensions
            $valid_ext = array("pdf","doc","docx","jpg","png","jpeg","mp4","avi","mpg","mpeg","wmv");
         
            $response = false;
            if(in_array($file_extension,$valid_ext)){
               // Upload file

               if (file_exists($location)){ 
                   if(strcmp($sobreescribir,"si") == 0){
                    chmod($location, 0755);
                    unlink($location);
                        if(move_uploaded_file($_FILES[$nombre_file]['tmp_name'],$location)){
                            $response = true;
                        } 
                    }else{
                        $response = true;
                    }
                }else{
                    if(move_uploaded_file($_FILES[$nombre_file]['tmp_name'],$location)){
                        $response = true;
                     } 
                }

               
            }
         
            return $response;
         }else{
             return true;
         }
    }
    

    function BlockSQLInjection($str)
    {
        $search  = array("'",'"',"'",'"',";");
        $replace = array("'", '&quot;"', '&quot;');
        return str_replace($search, $replace, $str);
    }
?>