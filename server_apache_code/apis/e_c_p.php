<?php
	define('METHOD','AES-256-CBC');
	define('SECRET_KEY','$Kognitive@2019_wGkQJw97u1wXyynqhhoP4x355ZRGnJKQ');
	define('SECRET_IV','0856829531722713870');
	class en_c_psw {
		public static function encryption($string){
			$output=FALSE;
			$key=hash('sha256', SECRET_KEY);
			$iv=substr(hash('sha256', SECRET_IV), 0, 16);
			$output=openssl_encrypt($string, METHOD, $key, 0, $iv);
			$output=base64_encode($output);
			return $output;
		}
		public static function decryption($string){
			$key=hash('sha256', SECRET_KEY);
			$iv=substr(hash('sha256', SECRET_IV), 0, 16);
			$output=openssl_decrypt(base64_decode($string), METHOD, $key, 0, $iv);
			return $output;
		}
	}