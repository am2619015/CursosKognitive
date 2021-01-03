import React from "react";
import {Helmet} from 'react-helmet';
import {MDBNotification,MDBContainer, MDBRow, MDBCol, MDBInput, MDBBtn, MDBCard, MDBCardBody, MDBAlert} from 'mdbreact';
import Base from "../base_loged/base_comun";
import history from '../history';
import Header from "../header/header";
import Footer from "../footer/footer";
import "./restore_pass.css";
import axios from 'axios';

class Restore_pass extends Base {

      constructor(props){
        super(props);

        if(this.usuario_Logeado()){ // aqui funciona al revez solo si esta logeado no puedo entrar aqui
            history.push("/");
            history.go("/");
           }

        const { match: { params } } = this.props;

        this.state = {
            errorMysql:false,
            errorMysql_msg:"",
            loading: false,
            errorForm:false,
            error_msg:"",
            titulo_notify:"",
            msg_final_send:false,
            password1:"",
            password2:"",
            token_key: params.token_key
        }

        this.set_error_notify = this.set_error_notify.bind(this);
        this.handle_restore_password = this.handle_restore_password.bind(this);

      }

      componentDidMount() {
        this.showMsg("Cargando Restore password para el token "+this.state.token_key);
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


    //// se encarga de escribir el valor de un input en un estado
    getLoginData = (value, type) =>{
        // this.showMsg("valor de "+value+" = "+type);
         this.setState({
         [type]: value
         });

     }


     handle_restore_password = () =>{

        this.set_error_notify(false,"","");
        var pass1=this.state.password1;
        var pass2=this.state.password2;
        var token=this.state.token_key;
        var claseObj=this;

        setTimeout(function(){
            console.log("clickeando restaurar con "+pass1+" y "+pass2);
                if(pass1.localeCompare(pass2)===0){

                    if(pass1.length>5){
                        console.log("procedo con peticion axios");

                        claseObj.setState({
                            loading:true
                        });

                        const user= {
                            password: pass1,
                            token_key: token
                        };

                        axios.post(`${claseObj.get_ip_server()}/apis/action_restore_password.php`, { user })
                                            .then(res => {
                                                claseObj.showMsg(res);
                                                claseObj.showMsg(res.data);
                                                    //this.showMsg(res.data.mensaje);
                                                    //this.showMsg(res.data.codigoHTML);
                                                    // var cursos = JSON.parse(res.data.mensaje);
                                                    //this.showMsg("----> cursos");
                                                    //this.showMsg(cursos);
                                                    
                                            
                                                   if(res.data.mensaje==="incorrecto"){
                                                    claseObj.setState({
                                                        errorMysql:true,
                                                        errorMysql_msg:res.data.codigoHTML,
                                                        loading:false
                                                        });

                                                        claseObj.set_error_notify(true,res.data.codigoHTML,"Error");

                                                        if(res.data.codigoHTML.includes("Usuario con ese token no existe")){
                                                            history.push("/");
                                                            history.go("/");
                                                        }

                                                    }else if(res.data.mensaje==="correcto"){


                                                        claseObj.setState({
                                                            errorMysql:false,
                                                            errorMysql_msg:res.data.codigoHTML,
                                                            loading:false,
                                                            msg_final_send:true
                                                        });

                                                        console.log("correcto = "+res.data.codigoHTML);
                                                        claseObj.set_error_notify(false,"","");
                                                        

                                                    }
                                            
                                            }).catch((error) => {
                                                claseObj.showMsg("error de "+error);
                                                claseObj.setState({
                                                        errorMysql:true,
                                                        errorMysql_msg:"No se pudo contactar con el servidor",
                                                        loading:false
                                                    });

                                                    claseObj.set_error_notify(true,"No se pudo contactar con el servidor","Error");
                                            });


                            
                        

                    }else{
                        claseObj.set_error_notify(true,"Las contraseña debe tener mas de 5 caracteres","Error");
                    }
                }else{
                    claseObj.set_error_notify(true,"Las contraseñas ingresadas no coinciden entre si","Error");
                }
        },600); 
     }



render() {
    return (
        <>
            <Helmet>
                            <meta charSet="utf-8" />
                            <title>Restaurando Contraseña</title>
                            <link rel="canonical" href="https://cursos.kognitivecapsa.com" />
                            <meta name="description" content="Olvido su contraseña" />
            </Helmet>
            <Header/>

                    <main>
                        <MDBContainer className="contenedor_formulario my-5">
                            <MDBRow>
                                <MDBCol md="7" className="mx-auto">
                                    <MDBCard>
                                        <MDBCardBody>
                                            <form className="formulario_restaurar">
                                                <h1 className="h5 text-center mb-4 titulo_form">Reestablecer contraseña</h1>
                                                <div className="grey-text">
                                                    {!this.state.msg_final_send ?
                                                        <>
                                                            <MDBInput label="Nueva contraseña" icon="lock" group id="pass1" type="password" validate error="wrong"
                                                            getValue={value => this.getLoginData(value, "password1")}  success="right"  className="input_pass1 mb-0">
                                                            </MDBInput>
                                                            <p className="estilo_min_characters">6 caracteres minimo, distingue mayúsculas de minusculas</p>
                                                            
                                                            <MDBInput label="Vuelva a escribir la contraseña" icon="lock" group id="pass2" type="password" validate error="wrong"
                                                            getValue={value => this.getLoginData(value, "password2")}  success="right"  className="input_pass2"/>
                                                        </>
                                                    :
                                                    <></>
                                                    }
                                                </div>
                                                <div className="text-center">
                                                    {!this.state.msg_final_send ?   
                                                        <MDBBtn type="button" className={this.state.loading ? "disabled" : ""} onClick={this.handle_restore_password}>Confirmar</MDBBtn>
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
                                                            Se completo el proceso y se a <span className="alert-link">reestablecido la contraseña</span> correctamente.
                                                            <br></br><br></br>Inicie Sessión para continuar<br></br><br></br>
                                                            <MDBBtn type="button" className="success" href="/">Inicia Session</MDBBtn>
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

export default Restore_pass;