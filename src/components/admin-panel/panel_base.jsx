import React from "react";
import {Helmet} from "react-helmet";
import { MDBContainer, MDBRow, MDBCol, MDBTabPane, MDBTabContent, MDBNav, MDBNavItem, MDBLink,MDBNavLink,MDBNotification,MDBIcon,MDBPopover,MDBPopoverBody} from "mdbreact";
import Base from "../base_loged/base_comun";
import Header from "../header/header";
import "./admin_panel.css";
import Footer from "../footer/footer";
import history from "../history";
import axios from "axios";
import ModuloCrearUsuario from "./crear_usuario";
import ModuloCrearCurso from "./crear_curso";
import ModuloCrearTaller from "./crear_taller";
import TablaDatosDB from "./tablas_datos_visuales";
import TablaDatosDBCursos from "./tabla_notas_promedioCursos";
import TablaDatosNoIngresaron from "./tabla_datos_noIngresaronAun";
import ModuloCrearCuestionario from "./crear_cuestionario";
import ModuloCrearMatricula from"./crear_matricula";
import $ from "jquery";


class panel_base extends Base {


    constructor(props){
        super(props);

        if(!this.usuario_Logeado()){ 
            history.push("/");
            history.go("/");
           }

           this.state = {
            role : this.role_Logeado(),
            usuario: this.decencriptado_valores(this.get_usuarioNombre().split("§")[1]),
            activeItemPills: "1",
            thisClass:this,
            activeItem_estudiantes : "1",
            activeItem_cursos : "1",
            activeItem_talleres : "1",
            activeItem_cuestionarios : "1",
            activeItem_matriculas : "1",
            activeItem_notas:"1",
            title_error_msg:"",
            error_msg:"",
            errorForm:false,
            show_top_corner:false,
            msg_top_corner:"",
            title_msg_top_corner:"",
            errorMysql:false,
            errorMysql_msg:"",
            claseTabla_estudiantes:null,
            claseTabla_cursos:null,
            clase_crear_taller:null,
            claseTabla_talleres:null,
            clase_crear_cuestionario:null,
            claseTabla_cuestionarios:null,
            clase_crear_matricula:null,
            claseTabla_matriculas:null,
            claseTabla_notas:null,
            claseTabla_notasv2:null,
            claseTabla_noIngresaron:null
           }


           this.showNotify_popOut = this.showNotify_popOut.bind(this);
           this.showNotify_top_corner = this.showNotify_top_corner.bind(this);
           this.handleClickOutside_Elements = this.handleClickOutside_Elements.bind(this);
    }

    /////// estados del componente
    componentDidMount() {
        this.showMsg("Usuario logeado con role "+this.state.role+" usuario "+this.state.usuario);
        if(this.usuario_Logeado() && this.state.role.localeCompare("admin")!==0){
            history.push("/");
            history.go("/");
        }
        this.expulsar_no_son_admins();
        this.callback_close_notifications();

    }

    componentWillUnmount(){
        document.removeEventListener('mousedown', this.handleClickOutside_Elements);
    }


    ////// callback de cierre de MDBNotificacion
    callback_close_notifications = () =>{
        /// unico codigo jquery usado para cambiar el funcionamiento de MDBNotificacion que no tiene callback al cerrar
        $(".cerrando_error").on( "click", function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            var padre_modal_a_cerar=$(this).closest(".notificaciones");
            //console.log("clickeando cerrar "+$(this).closest(".notificaciones").attr('class'));
            if(padre_modal_a_cerar.hasClass("show")){
                padre_modal_a_cerar.removeClass("show").addClass("hide");
            }
        });
        document.addEventListener('mousedown', this.handleClickOutside_Elements);
    }

    //// funcion que setea ojeto desde otra clase value es el valor a poner en el estado llamado type
    //// esta funcion usan los objetos de tipo tabla
    set_clase_tabla  = (value, type) =>{
        // this.showMsg("valor de "+value+" = "+type);
         this.setState({
         [type]: value
         });
     }

    
    //// habilita funcionalidad del menu izquierdo sus cambios
    togglePills = tab => () => {
        const { activePills } = this.state;
        if (activePills !== tab) {
          this.setState({
            activeItemPills: tab
          });
        }
        if(tab.trim() === "3"){
            this.state.clase_crear_taller.handle_get_datos_crear_taller();
            this.state.claseTabla_talleres.callback_start_component();
        }else if(tab.trim() === "4"){
            this.state.clase_crear_cuestionario.handle_get_idCuestionarioDisponible();
        }else if(tab.trim() === "5"){
            this.state.clase_crear_matricula.handle_get_datos_crear_matricula();
        }else if(tab.trim() === "6"){
            this.state.claseTabla_notas.callback_start_component();
            this.state.claseTabla_notasv2.callback_start_component();
            this.state.claseTabla_noIngresaron.callback_start_component();
        }
      };

    
    //// habilita funcionalidad menu derecho estudiantes
    toggle_tab_estudiantes = tab => e => {
        if (this.state.activeItem_estudiantes !== tab) {
          this.setState({
            activeItem_estudiantes: tab
          });
          // si estoy en la segunda pestana de estudiantes mando a obtener el proceso de carga de pagina de estudiantes
          if(tab.trim() === "2"){
            this.state.claseTabla_estudiantes.callback_start_component(); //dispara la tabla su inicio
          }
        }
      };

      //// habilita funcionalidad menu derecho cursos
      toggle_tab_cursos = tab => e => {
        if (this.state.activeItem_cursos !== tab) {
            this.setState({
                activeItem_cursos: tab
            });
          // si estoy en la segunda pestana de cursos mando a obtener el proceso de carga de pagina de estudiantes
          if(tab.trim() === "2"){
            this.state.claseTabla_cursos.callback_start_component();
          }
        }
      };


          //// habilita funcionalidad menu derecho talleres
          toggle_tab_talleres = tab => e => {
            if (this.state.activeItem_talleres !== tab) {
                this.setState({
                    activeItem_talleres: tab
                });
              // si estoy en la segunda pestana de talleres mando a obtener el proceso de carga de pagina de estudiantes
              if(tab.trim() === "2"){
                this.state.claseTabla_talleres.callback_start_component();
              }else if(tab.trim() === "1"){
                this.state.clase_crear_taller.handle_get_datos_crear_taller();
              }
            }
          };

          //// habilita funcionalidad menu derecho cuestionarios
          toggle_tab_cuestionarios = tab => e => {
            if (this.state.activeItem_cuestionarios !== tab) {
                this.setState({
                    activeItem_cuestionarios: tab
                });
              // si estoy en la segunda pestana de cuestionarios mando a obtener el proceso de carga de pagina de estudiantes
              if(tab.trim() === "2"){
                this.state.claseTabla_cuestionarios.callback_start_component();
              }else if(tab.trim() === "1"){
                this.state.clase_crear_cuestionario.handle_get_idCuestionarioDisponible();
              }
            }
          };

        //// habilita funcionalidad menu derecho cuestionarios
        toggle_tab_matriculas = tab => e => {
            if (this.state.activeItem_matriculas !== tab) {
                this.setState({
                    activeItem_matriculas: tab
                });
                // si estoy en la segunda pestana de cuestionarios mando a obtener el proceso de carga de pagina de estudiantes
                if(tab.trim() === "2"){
                    this.state.claseTabla_matriculas.callback_start_component();
                }else if(tab.trim() === "1"){
                    this.state.clase_crear_matricula.handle_get_datos_crear_matricula();
                }
            }
            };
        //// habilita funcionalidad menu derecho notas
        toggle_tab_notas = tab => e => {
            if (this.state.activeItem_notas !== tab) {
                this.setState({
                    activeItem_notas: tab
                });
                // si estoy en la segunda pestana de cuestionarios mando a obtener el proceso de carga de pagina de estudiantes
                if(tab.trim() === "2"){
                    this.state.claseTabla_notasv2.callback_start_component();
                }else if(tab.trim() === "1"){
                    this.state.claseTabla_notas.callback_start_component();
                }else if(tab.trim() === "3"){
                    this.state.claseTabla_noIngresaron.callback_start_component();
                }
            }
            };

     //// showNotification todo panel

     showNotify_popOut = (active,titulo,msg) =>{
         this.setState({
            errorForm:active,
            title_error_msg:titulo,
            error_msg:msg
         });
     }

     showNotify_top_corner = (active,titulo,msg) =>{
        this.setState({
            show_top_corner:active,
            title_msg_top_corner:titulo,
            msg_top_corner:msg
         });
     }

     //// funcion que expulsa a quien no sea admin
     expulsar_no_son_admins =  () =>{
        const user= {
            email : this.state.usuario,
            password: this.state.password_usuario,
            nombres: this.state.nombres_usuario,
            apellidos: this.state.apellidos_usuario,
            telefono: this.state.apellidos_usuario
        };

        axios.post(`${this.get_ip_server()}/apis/admin_panel/is_admin.php`, { user })
                                            .then(res => {
                                                    this.showMsg(res);
                                                    //this.showMsg(res.data);
                                                    //this.showMsg(res.data.mensaje);
                                                    //this.showMsg(res.data.codigoHTML);
                                                    // var cursos = JSON.parse(res.data.mensaje);
                                                    //this.showMsg("----> cursos");
                                                    //this.showMsg(cursos);
                                                    
                                            
                                                   if(res.data.mensaje==="incorrecto"){
                                                        history.push("/logout");
                                                        history.go("/logout");

                                                    }else if(res.data.mensaje==="correcto"){
                                                            this.showMsg("Admin identificado y valido");
                                                    }
                                            
                                            }).catch((error) => {
                                                    history.push("/logout");
                                                    history.go("/logout");
                                            }); 
     }


     ///// evento que detecta cuando se clickea fuera de un elemento 
     handleClickOutside_Elements = (e) => {
        var specifiedElement = document.getElementById('cerrable_click_outside');
       
        var isClickInside = specifiedElement.contains(e.target);

        if (!isClickInside) {
            if(this.state.show_top_corner){
                this.showMsg("clickeado afuera notification se debe cerrar");
                this.showNotify_top_corner(false,"","");
            }
        }else{
           // this.showMsg("clickeado adentro ");
        }
    }


    render() {

        const { activeItemPills,thisClass } = this.state;

        function contenido_panel(){
            return (
                <MDBRow>
                            <MDBCol size="12" md='3'>
                                <MDBNav className='nav-pills flex-column perfil_nav_left'>
                                    <MDBNavItem>
                                        <MDBLink className="text-center" to='#' active={activeItemPills === '1'} onClick={thisClass.togglePills('1')} link>
                                            Estudiantes
                                            <MDBIcon icon="address-card" className="ml-3" />
                                        </MDBLink>
                                    </MDBNavItem>
                                    <MDBNavItem>
                                        <MDBLink className="text-center" to='#' active={activeItemPills === '2'} onClick={thisClass.togglePills('2')} link>
                                            Cursos
                                            <MDBIcon icon="book" className="ml-3"/>
                                        </MDBLink>
                                    </MDBNavItem>
                                    <MDBNavItem>
                                        <MDBLink className="text-center" to='#' active={activeItemPills === '3'} onClick={thisClass.togglePills('3')} link>
                                            Talleres
                                            <MDBIcon icon="pencil-square-o" className="ml-3"/>
                                        </MDBLink>
                                    </MDBNavItem>
                                    <MDBNavItem>
                                        <MDBLink className="text-center" to='#' active={activeItemPills === '4'} onClick={thisClass.togglePills('4')} link>
                                             Cuestionarios
                                             <MDBIcon icon="pencil" className="ml-3"/>
                                        </MDBLink>
                                        <MDBLink className="text-center" to='#' active={activeItemPills === '5'} onClick={thisClass.togglePills('5')} link>
                                             Matriculas
                                             <MDBIcon icon="user-plus" className="ml-3"/>
                                        </MDBLink>
                                        <MDBLink className="text-center" to='#' active={activeItemPills === '6'} onClick={thisClass.togglePills('6')} link>
                                             Notas
                                             <MDBIcon icon="graduation-cap" className="ml-3"/>
                                        </MDBLink>
                                    </MDBNavItem>
                                    
                                </MDBNav>
                            </MDBCol>
                            <MDBCol size="12" md='9'>
                                <MDBTabContent activeItem={activeItemPills}>
                                    <MDBTabPane tabId='1' className="perfil_nav_right pt-0">
                                            <MDBContainer>
                                                    <MDBNav className="nav-tabs mt-0">
                                                            <MDBNavItem key="1">
                                                                <MDBNavLink link className="estilo_opciones_derecha" to="#" active={thisClass.state.activeItem_estudiantes === "1"} onClick={thisClass.toggle_tab_estudiantes("1")} role="tab" >
                                                                        <span>Agregar usuario</span>
                                                                        <MDBPopover popover className="full_with_popover" clickable placement="bottom" domElement>
                                                                                <span><MDBIcon icon="question-circle" className="pointer ml-2" /></span>
                                                                                <div>
                                                                                <MDBPopoverBody className="text-center">
                                                                                    <span className="text-center pointer">Aquí podra crear un nuevo usuario, tenga en cuenta que solo email y password son mandatorios, el resto es opcional y puede ir en blanco si no se poseen esos datos.</span>
                                                                                </MDBPopoverBody>
                                                                                </div>
                                                                        </MDBPopover>
                                                                </MDBNavLink>
                                                            </MDBNavItem>
                                                            <MDBNavItem key="2">
                                                                <MDBNavLink link className="estilo_opciones_derecha" to="#" active={thisClass.state.activeItem_estudiantes === "2"} onClick={thisClass.toggle_tab_estudiantes("2")} role="tab" >
                                                                        <span>Lista Usuarios</span>
                                                                        <MDBPopover popover className="full_with_popover" clickable placement="bottom" domElement>
                                                                                <span><MDBIcon icon="question-circle" className="pointer ml-2" /></span>
                                                                                <div>
                                                                                <MDBPopoverBody className="text-center">
                                                                                    <span className="text-center pointer">Aquí podra mirar todos los usuarios, asi como usuarios especificos al filtrarlos por el email, para usar el filtro de click en la lupa o presione Enter en el buscador, asi como eliminarlos y editarlos</span>
                                                                                </MDBPopoverBody>
                                                                                </div>
                                                                        </MDBPopover>
                                                                </MDBNavLink>
                                                            </MDBNavItem>
                                                    </MDBNav>
                                                    <MDBTabContent activeItem={thisClass.state.activeItem_estudiantes} >
                                                                        <MDBTabPane key="1" tabId="1" role="tabpanel">
                                                                                    <ModuloCrearUsuario 
                                                                                         success_function={thisClass.showNotify_top_corner} 
                                                                                         error_function={thisClass.showNotify_popOut}
                                                                                    /> 
                                                                        </MDBTabPane>
                                                                        <MDBTabPane key="2" tabId="2" role="tabpanel">
                                                                                    <TablaDatosDB 
                                                                                        callback_carga = {thisClass.set_clase_tabla}
                                                                                        success_function={thisClass.showNotify_top_corner}
                                                                                        error_function={thisClass.showNotify_popOut}
                                                                                        api_tabla_dato={"users"}
                                                                                        datos_tabla_colum={["ID","Email","Nombres Apellidos","Telefono"]}
                                                                                        msg_eliminacion = {"Estudiante"}
                                                                                    />
                                                                        </MDBTabPane>
                                                    </MDBTabContent>
                                            </MDBContainer>
                                    </MDBTabPane>
                                    <MDBTabPane tabId='2' className="perfil_nav_right pt-0">
                                                <MDBContainer>
                                                <MDBNav className="nav-tabs mt-0">
                                                            <MDBNavItem key="1">
                                                                <MDBNavLink link className="estilo_opciones_derecha" to="#" active={thisClass.state.activeItem_cursos === "1"} onClick={thisClass.toggle_tab_cursos("1")} role="tab" >
                                                                        <span>Agregar curso</span>
                                                                        <MDBPopover popover className="full_with_popover" clickable placement="bottom" domElement>
                                                                                <span><MDBIcon icon="question-circle" className="pointer ml-2" /></span>
                                                                                <div>
                                                                                <MDBPopoverBody className="text-center">
                                                                                    <span className="text-center pointer">Aquí podra crear un nuevo curso, cada campo es mandatorio, se recomienda fotos de no mas de 1MB.</span>
                                                                                </MDBPopoverBody>
                                                                                </div>
                                                                        </MDBPopover>
                                                                </MDBNavLink>
                                                            </MDBNavItem>
                                                            <MDBNavItem key="2">
                                                                <MDBNavLink link className="estilo_opciones_derecha" to="#" active={thisClass.state.activeItem_cursos === "2"} onClick={thisClass.toggle_tab_cursos("2")} role="tab" >
                                                                        <span>Lista Cursos</span>
                                                                        <MDBPopover popover className="full_with_popover" clickable placement="bottom" domElement>
                                                                                <span><MDBIcon icon="question-circle" className="pointer ml-2" /></span>
                                                                                <div>
                                                                                <MDBPopoverBody className="text-center">
                                                                                    <span className="text-center pointer">Aquí podra mirar todos los cursos y de ser necesario eilimar o modificar alguno, el buscador funciona en base al titulo del curso.</span>
                                                                                </MDBPopoverBody>
                                                                                </div>
                                                                        </MDBPopover>
                                                                </MDBNavLink>
                                                            </MDBNavItem>
                                                    </MDBNav>
                                                    <MDBTabContent activeItem={thisClass.state.activeItem_cursos} >
                                                                        <MDBTabPane key="1" tabId="1" role="tabpanel">
                                                                                   <ModuloCrearCurso 
                                                                                        success_function={thisClass.showNotify_top_corner} 
                                                                                        error_function={thisClass.showNotify_popOut}
                                                                                   />
                                                                        </MDBTabPane>
                                                                        <MDBTabPane key="2" tabId="2" role="tabpanel">
                                                                                    <TablaDatosDB 
                                                                                        callback_carga = {thisClass.set_clase_tabla}
                                                                                        success_function={thisClass.showNotify_top_corner}
                                                                                        error_function={thisClass.showNotify_popOut}
                                                                                        api_tabla_dato={"cursos"}
                                                                                        datos_tabla_colum={["ID","Titulo","Descripcion","Talleres"]}
                                                                                        msg_eliminacion = {"Curso"}
                                                                                    />
                                                                        </MDBTabPane>
                                                    </MDBTabContent>
                                                </MDBContainer>
                                    </MDBTabPane>
                                    <MDBTabPane tabId='3' className="perfil_nav_right">
                                                <MDBContainer>
                                                <MDBNav className="nav-tabs mt-0">
                                                            <MDBNavItem key="1">
                                                                <MDBNavLink link className="estilo_opciones_derecha" to="#" active={thisClass.state.activeItem_talleres === "1"} onClick={thisClass.toggle_tab_talleres("1")} role="tab" >
                                                                        <span>Agregar un Taller</span>
                                                                        <MDBPopover popover className="full_with_popover" clickable placement="bottom" domElement>
                                                                                <span><MDBIcon icon="question-circle" className="pointer ml-2" /></span>
                                                                                <div>
                                                                                <MDBPopoverBody className="text-center">
                                                                                    <span className="text-center pointer">Aquí podra crear un nuevo taller, asi como agregarlo a un curso al momento de su creacion, varios talleres pueden ser ingresados a un curso, entre sus datos estan el numero de videos que desea, se recomienda no mas de 35 MB por video como maximo, y de 5MB para el pdf, tambien se puede especificar si sera un taller con intentos limitados, los cuales por defecto seran de 3 intentos maximos.</span>
                                                                                </MDBPopoverBody>
                                                                                </div>
                                                                        </MDBPopover>
                                                                </MDBNavLink>
                                                            </MDBNavItem>
                                                            <MDBNavItem key="2">
                                                                <MDBNavLink link className="estilo_opciones_derecha" to="#" active={thisClass.state.activeItem_talleres === "2"} onClick={thisClass.toggle_tab_talleres("2")} role="tab" >
                                                                        <span>Lista Taller</span>
                                                                        <MDBPopover popover className="full_with_popover" clickable placement="bottom" domElement>
                                                                                <span><MDBIcon icon="question-circle" className="pointer ml-2" /></span>
                                                                                <div>
                                                                                <MDBPopoverBody className="text-center">
                                                                                    <span className="text-center pointer">Aquí podra mirar los distintos talleres asi como a que curso pertenecen, el parametro de busqueda es el nombre del taller, tambien se podra editarlos o eliminarlos, tenga en cuenta que si elimina un curso, los talleres del mismo que esten asociados al mismo desapareceran ya que sin su curso no tienen razon de existir.</span>
                                                                                </MDBPopoverBody>
                                                                                </div>
                                                                        </MDBPopover>
                                                                </MDBNavLink>
                                                            </MDBNavItem>
                                                    </MDBNav>
                                                    <MDBTabContent activeItem={thisClass.state.activeItem_talleres} >
                                                                        <MDBTabPane key="1" tabId="1" role="tabpanel">
                                                                                   <ModuloCrearTaller 
                                                                                        success_function={thisClass.showNotify_top_corner} 
                                                                                        error_function={thisClass.showNotify_popOut}
                                                                                        callback_carga = {thisClass.set_clase_tabla}
                                                                                  />
                                                                        </MDBTabPane>
                                                                        <MDBTabPane key="2" tabId="2" role="tabpanel">
                                                                                    <TablaDatosDB 
                                                                                        callback_carga = {thisClass.set_clase_tabla}
                                                                                        success_function={thisClass.showNotify_top_corner}
                                                                                        error_function={thisClass.showNotify_popOut}
                                                                                        api_tabla_dato={"talleres"}
                                                                                        datos_tabla_colum={["ID","Curso Pertenece","Nombre Taller","Descripcion Taller","# Cuestionario"]}
                                                                                        msg_eliminacion = {"Taller"}
                                                                                    />
                                                                        </MDBTabPane>
                                                    </MDBTabContent>
                                                </MDBContainer>
                                    </MDBTabPane>
                                    
                                    <MDBTabPane tabId='4' className="perfil_nav_right">
                                                <MDBContainer>
                                                    <MDBNav className="nav-tabs mt-0">
                                                                <MDBNavItem key="1">
                                                                    <MDBNavLink link className="estilo_opciones_derecha" to="#" active={thisClass.state.activeItem_cuestionarios === "1"} onClick={thisClass.toggle_tab_cuestionarios("1")} role="tab" >
                                                                            <span>Agregar Cuestionario</span>
                                                                            <MDBPopover popover className="full_with_popover" clickable placement="bottom" domElement>
                                                                                    <span><MDBIcon icon="question-circle" className="pointer ml-2" /></span>
                                                                                    <div>
                                                                                    <MDBPopoverBody className="text-center">
                                                                                        <span className="text-center pointer">Aquí podra crear un nuevo cuestionario, donde escogera el tipo de pregunta, e ingresar a el tantas preguntas como desee, tenga en cuenta que las imagenes del cuestionario no deberan pesar mas de 2MB, ademas nada quedara guardado hasta que se escoga guardar el cuestionario, las preguntas pertenecen al cuestionario pero estas no se guardan sin el cuestionario en cuestion.</span>
                                                                                    </MDBPopoverBody>
                                                                                    </div>
                                                                            </MDBPopover>
                                                                    </MDBNavLink>
                                                                </MDBNavItem>
                                                                <MDBNavItem key="2">
                                                                    <MDBNavLink link className="estilo_opciones_derecha" to="#" active={thisClass.state.activeItem_cuestionarios === "2"} onClick={thisClass.toggle_tab_cuestionarios("2")} role="tab" >
                                                                            <span>Lista</span>
                                                                            <MDBPopover popover className="full_with_popover" clickable placement="bottom" domElement>
                                                                                    <span><MDBIcon icon="question-circle" className="pointer ml-2" /></span>
                                                                                    <div>
                                                                                    <MDBPopoverBody className="text-center">
                                                                                        <span className="text-center pointer">Aquí podra mirar todos los cuestionarios, asi como eliminarlos, no se acepta la edicion de estos por la naturaleza de datos de los mismos, puede borrar y crear otro si desea hacer un cambio, el buscador unicamente sera por ID de cuestionario</span>
                                                                                    </MDBPopoverBody>
                                                                                    </div>
                                                                            </MDBPopover>
                                                                    </MDBNavLink>
                                                                </MDBNavItem>
                                                        </MDBNav>
                                                        <MDBTabContent activeItem={thisClass.state.activeItem_cuestionarios} >
                                                                            <MDBTabPane key="1" tabId="1" role="tabpanel">
                                                                                    <ModuloCrearCuestionario
                                                                                        success_function={thisClass.showNotify_top_corner} 
                                                                                        error_function={thisClass.showNotify_popOut}    
                                                                                        callback_carga = {thisClass.set_clase_tabla}
                                                                                    />
                                                                            </MDBTabPane>
                                                                            <MDBTabPane key="2" tabId="2" role="tabpanel">
                                                                                        <TablaDatosDB 
                                                                                            callback_carga = {thisClass.set_clase_tabla}
                                                                                            success_function={thisClass.showNotify_top_corner}
                                                                                            error_function={thisClass.showNotify_popOut}
                                                                                            api_tabla_dato={"preguntas_cuestionarios"}
                                                                                            datos_tabla_colum={["ID","# Preguntas","Ejemplo pregunta"]}
                                                                                            msg_eliminacion = {"Cuestionario"}
                                                                                        />
                                                                            </MDBTabPane>
                                                        </MDBTabContent>
                                                </MDBContainer>
                                    </MDBTabPane>
                                    <MDBTabPane tabId='5' className="perfil_nav_right">
                                                <MDBContainer>
                                                    <MDBNav className="nav-tabs mt-0">
                                                                <MDBNavItem key="1">
                                                                    <MDBNavLink link className="estilo_opciones_derecha" to="#" active={thisClass.state.activeItem_matriculas === "1"} onClick={thisClass.toggle_tab_matriculas("1")} role="tab" >
                                                                            <span>Matricular</span>
                                                                            <MDBPopover popover className="full_with_popover" clickable placement="bottom" domElement>
                                                                                    <span><MDBIcon icon="question-circle" className="pointer ml-2" /></span>
                                                                                    <div>
                                                                                    <MDBPopoverBody className="text-center">
                                                                                        <span className="text-center pointer">Aquí podra matricular a un estudiante a un determinado curso, asi como definir la fecha del estudiante de caducidad de acceso a dicho curso, dicha fecha caduca el dia seleccionado a media noche.</span>
                                                                                    </MDBPopoverBody>
                                                                                    </div>
                                                                            </MDBPopover>
                                                                    </MDBNavLink>
                                                                </MDBNavItem>
                                                                <MDBNavItem key="2">
                                                                    <MDBNavLink link className="estilo_opciones_derecha" to="#" active={thisClass.state.activeItem_matriculas === "2"} onClick={thisClass.toggle_tab_matriculas("2")} role="tab" >
                                                                            <span>Lista Matriculas</span>
                                                                            <MDBPopover popover className="full_with_popover" clickable placement="bottom" domElement>
                                                                                    <span><MDBIcon icon="question-circle" className="pointer ml-2" /></span>
                                                                                    <div>
                                                                                    <MDBPopoverBody className="text-center">
                                                                                        <span className="text-center pointer">Aquí podra mirar todos los estudiantes matriculados a que cursos y bien eliminar dicha matricula o editarlo para cambiar su fecha de caducidad, el buscador funciona por email usuario.</span>
                                                                                    </MDBPopoverBody>
                                                                                    </div>
                                                                            </MDBPopover>
                                                                    </MDBNavLink>
                                                                </MDBNavItem>
                                                        </MDBNav>
                                                        <MDBTabContent activeItem={thisClass.state.activeItem_matriculas} >
                                                                            <MDBTabPane key="1" tabId="1" role="tabpanel">
                                                                                    <ModuloCrearMatricula
                                                                                        success_function={thisClass.showNotify_top_corner} 
                                                                                        error_function={thisClass.showNotify_popOut}    
                                                                                        callback_carga = {thisClass.set_clase_tabla}
                                                                                    />
                                                                            </MDBTabPane>
                                                                            <MDBTabPane key="2" tabId="2" role="tabpanel">
                                                                                        <TablaDatosDB 
                                                                                            callback_carga = {thisClass.set_clase_tabla}
                                                                                            success_function={thisClass.showNotify_top_corner}
                                                                                            error_function={thisClass.showNotify_popOut}
                                                                                            api_tabla_dato={"caducidad_cursos"}
                                                                                            datos_tabla_colum={["Usuario","Curso","Fecha Caducidad"]}
                                                                                            msg_eliminacion = {"Matricula"}
                                                                                        />
                                                                            </MDBTabPane>
                                                        </MDBTabContent>
                                                </MDBContainer>
                                    </MDBTabPane>
                                    <MDBTabPane tabId='6' className="perfil_nav_right">
                                                <MDBContainer>
                                                    <MDBNav className="nav-tabs mt-0">
                                                                <MDBNavItem key="1">
                                                                    <MDBNavLink link className="estilo_opciones_derecha" to="#" active={thisClass.state.activeItem_notas === "1"} onClick={thisClass.toggle_tab_notas("1")} role="tab" >
                                                                            <span>Notas globales</span>
                                                                            <MDBPopover popover className="full_with_popover" clickable placement="bottom" domElement>
                                                                                    <span><MDBIcon icon="question-circle" className="pointer ml-2" /></span>
                                                                                    <div>
                                                                                    <MDBPopoverBody className="text-center">
                                                                                        <span className="text-center pointer">Aquí podra mirar el listado de las notas de los estudiantes, en esta tabla se puede filtrar por todas las opciones posibles, por usuarios, por cursos, por talleres, entre otros, esto ayuda a que pueda tener informacion exacta sobre las notas.</span>
                                                                                    </MDBPopoverBody>
                                                                                    </div>
                                                                            </MDBPopover>
                                                                    </MDBNavLink>
                                                                </MDBNavItem>
                                                                <MDBNavItem key="2">
                                                                    <MDBNavLink link className="estilo_opciones_derecha" to="#" active={thisClass.state.activeItem_notas === "2"} onClick={thisClass.toggle_tab_notas("2")} role="tab" >
                                                                            <span>Notas por cursos</span>
                                                                            <MDBPopover popover className="full_with_popover" clickable placement="bottom" domElement>
                                                                                    <span><MDBIcon icon="question-circle" className="pointer ml-2" /></span>
                                                                                    <div>
                                                                                    <MDBPopoverBody className="text-center">
                                                                                        <span className="text-center pointer">Aquí podra mirar las notas de los cursos, es decir el promedio de los mismos, en la primera opcion previa se mira que un curso puede tener 3 talleres o mas y cada uno con su nota, en este apartado unicamente se muestra la nota del curso, ya promediado el numero de talleres que posea ya sea 1,2,8,n.</span>
                                                                                    </MDBPopoverBody>
                                                                                    </div>
                                                                            </MDBPopover>
                                                                    </MDBNavLink>
                                                                </MDBNavItem>
                                                                <MDBNavItem key="3">
                                                                    <MDBNavLink link className="estilo_opciones_derecha" to="#" active={thisClass.state.activeItem_notas === "3"} onClick={thisClass.toggle_tab_notas("3")} role="tab" >
                                                                            <span>No Ingresaron al Sistema</span>
                                                                            <MDBPopover popover className="full_with_popover" clickable placement="bottom" domElement>
                                                                                    <span><MDBIcon icon="question-circle" className="pointer ml-2" /></span>
                                                                                    <div>
                                                                                    <MDBPopoverBody className="text-center">
                                                                                        <span className="text-center pointer">Aquí podra mirar de cada curso, que usuarios que se encuentran matriculados y aun ni ingresan al sistema</span>
                                                                                    </MDBPopoverBody>
                                                                                    </div>
                                                                            </MDBPopover>
                                                                    </MDBNavLink>
                                                                </MDBNavItem>
                                                        </MDBNav>
                                                        <MDBTabContent activeItem={thisClass.state.activeItem_notas} >
                                                                            <MDBTabPane key="1" tabId="1" role="tabpanel">
                                                                                        <TablaDatosDB 
                                                                                            callback_carga = {thisClass.set_clase_tabla}
                                                                                            success_function={thisClass.showNotify_top_corner}
                                                                                            error_function={thisClass.showNotify_popOut}
                                                                                            api_tabla_dato={"notas"}
                                                                                            datos_tabla_colum={["ID nota","Email","Curso","Taller","Nota"]}
                                                                                            msg_eliminacion = {"Notas"}
                                                                                        />
                                                                            </MDBTabPane>
                                                                            <MDBTabPane key="2" tabId="2" role="tabpanel">
                                                                                        <TablaDatosDBCursos 
                                                                                            callback_carga = {thisClass.set_clase_tabla}
                                                                                            success_function={thisClass.showNotify_top_corner}
                                                                                            error_function={thisClass.showNotify_popOut}
                                                                                            api_tabla_dato={"notasv2"}
                                                                                            datos_tabla_colum={["ID nota","Email","Curso","Nota"]}
                                                                                            msg_eliminacion = {"Notas"}
                                                                                        />
                                                                            </MDBTabPane>
                                                                            <MDBTabPane key="3" tabId="3" role="tabpanel">
                                                                                        <TablaDatosNoIngresaron 
                                                                                            callback_carga = {thisClass.set_clase_tabla}
                                                                                            success_function={thisClass.showNotify_top_corner}
                                                                                            error_function={thisClass.showNotify_popOut}
                                                                                            api_tabla_dato={"no_ingresaron"}
                                                                                            datos_tabla_colum={["ID","Email"]}
                                                                                            msg_eliminacion = {"No Ingesaron"}
                                                                                        />
                                                                            </MDBTabPane>
                                                        </MDBTabContent>
                                                </MDBContainer>
                                    </MDBTabPane>
                                </MDBTabContent>
                                    <MDBNotification
                                        show
                                        fade
                                        bodyClassName="p-5 font-weight-bold white-text"
                                        className={`notificaciones stylish-color-dark notificacion_respuesta_formulario align-middle ${thisClass.state.errorForm?"show":"hide"}`}
                                        closeClassName="blue-grey-text cerrando_error"
                                        icon="bell"
                                        iconClassName="blue-grey-text"
                                        title={thisClass.state.title_error_msg}
                                        message={thisClass.state.error_msg}
                                        text="Ahora mismo"
                                        titleClassName="elegant-color-dark white-text"
                                    />

                                    <MDBNotification
                                        autohide={0}
                                        bodyClassName="p-4 font-weight-bold black-text"
                                        className={`notificaciones green green green lighten-2 ${thisClass.state.show_top_corner?"show":"hide"}`}
                                        closeClassName="default-color-dark cerrando_error"
                                        id="cerrable_click_outside"
                                        fade
                                        icon="bell"
                                        iconClassName="white-text"
                                        message={thisClass.state.msg_top_corner}
                                        show
                                        text="Ahora mismo"
                                        title={thisClass.state.title_msg_top_corner}
                                        titleClassName="default-color-dark white-text"
                                        style={{
                                            position: "fixed",
                                            top: "60px",
                                            right: "10px",
                                            zIndex: 9999
                                        }}    
                                    />

                                

                            </MDBCol>
                        </MDBRow>
            );
        }

        if(this.usuario_Logeado()){
            if(this.role_Logeado().localeCompare("admin")===0){
                return (
                    <>
                    <Helmet>
                            <meta charSet="utf-8" />
                            <title>Admin Panel</title>
                            <link rel="canonical" href="https://cursos.kognitivecapsa.com" />
                            <meta name="description" content="Taller de Kognitive Capsa" />
                    </Helmet>
                    <Header/>
                    <main>
                    <MDBContainer className="contenedor_cursos panel_admin_parent my-5">
                            <h1 className="h5 text-center mb-4 titulo_cursos">PANEL ADMINISTRATIVO</h1>
                            {contenido_panel()}
                    </MDBContainer>  
                    </main>
                    <Footer />
                    </>
                  );
            }else {
                return (
                    <>
                    <Helmet>
                            <meta charSet="utf-8" />
                            <title>Cursos Kognitive</title>
                            <link rel="canonical" href="https://cursos.kognitivecapsa.com" />
                            <meta name="description" content="Taller de Kognitive Capsa" />
                    </Helmet>
                    <Header/>
                    <main>
                        <MDBContainer className="contenedor_curso my-5">
                        
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

export default panel_base;