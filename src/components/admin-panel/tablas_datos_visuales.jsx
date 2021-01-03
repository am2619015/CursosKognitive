import React from 'react';
import Base from "../base_loged/base_comun";
import { MDBProgress,MDBCol,MDBIcon,MDBInput,MDBTable,MDBTableHead,MDBTableBody,MDBRow,MDBPagination,MDBPageItem,MDBPageNav,MDBContainer,MDBModal,MDBModalHeader,MDBModalBody,MDBModalFooter,MDBBtn} from "mdbreact";
import axios from 'axios';
import ModuloEditar from "./editar_module";
import ModuloEditarTaller from "./editar_modulo_taller"; // taller no puede ser modular tiene comportamiento de objetos dinamicos necesita su propio objeto

class crear_tabla_datos_db extends Base {

    
    constructor(props){
        super(props);

           this.state = {
            email_admin: this.decencriptado_valores(this.get_usuarioNombre().split("§")[1]),
            thisClass:this,
            errorMysql:false,
            errorMysql_msg:"",
            loading_tabla:false,
            number_pagina_actual:1,
            number_datos_per_pagination:15,
            number_paginas_recorrer:0,
            search_value:"",
            modal3:false,
            usuario_eliminar:"",
            eliminando_usuario:false,
            datos_lista_pagina:[],
            dato_editar:"",
            editando_dato:false,
            arreglo_construir_editar:[],
            buscador_notas_by:"0"
           }


           this.handle_load_pagina = this.handle_load_pagina.bind(this);
           this.get_datos_pagina_actual = this.get_datos_pagina_actual.bind(this);
           this.atras_paginacion_button = this.atras_paginacion_button.bind(this);
           this.adelante_paginacion_button = this.adelante_paginacion_button.bind(this);
           this.handle_search_datos = this.handle_search_datos.bind(this);
           this.handleSearchUp = this.handleSearchUp.bind(this);
           this.get_Inputs_Values = this.get_Inputs_Values.bind(this);
           this.handle_eliminar_dato_tabla = this.handle_eliminar_dato_tabla.bind(this);
           this.togle_modal_delete_dato = this.togle_modal_delete_dato.bind(this);
           this.handle_editar_datos_tabla = this.handle_editar_datos_tabla.bind(this);
           this.callback_module_editar = this.callback_module_editar.bind(this);


    }


    /// al inicio establecemos en nombre de la clase para que se pueda usar el callback_start_component desde quien lo llama
    componentDidMount(){
        this.showMsg("Objeto tabla curso cargado con columns "+this.props.api_tabla_dato);
        //// ------------------------------------------------------se aumentara para proximos typos a futuro sera necesario editar especificando los inputs
        switch(this.props.api_tabla_dato){
            case "users":
                this.props.callback_carga(this,"claseTabla_estudiantes");
                this.state.arreglo_construir_editar.push("email╚Email","text╚Nombres","text╚Apellidos","number╚Telefono");
            break;

            case "cursos":
                this.props.callback_carga(this,"claseTabla_cursos");
                this.state.arreglo_construir_editar.push("text╚Titulo","textarea╚Descripcion","file╚ImagenCurso|image/x-png,image/jpeg");
            break;

            case "talleres":
                this.props.callback_carga(this,"claseTabla_talleres");
                //this.state.arreglo_construir_editar.push("text╚Titulo","textarea╚Descripcion","file╚ImagenCurso|image/x-png,image/jpeg");
                /// talleres tienen su propio modulo de edicion
            break;

            case "preguntas_cuestionarios":
                this.props.callback_carga(this,"claseTabla_cuestionarios");
                //this.state.arreglo_construir_editar.push("text╚Titulo","textarea╚Descripcion","file╚ImagenCurso|image/x-png,image/jpeg");
                /// cuestionarios no son editables por su estructura
            break;

            case "caducidad_cursos":
                this.props.callback_carga(this,"claseTabla_matriculas");
                this.state.arreglo_construir_editar.push("date╚Caducidad Curso");
            break;

            case "notas":
                this.props.callback_carga(this,"claseTabla_notas");
            break;
            

            default:
                this.showMsg("callback inexistente para llamar ERROR mirar esto en tablas_datos_visuales "+this.props.api_tabla_dato);
        }
        
    }

    //// al destruir el objeto limpiamos los arreglos
    componentWillUnmount(){
        this.setState({
            datos_lista_pagina : [],
            arreglo_construir_editar : []
        });
    }

    /// callback que inicia todo el funcionamiento de la tabla es disparado desde quien lo llama, es decir que esta el objeto cargado pero dormido hasta que lo activa quien lo instancia
    callback_start_component = () =>{
        this.showMsg("llamado evento inicializar disparado desde padre que llama objeto");
        this.handle_load_pagina();
    }



    //// se llama al cargar los datos de la base de datos totales /////
    handle_load_pagina = () => {
        this.showMsg("cargando datos db tabla totales");

        var email_admin_t = this.state.email_admin;
        var datos_pag = this.state.number_datos_per_pagination;

        const thisClass=this;
        
        const user= {
            email_admin: email_admin_t,
            datos_por_pagina:datos_pag,
            tipo_tabla:this.props.api_tabla_dato
        };


        async function msg_error_inicial(value,titulo,msg) {
            return await Promise.resolve(thisClass.props.error_function(value,titulo,msg));
        };
    
        async function estados_iniciales() {
            return await Promise.resolve(thisClass.setState({
                loading_tabla:true,
                number_pagina_actual:1,
                search_value:""
            }));
        }

        msg_error_inicial(false,"","").then(function(){
            estados_iniciales().then(process_resolving());
        });


        function process_resolving(){
                    axios.post(`${thisClass.get_ip_server()}/apis/admin_panel/get_number_pagination.php`, { user })
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
                                                                    loading_tabla:false
                                                                    });

                                                                    thisClass.props.error_function(true,"Error",thisClass.state.errorMysql_msg); 

                                                                }else if(res.data.mensaje==="correcto"){
            
                                                                    
                                                                    //var datos = JSON.parse(res.data.codigoHTML);
            
                                                                    thisClass.showMsg("datos recibidos "+res.data.codigoHTML.split('╚')[1]);
            
                                                                    thisClass.setState({
                                                                        errorMysql:false,
                                                                        errorMysql_msg:res.data.codigoHTML,
                                                                        loading_tabla:true,
                                                                        number_paginas_recorrer:res.data.codigoHTML.split('╚')[1]
                                                                    });


                                                                    thisClass.get_datos_pagina_actual();

                                                                    
            
                                                                }
                                                        
                                                        }).catch((error) => {
                                                            thisClass.showMsg("error de "+error);
                                                            thisClass.setState({
                                                                    errorMysql:true,
                                                                    errorMysql_msg:"No se pudo contactar con el servidor",
                                                                    loading_tabla:false
                                                                });

                                                            thisClass.props.error_function(true,"Error",thisClass.state.errorMysql_msg); 
                                                        }); 
         }


    }



    /// consigue datos de db de acuerdo a la pagina y es llamado en 2 casos al iniciar o al usar el buscador
    get_datos_pagina_actual = () => {
            
        const thisClass=this;

        var email_admin_t = this.state.email_admin;
        var datos_pag = this.state.number_datos_per_pagination;
        var p_act = this.state.number_pagina_actual;

        this.showMsg("Procediendo a obtener la lista de la tabla de dichos datos pag ="+this.state.number_pagina_actual);

        const user= {
            email_admin: email_admin_t,
            datos_por_pagina:datos_pag,
            pagina_actual:p_act,
            tipo_tabla:this.props.api_tabla_dato
        };


        async function msg_error_inicial(value,titulo,msg) {
            return await Promise.resolve(thisClass.props.error_function(value,titulo,msg));
        };
    
        async function estados_iniciales() {
            return await Promise.resolve(thisClass.setState({
                datos_lista_pagina : []
            }));
        }

        msg_error_inicial(false,"","").then(function(){
            estados_iniciales().then(process_resolving());
        });


        function process_resolving(){
                axios.post(`${thisClass.get_ip_server()}/apis/admin_panel/get_datos_from_pagination.php`, { user })
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
                                                                            loading_tabla:false
                                                                            });

                                                                            thisClass.props.error_function(true,"Error",thisClass.state.errorMysql_msg); 

                                                                        }else if(res.data.mensaje==="correcto"){
                    
                                                                            
                                                                            //var datos = JSON.parse(res.data.codigoHTML);
                    
                                                                        

                                                                            var datos_obtenidos = JSON.parse(res.data.codigoHTML);

                                                                            datos_obtenidos.forEach(element => {
                                                                                            thisClass.state.datos_lista_pagina.push(element);
                                                                                        });
                                                                                    
                                                                                        thisClass.showMsg("usuarios recibidos");
                    
                                                                                        thisClass.setState({
                                                                                errorMysql:false,
                                                                                errorMysql_msg:res.data.codigoHTML,
                                                                                loading_tabla:false
                                                                            });

                                                                            
                    
                                                                        }
                                                                
                                                                }).catch((error) => {
                                                                        thisClass.showMsg("error de "+error);
                                                                        thisClass.setState({
                                                                            errorMysql:true,
                                                                            errorMysql_msg:"No se pudo contactar con el servidor",
                                                                            loading_tabla:false
                                                                        });

                                                                        thisClass.props.error_function(true,"Error",thisClass.state.errorMysql_msg); 
                                                                });
         } 
    }


       //// handler de paginacion estudiantes atras y siguiente 

       atras_paginacion_button = () =>{
        this.showMsg("Atras paginacion");
        const thisClass=this;

        async function estados_iniciales() {
            return await Promise.resolve(thisClass.setState({
                number_pagina_actual: thisClass.state.number_pagina_actual-1,
                loading_tabla:true
            }));
        }

        estados_iniciales().then(function(){
            thisClass.get_datos_pagina_actual();
        });  
    }

    adelante_paginacion_button = () =>{
        this.showMsg("Adelante paginacion");
        const thisClass=this;

        async function estados_iniciales() {
            return await Promise.resolve(thisClass.setState({
                number_pagina_actual: thisClass.state.number_pagina_actual+1,
                loading_tabla:true
            }));
        }

        estados_iniciales().then(function(){
            thisClass.get_datos_pagina_actual();
        });
    }


    ////// handle search bar on user_list

    handle_search_datos = () => {

        const thisClass=this;

        async function msg_error_inicial(value,titulo,msg) {
            return await Promise.resolve(thisClass.props.error_function(value,titulo,msg));
        };
    
        async function estados_iniciales() {
            return await Promise.resolve(thisClass.setState({
                loading_tabla:true,
                datos_lista_pagina:[]
            }));
        }

        var valor_introducido = this.state.search_value.trim();
        this.showMsg("usuario a buscar = "+valor_introducido);
        if(valor_introducido.localeCompare("")!==0){
            ////////////// aqui se realiza la busqueda /////////
            this.showMsg("valor a buscar de "+valor_introducido);

            msg_error_inicial(false,"","").then(function(){
                estados_iniciales().then(process_resolving());
            });

        }else{
            this.showMsg("sin datos introducidos no se realiza nada");
        }


        function process_resolving(){

            var email_admin_t = thisClass.state.email_admin;
            var datos_pag = thisClass.state.number_datos_per_pagination;

            thisClass.showMsg("Procediendo a obtener la lista de la tabla de dichos estudiantes pag ="+thisClass.state.number_pagina_actual);


            const user= {
                email_admin: email_admin_t,
                datos_por_pagina:datos_pag,
                patern_search:valor_introducido,
                tipo_tabla:thisClass.props.api_tabla_dato,
                buscador_notas_by:thisClass.state.buscador_notas_by
            };

            

            
            axios.post(`${thisClass.get_ip_server()}/apis/admin_panel/get_datos_from_search.php`, { user })
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
                                                                        loading_tabla:false
                                                                        });

                                                                        thisClass.props.error_function(true,"Error",thisClass.state.errorMysql_msg); 

                                                                    }else if(res.data.mensaje==="correcto"){
                
                                                                        
                                                                        //var datos = JSON.parse(res.data.codigoHTML);
                
                                                                    

                                                                        var datos_obtenidos = JSON.parse(res.data.codigoHTML);

                                                                        datos_obtenidos.forEach(element => {
                                                                                        thisClass.state.datos_lista_pagina.push(element);
                                                                                    });
                                                                                
                                                                        thisClass.showMsg("usuarios recibidos");
                
                                                                        thisClass.setState({
                                                                            errorMysql:false,
                                                                            errorMysql_msg:res.data.codigoHTML,
                                                                            loading_tabla:false
                                                                        });

                                                                        
                
                                                                    }
                                                            
                                                            }).catch((error) => {
                                                                thisClass.showMsg("error de "+error);
                                                                thisClass.setState({
                                                                        errorMysql:true,
                                                                        errorMysql_msg:"No se pudo contactar con el servidor",
                                                                        loading_tabla:false
                                                                    });

                                                                thisClass.props.error_function(true,"Error",thisClass.state.errorMysql_msg); 
                                                            }); 

        }


    }


    /// cuando borro lo buscado si resulta que es en blanco lo quito
    handleSearchUp = (e) => {
        var valor_introducido = this.state.search_value.trim();
        //this.showMsg("key released = "+valor_introducido);
        if(valor_introducido.localeCompare("")===0){
            e.target.value = "";
            this.handle_load_pagina();
        }else{
            if (e.keyCode === 13) {
                this.showMsg("Presionado enter en buscador");
                this.handle_search_datos();
            }
        }
    }

    /// guarda en estados los values de inputs como el search
    get_Inputs_Values = (value, type) =>{
        // this.showMsg("valor de "+value+" = "+type);
         this.setState({
         [type]: value
         });
     }
    

     //////////////// eliminado de la tabla funcionamiento ////

     /// llamado desde la tabla
     handle_eliminar_dato_tabla = (e) =>{
        

        this.setState({
            usuario_eliminar:e.target.id
        });

            this.showMsg("Handle eliminar user de id "+this.state.usuario_eliminar);

            this.togle_modal_delete_dato();

    }

    //// activa visualmente interfaz confirmacion de borrado
    togle_modal_delete_dato = () => {
        //let modalNumber = 'modal' + nr
        if(!this.state.modal3){
            this.props.success_function(false,"","");
        }
        this.setState({
            modal3:this.state.modal3?false:true
        });
      }

    //// si se confirma el borrado sucede lo siguiente

    confirmado_delete = () => {

        const thisClass=this;

        async function msg_error_inicial(value,titulo,msg) {
            return await Promise.resolve(thisClass.props.error_function(value,titulo,msg));
          };
        async function msg_success_inicial(value,titulo,msg) {
            return await Promise.resolve(thisClass.props.success_function(value,titulo,msg));
          };
    
        async function estados_iniciales() {
            return await Promise.resolve(thisClass.setState({
                eliminando_usuario:true
            }));
          }


        if(this.state.usuario_eliminar.trim().localeCompare("")!==0){
            this.showMsg("Procediendo a eliminar "+this.state.usuario_eliminar);

            var email_admin_t = this.state.email_admin;
            var id_user_t = this.state.usuario_eliminar;

            msg_error_inicial(false,"","").then(function(){
                msg_success_inicial(false,"","").then(function(){
                    estados_iniciales().then(process_resolving());
                });
            });


            //cambiar por axios
            function process_resolving(){

                    const user= {
                        email_admin: email_admin_t,
                        id_user: id_user_t,
                        tipo_tabla:thisClass.props.api_tabla_dato
                    };
        
                    
                    axios.post(`${thisClass.get_ip_server()}/apis/admin_panel/delete_datos_by_id.php`, { user })
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
                                                                                eliminando_usuario:false
                                                                                });
        
                                                                                thisClass.props.error_function(true,"Error",thisClass.state.errorMysql_msg); 
        
                                                                            }else if(res.data.mensaje==="correcto"){
                        
                                                                                /// resultado si es correcta

                                                                                thisClass.setState({
                                                                                    usuario_eliminar:"",
                                                                                    errorMysql:false,
                                                                                    errorMysql_msg:res.data.codigoHTML,
                                                                                    eliminando_usuario:false
                                                                                });
                                                                                
                                                                                thisClass.togle_modal_delete_dato();
                                                                                thisClass.props.success_function(true,"Eliminado","Usuario Eliminado Correctamente");
        
                                                                                thisClass.handle_load_pagina();
                        
                                                                            }
                                                                    
                                                                    }).catch((error) => {
                                                                            thisClass.showMsg("error de "+error);
                                                                            thisClass.setState({
                                                                                errorMysql:true,
                                                                                errorMysql_msg:"No se pudo contactar con el servidor",
                                                                                eliminando_usuario:false
                                                                            });
        
                                                                            thisClass.props.error_function(true,"Error",thisClass.state.errorMysql_msg); 
                                                                    }); 
            }
            
        }
    }



    //// handle editar de la tabla

    handle_editar_datos_tabla = (e) =>{
        this.showMsg("Handle editar dato de id "+e.target.id);
        this.setState({
            dato_editar:e.target.id,
            editando_dato:true
        });
    }

    // callback de cerrado modulo llamado desde otro objeto

    callback_module_editar = (accion,msg) =>{
        const thisClass=this;

        this.showMsg("callback corriendo desde pane_base al cerrar modal editar = "+accion+" - "+msg);

        async function msg_error_inicial(value,titulo,msg) {
            return await Promise.resolve(thisClass.props.error_function(value,titulo,msg));
          };
        async function msg_success_inicial(value,titulo,msg) {
            return await Promise.resolve(thisClass.props.success_function(value,titulo,msg));
          };
    
        async function estados_iniciales() {
            return await Promise.resolve(thisClass.setState({
                editando_dato:false,
                dato_editar:""
            }));
        }
    
        msg_error_inicial(false,"","").then(function(){
            msg_success_inicial(false,"","").then(function(){
                estados_iniciales().then(process_resolving());
            });
        });
        
       function process_resolving(){
            if(accion.localeCompare("Cancel")===0){
                thisClass.showMsg("No se hace nada se cancelo el editar");
            }else if(accion.localeCompare("Incorrecto")===0){
                thisClass.props.error_function(true,"Error Editar",msg);
            }else if(accion.localeCompare("Correcto")===0){
                thisClass.props.success_function(true,"",msg);
                thisClass.handle_load_pagina();
            }
       } 
    }


      //// handlers para distintos tipos de datos algunos dinamicos son para selects,checkbox e inputs de files
  handleChange_selects = (e) => {
    let {name, value} = e.target;
    this.setState({
    [name]: value
    });

    this.handle_load_pagina();
}
    



    /// renderizado del componente 
    render = () =>{

        const {thisClass } = this.state;

        //// visualmente datos de la tabla
        function tabla_cargar_visual(){

            var d_pag = [];

            thisClass.state.datos_lista_pagina.map((value,key) => (
                d_pag.push(<tr key={key} className="col-lg-4 col-md-6 contenedor_taller">
                        {thisClass.props.datos_tabla_colum.map((v,k)=> (
                            <td key={k}>{value[k]}</td>
                        ))}
                        
                        {thisClass.props.api_tabla_dato.localeCompare("caducidad_cursos")===0?
                         <>
                            <td><span id={value[0].split(")")[0].substring(2,value[0].split(")")[0].lenght)+"╚"+value[1].split(")")[0].substring(2,value[1].split(")")[0].lenght)}  onClick={thisClass.handle_editar_datos_tabla} className={`font-weight-bold mt-0 opciones_edit_delete ${thisClass.props.api_tabla_dato.localeCompare("preguntas_cuestionarios")===0?"disabled grey-text":"blue-text"} ${thisClass.props.api_tabla_dato.includes("notas")?"disabled grey-text":""}`}>Editar</span></td>    
                            <td><span id={value[0].split(")")[0].substring(2,value[0].split(")")[0].lenght)+"╚"+value[1].split(")")[0].substring(2,value[1].split(")")[0].lenght)}  onClick={thisClass.handle_eliminar_dato_tabla} className={`font-weight-bold mt-0 blue-text opciones_edit_delete ${thisClass.state.modal3?"eliminar_disabled":""}`}>Eliminar</span></td>
                         </>
                        :
                        <>
                            <td><span id={value[0]}  onClick={thisClass.handle_editar_datos_tabla} className={`font-weight-bold mt-0 opciones_edit_delete ${thisClass.props.api_tabla_dato.localeCompare("preguntas_cuestionarios")===0?"disabled grey-text":"blue-text"} ${thisClass.props.api_tabla_dato.includes("notas")?"disabled grey-text":""}`}>Editar</span></td>
                            <td><span id={value[0]}  onClick={thisClass.handle_eliminar_dato_tabla} className={`font-weight-bold mt-0 blue-text opciones_edit_delete ${thisClass.state.modal3?"eliminar_disabled":""}`}>Eliminar</span></td>   
                        </>
                        }
                       
                    </tr>)
            ));

            return(
                <>
                    <MDBCol md="12">
                        
                        {thisClass.props.api_tabla_dato.includes("notas")?
                        <MDBRow className="pt-2">
                                <MDBCol size="12" md="6" className="text-right justify-content-center align-self-center">
                                    <div className="padreSelects_notasby">
                                            <select  name="buscador_notas_by" className="browser-default custom-select" 
                                            onChange={thisClass.handleChange_selects}
                                            value={thisClass.state.buscador_notas_by}
                                            >
                                            <option value="0">Busqueda por estudiante (email) :</option>
                                            <option value="1">Busqueda por cursos (nombre) :</option>
                                            <option value="2">Busqueda por cursos (ID) :</option>
                                            <option value="3">Busqueda por talleres (nombre):</option>
                                            <option value="4">Busqueda por talleres (ID):</option>
                                            <option value="5">Busqueda por ID nota:</option>
                                            </select>
                                    </div>
                                </MDBCol>
                                    <MDBCol size="12" md="6">
                                        <div className="form-inline mt-2 mb-4 formulario_search_notas d-flex align-items-center justify-content-end">
                                            <MDBIcon icon="search" className="icono_busqueda" onClick={thisClass.handle_search_datos}/>
                                            <MDBInput className="form-control form-control-sm ml-3 w-100 test" 
                                                getValue={value => thisClass.get_Inputs_Values(value, "search_value")} 
                                                value={thisClass.state.search_value}
                                                onKeyUp={thisClass.handleSearchUp} 
                                                type="text" placeholder="Buscar por email" aria-label="Search" />
                                        </div>   
                                </MDBCol>
                            </MDBRow>
                            :
                            <div className="form-inline mt-2 mb-4 formulario_search d-flex align-items-center justify-content-end">
                                            <MDBIcon icon="search" className="icono_busqueda" onClick={thisClass.handle_search_datos}/>
                                            <MDBInput className="form-control form-control-sm ml-3 w-100 test" 
                                                getValue={value => thisClass.get_Inputs_Values(value, "search_value")} 
                                                value={thisClass.state.search_value}
                                                onKeyUp={thisClass.handleSearchUp} 
                                                type="text" placeholder="Buscar por email" aria-label="Search" />
                            </div>
                            }
                        
                    </MDBCol>
                    <MDBTable className="mt-4 tabla_estudiantes text-center">
                        <MDBTableHead color="primary-color" textWhite>
                            <tr>
                            {thisClass.props.datos_tabla_colum.map((v,k)=> (
                                <th key={k}>{v}</th>
                            ))}
                            <th>Editar</th>
                            <th>Eliminar</th>
                            </tr>
                        </MDBTableHead>
                        <MDBTableBody>
                            {d_pag}
                        </MDBTableBody>
                    </MDBTable>

                    <MDBRow>
                        <MDBCol md="12">
                            <MDBPagination className={`mb-5 justify-content-center ${thisClass.state.search_value.trim().localeCompare("")===0?"":"disabled_pagination"}`}>

                                {thisClass.state.number_pagina_actual === 1 || thisClass.state.loading_tabla===true ?
                                <MDBPageItem disabled className = "pagina_actual_estilo" onClick={thisClass.atras_paginacion_button}>
                                    <MDBPageNav aria-label="Previous">
                                    <span aria-hidden="true">Anterior</span>
                                    </MDBPageNav>
                                </MDBPageItem>
                                : 
                                <MDBPageItem className = "pagina_actual_estilo" onClick={thisClass.atras_paginacion_button}>
                                    <MDBPageNav aria-label="Previous">
                                    <span aria-hidden="true">Anterior</span>
                                    </MDBPageNav>
                                </MDBPageItem>}
                            
                                

                            <MDBPageItem className="ml-4 mr-4">
                                <span className="pagina_actual_estilo" >Paguina: {thisClass.state.number_pagina_actual}/{thisClass.state.number_paginas_recorrer}</span>
                            </MDBPageItem>
                            
                            {thisClass.state.number_pagina_actual >= thisClass.state.number_paginas_recorrer || thisClass.state.loading_tabla===true ?
                                <MDBPageItem disabled className = "pagina_actual_estilo" onClick={thisClass.adelante_paginacion_button}>
                                    <MDBPageNav  aria-label="Previous">
                                    <span aria-hidden="true">Siguiente</span>
                                    </MDBPageNav>
                                </MDBPageItem>
                            :   
                                <MDBPageItem className = "pagina_actual_estilo" onClick={thisClass.adelante_paginacion_button}>
                                    <MDBPageNav aria-label="Previous">
                                    <span aria-hidden="true">Siguiente</span>
                                    </MDBPageNav>
                                </MDBPageItem>
                            }
                            </MDBPagination>
                        </MDBCol>
                        
                        
                        <MDBContainer>
                            <MDBModal modalStyle="danger" className="text-white" size="sm" side position="top-right" backdrop={true} isOpen={thisClass.state.modal3}
                            toggle={thisClass.togle_modal_delete_dato}>
                            <MDBModalHeader className="text-center" titleClass="w-100" tag="p" toggle={thisClass.togle_modal_delete_dato}>
                                Seguro que desea eliminar {thisClass.props.msg_eliminacion} #{thisClass.state.usuario_eliminar}
                            </MDBModalHeader>
                            <MDBModalBody className="text-center">
                                <MDBIcon icon="times" size="4x" className="animated pulse infinite" />
                            </MDBModalBody>
                            <MDBModalFooter className="justify-content-center">
                                <MDBBtn color="danger" className={thisClass.state.eliminando_usuario?"disabled":""} onClick={thisClass.confirmado_delete}>SI</MDBBtn>
                                <MDBBtn color="danger" outline className={thisClass.state.eliminando_usuario?"disabled":""} onClick={thisClass.togle_modal_delete_dato}>NO</MDBBtn>
                            </MDBModalFooter>
                            </MDBModal>
                        </MDBContainer>
                            

                        {thisClass.state.editando_dato?
                                        thisClass.props.api_tabla_dato.localeCompare("talleres")===0?
                                            <ModuloEditarTaller
                                            dato_id={thisClass.state.dato_editar} 
                                            callback_closed={thisClass.callback_module_editar}
                                            inputs_datos={thisClass.state.arreglo_construir_editar}
                                            typo_edicion={thisClass.props.api_tabla_dato}
                                            nombre_visualtypo={thisClass.props.msg_eliminacion}
                                            error_function={thisClass.props.error_function}
                                            />
                                        :
                                        <ModuloEditar 
                                        dato_id={thisClass.state.dato_editar} 
                                        callback_closed={thisClass.callback_module_editar}
                                        inputs_datos={thisClass.state.arreglo_construir_editar}
                                        typo_edicion={thisClass.props.api_tabla_dato}
                                        nombre_visualtypo={thisClass.props.msg_eliminacion}
                                        error_function={thisClass.props.error_function}
                                        />
                        :
                            <></>
                        }


                    </MDBRow>

                </>
            );
        }

        return(
        this.state.loading_tabla
               ?
                <div className="mt-4">
                    <span className="titulo_carga_bar">Cargando ...</span>
                        <MDBProgress className="my-2 progress_bar_infinite" material value={40} height="10px" color="light-blue darken-1" />
                </div>
                :
                tabla_cargar_visual()
        );
    }

}

export default crear_tabla_datos_db;