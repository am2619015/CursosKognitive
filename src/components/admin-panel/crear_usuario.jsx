import React from 'react';
import Base from "../base_loged/base_comun";
import {MDBBtn,MDBInput} from "mdbreact";
import axios from 'axios';

class crear_usuario extends Base {

    
    constructor(props){
        super(props);

           this.state = {
            email_admin: this.decencriptado_valores(this.get_usuarioNombre().split("§")[1]),
            errorMysql:false,
            errorMysql_msg:"",
            email_usuario:"",
            password_usuario:"",
            nombres_usuario:"",
            apellidos_usuario:"",
            telefono_usuario:"",
            loading_create_user:false
           }

           this.handle_creating_user = this.handle_creating_user.bind(this);

    }


    componentDidMount(){
        this.showMsg("Objeto crear usuario cargado");
    }

    componentWillUnmount(){
        
    }

   //// funcion para obtener valores de cualquier input
   get_Inputs_Values = (value, type) =>{
    // this.showMsg("valor de "+value+" = "+type);
     this.setState({
     [type]: value
     });
 }

 validateEmail = (email)  =>{
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


  ////// creando usuario handling
  handle_creating_user = () =>{
            
            
    var email_t = this.state.email_usuario;
    var password_t = this.state.password_usuario;
    var nombres_t = this.state.nombres_usuario;
    var apellidos_t = this.state.apellidos_usuario;
    var telefono_t = this.state.telefono_usuario;
    var email_admin_t = this.state.email_admin;

    this.showMsg("procediendo a crear usuario "+email_t+" "+password_t+" "+nombres_t+" "+apellidos_t+" "+telefono_t);

    this.setState({
        loading_create_user:true
    });

    const thisClass=this;
    
        async function msg_error_inicial(value,titulo,msg) {
            return await Promise.resolve(thisClass.props.error_function(value,titulo,msg));
          };
        async function msg_success_inicial(value,titulo,msg) {
            return await Promise.resolve(thisClass.props.success_function(value,titulo,msg));
          };

        msg_error_inicial(false,"","").then(function(){
            msg_success_inicial(false,"","").then(function(){
                process_resolving();
            });
        });

        function process_resolving(){
            if(thisClass.validateEmail(thisClass.state.email_usuario)){
                if(thisClass.state.password_usuario.trim().length >5){

                    
                    // cambiar por verdadera solicitud ajax axios

                        
                        const user= {
                            email : email_t,
                            password: password_t,
                            nombres: nombres_t,
                            apellidos: apellidos_t,
                            telefono: telefono_t,
                            email_admin: email_admin_t
                        };

                        thisClass.showMsg("a enviar "+user.email);
                
                        axios.post(`${thisClass.get_ip_server()}/apis/admin_panel/admin_creando_user.php`, { user })
                                                            .then(res => {
                                                                    thisClass.showMsg(res);
                                                                    //this.showMsg(res.data);
                                                                    //this.showMsg(res.data.mensaje);
                                                                    //this.showMsg(res.data.codigoHTML);
                                                                    // var cursos = JSON.parse(res.data.mensaje);
                                                                    //this.showMsg("----> cursos");
                                                                    //this.showMsg(cursos);
                                                                    
                                                            
                                                                if(res.data.mensaje==="incorrecto"){
                                                                        thisClass.setState({
                                                                        errorMysql:true,
                                                                        errorMysql_msg:res.data.codigoHTML,
                                                                        loading_create_user:false
                                                                        });

                                                                        thisClass.props.error_function(true,"Error",thisClass.state.errorMysql_msg); 

                                                                    }else if(res.data.mensaje==="correcto"){
                
                                                                        
                                                                        //var datos = JSON.parse(res.data.codigoHTML);
                
                                                                        thisClass.showMsg("datos notas");
                
                                                                        thisClass.setState({
                                                                            errorMysql:false,
                                                                            errorMysql_msg:res.data.codigoHTML,
                                                                            loading_create_user:false,
                                                                            email_usuario:"",
                                                                            password_usuario:"",
                                                                            nombres_usuario:"",
                                                                            apellidos_usuario:"",
                                                                            telefono_usuario:""
                                                                        });

                                                                        thisClass.props.success_function(true,"Usuario Creado","Se a creado al usuario "+thisClass.state.email_usuario+" con exito");
                
                                                                    }
                                                            
                                                            }).catch((error) => {
                                                                    thisClass.showMsg("error de "+error);
                                                                    thisClass.setState({
                                                                        errorMysql:true,
                                                                        errorMysql_msg:"No se pudo contactar con el servidor",
                                                                        loading_create_user:false
                                                                    });

                                                                    thisClass.props.error_function(true,"Error",thisClass.state.errorMysql_msg); 
                                                            }); 

                }else{
                    thisClass.props.error_function(true,"Error formulario","La contraseña tiene que tener al menos 6 caracteres"); 
                    thisClass.setState({
                        loading_create_user:false
                    });
                }
            }else{
                thisClass.props.error_function(true,"Error formulario","Ingrese un email valido para crear al usuario");
                thisClass.setState({
                    loading_create_user:false
                });
            }
        }
    
}

    render = () =>(
        <div className="mt-5">
            <form>
                <div className="grey-text">
                        <MDBInput label="Escriba email del usuario" icon="envelope" group type="email" validate error="wrong"
                            success="right" getValue={value => this.get_Inputs_Values(value, "email_usuario")} value={this.state.email_usuario} className="input_nombre"/>
                        <MDBInput label="Escriba su contraseña" icon="lock" group type="password" validate 
                        getValue={value => this.get_Inputs_Values(value, "password_usuario")} value={this.state.password_usuario} className="input_password mb-0"/>

                        <MDBInput label="Nombres usuario" icon="user" group type="text" validate error="wrong"
                            success="right" getValue={value => this.get_Inputs_Values(value, "nombres_usuario")} value={this.state.nombres_usuario} className="input_nombre"/>
                        <MDBInput label="Apellidos usuario" icon="user" group type="text" validate error="wrong"
                            success="right" getValue={value => this.get_Inputs_Values(value, "apellidos_usuario")} value={this.state.apellidos_usuario} className="input_nombre"/>
                        <MDBInput label="Telefono usuario" icon="phone" group type="number" validate error="wrong"
                            success="right" getValue={value => this.get_Inputs_Values(value, "telefono_usuario")} value={this.state.telefono_usuario} className="input_nombre"/>
                </div>
                <div className="text-center">
                    <MDBBtn type="button" className={this.state.loading_create_user ? "disabled" : ""} onClick={this.handle_creating_user}>Crear Usuario</MDBBtn>
                    {this.state.loading_create_user
                    ?
                        <div className="spinner-grow text-primary align-middle" role="status">
                            <span className="sr-only align-middle">Loading...</span>
                        </div>
                        :
                        <></>
                    }
                </div>
            </form>
        </div>
    )

}

export default crear_usuario;