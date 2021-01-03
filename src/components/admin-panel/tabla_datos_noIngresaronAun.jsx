import React from 'react';
import Base from "../base_loged/base_comun";
import { MDBProgress,MDBTable,MDBTableHead,MDBTableBody} from "mdbreact";
import axios from 'axios';

class crear_tabla_datos_db_noIngresaron extends Base {

    
    constructor(props){
        super(props);

           this.state = {
            email_admin: this.decencriptado_valores(this.get_usuarioNombre().split("§")[1]),
            thisClass:this,
            errorMysql:false,
            errorMysql_msg:"",
            loading_tabla:false,
            modal3:false,
            usuario_eliminar:"",
            eliminando_usuario:false,
            datos_lista_pagina:[],
            datos1:[],
            select_cursos:""
           }
    }


    /// al inicio establecemos en nombre de la clase para que se pueda usar el callback_start_component desde quien lo llama
    componentDidMount(){
        this.showMsg("Objeto tabla no ingresaron cargado con columns "+this.props.api_tabla_dato);
        //// ------------------------------------------------------se aumentara para proximos typos a futuro sera necesario editar especificando los inputs
        switch(this.props.api_tabla_dato){
            case "no_ingresaron":
                this.props.callback_carga(this,"claseTabla_noIngresaron");
            break;

            default:
                this.showMsg("callback inexistente para llamar ERROR mirar esto en tablas_datos_visuales "+this.props.api_tabla_dato);
        }
        
    }

    //// al destruir el objeto limpiamos los arreglos
    componentWillUnmount(){
        this.setState({
            datos_lista_pagina : [],
            datos1:[]
        });
    }

    /// callback que inicia todo el funcionamiento de la tabla es disparado desde quien lo llama, es decir que esta el objeto cargado pero dormido hasta que lo activa quien lo instancia
    callback_start_component = () =>{
        this.showMsg("llamado evento inicializar disparado desde padre que llama objeto");
        this.handle_get_datos_crear_tabla();
    }




    ///// al iniciar el objeto instanciado ya se piden los datos asyincronamente, estos datos son necesarios para construir la tabla
handle_get_datos_crear_tabla = () => {
    this.showMsg("----> obteniendo los datos para poder crear el taller");
    
    const thisClass=this;

    const user= {
        email_admin : this.state.email_admin,
    };

    async function msg_error_inicial(value,titulo,msg) {
        return await Promise.resolve(thisClass.props.error_function(value,titulo,msg));
      };
    async function msg_success_inicial(value,titulo,msg) {
        return await Promise.resolve(thisClass.props.success_function(value,titulo,msg));
      };

      async function estados_iniciales() {
        return await Promise.resolve(thisClass.setState({
            loading_tabla:true,
            datos1:[]
        }));
      }

    msg_error_inicial(false,"","").then(function(){
        msg_success_inicial(false,"","").then(function(){
            estados_iniciales().then(process_resolving());
        });
    });


    function process_resolving(){

                axios.post(`${thisClass.get_ip_server()}/apis/admin_panel/get_datos_crear_taller.php`, { user })
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

                                                            thisClass.props.error_function(true,"Error",res.data.codigoHTML);

                                                        }else if(res.data.mensaje==="correcto"){

                                                            var datos1 = JSON.parse(res.data.codigoHTML);

                                                                

                                                                datos1.forEach(element => {
                                                                    thisClass.state.datos1.push(element);
                                                                });

                                                                thisClass.setState({
                                                                    errorMysql:false,
                                                                    errorMysql_msg:res.data.codigoHTML,
                                                                    loading_tabla:true,
                                                                    select_cursos:datos1[0][0]
                                                                });

                                                               // thisClass.showMsg("------------------------>"+datos1[0][0])
                                                                if(thisClass.state.select_cursos.trim().localeCompare("")!==0 && 
                                                                                thisClass.state.select_cursos.trim().localeCompare("0")!==0){
                                                                                        thisClass.get_datos_pagina_actual();
                                                                                }

                                                                
                                                            //console.log("datos 1 de"+thisClass.state.datos1);
                                                            //console.log("datos 2 de"+thisClass.state.datos2);

                                                        }
                                                
                                                }).catch((error) => {
                                                    thisClass.showMsg("error de "+error);
                                                    thisClass.setState({
                                                            errorMysql:true,
                                                            errorMysql_msg:"No se pudo contactar con el servidor",
                                                            loading_tabla:false
                                                        });

                                                        thisClass.props.error_function(true,"Error","No se pudo contactar con el servidor");
                                                });

        }
  }




    //// se llama al cargar los datos de la base de datos totales /////
    get_datos_pagina_actual = () => {
            
        const thisClass=this;

        var email_admin_t = this.state.email_admin;

        this.showMsg("Procediendo a obtener la lista de la tabla de dichos datos pag ="+this.props.api_tabla_dato);

        const user= {
            email_admin: email_admin_t,
            tipo_tabla:this.props.api_tabla_dato,
            curso_buscar:this.state.select_cursos
        };


        async function msg_error_inicial(value,titulo,msg) {
            return await Promise.resolve(thisClass.props.error_function(value,titulo,msg));
        };
    
        async function estados_iniciales() {
            return await Promise.resolve(thisClass.setState({
                datos_lista_pagina : [],
                loading_tabla:true
            }));
        }

        msg_error_inicial(false,"","").then(function(){
            estados_iniciales().then(process_resolving());
        });


        function process_resolving(){
                axios.post(`${thisClass.get_ip_server()}/apis/admin_panel/get_datos_no_ingresaronCurso.php`, { user })
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
                                                                                    
                                                                                        thisClass.showMsg("usuarios recibidos ");
                    
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


      //// handlers para distintos tipos de datos algunos dinamicos son para selects,checkbox e inputs de files
  handleChange_selects = (e) => {
    let {name, value} = e.target;
    const thisClass=this;
    async function estado_cambio(){
        return await Promise.resolve(thisClass.setState({
            [name]: value
            }));
    }

    estado_cambio().then(function(){
        thisClass.get_datos_pagina_actual();
    })
   
}
    





    /// renderizado del componente 
    render = () =>{

        const {thisClass } = this.state;

        //// visualmente datos de la tabla


        function cursos_picker(){
            var d_curs = [];
            thisClass.state.datos1.map((value,key)=>(
                d_curs.push(<option key={key} value={value[0]}>Curso {value[0]} = {value[1]}</option>)
            ));

            //console.log("datos 1 v2 de"+thisClass.state.datos1);

            return (
                <div className="padreSelects_taller mt-4 mb-4">
                    <select  name="select_cursos" className="browser-default custom-select" 
                    onChange={thisClass.handleChange_selects}
                    value={thisClass.state.select_cursos}
                    >
                    {d_curs}
                    </select>
                </div>
            )
        }


        function tabla_cargar_visual(){

            var d_pag = [];

            thisClass.state.datos_lista_pagina.map((value,key) => (
                d_pag.push(<tr key={key} className="col-lg-4 col-md-6 contenedor_taller">
                        {thisClass.props.datos_tabla_colum.map((v,k)=> (
                            <td key={k}>{value[k]}</td>
                        ))}
                    </tr>)
            ));

            return(
                <>
                    {cursos_picker()}
                    <span> Mostrando {thisClass.state.datos_lista_pagina.length} Resultados </span>
                    <MDBTable className="mt-4 tabla_estudiantes text-center">
                        <MDBTableHead color="primary-color" textWhite>
                            <tr>
                            {thisClass.props.datos_tabla_colum.map((v,k)=> (
                                <th key={k}>{v}</th>
                            ))}
                            </tr>
                        </MDBTableHead>
                        <MDBTableBody>
                            {d_pag}
                        </MDBTableBody>
                    </MDBTable>
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

export default crear_tabla_datos_db_noIngresaron;