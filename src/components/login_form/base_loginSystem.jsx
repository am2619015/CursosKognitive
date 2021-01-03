import React from "react";
import {getSessionCookie_session,getSessionCookie_role} from "../cookies";
import * as myConstClass from '../constant_class';

const session = getSessionCookie_session();
const rol =  getSessionCookie_role();
const ip_servidor = myConstClass.IP_SERVIDOR_PETICIONES_PHP;
var show_debuger = true;

class baseSystemLogin extends React.Component {

usuario_Logeado = () =>{
  //console.log("logeado de "+session.userName);
 // setTimeout(() => {
    if(session.userName === undefined){
      return false;
    }else{
      //alert(session.userName.split("§")[0].length);
      if(session.userName && session.userName.split("§")[0].length === 18){
        return true;
      }else{
        return false;
      }
    }
 // }, 1000);
  
}

return_codAcc = () =>{
  if(session.userName === undefined){
    return "null";
  }else{
    if(session.userName && session.userName.length === 18){
      return session.userName.split("§")[0];
    }else{
      return "null";
    }
  }
}

get_usuarioNombre = () =>{
  return session.userName;
}

role_Logeado = () =>{
  //console.log("logeado con rol de  "+rol.role);
  if(rol.role === undefined){
    return "undefined error db structure";
  }else{
    return rol.role;
  }
}

showMsg = (msg) =>{
  if(show_debuger){
    console.log(msg);
  }
}

get_ip_server = () =>{
  return ip_servidor;
}

encripto_valores(valores_encriptar){
  var crypto = require('crypto');
  var key = 'proyecto2021_leop';
  var iv = '1234567890123456';
  var cipher = crypto.createCipheriv('aes-128-cbc', key, iv);

  var encrypted = cipher.update(valores_encriptar, 'utf8', 'binary');
  encrypted += cipher.final('binary');
  var hexVal = new Buffer(encrypted, 'binary');
  var newEncrypted = hexVal.toString('hex');
  
  return newEncrypted;
}

decencriptado_valores(valor_decencriptar){
  var crypto = require('crypto');
var key = 'proyecto2021_leop';
var iv = '1234567890123456';
var decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);

var decrypted = decipher.update(valor_decencriptar, 'hex', 'binary');
decrypted += decipher.final('binary');

return decrypted;
}

}

export default baseSystemLogin;