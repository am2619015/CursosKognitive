<?php

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Disposition, Content-Type, Content-Length, Accept-Encoding");
header("Content-type:application/json");

include "../../apis/config.php";
include "../../apis/cookie_check.php";

	// otro metodo mas simple pero sin registro de quien o como se envia
    /*ini_set( 'display_errors', 1 );
    error_reporting( E_ALL );
    $from = "test@emailsender.com";
    $to = "am085682953@gmail.com";
    $subject = "Checking PHP mail";
    $message = "PHP mail works just fine";
    $headers = "From:" . $from;
    mail($to,$subject,$message, $headers);
    echo "The email message was sent.";*/

    	/* librerias usadas instaladas mediante composer con ssh en el servidor*/
	    use PHPMailer\PHPMailer\PHPMailer;
		require '../vendor/autoload.php';
		
		$data = json_decode(file_get_contents('php://input'), true);
		$cod_acceso = $data['user_login']["cod_acc"]; 
		$email=$data['user_login']["email"];;
		$curso_id=$data['user_login']["curso_id"];
		$taller_id=$data['user_login']["taller_id"];
		$puntucacion=$data['user_login']["puntaje"];

		$post_data_error = "";
		$post_data = "";

		/*if (strcmp($cod_acceso, 'cJQH~!GE{K+QOmDvco/WxcQ1^HO[,^2|>4ve-LObho9SO2J~Alzj[I=Cb?E)6FQ') !== 0) {
			$post_data_error= json_encode(
				array(	'mensaje' => "incorrecto",
						'codigoHTML' => "Error no posee acceso")
	
			);			
	
	
			echo $post_data_error;
			exit;
		}*/

     // solo si estamos en produccion comprobamos si tenemos acceso a realizar en base al tooken cookie seteado desde jsx
     if($modo_produccion){
        if(!cookie_check::Is_Cookie_acces_Correct($email)){
            $dato_respuesta ="cookie_erronea para ".$email;
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
			   PDO::ATTR_EMULATE_PREPARES => false, 
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
		
		$db_cursos="cursos";
	
		//$stm = $conn->prepare("SELECT * FROM users WHERE email=:correo");
		$stm = $conn->prepare("CALL get_info_send_mail_talleres(:id_c,:id_t);"); // funcion mysql con todos los datos
		
		/* 
				retorna la lista de talleres con su nombre descripcion, videos y cuestionario ademas de la nota de un determinado estudiante, si el estudiante no existe retornara los talleres con datos null en nota ya que ese estudiante no existe y no tiene registro ahi, esto no valida si el usuario tiene acceso al curso ya que eso esta en otra clase
				DELIMITER $$
	
				DROP PROCEDURE IF EXISTS `get_info_send_mail_talleres` $$
				CREATE DEFINER=`user_name_test`@`127.0.0.1` PROCEDURE `get_info_send_mail_talleres`(
					IN id_curso_buscar INT,
					IN id_taller_buscar INT
					)
					BEGIN
	
					SELECT RF.nombre,nombre_taller FROM talleres AS T LEFT JOIN(SELECT * FROM cursos AS C WHERE C.id_curso=id_curso_buscar) AS RF ON RF.id_curso = T.id_curso WHERE T.id_taller=id_taller_buscar AND RF.nombre IS NOT NULL;
	
				END $$
	
	 DELIMITER ;
		*/
			$stm->bindValue(":id_c", $curso_id);
			$stm->bindValue(":id_t", $taller_id);
			$stm->execute();
			$rows = $stm->fetchAll(PDO::FETCH_NUM);
	
	
		//// se asume que hay un error de entrada al menos que luego no lo haya 
			 $dato_respuesta= "Usuario no posee cursos";
			 $mensaje_de="incorrecto";
			 
			 $array_respuesta= array();
	
			  /// se procede a recorrer los resultados //
			 if($rows>0){
				$mensaje_de="correcto";
			}
	
			$dato_respuesta = json_encode($rows);
	
			//$conn->close();
			$conn=null;
	



		/* datos post que envio el usuario*/
		$curso_nombre=$rows[0][0];
		$taller_nombre=$rows[0][1];


		/* respuesta del servidor al usuario por medio de mail*/
		$msg_respusta='<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml"><head><meta content="text/html; charset=utf-8" http-equiv="Content-Type"/><meta content="width=device-width" name="viewport"/><meta content="IE=edge" http-equiv="X-UA-Compatible"/><title></title><style type="text/css">body{margin: 0;padding: 0;}table,td,tr{vertical-align: top;border-collapse: collapse;}*{line-height: inherit;}a[x-apple-data-detectors=true]{color: inherit !important;text-decoration: none !important;}</style><style id="media-query" type="text/css">@media (max-width: 670px){.block-grid,.col{min-width: 320px !important;max-width: 100% !important;display: block !important;}.block-grid{width: 100% !important;}.col{width: 100% !important;}.col>div{margin: 0 auto;}img.fullwidth,img.fullwidthOnMobile{max-width: 100% !important;}.no-stack .col{min-width: 0 !important;display: table-cell !important;}.no-stack.two-up .col{width: 50% !important;}.no-stack .col.num4{width: 33% !important;}.no-stack .col.num8{width: 66% !important;}.no-stack .col.num4{width: 33% !important;}.no-stack .col.num3{width: 25% !important;}.no-stack .col.num6{width: 50% !important;}.no-stack .col.num9{width: 75% !important;}.video-block{max-width: none !important;}.mobile_hide{min-height: 0px;max-height: 0px;max-width: 0px;display: none;overflow: hidden;font-size: 0px;}.desktop_hide{display: block !important;max-height: none !important;}}</style></head><body class="clean-body" style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: #3d1554;"><table bgcolor="#3d1554" cellpadding="0" cellspacing="0" class="nl-container" role="presentation" style="table-layout: fixed; vertical-align: top; min-width: 320px; Margin: 0 auto; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #3d1554; width: 100%;" valign="top" width="100%"><tbody><tr style="vertical-align: top;" valign="top"><td style="word-break: break-word; vertical-align: top;" valign="top"><div style="background-color:#57366e;"><div class="block-grid" style="Margin: 0 auto; min-width: 320px; max-width: 650px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"><div class="col num12" style="min-width: 320px; max-width: 650px; display: table-cell; vertical-align: top; width: 650px;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;"><table border="0" cellpadding="0" cellspacing="0" class="divider" role="presentation" style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" valign="top" width="100%"><tbody><tr style="vertical-align: top;" valign="top"><td class="divider_inner" style="word-break: break-word; vertical-align: top; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; padding-left: 10px;" valign="top"><table align="center" border="0" cellpadding="0" cellspacing="0" class="divider_content" height="0" role="presentation" style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-top: 0px solid transparent; height: 0px; width: 100%;" valign="top" width="100%"><tbody><tr style="vertical-align: top;" valign="top"><td height="0" style="word-break: break-word; vertical-align: top; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" valign="top"><span></span></td></tr></tbody></table></td></tr></tbody></table></div></div></div></div></div></div><div style="background-color:#57366e;"><div class="block-grid mixed-two-up" style="Margin: 0 auto; min-width: 320px; max-width: 650px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"><div class="col num3" style="display: table-cell; vertical-align: top; max-width: 320px; min-width: 162px; width: 162px;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:0px; padding-bottom:0px; padding-right: 0px; padding-left: 0px;"><div align="center" class="img-container center autowidth" style="padding-right: 0px;padding-left: 0px;"><a href="https://kognitivecapsa.com/" style="outline:none" tabindex="-1" target="_blank"> <img align="center" alt="Logo" border="0" class="center autowidth" src="https://kognitivecapsa.com/logos/name_logov2.svg" style="text-decoration: none; -ms-interpolation-mode: bicubic; height: auto; border: 0; width: 100%; max-width: 162px; display: block;" title="Logo" width="162"/></a></div></div></div></div><div class="col num9" style="display: table-cell; vertical-align: top; min-width: 320px; max-width: 486px; width: 487px;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:15px; padding-bottom:10px; padding-right: 0px; padding-left: 0px;"><div style="color:#ffffff;font-family:Poppins, Arial, Helvetica, sans-serif;line-height:1.2;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;"><div style="line-height: 1.2; font-size: 12px; color: #ffffff; font-family: Poppins, Arial, Helvetica, sans-serif; mso-line-height-alt: 14px;"><p style="font-size: 16px; line-height: 1.2; word-break: break-word; text-align: center; mso-line-height-alt: 19px; margin: 0;"><span style="font-size: 16px;"><a href="https://kognitivecapsa.com/" rel="noopener" style="text-decoration: none; color: #ffffff;" target="_blank">INICIO</a>    <a href="https://kognitivecapsa.com/acerca_nosotros/" rel="noopener" style="text-decoration: none; color: #ffffff;" target="_blank">CONOCENOS</a>     <a href="https://cursos.kognitivecapsa.com" rel="noopener" style="text-decoration: none; color: #ffffff;" target="_blank">CURSOS</a></span></p></div></div></div></div></div></div></div></div><div style="background-color:#57366e;"><div class="block-grid" style="Margin: 0 auto; min-width: 320px; max-width: 650px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"><div class="col num12" style="min-width: 320px; max-width: 650px; display: table-cell; vertical-align: top; width: 650px;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;"><table border="0" cellpadding="0" cellspacing="0" class="divider" role="presentation" style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" valign="top" width="100%"><tbody><tr style="vertical-align: top;" valign="top"><td class="divider_inner" style="word-break: break-word; vertical-align: top; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; padding-left: 10px;" valign="top"><table align="center" border="0" cellpadding="0" cellspacing="0" class="divider_content" height="0" role="presentation" style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-top: 0px solid transparent; height: 0px; width: 100%;" valign="top" width="100%"><tbody><tr style="vertical-align: top;" valign="top"><td height="0" style="word-break: break-word; vertical-align: top; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" valign="top"><span></span></td></tr></tbody></table></td></tr></tbody></table></div></div></div></div></div></div><div style="background-color:transparent;"><div class="block-grid" style="Margin: 0 auto; min-width: 320px; max-width: 650px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"><div class="col num12" style="min-width: 320px; max-width: 650px; display: table-cell; vertical-align: top; width: 650px;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:35px; padding-bottom:0px; padding-right: 0px; padding-left: 0px;"><div align="center" class="img-container center autowidth" style="padding-right: 0px;padding-left: 0px;"><img align="center" border="0" class="center autowidth" src="https://cursos.kognitivecapsa.com/mail_images/content-top_2.png" style="text-decoration: none; -ms-interpolation-mode: bicubic; height: auto; border: 0; width: 100%; max-width: 650px; display: block;" width="650"/></div></div></div></div></div></div></div><div style="background-color:transparent;"><div class="block-grid" style="Margin: 0 auto; min-width: 320px; max-width: 650px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"><div class="col num12" style="min-width: 320px; max-width: 650px; display: table-cell; vertical-align: top; width: 642px;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:4px solid #57366E; border-bottom:0px solid transparent; border-right:4px solid #57366E; padding-top:55px; padding-bottom:60px; padding-right: 0px; padding-left: 0px;"><div style="color:#fbd711;font-family:Poppins, Arial, Helvetica, sans-serif;line-height:1.2;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;"><div style="line-height: 1.2; font-size: 12px; color: #fbd711; font-family: Poppins, Arial, Helvetica, sans-serif; mso-line-height-alt: 14px;"><p style="font-size: 14px; line-height: 1.2; word-break: break-word; text-align: center; mso-line-height-alt: 17px; margin: 0;"><strong><span style="font-size: 30px;">Hola '.$email.'</span></strong></p></div></div><div style="color:#ffffff;font-family:Poppins, Arial, Helvetica, sans-serif;line-height:1.2;padding-top:10px;padding-right:50px;padding-bottom:10px;padding-left:50px;"><div style="line-height: 1.2; font-size: 12px; color: #ffffff; font-family: Poppins, Arial, Helvetica, sans-serif; mso-line-height-alt: 14px;"><p style="font-size: 28px; line-height: 1.2; word-break: break-word; text-align: center; mso-line-height-alt: 34px; margin: 0;"><span style="font-size: 28px;">Felicidades completaste el "'.$taller_nombre.'" del curso "'.$curso_nombre.'"</span></p></div></div><div style="color:#ffffff;font-family:Poppins, Arial, Helvetica, sans-serif;line-height:1.5;padding-top:10px;padding-right:30px;padding-bottom:25px;padding-left:30px;"><div style="line-height: 1.5; font-size: 12px; color: #ffffff; font-family: Poppins, Arial, Helvetica, sans-serif; mso-line-height-alt: 18px;"><p style="font-size: 14px; line-height: 1.5; word-break: break-word; text-align: center; mso-line-height-alt: 21px; margin: 0;"><em><span style="font-size: 14px;">Obtuviste una puntuación de '.$puntucacion.'/20, recuerda que puedes repetir los primeros talleres de un cuestionario, las veces necesarias, hasta que tengas los conocimientos y la puntuación deseada, sin embargo el ultimo taller de cada curso tendrá un numero limitado de repeticiones.</span></em></p></div></div><div align="center" class="button-container" style="padding-top:12px;padding-right:10px;padding-bottom:12px;padding-left:10px;"><a href="https://cursos.kognitivecapsa.com" style="-webkit-text-size-adjust: none; text-decoration: none; display: inline-block; color: #000000; background-color: #fbd711; border-radius: 30px; -webkit-border-radius: 30px; -moz-border-radius: 30px; width: auto; width: auto; border-top: 1px solid #fbd711; border-right: 1px solid #fbd711; border-bottom: 1px solid #fbd711; border-left: 1px solid #fbd711; padding-top: 10px; padding-bottom: 10px; font-family: Poppins, Arial, Helvetica, sans-serif; text-align: center; mso-border-alt: none; word-break: keep-all;" target="_blank"><span style="padding-left:45px;padding-right:45px;font-size:18px;display:inline-block;"><span style="font-size: 16px; line-height: 2; word-break: break-word; mso-line-height-alt: 32px;"><span data-mce-style="font-size: 18px; line-height: 36px;" style="font-size: 18px; line-height: 36px;"><strong>REINTENTAR</strong></span></span></span></a></div></div></div></div></div></div></div><div style="background-color:transparent;"><div class="block-grid" style="Margin: 0 auto; min-width: 320px; max-width: 650px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: #57366e;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:#57366e;"><div class="col num12" style="min-width: 320px; max-width: 650px; display: table-cell; vertical-align: top; width: 650px;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:55px; padding-bottom:55px; padding-right: 30px; padding-left: 30px;"><div style="color:#ffffff;font-family:Poppins, Arial, Helvetica, sans-serif;line-height:1.5;padding-top:10px;padding-right:25px;padding-bottom:20px;padding-left:25px;"><div style="line-height: 1.5; font-size: 12px; color: #ffffff; font-family: Poppins, Arial, Helvetica, sans-serif; mso-line-height-alt: 18px;"><p style="font-size: 14px; line-height: 1.5; word-break: break-word; text-align: center; mso-line-height-alt: 21px; margin: 0;">Recuerda "El gran descubrimiento de mi generación es que los seres humanos pueden alterar sus vidas al alterar actitules mentales" (William James).</p></div></div><div style="color:#ffffff;font-family:Poppins, Arial, Helvetica, sans-serif;line-height:1.5;padding-top:20px;padding-right:25px;padding-bottom:10px;padding-left:25px;"><div style="line-height: 1.5; font-size: 12px; color: #ffffff; font-family: Poppins, Arial, Helvetica, sans-serif; mso-line-height-alt: 18px;"><p style="font-size: 16px; line-height: 1.5; word-break: break-word; text-align: center; mso-line-height-alt: 24px; margin: 0;"><span style="font-size: 16px;">Si tienes alguna pregunta por favor contacta con <a href="mailto:kognitivecapsa@gmail.com?subject=Información acerca de los cursos" style="text-decoration: underline; color: #ffffff;" title="kognitivecapsa@gmail.com">nosotros.</a></span></p></div></div></div></div></div></div></div></div><div style="background-color:transparent;"><div class="block-grid" style="Margin: 0 auto; min-width: 320px; max-width: 650px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"><div class="col num12" style="min-width: 320px; max-width: 650px; display: table-cell; vertical-align: top; width: 650px;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:0px; padding-bottom:0px; padding-right: 0px; padding-left: 0px;"><div align="center" class="img-container center autowidth" style="padding-right: 0px;padding-left: 0px;"><img align="center" border="0" class="center autowidth" src="https://cursos.kognitivecapsa.com/mail_images/content-bottom_1.png" style="text-decoration: none; -ms-interpolation-mode: bicubic; height: auto; border: 0; width: 100%; max-width: 650px; display: block;" width="650"/></div><div style="color:#b0a7b7;font-family:Poppins, Arial, Helvetica, sans-serif;line-height:1.5;padding-top:15px;padding-right:10px;padding-bottom:20px;padding-left:10px;"><div style="line-height: 1.5; font-size: 12px; color: #b0a7b7; font-family: Poppins, Arial, Helvetica, sans-serif; mso-line-height-alt: 18px;"><p style="font-size: 12px; line-height: 1.5; word-break: break-word; text-align: center; mso-line-height-alt: 18px; margin: 0;"><span style="font-size: 12px;">Asunción Oe1-28 y 10 de Agosto en Edificio Molina Ofc. 104, Quito Ecuador</span></p><p style="font-size: 12px; line-height: 1.5; word-break: break-word; text-align: center; mso-line-height-alt: 18px; margin: 0;"><span style="font-size: 12px;">© Copyright 2020 kognitivecapsa.com</span></p></div></div></div></div></div></div></div></div></td></tr></tbody></table></body></html>';
		
	
					/* correo que le llega el interesado por haber llenado el formulario de contacto*/
				    $mail = new PHPMailer;
						$mail->isSMTP();
						$mail->SMTPDebug = false;
						$mail->Host = 'smtp.hostinger.es';
						$mail->SMTPSecure = 'tls';
						$mail->Port = 587;
						$mail->SMTPAuth = true;
						$mail->Username = 'test@emailsender.com';
						$mail->Password = 'passwod_emailsender';
						$mail->CharSet = 'UTF-8';
						$mail->setFrom('test@emailsender.com', 'Kognitive Cursos');
						$mail->addAddress($email, $nombre);
						if ($mail->addReplyTo($email, $nombre)) {

						/*$mail->addCustomHeader('Reply-To: Kognitive <test@emailsender.com>\r\n');
						$mail->addCustomHeader('Return-Path: Kognitive <test@emailsender.com>\r\n');
						//$mail->addCustomHeader('From: The Sender <test@emailsender.com>\r\n');
						$mail->addCustomHeader('Organization: Kognitive\r\n');
						$mail->addCustomHeader('MIME-Version: 1.0\r\n');
						$mail->addCustomHeader('Content-type: text/plain; charset=iso-8859-1\r\n');*/

						/*$mail->Subject = 'Contactos';
						        $mail->isHTML(false);
						        $mail->Body = <<<EOT
						mail: {$email}
						Nombre: {$nombre}
						Mensaje: {$msg}
						EOT;*/
						$mail->Subject = 'Calificacion';	
						$mail->isHTML(true);
						$mail->Body=$msg_respusta;
						if (!$mail->send()) {
							$mensaje_de = "incorrecto";
						    $dato_respuesta = 'Mailer Error: ' . $mail->ErrorInfo;
						} else {
							$mensaje_de = "correcto";
						    $dato_respuesta= 'Se le envio un mensaje a su correo: '.$email.' notificando su nota del Taller.';
						}
					}
					else{
						$mensaje_de = "incorrecto";
						$dato_respuesta= 'Error : el mail proporsionado no es correcto porfavor contacte con el administrador.';
					}

	$post_data= json_encode(
		array(	'mensaje' => $mensaje_de,
			 'codigoHTML' => $dato_respuesta)
			
	);	

				    
	echo $post_data;



    ?>
