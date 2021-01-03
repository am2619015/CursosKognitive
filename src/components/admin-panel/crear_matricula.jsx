import React from 'react';
import Base from "../base_loged/base_comun";
import {MDBBtn,MDBRow,MDBCol,MDBProgress, MDBContainer,MDBIcon} from "mdbreact";
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale} from  "react-datepicker";
import es from 'date-fns/locale/es';
import TablaDBPicker from "./tabla_datos_picker";

class crear_matricula extends Base {

    
    constructor(props){
        super(props);

           this.state = {
            email_admin: this.decencriptado_valores(this.get_usuarioNombre().split("§")[1]),
            thisClass:this,
            errorMysql:false,
            errorMysql_msg:"",
            loading_crear_matriculas:true,
            accion_creating_matricula:false,
            datos_cursos_picker:[],
            select_cursos:"0",
            date_picker_val:null,
            date_picker_name:"",
            fecha_minima:new Date(),
            claseTabla_estudiantes:null,
            claseTabla_cursos:null,
            claseTabla_talleres:null,
            claseTabla_cuestionarios:null,
            estudiante_seleccionado:""
           }

           this.handleChange_selects = this.handleChange_selects.bind(this);
           this.handleChange_date = this.handleChange_date.bind(this);
           this.set_clase_tabla = this.set_clase_tabla.bind(this);
           this.handle_pickerEstudiante = this.handle_pickerEstudiante.bind(this);
           this.estudiante_pickerFunction = this.estudiante_pickerFunction.bind(this);


    }


    componentDidMount(){
        this.showMsg("Objeto crear taller cargado");
        //this.handle_get_datos_crear_matricula();
        registerLocale('es', es);
        this.props.callback_carga(this,"clase_crear_matricula");
    }

    componentWillUnmount(){
        this.setState({
            datos_cursos_picker:[]
        })
    }




///// al iniciar el objeto instanciado ya se piden los datos asyincronamente, estos datos son necesarios para construir el formulario que creara el taller
 handle_get_datos_crear_matricula = () => {
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
            loading_crear_matriculas:true,
            datos_cursos_picker:[]
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
                                                            loading_crear_matriculas:false
                                                            });

                                                            thisClass.props.error_function(true,"Error",res.data.codigoHTML);

                                                        }else if(res.data.mensaje==="correcto"){

                                                            var datos1 = JSON.parse(res.data.codigoHTML);

                                                                

                                                                datos1.forEach(element => {
                                                                    thisClass.state.datos_cursos_picker.push(element);
                                                                });


                                                                thisClass.setState({
                                                                    errorMysql:false,
                                                                    errorMysql_msg:res.data.codigoHTML,
                                                                    loading_crear_matriculas:false
                                                                });

                                                            
                                                                thisClass.showMsg("datos 1 de"+thisClass.state.datos_cursos_picker);

                                                        }
                                                
                                                }).catch((error) => {
                                                    thisClass.showMsg("error de "+error);
                                                    thisClass.setState({
                                                            errorMysql:true,
                                                            errorMysql_msg:"No se pudo contactar con el servidor",
                                                            loading_crear_matriculas:false
                                                        });

                                                        thisClass.props.error_function(true,"Error","No se pudo contactar con el servidor");
                                                });

        }
  }

  //// handlers para distintos tipos de datos algunos dinamicos son para selects,checkbox e inputs de files
  handleChange_selects = (e) => {
        let {name, value} = e.target;
        this.setState({
        [name]: value,
        });
    }


    handleChange_date = (value) =>{
       /* this.setState({
          value_date: value, // ISO String, ex: "2016-11-19T12:00:00.000Z"
          formattedValue_date: formattedValue // Formatted String, ex: "11/19/2016"
        });*/
        //.toLocaleDateString()
        this.showMsg("valores de "+value);
        let dateTemp="";
        let date_name_temp="";
        if(value!==null){
            dateTemp=value.toLocaleDateString();
            date_name_temp=dateTemp.split("/")[2]+"-"+dateTemp.split("/")[1]+"-"+dateTemp.split("/")[0];
        }
        this.setState({
            date_picker_val:value,
            date_picker_name:date_name_temp
        })
    }

    //// funcion que setea ojeto desde otra clase value es el valor a poner en el estado llamado type
    //// esta funcion usan los objetos de tipo tabla
    set_clase_tabla  = (value, type) =>{
        // this.showMsg("valor de "+value+" = "+type);
         this.setState({
         [type]: value
         });
     }


     handle_pickerEstudiante = () =>{
        this.state.claseTabla_estudiantes.callback_start_component();
     }

     //// funcion que la tabla de datos llama y asigna valores
     estudiante_pickerFunction = (value) =>{
        this.setState({
            estudiante_seleccionado:value
        })
     }


     ///// matriculando estudiante 

     handle_matricula_estudiante = () =>{
        const thisClass=this;

        async function msg_error_inicial(value,titulo,msg) {
            return await Promise.resolve(thisClass.props.error_function(value,titulo,msg));
          };
        async function msg_success_inicial(value,titulo,msg) {
            return await Promise.resolve(thisClass.props.success_function(value,titulo,msg));
          };
    
          async function estados_iniciales() {
            return await Promise.resolve(thisClass.setState({
                accion_creating_matricula:true
            }));
          }
    
        msg_error_inicial(false,"","").then(function(){
            msg_success_inicial(false,"","").then(function(){
                estados_iniciales().then(process_resolving());
            });
        });

        function process_resolving(){

            let validado=true;
            let msg_error="";

            const user= {
                email_admin : thisClass.state.email_admin,
                id_usuario : thisClass.state.estudiante_seleccionado,
                id_curso : thisClass.state.select_cursos,
                caducidad_curso: thisClass.state.date_picker_name
            };
            
            if(thisClass.state.date_picker_name.trim().localeCompare("")===0){
                validado=false;
                msg_error="Seleccione la fecha en la que caduca el acceso al curso de ese estudiante.";
            }

            if(thisClass.state.estudiante_seleccionado.trim().localeCompare("")===0){
                validado=false;
                msg_error="Seleccione el estudiante a ser matriculado.";
            }

            if(thisClass.state.select_cursos.trim().localeCompare("0")===0){
                validado=false;
                msg_error="Seleccione un curso para matricular a un estudiante.";
            }

            if(!validado){
                thisClass.props.error_function(true,"Error",msg_error);
                thisClass.setState({
                    accion_creating_matricula:false
                })
            }else{

                axios.post(`${thisClass.get_ip_server()}/apis/admin_panel/create_matricula.php`, { user }).then(res => {
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
                                                                accion_creating_matricula:false,
                                                                });
    
                                                                thisClass.props.error_function(true,"Error",res.data.codigoHTML);
    
                                                            }else if(res.data.mensaje==="correcto"){
                                                                thisClass.setState({
                                                                    accion_creating_matricula:false,
                                                                    date_picker_name:"",
                                                                    date_picker_val:new Date(),
                                                                    select_cursos:"0",
                                                                    estudiante_seleccionado:""
                                                                }); 
                                                                
                                                                thisClass.props.success_function(true,"Matriculado","Usuario Matriculado con exito");
                                                            }
    
                                                    }).catch((error) => {
                                                        thisClass.showMsg("error de "+error);
                                                        thisClass.setState({
                                                                errorMysql:true,
                                                                errorMysql_msg:"No se pudo contactar con el servidor",
                                                                accion_creating_matricula:false,
                                                            });
    
                                                            thisClass.props.error_function(true,"Error","No se pudo contactar con el servidor");
                                                    });
            }
        }
     }

  ///////// render de la aplicacion

    render = () =>{

        const {thisClass} = this.state;

        function cursos_picker(){
            var d_curs = [];
            thisClass.state.datos_cursos_picker.map((value,key)=>(
                d_curs.push(<option key={key} value={value[0]}>Curso {value[0]} = {value[1]}</option>)
            ));

            //console.log("datos 1 v2 de"+thisClass.state.datos_cursos_picker);

            return (
                <div className="padreSelects_taller">
                    <select  name="select_cursos" className="browser-default custom-select" 
                    onChange={thisClass.handleChange_selects}
                    value={thisClass.state.select_cursos}
                    >
                    <option value="0">Escoja el curso a matricular al estudiante</option>
                    {d_curs}
                    </select>
                </div>
            )
        }


        return(

        this.state.loading_crear_matriculas
            ?
            <div className="mt-4">
                <span className="titulo_carga_bar">Cargando ...</span>
                    <MDBProgress className="my-2 progress_bar_infinite" material value={40} height="10px" color="light-blue darken-1" />
            </div>
            :
                <div className="mt-5">
                    <form>
                        <div className="grey-text">
                            {cursos_picker()}   
                            <MDBContainer>
                                <MDBRow className="mt-4 d-flex">
                                    <MDBCol size="6" className="text-right justify-content-center align-self-center"><span> {this.state.estudiante_seleccionado.trim().localeCompare("")===0?"Escoger al estudiante":"Estudiante Seleccionado : "+this.state.estudiante_seleccionado} :</span></MDBCol>
                                    <MDBCol size="6">
                                        <MDBBtn color="mdb-color text-white" onClick={this.handle_pickerEstudiante}>Estudiantes</MDBBtn>
                                    </MDBCol>
                                </MDBRow>
                            </MDBContainer>
                            <MDBContainer className="text-center mt-4 mb-4">
                                <p>Acceso al Curso para este estudiante caducara en la fecha : {this.state.date_picker_name}</p>
                                <MDBIcon icon="calendar" className="pointer mr-2" />
                                <DatePicker id="example-datepicker"
                                selected={this.state.date_picker_val}
                                onChange={this.handleChange_date}
                                locale="es"
                                dateFormat="yyyy/MM/dd"
                                minDate={this.state.fecha_minima}
                                showDisabledMonthNavigation
                                isClearable
                                placeholderText="Caducidad Curso"
                                />
                            </MDBContainer>

                            
                            <TablaDBPicker 
                                callback_carga = {thisClass.set_clase_tabla}
                                success_function={thisClass.props.success_function}
                                error_function={thisClass.props.error_function}
                                api_tabla_dato={"users"}
                                datos_tabla_colum={["ID","Email","Nombres Apellidos"]}
                                msg_eliminacion = {"Estudiante"}
                                estudiante_picker ={thisClass.estudiante_pickerFunction}
                            />
                            
                            
                        </div>
                        <div className="text-center">
                            <MDBBtn type="button" className={this.state.accion_creating_matricula ? "disabled" : ""} onClick={this.handle_matricula_estudiante}>Matricular Estudiante</MDBBtn>
                            {this.state.accion_creating_matricula
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

}

export default crear_matricula;