import React from 'react';
import Base from "../base_loged/base_comun";
import { MDBProgress,MDBCol,MDBIcon,MDBInput,MDBTable,MDBTableHead,MDBTableBody,MDBRow,MDBPagination,MDBPageItem,MDBPageNav,MDBContainer,MDBModal,MDBModalHeader,MDBModalBody} from "mdbreact";
import axios from 'axios';

class tabla_datos_picker extends Base {

    
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
            datos_lista_pagina:[],
            arreglo_construir_editar:[],
            modal8:false
           }


           this.handle_load_pagina = this.handle_load_pagina.bind(this);
           this.get_datos_pagina_actual = this.get_datos_pagina_actual.bind(this);
           this.atras_paginacion_button = this.atras_paginacion_button.bind(this);
           this.adelante_paginacion_button = this.adelante_paginacion_button.bind(this);
           this.handle_search_datos = this.handle_search_datos.bind(this);
           this.handleSearchUp = this.handleSearchUp.bind(this);
           this.get_Inputs_Values = this.get_Inputs_Values.bind(this);
           this.handlePickerUsuario = this.handlePickerUsuario.bind(this);


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
            break;

            case "preguntas_cuestionarios":
                this.props.callback_carga(this,"claseTabla_cuestionarios");
                //this.state.arreglo_construir_editar.push("text╚Titulo","textarea╚Descripcion","file╚ImagenCurso|image/x-png,image/jpeg");
            break;

            case "caducidad_cursos":
                this.props.callback_carga(this,"claseTabla_matriculas");
                //this.state.arreglo_construir_editar.push("text╚Titulo","textarea╚Descripcion","file╚ImagenCurso|image/x-png,image/jpeg");
            break;

            default:
                this.showMsg("callback inexistente para llamar ERROR mirar esto en tablas_datos_visuales (picker) para "+this.props.api_tabla_dato);
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
                search_value:"",
                modal8:true
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
                tipo_tabla:thisClass.props.api_tabla_dato
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
    

    /// funcion que abre o cierra el modal
    toogle_modal_userPicker = () => {
        this.setState({
            modal8: this.state.modal8?false:true
        });

        if(this.state.modal8){
            this.showMsg("procediendo a cerrar modal");
            this.props.estudiante_picker("");
        }

        }

    ///// handle eleccion usuario picker 


    handlePickerUsuario = (e) =>{
        this.showMsg("se selecciono usuario "+e.target.id);
        const thisClass=this;
        const id_usuario=e.target.id;
        async function cerrando_modal(){
            return await Promise.resolve(thisClass.toogle_modal_userPicker());
        }

        cerrando_modal().then(function(){
            setEstudianteSeleccionado();
        })
        
        function setEstudianteSeleccionado(){
            thisClass.props.estudiante_picker(id_usuario);
        }
        
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
                        <td><span id={value[0]}  className="font-weight-bold mt-0 opciones_edit_delete" onClick={thisClass.handlePickerUsuario}>Seleccionar</span></td>
                    </tr>)
            ));

            return(
                <MDBContainer>
                    <MDBCol md="12">
                        <div className="form-inline mt-2 mb-4 formulario_search d-flex align-items-center justify-content-end">
                            <MDBIcon icon="search" className="icono_busqueda" onClick={thisClass.handle_search_datos}/>
                            <MDBInput className="form-control form-control-sm ml-3 w-100" 
                                getValue={value => thisClass.get_Inputs_Values(value, "search_value")} 
                                value={thisClass.state.search_value}
                                onKeyUp={thisClass.handleSearchUp} 
                                type="text" placeholder="Buscar por email" aria-label="Search" />
                        </div>
                    </MDBCol>
                    <MDBTable className="mt-4 tabla_estudiantes text-center">
                        <MDBTableHead color="primary-color" textWhite>
                            <tr>
                            {thisClass.props.datos_tabla_colum.map((v,k)=> (
                                <th key={k}>{v}</th>
                            ))}
                            <th>Seleccionar</th>
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
                    </MDBRow>
                </MDBContainer>            
            );
        }

        return(
            <MDBContainer className="padre_modal_tablePicker">
                <MDBModal className="modal-dialog-centered w-100 max_width_content" isOpen={thisClass.state.modal8} toggle={thisClass.toogle_modal_userPicker}>
                    <MDBModalHeader className="text-center" titleClass="w-100 font-weight-bold" toggle={thisClass.toogle_modal_userPicker}>Escoger Estudiante</MDBModalHeader>
                        <MDBModalBody className="ml-2 mr-2 w-100">     
                        {this.state.loading_tabla
                        ?
                            <div className="mt-4">
                                <span className="titulo_carga_bar">Cargando ...</span>
                                    <MDBProgress className="my-2 progress_bar_infinite" material value={40} height="10px" color="light-blue darken-1" />
                            </div>
                            :
                            tabla_cargar_visual()
                        }
                        </MDBModalBody>  
                    </MDBModal> 
                </MDBContainer> 
        );
    }

}

export default tabla_datos_picker;