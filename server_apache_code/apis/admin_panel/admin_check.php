<?php 

//admin_check::Is_Admin_acces_Correct("hack2619015@hotmail.com"); // ejemplo de uso

class admin_check {
// cuidado con usar echo en la funcion
public static function Is_Admin_acces_Correct($email_usuario){

    include "../config.php";
    
    $u_n=$username;
    $pw_db=$pasword;
    $server_n =$servername;
    $db_n=$dbname;

    try{ 

		$conexion_db = new PDO('mysql:host='.$server_n.';dbname='.$db_n.";charset=utf8", $u_n, $pw_db,[
            PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8',
            PDO::MYSQL_ATTR_USE_BUFFERED_QUERY => true,
	        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
          ]); // nuevo metodo mejorado
         
         $msg_conex="correcto";

	}catch(PDOException $e) /// un catch por si se encuentra una excepcion
    {
		$msg_conex="incorrecto";
    }
  
    if(!$conexion_db){
		$msg_conex="incorrecto";
		die("Conexion error causa de :".mysqli_conexion_dbect_error());
    }

    if(strcmp($msg_conex,"correcto")==0){

                $stm = $conexion_db->prepare("SELECT rol FROM users WHERE email=:correo"); 
                $stm->bindValue(":correo", $email_usuario);
                $stm->execute();
                $rows = $stm->fetchAll(PDO::FETCH_NUM);
                if($rows>0){
                    if(strcmp($rows[0][0],"admin") == 0){
                       // echo admin aceptado";
                        $stm->closeCursor();
                        $conexion_db = null;
                        return true;
                    }else{
                        //echo "admin no aceptado";
                        $stm->closeCursor();
                        $conexion_db = null;
                        return false;
                    }
                }else{
                    $stm->closeCursor();
                    $conexion_db = null;
                    return false;
                }
                $conexion_db = null;
                return false;


    }else{
        $conexion_db = null;
        return false;
    }

  
}
    

}
    

  
?> 