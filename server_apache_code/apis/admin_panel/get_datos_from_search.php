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
    $patron_buscar=$data['user']["patern_search"];
    $table_name=$data['user']["tipo_tabla"];

    //echo "received data = ".$nombre_user." - ".$pasword_user;
    
    $email_admin=BlockSQLInjection(strip_tags(trim($email_admin)));

    $num_datos_por_pagina=BlockSQLInjection(strip_tags(trim($num_datos_por_pagina)));
    $patron_buscar=BlockSQLInjection(strip_tags(trim($patron_buscar)));
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
    
    $column_busqueda = "";
    $column_id_name = "";
        switch($table_name){
            case "users":
                $column_busqueda="email";
                $column_id_name="id";
                $obtencion = "u.id,u.email,CONCAT(u.nombres,' ',u.apellidos),u.telefono";
                $condicion = "ORDER BY";
            break;

            case "cursos":
                $column_busqueda="nombre";
                $column_id_name="id_curso";
                $obtencion = "u.id_curso,u.nombre,u.descripcion,(SELECT Count(*) FROM talleres t WHERE t.id_curso=u.id_curso)";
                $condicion = "ORDER BY";
            break;

            case "talleres":
                $column_busqueda="nombre_taller";
                $column_id_name="id_taller";
                $obtencion = "u.id_taller,(SELECT CONCAT('(Curso #',c.id_curso,')     ',c.nombre) FROM cursos c WHERE c.id_curso = u.id_curso),u.nombre_taller,u.descripcion,u.id_cuestionario";
                $condicion = "ORDER BY";
            break;

            case "preguntas_cuestionarios":
                $column_busqueda="id_cuestionario";
                $column_id_name="id_cuestionario";
                $obtencion = "id_cuestionario,COUNT(num_pregunta),SUBSTRING(pregunta_txt,1,60)";
                $condicion = "GROUP BY";
            break;

            case "caducidad_cursos":
                $column_busqueda="email";
                $column_id_name="id_usuario";
                $obtencion = "(SELECT CONCAT('(#',id_usuario,') ',email)),(SELECT CONCAT('(#',c.id_curso,') ',(SELECT i.nombre FROM cursos i WHERE i.id_curso=c.id_curso))),caducidad_acceso_curso";
                $condicion = "ORDER BY";
            break;

            case "notas":
                $column_id_name="id_nota";
                $obtencion = "id_nota,u.email,(SELECT CONCAT('(#',n.id_curso,') ',c.nombre)),(SELECT CONCAT('(#',n.id_taller,') ',t.nombre_taller)),nota";
                $condicion = "ORDER BY";
            break;
            
            default:
            $column_busqueda="";
            $column_id_name="";
            $obtencion = "*";
        }

        if(strcmp($table_name,"notas")==0){
            $busqueda_nota_by=$data['user']["buscador_notas_by"];
            switch($busqueda_nota_by){
            case "0":
                $column_busqueda="u.email";
            break;

            case "1":
                $column_busqueda="c.nombre";
            break;

            case "2":
                $column_busqueda="n.id_curso";
            break;

            case "3":
                $column_busqueda="t.nombre_taller";
            break;

            case "4":
                $column_busqueda="n.id_taller";
            break;

            case "5":
                $column_busqueda="n.id_nota";
            break;

            break;
                $column_busqueda="";
            }
        }
        


    try{
        if($num_datos_por_pagina != ''){
        //$stm = $conn->prepare("SELECT * FROM users WHERE email=:correo");
            if($column_busqueda != ''){
                    if(strcmp($table_name,"users")==0){
                        $sql = "SELECT ".$obtencion." FROM ".$table_name." u WHERE rol='estudiante' AND LOWER(".$column_busqueda.") LIKE LOWER(:patern) ORDER BY ".$column_id_name." DESC LIMIT 0,:numeroCargar";
                        $stm = $conn->prepare($sql); // funcion mysql con todos los datos
                    }else if(strcmp($table_name,"caducidad_cursos")==0){
                        $sql = "SELECT ".$obtencion." FROM ".$table_name." c INNER JOIN users u ON u.id=c.id_usuario WHERE LOWER(".$column_busqueda.") LIKE LOWER(:patern) ORDER BY id_curso DESC,id_usuario DESC LIMIT 0,:numeroCargar";
                        $stm = $conn->prepare($sql); // funcion mysql con todos los datos
                    }else if(strcmp($table_name,"notas")==0){
                        $sql = "SELECT ".$obtencion." FROM ".$table_name." n INNER JOIN users u ON n.id_estudiante=u.id INNER JOIN cursos c ON n.id_curso=c.id_curso INNER JOIN talleres t ON t.id_taller=n.id_taller WHERE LOWER(".$column_busqueda.") LIKE LOWER(:patern) ".$condicion." ".$column_id_name." DESC";
                        $stm = $conn->prepare($sql); // funcion mysql con todos los datos
                    }else{
                        $sql = "SELECT ".$obtencion." FROM ".$table_name." u WHERE LOWER(".$column_busqueda.") LIKE LOWER(:patern) ".$condicion." ".$column_id_name." DESC LIMIT 0,:numeroCargar";
                        $stm = $conn->prepare($sql); // funcion mysql con todos los datos
                    }
                    
                        
                        $patron_buscar = "%".$patron_buscar."%";

                        if(strcmp($table_name,"notas")!=0){
                        $stm->bindValue(":numeroCargar", $num_datos_por_pagina,PDO::PARAM_INT);
                        }
                        $stm->bindValue(":patern",$patron_buscar);
                        $stm->execute();
                        $rows = $stm->fetchAll(PDO::FETCH_NUM);

                    
                        if($rows>0){
                            $mensaje_de="correcto";
                            $dato_respuesta = json_encode($rows);
                        }else{
                            $mensaje_de="incorrecto";
                            $dato_respuesta = "No hay estudiantes en la db que correspondan con lo indicado";
                        }
                        

                        

                        $stm->closeCursor();
            }
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