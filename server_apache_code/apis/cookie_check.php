<?php 

//cookie_check::Is_Cookie_acces_Correct("hack2619015@hotmail.com"); // ejemplo de uso

class cookie_check {
// cuidado con usar echo en la funcion
public static function Is_Cookie_acces_Correct($email_usuario){

    include "config.php";
    
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
            if(isset($_COOKIE["session"])){ 
                $cookie_exampleData = stripslashes($_COOKIE['session']);
                $cookie_decode = json_decode($cookie_exampleData, true);
                //echo "Auction Item is a  " . $cookie_decode["userName"]; 
                $cookie_final = explode("§", $cookie_decode["userName"]);

                $stm = $conexion_db->prepare("SELECT tkn_accs FROM users WHERE email=:correo"); 
                $stm->bindValue(":correo", $email_usuario);
                $stm->execute();
                $rows = $stm->fetchAll(PDO::FETCH_NUM);
                if($rows>0){
                    //echo "comprobando si la cookie ".$cookie_final[0]." se compara con ".$rows[0][0];
                    if(strcmp($rows[0][0],$cookie_final[0]) == 0){
                       // echo "cookie aceptada";
                        $stm->closeCursor();
                        $conexion_db = null;
                        return true;
                    }else{
                        //echo "cookie no aceptada";
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
                //echo "No posee acceso"; 
                $conexion_db = null;
                return false;
            }
    }else{
        $conexion_db = null;
        return false;
    }

    

    
}
    

}
    

  
?> 