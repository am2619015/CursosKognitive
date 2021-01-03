import React from "react";
import {Helmet} from 'react-helmet';
import {MDBNotification,MDBContainer, MDBRow, MDBCol, MDBInput, MDBBtn, MDBCard, MDBCardBody, MDBAlert} from 'mdbreact';
import Base from "../base_loged/base_comun";
import history from '../history';
import Header from "../header/header";
import Footer from "../footer/footer";
import "./olv_pass.css";
import axios from 'axios';

class Olv_pass extends Base {

      constructor(props){
        super(props);

        if(this.usuario_Logeado()){ // aqui funciona al revez solo si esta logeado no puedo entrar aqui
            history.push("/");
            history.go("/");
           }

        this.state = {
            errorMysql:false,
            errorMysql_msg:"",
            loading: false,
            errorForm:false,
            error_msg:"",
            email:"",
            titulo_notify:"",
            msg_final_send:false
        }

        this.set_error_notify = this.set_error_notify.bind(this);

      }

      componentDidMount() {
        this.showMsg("Cargando olvide password");
      }

      componentWillUnmount(){
      }

      set_error_notify = (activate,value,titulo) =>{
        this.setState({
            errorForm:activate,
            error_msg:value,
            titulo_notify:titulo
        });
      }

    validateEmail = (email)  =>{
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    //// se encarga de escribir el valor de un input en un estado
    getLoginData = (value, type) =>{
        // this.showMsg("valor de "+value+" = "+type);
         this.setState({
         [type]: value
         });

     }


    handle_restaurePassword = () =>{
        this.set_error_notify(false,"","");
        this.setState({
            msg_final_send:false
        })

        setTimeout(() => {
            if(this.validateEmail(this.state.email)){
                this.showMsg("Preparando para comprobar si existe usuario con email de "+this.state.email);
                this.setState({
                    loading:true
                });


                const user= {
                    email : this.state.email
                };
        
                axios.post(`${this.get_ip_server()}/apis/check_user_existe_not_cookie.php`, { user })
                                                    .then(res => {
                                                            //this.showMsg(res);
                                                            //this.showMsg(res.data);
                                                            //this.showMsg(res.data.mensaje);
                                                            //this.showMsg(res.data.codigoHTML);
                                                            // var cursos = JSON.parse(res.data.mensaje);
                                                            //this.showMsg("----> cursos");
                                                            //this.showMsg(cursos);
                                                            
                                                    
                                                           if(res.data.mensaje==="incorrecto"){
                                                                this.setState({
                                                                errorMysql:true,
                                                                errorMysql_msg:res.data.codigoHTML,
                                                                loading:false
                                                                });

                                                                this.set_error_notify(true,res.data.codigoHTML,"Error");

                                                            }else if(res.data.mensaje==="correcto"){
        
                                                                
                                                                var existe_usuario = JSON.parse(res.data.codigoHTML);
        
                                                                this.showMsg("existe el usuario =  "+existe_usuario[0][0]);
                                                                
                                                                if(existe_usuario[0][0] === "true"){

                                                                    this.setState({
                                                                        errorMysql:false,
                                                                        errorMysql_msg:res.data.codigoHTML,
                                                                        loading:true,
                                                                        msg_final_send:false
                                                                    });
            
                                                                    this.set_error_notify(false,"","");
                                                                    this.handle_sending_restore_link_email(user);
                                                                    

                                                                }else{
                                                                    this.setState({
                                                                        errorMysql:false,
                                                                        errorMysql_msg:res.data.codigoHTML,
                                                                        loading:false,
                                                                        msg_final_send:false
                                                                    });
            
                                                                    this.set_error_notify(true,"El correo ingresado no existe en nuestro sistema","Error");
                                                                }
                                                                
        
                                                            }
                                                    
                                                    }).catch((error) => {
                                                            this.showMsg("error de "+error);
                                                            this.setState({
                                                                errorMysql:true,
                                                                errorMysql_msg:"No se pudo contactar con el servidor",
                                                                loading:false
                                                            });

                                                            this.set_error_notify(true,"No se pudo contactar con el servidor","Error");
                                                    });



            }else{
                this.set_error_notify(true,"El correo ingresado no es un email valido","Error");
            } 
        }, 600);
        
        
    }

    
    handle_sending_restore_link_email = (user) =>{
        
        axios.post(`${this.get_ip_server()}/apis/sending_restore_mail_link.php`, { user })
                                            .then(res => {
                                                    this.showMsg(res);
                                                    //this.showMsg(res.data);
                                                    //this.showMsg(res.data.mensaje);
                                                    //this.showMsg(res.data.codigoHTML);
                                                    // var cursos = JSON.parse(res.data.mensaje);
                                                    //this.showMsg("----> cursos");
                                                    //this.showMsg(cursos);
                                                    
                                            
                                                   if(res.data.mensaje==="incorrecto"){
                                                        this.setState({
                                                        errorMysql:true,
                                                        errorMysql_msg:res.data.codigoHTML,
                                                        loading:false
                                                        });

                                                        this.set_error_notify(true,res.data.codigoHTML,"Error");

                                                    }else if(res.data.mensaje==="correcto"){


                                                        this.setState({
                                                            errorMysql:false,
                                                            errorMysql_msg:res.data.codigoHTML,
                                                            loading:false,
                                                            msg_final_send:true
                                                        });

                                                        console.log("correcto email se a enviado");
                                                        this.set_error_notify(false,"","");
                                                        

                                                    }
                                            
                                            }).catch((error) => {
                                                    this.showMsg("error de "+error);
                                                    this.setState({
                                                        errorMysql:true,
                                                        errorMysql_msg:"No se pudo contactar con el servidor",
                                                        loading:false
                                                    });

                                                    this.set_error_notify(true,"No se pudo contactar con el servidor","Error");
                                            });
    }

render() {
    return (
        <>
            <Helmet>
                            <meta charSet="utf-8" />
                            <title>Olvido Contraseña</title>
                            <link rel="canonical" href="https://cursos.kognitivecapsa.com" />
                            <meta name="description" content="Olvido su contraseña" />
            </Helmet>
            <Header/>

                    <main>
                        <MDBContainer className="contenedor_formulario my-5">
                            <MDBRow>
                                <MDBCol md="6" className="mx-auto">
                                    <MDBCard>
                                        <MDBCardBody>
                                            <form>
                                                <h1 className="h5 text-center mb-5 titulo_form">Restaurar la contraseña</h1>
                                                <div className="grey-text">
                                                    {!this.state.msg_final_send ?
                                                        <MDBInput label="Escriba el email de su cuenta" icon="envelope" group id="email" type="email" validate error="wrong"
                                                        getValue={value => this.getLoginData(value, "email")}  success="right"  className="input_nombre"/>
                                                    :
                                                    <></>
                                                    }
                                                </div>
                                                <div className="text-center">
                                                    {!this.state.msg_final_send ?   
                                                        <MDBBtn type="button" className={this.state.loading ? "disabled" : ""} onClick={this.handle_restaurePassword} >Restaurar</MDBBtn>
                                                        :
                                                        <></>
                                                    }
                                                    {this.state.loading
                                                    ?
                                                    <div className="spinner-grow text-primary align-middle" role="status">
                                                        <span className="sr-only align-middle">Loading...</span>
                                                    </div>
                                                    :
                                                    <div></div>
                                                    }

                                                    {this.state.msg_final_send ?
                                                        <MDBAlert color="success" className="mt-3 mensaje_enviado">
                                                            Se le a enviado un email a su <span className="alert-link">correo electronico</span> con una URL para restablecer su contraseña.
                                                            <br></br><br></br>Tiene una validez de 24 horas<br></br><br></br>
                                                            No olvide mirar su correo no deseado si no encuentra el email.
                                                        </MDBAlert>
                                                    :
                                                        <></>
                                                    }
                                                </div>
                                            </form>
                                        </MDBCardBody>
                                    </MDBCard>
                                </MDBCol>
                            </MDBRow>
                            {this.state.errorForm?
                            <MDBNotification
                                show
                                fade
                                iconClassName="text-primary"
                                className="notificacion_respuesta_formulario align-middle"
                                title={this.state.titulo_notify}
                                message={this.state.error_msg}
                                text="Ahora mismo"
                                closeClassName="boton_cerrando_error"
                            />
                            :
                            <div></div>
                            }
                        </MDBContainer>
                        </main>
            <Footer />
        </>
);
}
}

export default Olv_pass;