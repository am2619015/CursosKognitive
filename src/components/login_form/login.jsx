import React from "react";
import {MDBNotification,MDBContainer, MDBRow, MDBCol, MDBInput, MDBBtn, MDBCard, MDBCardBody,MDBModal, MDBModalBody, MDBModalHeader, MDBModalFooter } from 'mdbreact';
import BaseSystemLogin from "./base_loginSystem";
import history from '../history';
import {setSessionCookie_session,setSessionCookie_role} from "../cookies";
import axios from 'axios';
import "./formulario_estilos.css";

class LoginForm extends BaseSystemLogin {

      constructor(props){
        super(props);
        this.state = {
            userName: "",
            password: "",
            loading: false,
            classObject:this,
            errorForm:false,
            error_msg:"",
            modal13: false,
            aceptado_condiciones:false
        }

        this.onFormSubmit = this.onFormSubmit.bind(this);
        this.setLoading = this.setLoading.bind(this);
        this.handleTerminos = this.handleTerminos.bind(this);
      }

      componentDidMount() {
          if(this.usuario_Logeado()){
            if(this.role_Logeado().localeCompare("admin") !==0){
              history.push("/cursos");
              history.go("/cursos");
            }else{
              history.push("/admin_panel");
              history.go("/admin_panel");
            }
          }
      }

      getLoginData = (value, type) =>{
       // this.showMsg("valor de "+value+" = "+type);
        this.setState({
        [type]: value
        });
    }

    validateEmail = (email)  =>{
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }


  toggle = nr => () => {
    let modalNumber = 'modal' + nr
    this.setState({
      [modalNumber]: !this.state[modalNumber]
    });
  }

  onFormSubmit = e => {
    e.preventDefault();

    this.setState({
      errorForm:false,
      error_msg: ""
    });

    //    this.showMsg("tratando de ingresar con "+this.state.userName+" - "+this.state.password);

    setTimeout(() => {
            var userName = this.state.userName;
              var pass = this.state.password;
              var terminos_aceptados = this.state.aceptado_condiciones;

                if(userName === "" || pass === "" || pass.length < 5 || !this.validateEmail(userName)){

                  this.setState({
                    errorForm:true,
                    error_msg:"Por favor ingrese un usuario o contraseña validos"
                  });        

                  this.showMsg("entrando en error form");
                }else{
                    if(!terminos_aceptados){
                      this.setState({
                        errorForm:true,
                        error_msg:"Debe aceptar los terminos y condiciones para usar el sistema"
                      });    
                    }else{
                        this.setState({
                          errorForm:false,
                          error_msg:""
                        });
                        this.setLoading(true);
                        this.respuesta_api_php_Login(userName,pass);
                    }
                }

          }, 500);
    
    

  };

  setLoading = (valor) =>{
      //this.showMsg("loading = "+valor);
      this.setState({ loading: valor});
  }




  respuesta_api_php_Login =(nombre,password)=>{

    const user_login = {
      name: nombre,
      pass: password
    };

    axios.post(`${this.get_ip_server()}/apis/login_cursos.php`, { user_login })
      .then(res => {
        //this.showMsg(res);
       // this.showMsg(res.data);
       // this.showMsg(res.data.mensaje);

        if(res.data.mensaje==="incorrecto"){
          this.setState({
            errorForm:true,
            error_msg:res.data.codigoHTML
          });
        }else if(res.data.mensaje==="correcto"){
          this.setState({
            errorForm:false,
            error_msg:""
          });
          var userName = res.data.codigoHTML.split("╚")[0];
          var role = res.data.codigoHTML.split("╚")[1];
          userName = userName.split("§")[0]+"§"+this.encripto_valores(userName.split("§")[1]);
         
          setSessionCookie_session({ userName });
          setSessionCookie_role({ role });
          
          if(role.localeCompare("admin")===0){
            history.push("/admin_panel");
            history.go("/admin_panel");
          }else{
            history.push("/cursos");
            history.go("/cursos");
          }
          
        }

        this.setLoading(false);

      }).catch((error) => {
        this.showMsg("error de "+error);
        this.setState({
          errorForm:true,
          error_msg:"No se pudo contactar con el servidor"
        });
        this.setLoading(false);
      });
      
  }

  handleTerminos = () =>{
    this.showMsg("clickeando terminos");
    this.setState({
      aceptado_condiciones:this.state.aceptado_condiciones?false:true
    })
  }


  handle_forgotPass = () =>{
    window.open("/reset-password","_self")
  }


render() {
    return (
      <main>
          <MDBContainer className="contenedor_formulario my-5">
            <MDBRow>
                <MDBCol md="6" className="mx-auto">
                    <MDBCard>
                        <MDBCardBody>
                            <form>
                                <h1 className="h5 text-center mb-4 titulo_form">Ingresar</h1>
                                <div className="grey-text">
                                    <MDBInput label="Escriba su email" icon="envelope" group type="email" id="email" validate error="wrong"
                                        success="right" getValue={value => this.getLoginData(value, "userName")} className="input_nombre"/>
                                    <MDBInput label="Escriba su contraseña" icon="lock" group type="password" id="password" validate 
                                    getValue={value => this.getLoginData(value, "password")} className="input_password mb-1">
                                    <div className="text-right olvido_password_link mb-4" onClick={this.handle_forgotPass}>¿Olvido su Contraseña?</div>
                                    </MDBInput>
                                    
                                    <div className="custom-control custom-checkbox text-center condiciones">
                                      <input type="checkbox" className="custom-control-input" id="defaultUnchecked" onClick={this.handleTerminos}/>
                                      <label className="custom-control-label" htmlFor="defaultUnchecked">Acepto los terminos y condiciones</label>
                                      <span className="t_c" onClick={this.toggle(13)}>leer</span>
                                    </div>
                                    

                                </div>
                                <div className="text-center">
                                  <MDBBtn type="button" className={this.state.loading ? "disabled" : ""} onClick={this.onFormSubmit}>Entrar</MDBBtn>
                                  {this.state.loading
                                  ?
                                  <div className="spinner-grow text-primary align-middle" role="status">
                                    <span className="sr-only align-middle">Loading...</span>
                                  </div>
                                  :
                                  <div></div>
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
              title="Error"
              message={this.state.error_msg}
              text="Ahora mismo"
            />
            :
              <div></div>
            }



              <MDBModal className="modal_terminos_estilos" isOpen={this.state.modal13} toggle={this.toggle(13)}>
                <MDBModalHeader toggle={this.toggle(13)}>
                  TERMINOS Y CONDICIONES
                </MDBModalHeader>
                <MDBModalBody>
                El los presentes términos y condiciones usted al ingresar a los cursos, acepta que: No divulgara o compartirá ningún curso, con ninguna persona u entidad, entendiendo que esta es para su uso mientras este en el sistema, pero siendo un contenido privado del cual es propietario Kognitive Capsa, la divulgación o compartición de estos cursos serán penados por la ley.
                <br/><br/><b>POLÍTICA DE PRIVACIDAD</b><br/><br/>
                El presente Política de Privacidad establece los términos en que  usa y protege la información que es proporcionada por sus usuarios al momento de utilizar su sitio web.<br/> Esta compañía está comprometida con la seguridad de los datos de sus usuarios.<br/> Cuando le pedimos llenar los campos de información personal con la cual usted pueda ser identificado, lo hacemos asegurando que sólo se empleará de acuerdo con los términos de este documento.<br/> Sin embargo esta Política de Privacidad puede cambiar con el tiempo o ser actualizada por lo que le recomendamos y enfatizamos revisar continuamente esta página para asegurarse que está de acuerdo con dichos cambios.
                <br/><br/>
                <b>Información que es recogida</b><br/><br/>

                Nuestro sitio web podrá recoger información personal por ejemplo: Nombre,  información de contacto como  su dirección de correo electrónica.<br/> Así mismo cuando sea necesario podrá ser requerida información específica para procesar algún pedido o realizar una entrega o facturación.

                <br/><br/><b>Uso de la información recogida</b><br/><br/>

                Nuestro sitio web emplea la información con el fin de proporcionar el mejor servicio posible, particularmente para mantener un registro de usuarios y notas de los mismos, para de tal manera mejorar nuestros servicios.<br/>  Es posible que sean enviados correos electrónicos periódicamente a través de nuestro sitio con ofertas especiales, nuevos cursos y otra información publicitaria que consideremos relevante para usted o que pueda brindarle algún beneficio, estos correos electrónicos serán enviados a la dirección que usted proporcione y podrán ser cancelados en cualquier momento.
                <br/>
                Por tal razon estamos altamente comprometidos para cumplir con el compromiso de mantener su información segura. Usamos los sistemas más avanzados y los actualizamos constantemente para asegurarnos que no exista ningún acceso no autorizado.

                <br/><br/><b>Cookies</b><br/><br/>

                Una cookie se refiere a un fichero que es enviado con la finalidad de solicitar permiso para almacenarse en su ordenador, al aceptar dicho fichero se crea y la cookie sirve entonces para tener información respecto al tráfico web, y también facilita las futuras visitas a una web recurrente.<br/> Otra función que tienen las cookies es que con ellas las web pueden reconocerte individualmente y por tanto brindarte el mejor servicio personalizado de su web.
                <br/>
                Nuestro sitio web emplea las cookies para poder idintificar usuarios en el sistema. Esta información es empleada únicamente para análisis estadístico y después la información se elimina de forma permanente.
                <br/>
                <br/><br/><b>Control de su información personal</b><br/><br/>

                En cualquier momento usted puede restringir la recopilación o el uso de la información personal que es proporcionada a nuestro sitio web.
                <br/>
                Esta compañía no venderá, cederá ni distribuirá la información personal que es recopilada sin su consentimiento, salvo que sea requerido por un juez con un orden judicial.
                <br/>
                Se reserva el derecho de cambiar los términos de la presente Política de Privacidad en cualquier momento.
                
                </MDBModalBody>
                <MDBModalFooter>
                  <MDBBtn color="primary" onClick={this.toggle(13)}>
                    Cerrar
                  </MDBBtn>
                </MDBModalFooter>
              </MDBModal>

          </MDBContainer>
        </main>
);
}
}

export default LoginForm;