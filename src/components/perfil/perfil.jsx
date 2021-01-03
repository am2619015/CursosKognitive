import React from "react";
import {Helmet} from 'react-helmet';
import {MDBContainer, MDBBtn,MDBInput, MDBRow, MDBCol, MDBTabPane, MDBTabContent, MDBNav, MDBNavItem, MDBLink,MDBModal, MDBModalBody, MDBModalHeader, MDBModalFooter, MDBTable, MDBTableBody, MDBTableHead} from 'mdbreact';
import Base from "../base_loged/base_comun";
import Header from "../header/header";
import "./perfil.css";
import Footer from "../footer/footer";
import history from '../history';
import $ from 'jquery';
import axios from 'axios';

var notas_disponibles = [];

class perfil extends Base {


    constructor(props){
        super(props);

        if(!this.usuario_Logeado()){
            history.push("/");
            history.go("/");
           }

           this.state = {
            role : this.role_Logeado(),
            usuario: this.decencriptado_valores(this.get_usuarioNombre().split("§")[1]),
            errorMysql:false,
            errorMysql_msg:"",
            loading:false,
            activeItemPills: '1',
            thisClass:this,
            email:"",
            rol:"",
            nombres:"",
            apellidos:"",
            telefono:"",
            modal_open: false,
            loading_updatePerfil:false,
            error_llenado_password:false
        }

        /// referencias a objetos html para no usar jquery y obtener value
        this.myRef_email_update = React.createRef();
        this.myRef_nombres_update = React.createRef();
        this.myRef_apellidos_update = React.createRef();
        this.myRef_telefono_update = React.createRef();
        this.myRef_changue_password = React.createRef();

        
        // funciones que se les permite acceder a state
        this.togglePills = this.togglePills.bind(this);
        this.get_datos_perfilUsuario = this.get_datos_perfilUsuario.bind(this);
        this.handler_update_datos_perfil = this.handler_update_datos_perfil.bind(this);

    }

    togglePills = tab => () => {
        const { activePills } = this.state;
        if (activePills !== tab) {
          this.setState({
            activeItemPills: tab
          });
        }
      };
    

    toggle_modal = () => {
        this.setState({
            modal_open: !this.state.modal_open
        });
      }

    componentWillUnmount(){
        notas_disponibles = [];
    }

    componentDidMount(){
        this.showMsg("Cargando perfil de usuario con role "+this.state.role+" para el usuario "+this.state.usuario);

        //this.cambio_show_visible_password();
        
        this.setState({
            loading:true,
            errorMysql:"",
            errorMysql_msg:""
        });

        this.get_datos_perfilUsuario();

    }


    get_datos_perfilUsuario = () =>{
        const info_perfil= {
            email : this.state.usuario
        };

        axios.post(`${this.get_ip_server()}/apis/get_datos_perfil.php`, { info_perfil })
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
                                                        email:"",
                                                        rol:"",
                                                        nombres:"",
                                                        apellidos:"",
                                                        telefono:"",
                                                        loading:false
                                                        });
                                                    }else if(res.data.mensaje==="correcto"){

                                                        
                                                        var datos = JSON.parse(res.data.codigoHTML);

                                                        

                                                        this.setState({
                                                            errorMysql:false,
                                                            errorMysql_msg:res.data.codigoHTML,
                                                            email:datos[0][0],
                                                            rol:datos[0][1],
                                                            nombres:datos[0][2]?datos[0][2]:"",
                                                            apellidos:datos[0][3]?datos[0][3]:"",
                                                            telefono:datos[0][4]?datos[0][4]:"",
                                                            loading:true
                                                        });



                                                        this.handle_notas_perfil_usuario();

                                                    }
                                            
                                            }).catch((error) => {
                                                    this.showMsg("error de "+error);
                                                    this.setState({
                                                        errorMysql:true,
                                                        errorMysql_msg:"No se pudo contactar con el servidor",
                                                        email:"",
                                                        rol:"",
                                                        nombres:"",
                                                        apellidos:"",
                                                        telefono:"",
                                                        loading:false
                                                    });
                                            });
    }



    /// comportamiento del boton de cambio de visibilidad password
    cambio_show_visible_password = (e) =>{

            console.log("clikeando toogle password"+e);
            $(e.target).toggleClass('fa-eye fa-eye-slash');
            
            let input = $($(e.target).attr('toggle'));
            if (input.attr('type') === 'password') {
              input.attr('type', 'text');
            }
            else {
              input.attr('type', 'password');
            }
 
    }


    handler_update_datos_perfil = () =>{
        this.showMsg("cargando y axios y tambien modal que muestra carga "+this.myRef_email_update.current.value+" "+
                                                                            this.myRef_nombres_update.current.value+" "+
                                                                            this.myRef_apellidos_update.current.value+" "+
                                                                            this.myRef_telefono_update.current.value);
        this.toggle_modal();

        this.setState({
            loading_updatePerfil:true
        });

        const user_perfil= {
            email : this.state.usuario,
            nombres: this.myRef_nombres_update.current.value,
            apellidos: this.myRef_apellidos_update.current.value,
            telefono: this.myRef_telefono_update.current.value
        };

        axios.post(`${this.get_ip_server()}/apis/update_perfil_info.php`, { user_perfil })
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
                                                        email:"",
                                                        rol:"",
                                                        nombres:"",
                                                        apellidos:"",
                                                        telefono:"",
                                                        loading_updatePerfil:false
                                                        });
                                                    }else if(res.data.mensaje==="correcto"){

                                                        
                                                        var datos = JSON.parse(res.data.codigoHTML);

                                                        

                                                        this.setState({
                                                            errorMysql:false,
                                                            errorMysql_msg:res.data.codigoHTML,
                                                            email:datos[0][0],
                                                            rol:datos[0][1],
                                                            nombres:datos[0][2]?datos[0][2]:"",
                                                            apellidos:datos[0][3]?datos[0][3]:"",
                                                            telefono:datos[0][4]?datos[0][4]:"",
                                                            loading_updatePerfil:false
                                                        });

                                                    }
                                            
                                            }).catch((error) => {
                                                    this.showMsg("error de "+error);
                                                    this.setState({
                                                        errorMysql:true,
                                                        errorMysql_msg:"No se pudo contactar con el servidor",
                                                        email:"",
                                                        rol:"",
                                                        nombres:"",
                                                        apellidos:"",
                                                        telefono:"",
                                                        loading_updatePerfil:false
                                                    });
                                            });

    }


    //// password handler el cambio asi como la referencia para objetos mdboostrap que son distintos y no necesitan ser inicializados
    handleChanguePassword = () =>{
        this.showMsg("contraseña a poner de "+this.input_ref_password.value);

        if(this.input_ref_password.value.length > 5){

                this.toggle_modal();

                this.setState({
                    loading_updatePerfil:true,
                    error_llenado_password:false
                });

                const user_perfil= {
                    email : this.state.usuario,
                    password: this.input_ref_password.value
                };

                axios.post(`${this.get_ip_server()}/apis/update_password_perfil.php`, { user_perfil })
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
                                                                loading_updatePerfil:false
                                                                });
                                                                this.input_ref_password.value ="";
                                                            }else if(res.data.mensaje==="correcto"){
                                                                
                                                                this.showMsg("contraseña actualizada con exito");

                                                                this.setState({
                                                                    errorMysql:false,
                                                                    errorMysql_msg:res.data.codigoHTML,
                                                                    loading_updatePerfil:false
                                                                });
                                                                this.input_ref_password.value ="";
                                                            }
                                                    
                                                    }).catch((error) => {
                                                            this.showMsg("error de "+error);
                                                            this.setState({
                                                                errorMysql:true,
                                                                errorMysql_msg:"No se pudo contactar con el servidor",
                                                                loading_updatePerfil:false
                                                            });
                                                            this.input_ref_password.value ="";
                                                    });

        }else{
            this.showMsg("error la contraseña debe tener mas de 5 caracteres");
            this.setState({
                error_llenado_password:true
            });
        }

    }

     refFunctionPassword = (ref) => {
        this.input_ref_password = ref;
    };

    ////////////// handle notas perfil usuario /////////////////////

    handle_notas_perfil_usuario = () =>{
        const user_perfil= {
            email : this.state.usuario
        };

        axios.post(`${this.get_ip_server()}/apis/get_notas_usuario_perfil.php`, { user_perfil })
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
                                                    }else if(res.data.mensaje==="correcto"){

                                                        
                                                        var datos = JSON.parse(res.data.codigoHTML);

                                                        //this.showMsg("datos notas"+datos[0][0]);

                                                        datos.forEach(element => {
                                                            notas_disponibles.push(element);
                                                        });

                                                        this.showMsg("array notas de"+notas_disponibles);

                                                        this.setState({
                                                            errorMysql:false,
                                                            errorMysql_msg:res.data.codigoHTML,
                                                            loading:false
                                                        });


                                                    }
                                            
                                            }).catch((error) => {
                                                    this.showMsg("error de "+error);
                                                    this.setState({
                                                        errorMysql:true,
                                                        errorMysql_msg:"No se pudo contactar con el servidor",
                                                        loading:false
                                                    });
                                            });
    }


    render() {

        const { activeItemPills,thisClass } = this.state;
        
        function tabla_notas_usuario(){
            var count=0;
            return(
                <MDBTable>
                    <MDBTableHead color="primary-color" textWhite>
                        <tr>
                        <th>#</th>
                        <th>Taller</th>
                        <th>Curso</th>
                        <th>Nota</th>
                        </tr>
                    </MDBTableHead>
                    
                    
                    <MDBTableBody>
                                {notas_disponibles.map((value) => (
                                    <tr key={count++} md="4" className="columna_nota">
                                            <td>{count}</td>
                                            <td>{value[0]}</td>
                                            <td>{value[1]}</td>
                                            <td>{value[2]}</td>
                                    </tr>
                                ))}
                    </MDBTableBody>
                
                </MDBTable>
            );
        }

        function modal_update_perfil(){
            return (
                <MDBContainer>
                  <MDBModal isOpen={thisClass.state.modal_open} toggle={thisClass.toggle_modal} backdrop={false} size="lg"  centered>
                    <MDBModalHeader toggle={thisClass.toggle_modal}>Actualizando</MDBModalHeader>
                    <MDBModalBody>
                      {thisClass.state.loading_updatePerfil?
                        <div className="load_spinner_update_perfil">
                            <div className="spinner-grow text-success loader_spiner_cursos" role="status">
                                <span className="sr-only">Loading...</span>
                            </div>
                        </div>
                      :
                        <p>Actualizado correctamente, puede cerrar esta ventana</p>
                    }
                    </MDBModalBody>
                    <MDBModalFooter>
                      <MDBBtn color="primary" onClick={thisClass.toggle_modal}>Cerrar</MDBBtn>
                    </MDBModalFooter>
                  </MDBModal>
                </MDBContainer>
                );
        }

        function contenido_perfil(){
            return (
                <MDBRow>
                            <MDBCol size="12" md='6'>
                                <MDBNav className='nav-pills flex-column perfil_nav_left'>
                                    <MDBNavItem>
                                        <MDBLink to='#' active={activeItemPills === '1'} onClick={thisClass.togglePills('1')} link>
                                            Resumen
                                        </MDBLink>
                                    </MDBNavItem>
                                    <MDBNavItem>
                                        <MDBLink to='#' active={activeItemPills === '2'} onClick={thisClass.togglePills('2')} link>
                                            Modificar Perfil
                                        </MDBLink>
                                    </MDBNavItem>
                                    <MDBNavItem>
                                        <MDBLink to='#' active={activeItemPills === '3'} onClick={thisClass.togglePills('3')} link>
                                            Seguridad
                                        </MDBLink>
                                    </MDBNavItem>
                                    {thisClass.state.role.localeCompare("admin") !== 0 ?
                                        <MDBNavItem>
                                            <MDBLink to='#' active={activeItemPills === '4'} onClick={thisClass.togglePills('4')} link>
                                                Notas Cursos
                                            </MDBLink>
                                        </MDBNavItem>
                                    :
                                        <></>
                                    }
                                    
                                </MDBNav>
                            </MDBCol>
                            <MDBCol size="12" md='6'>
                                <MDBTabContent activeItem={activeItemPills}>
                                    <MDBTabPane tabId='1' className="perfil_nav_right">
                                            <MDBContainer>
                                                    <MDBRow>
                                                        <MDBCol md="12">
                                                        <form>
                                                            <p className="h5 text-center mb-3">Informacion Usuario</p>
                                                            <label htmlFor="email_dato" className="grey-text">
                                                                Email
                                                            </label>
                                                            <input type="text" id="email_dato" className="form-control" value={thisClass.state.email} readOnly/>
                                                            <br />
                                                            <label htmlFor="rol_dato" className="grey-text">
                                                                Rol
                                                            </label>
                                                            <input type="text" id="rol_dato" className="form-control" value={thisClass.state.rol} readOnly/>
                                                            <br />
                                                            <label htmlFor="nombres_dato" className="grey-text">
                                                                Nombres
                                                            </label>
                                                            <input type="text" id="nombres_dato" className="form-control" value={thisClass.state.nombres} readOnly/>
                                                            <br />
                                                            <label htmlFor="apellidos_dato" className="grey-text">
                                                                Apellidos
                                                            </label>
                                                            <input type="text" id="apellidos_dato" className="form-control" value={thisClass.state.apellidos}  readOnly/>
                                                            <br />
                                                            <label htmlFor="telefono_dato" className="grey-text">
                                                                Telefono
                                                            </label>
                                                            <input type="number" id="telefono_dato" className="form-control" value={thisClass.state.telefono}  readOnly/>
                                                        </form>
                                                        </MDBCol>
                                                    </MDBRow>
                                            </MDBContainer>
                                    </MDBTabPane>
                                    <MDBTabPane tabId='2' className="perfil_nav_right">
                                                <MDBContainer>
                                                            <MDBRow>
                                                                <MDBCol md="12">
                                                                <form>
                                                                    <p className="h5 text-center mb-3">Actualizar Informacion</p>
                                                                    <label htmlFor="email_dato_cambio" className="grey-text">
                                                                        Email
                                                                    </label>
                                                                    <input type="text" id="email_dato_cambio" className="form-control" ref={thisClass.myRef_email_update} value={thisClass.state.email} readOnly/>
                                                                    <br />
                                                                    <label htmlFor="nombres_dato_cambio" className="grey-text">
                                                                        Nombres
                                                                    </label>
                                                                    <input type="text" id="nombres_dato_cambio" className="form-control" ref={thisClass.myRef_nombres_update} defaultValue={thisClass.state.nombres}/>
                                                                    <br />
                                                                    <label htmlFor="apellidos_dato_cambio" className="grey-text">
                                                                        Apellidos
                                                                    </label>
                                                                    <input type="text" id="apellidos_dato_cambio" className="form-control" ref={thisClass.myRef_apellidos_update} defaultValue={thisClass.state.apellidos}/>
                                                                    <br />
                                                                    <label htmlFor="telefono_dato_cambio" className="grey-text">
                                                                        Telefono
                                                                    </label>
                                                                    <input type="number" id="telefono_dato_cambio" className="form-control" ref={thisClass.myRef_telefono_update} defaultValue={thisClass.state.telefono}/>
                                                                    <div className="text-center mt-4">
                                                                        {thisClass.state.modal_open?
                                                                        <MDBBtn color="indigo text-white" type="button" disabled 
                                                                        onClick={thisClass.handler_update_datos_perfil}>Actualizar</MDBBtn>
                                                                        :
                                                                        <MDBBtn color="indigo text-white" type="button" 
                                                                        onClick={thisClass.handler_update_datos_perfil}>Actualizar</MDBBtn>
                                                                        }
                                                                        
                                                                    </div>
                                                                </form>
                                                                </MDBCol>
                                                            </MDBRow>
                                                </MDBContainer>
                                    </MDBTabPane>
                                    <MDBTabPane tabId='3' className="perfil_nav_right">
                                                <MDBContainer>
                                                            <MDBRow>
                                                                <MDBCol md="12">
                                                                <form>
                                                                    <p className="h5 text-center mb-3">Cambio de Contraseña</p>
                                                                    <div className="md-form md-outline">
                                                                        <MDBInput label="Nueva Contraseña" className={`${thisClass.state.error_llenado_password?"invalid":""}`} inputRef={thisClass.refFunctionPassword} icon="lock" group type="password" name="pwd" id="input-pwd" />
                                                                        <div className={`invalid-feedback estilo_error_pass ${thisClass.state.error_llenado_password?"show_error":""}`}>Ingrese una contraseña con al menos 6 caracteres.</div>
                                                                        <span toggle="#input-pwd" onClick={thisClass.cambio_show_visible_password} className="fa fa-fw fa-eye field-icon toggle-password"></span>
                                                                    </div>
                                                                   
                                                                    <div className="text-center mt-4">
                                                                        <MDBBtn color="indigo text-white" type="button" onClick={thisClass.handleChanguePassword}>Cambiar</MDBBtn>
                                                                    </div>
                                                                </form>
                                                                </MDBCol>
                                                            </MDBRow>
                                                </MDBContainer>
                                    </MDBTabPane>
                                    {thisClass.state.role.localeCompare("admin") !== 0 ?
                                        <MDBTabPane tabId='4' className="perfil_nav_right">
                                            <p className="h5 text-center mb-3">Notas del estudiante</p>
                                            {tabla_notas_usuario()}
                                        </MDBTabPane>
                                        :
                                        <></>
                                    }
                                </MDBTabContent>
                            </MDBCol>
                        </MDBRow>
            );
        }
        

        if(this.usuario_Logeado()){
            if(this.role_Logeado()==="estudiante" || this.role_Logeado()==="admin"){
                return (
                    <>
                    <Helmet>
                            <meta charSet="utf-8" />
                            <title>Perfil Usuario de Kognitive</title>
                            <link rel="canonical" href="https://cursos.kognitivecapsa.com" />
                            <meta name="description" content="Perfil de usuario Kognitive" />
                    </Helmet>
                    <Header/>
                    <main>
                    <MDBContainer className="contendor_perfil my-5">
                        
                    {this.state.loading
                        ?
                            <div className="main_load_curso_spiner">
                                <div className="spinner-grow text-success loader_spiner_cursos" role="status">
                                    <span className="sr-only">Loading...</span>
                                </div>
                            </div>
                        :
                            this.state.errorMysql
                            ?
                            <div>Error mysql de : {this.state.errorMysql_msg} Contacte con el administrador</div>
                            :
                            <>
                            {contenido_perfil()}
                            {modal_update_perfil()}
                            </>
                    }
                        
                    </MDBContainer>
                       
                    </main>
                    <Footer />
                    </>
                  );
            }else if(this.role_Logeado()==="profesor"){
                return (
                    <>
                    <Helmet>
                            <meta charSet="utf-8" />
                            <title>Perfil Usuario de Kognitive</title>
                            <link rel="canonical" href="https://cursos.kognitivecapsa.com" />
                            <meta name="description" content="Perfil de usuario Kognitive" />
                    </Helmet>
                    <Header/>
                    <main>
                        <MDBContainer className="contenedor_curso my-5">
                        <div>En construccion, no existe aun la funcionalidad del maestro, que vera mensajes de sus cursos, estudiantes y calficaciones de sus cursos</div>
                        </MDBContainer>
                    </main>
                    <Footer />
                    </>
                );
            }else{
                return (
                    <>
                    <Helmet>
                            <meta charSet="utf-8" />
                            <title>Perfil Usuario de Kognitive</title>
                            <link rel="canonical" href="https://cursos.kognitivecapsa.com" />
                            <meta name="description" content="Perfil de usuario Kognitive" />
                    </Helmet>
                    <Header />
                    <main>
                        <MDBContainer className="contenedor_cursos my-5">
                    <div>Error su rol no existe, contactese con el Administrador</div>
                        </MDBContainer>
                    </main>
                    <Footer />
                    </>
                );
            }
        

        }else{
            return (<div className="error_404"><h1>Error 404</h1></div>);
        }
    }

}

export default perfil;