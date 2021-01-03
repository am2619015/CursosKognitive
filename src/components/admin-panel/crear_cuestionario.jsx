import React from 'react';
import Base from "../base_loged/base_comun";
import {MDBBtn, MDBCol, MDBRow,MDBTable,MDBTableHead,MDBTableBody,MDBProgress,MDBIcon} from "mdbreact";
import axios from 'axios';
import PreguntaIndividual from './cuest_pregunt_individual';

class crear_usuario extends Base {

    
    constructor(props){
        super(props);

           this.state = {
            email_admin: this.decencriptado_valores(this.get_usuarioNombre().split("§")[1]),
            classObj:this,
            errorMysql:false,
            errorMysql_msg:"",
            select_tipo_pregunta:"0",
            preguntas_agregadas:[],
            id_cuestionario:"",
            loading_get_id:false,
            pregunta_create_open:false,
            loading_create_cuestionario:false
           }

           this.handleChange_selects = this.handleChange_selects.bind(this);
           this.handle_PickerPreguntas = this.handle_PickerPreguntas.bind(this);
           this.handle_eliminar_pregunta = this.handle_eliminar_pregunta.bind(this);
           this.handleCreandoCuestionario = this.handleCreandoCuestionario.bind(this);

    }

    componentDidMount(){
        this.showMsg("Objeto crear cuestionario cargado");
        this.props.callback_carga(this,"clase_crear_cuestionario");
    }

    componentWillUnmount(){
        this.setState({
            preguntas_agregadas:[]
        })
    }

   //// funcion para obtener valores de cualquier input
   /*get_Inputs_Values = (value, type) =>{
    // this.showMsg("valor de "+value+" = "+type);
     this.setState({
     [type]: value
     });
 }*/

   //// handlers para distintos tipos de datos algunos dinamicos son para selects,checkbox e inputs de files
   handleChange_selects = (e) => {
        let {name, value} = e.target;
        this.setState({
        [name]: value,
        });
    }

    //// obtengo el id mas alto disponible para poder usar en la creacion de un cuestionario

    handle_get_idCuestionarioDisponible = () =>{
        const thisClass=this;
    
        async function msg_error_inicial(value,titulo,msg) {
            return await Promise.resolve(thisClass.props.error_function(value,titulo,msg));
          };

        async function estados_iniciales() {
            return await Promise.resolve(thisClass.setState({
                id_cuestionario:"",
                loading_get_id:true,
                select_tipo_pregunta:"0",
                preguntas_agregadas:[],
                pregunta_create_open:false,
                loading_create_cuestionario:false
            }));
        }

        msg_error_inicial(false,"","").then(function(){
            estados_iniciales().then(process_resolving());
        });

        function process_resolving(){

            const user = {
                email_admin : thisClass.state.email_admin
            }

            axios.post(`${thisClass.get_ip_server()}/apis/admin_panel/get_id_crear_cuestionario.php`,{user})
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
                                    loading_get_id:false,
                                    id_cuestionario:""
                                    });

                                    thisClass.props.error_function(true,"Error",thisClass.state.errorMysql_msg); 

                                }else if(res.data.mensaje==="correcto"){

                                    
                                    //var datos = JSON.parse(res.data.codigoHTML);

                                    thisClass.showMsg("id cuestionario disponible obtenido "+res.data.codigoHTML.split("╚")[1]);

                                    thisClass.setState({
                                        errorMysql:false,
                                        errorMysql_msg:"",
                                        loading_get_id:false,
                                        id_cuestionario:res.data.codigoHTML.split("╚")[1]
                                    });

                                }
                        
                        }).catch((error) => {
                                thisClass.showMsg("error de "+error);
                                thisClass.setState({
                                    errorMysql:true,
                                    errorMysql_msg:"No se pudo contactar con el servidor",
                                    loading_get_id:false,
                                    id_cuestionario:""
                                });

                                thisClass.props.error_function(true,"Error",thisClass.state.errorMysql_msg); 
                        }); 
        }
    }

    ///// activa el modal de preguntas que premite ingresar una pregunta, dicho objeto es disparado por un estado pregunta_create_open
    handle_PickerPreguntas = () =>{

        const thisClass=this;
        async function msg_error_inicial(value,titulo,msg) {
            return await Promise.resolve(thisClass.props.error_function(value,titulo,msg));
          };

          async function estados_iniciales() {
            return await Promise.resolve(thisClass.setState({
                pregunta_create_open:false
            }));
        }
          
          msg_error_inicial(false,"","").then(function(){
            estados_iniciales().then(process_resolving());
          });

          function process_resolving(){
                let pregunta_select=thisClass.state.select_tipo_pregunta;
                if(pregunta_select>0){
                    thisClass.showMsg("Agregador de preguntas abierto");
                    thisClass.setState({
                        pregunta_create_open:true
                    })
                }else{
                    thisClass.props.error_function(true,"Error","Seleccione un tipo de pregunta valido para ser agregado");
                }
          }

    }

    ///// callback llamado desde el objeto de pregunta individual, es llamado al agregar correctamente una pregunta
    //// aqui se valida si esa pregunta no exista previamente
    callbackADDPregunta = (tipo_pregunta,pregunta_txt,posibles_respuestas_txt,
                            respuesta_correcta,imagen_va_pregunta,imagen_posible_r_1,
                            imagen_posible_r_2,imagen_posible_r_3,imagen_posible_r_4)=>{
        this.showMsg("añadiendo pregunta");

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
            let pregunta_ya_existe_previamente=false;
            let arreglo_previo=thisClass.state.preguntas_agregadas;
            let pregunta_ingresar=[tipo_pregunta,pregunta_txt,posibles_respuestas_txt,
                respuesta_correcta,imagen_va_pregunta,imagen_posible_r_1,
                imagen_posible_r_2,imagen_posible_r_3,imagen_posible_r_4];

            for (let i = 0; i < arreglo_previo.length; i++) {
                let arreglo_pos=arreglo_previo[i];
                if(JSON.stringify(arreglo_pos)===JSON.stringify(pregunta_ingresar)){
                    pregunta_ya_existe_previamente=true;
                }
            }
            
            if(!pregunta_ya_existe_previamente){
                thisClass.state.preguntas_agregadas.push(pregunta_ingresar);
                //thisClass.showMsg("pregunta añadida = "+thisClass.state.preguntas_agregadas);
                //thisClass.showMsg("ademas preguntas agregadas de "+thisClass.state.preguntas_agregadas.length);
                thisClass.props.success_function(true,"Correcto","Pregunta Agregada con exito al cuestionario");
            }else{
                thisClass.props.error_function(true,"Error","Esta pregunta ya esta ingresada identicamente en el cuestionario");
            }
        }
    }

    ///// llamado desde el cerrado del objeto del cuestionario de preguntas 
    closePregunta = () =>{
        this.showMsg("Agregador de preguntas cerrado");
        this.setState({
            pregunta_create_open:false
        });
    }
    

    ////// handle de la eliminacion de una pregunta de la tabla del cuestionario
    handle_eliminar_pregunta = (e) =>{
        this.showMsg("por eliminar el objeto del arreglo "+(parseInt(e.target.id)));
        let index=parseInt(e.target.id);
        if (index > -1) {
            //arr.splice(index, 1);
            //this.state.preguntas_agregadas.splice(index,1);
            let array_temp=this.state.preguntas_agregadas;
            array_temp.splice(index,1);

            this.showMsg("eliminado pregunta del arreglo");
            this.setState({
                preguntas_agregadas:array_temp
            })
          }
    }
 
    /////// handle de la creacion del cuestionario con los datos a enviar 

    handleCreandoCuestionario = () =>{

        const thisClass=this;

        async function msg_error_inicial(value,titulo,msg) {
            return await Promise.resolve(thisClass.props.error_function(value,titulo,msg));
          };
        async function msg_success_inicial(value,titulo,msg) {
            return await Promise.resolve(thisClass.props.success_function(value,titulo,msg));
          };
    
        async function estados_iniciales() {
            return await Promise.resolve(thisClass.setState({
                loading_create_cuestionario:true
            }));
          }

        msg_error_inicial(false,"","").then(function(){
            msg_success_inicial(false,"","").then(function(){
                estados_iniciales().then(process_resolving());
            });
        });

        function process_resolving(){
            if(thisClass.state.preguntas_agregadas.length>=2){
                console.log("numero de preguntas a ingresar de "+thisClass.state.preguntas_agregadas.length);

                const user= {
                    email_admin : thisClass.state.email_admin,
                    preguntas:thisClass.state.preguntas_agregadas,
                    id_cuest:thisClass.state.id_cuestionario
                };

        
                axios.post(`${thisClass.get_ip_server()}/apis/admin_panel/crear_cuestionario.php`, { user })
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
                                                                loading_create_cuestionario:false
                                                                });

                                                                thisClass.props.error_function(true,"Error",thisClass.state.errorMysql_msg); 

                                                            }else if(res.data.mensaje==="correcto"){
        
                                                                //var datos = JSON.parse(res.data.codigoHTML);
        
                                                                thisClass.showMsg("Custionario creado con exito");
        
                                                                thisClass.setState({
                                                                    errorMysql:false,
                                                                    errorMysql_msg:res.data.codigoHTML,
                                                                    loading_create_cuestionario:false,
                                                                });

                                                                thisClass.props.success_function(true,"Cuestionario Creado","Se a creado al cuestionario con exito");
                                                                thisClass.handle_get_idCuestionarioDisponible();
                                                                
                                                            }
                                                    
                                                    }).catch((error) => {
                                                            thisClass.showMsg("error de "+error);
                                                            thisClass.setState({
                                                                errorMysql:true,
                                                                errorMysql_msg:"No se pudo contactar con el servidor",
                                                                loading_create_cuestionario:false
                                                            });

                                                            thisClass.props.error_function(true,"Error",thisClass.state.errorMysql_msg); 
                                                    }); 

            }else{
                thisClass.props.error_function(true,"Error","Agrege al menos dos preguntas para poder crear el cuestionario");
                thisClass.setState({
                    loading_create_cuestionario:false
                });    
            }
            
        }
        
    }


    /////////////// renderizado del componente
    render = () =>{
        
        const {classObj} = this.state;

        function tabla_preguntas_ingresadas(){

            let datos_tabla = [];

            classObj.state.preguntas_agregadas.map((value,key)=>(
                datos_tabla.push(<tr key={key}>
                    <td>{key+1}</td>
                    <td>{value[0]}</td>
                    <td>{value[1].substring(0,20)}</td>
                    <td><span id={key}  onClick={classObj.handle_eliminar_pregunta} className={`font-weight-bold mt-0 blue-text opciones_edit_delete ${classObj.state.loading_create_cuestionario ? "disabled" : ""}`}>Eliminar</span></td>
                </tr>)
            ));


            return(<>{datos_tabla}</>)
        }

        return(

            this.state.loading_get_id
            ?
            <div className="mt-4">
                <span className="titulo_carga_bar">Cargando ...</span>
                    <MDBProgress className="my-2 progress_bar_infinite" material value={40} height="10px" color="light-blue darken-1" />
            </div>
            :
            <div className="mt-5">
                <p className="h5 text-center"><MDBIcon icon="pencil" className="mr-3"/>Cuestionario # {this.state.id_cuestionario}</p>
                <form>
                    <MDBRow>
                        <MDBCol size="12" md="8" className="mt-4">
                            <div className="grey-text">
                                    <div className="padreSelects_tipo pregunta">
                                                    <select  name="select_tipo_pregunta" className={`browser-default custom-select ${this.state.loading_create_cuestionario ? "disabled" : ""} `}
                                                    onChange={this.handleChange_selects}
                                                    value={this.state.select_tipo_pregunta}
                                                    >
                                                        <option value="0">Seleccione Tipo Pregunta</option>
                                                        <option value="1">Pregunta texto seleccion multiple</option>
                                                        <option value="2">Pregunta texto seleccion multiple con varias respuestas posibles</option>
                                                        <option value="3">Pregunta Imagen, respuesta seleccion multiple</option>
                                                        <option value="4">Pregunta Tabla con imagen y escribir/escoger una respuesta</option>
                                                    </select>
                                    </div>
                            </div>
                        </MDBCol>
                        <MDBCol size="12" md="4" className="text-center mb-4 mt-4">
                            <MDBBtn type="button" color="primary" 
                                    className={this.state.pregunta_create_open || this.state.loading_create_cuestionario? "disabled":""}
                                    onClick={this.handle_PickerPreguntas}
                                    >Agregar Pregunta</MDBBtn>
                        </MDBCol>
                    </MDBRow>

                    <MDBTable>
                        <MDBTableHead color="primary-color" textWhite>
                            <tr>
                            <th>#</th>
                            <th>Tipo Pregunta</th>
                            <th>Pregunta</th>
                            <th>Eliminar</th>
                            </tr>
                        </MDBTableHead>
                        <MDBTableBody>
                            {tabla_preguntas_ingresadas()}
                        </MDBTableBody>
                    </MDBTable>


                    <div className="text-center">
                        <MDBBtn type="button" className={this.state.loading_create_cuestionario ? "disabled" : ""}
                                              onClick={this.handleCreandoCuestionario}>Crear Cuestionario</MDBBtn>
                        {this.state.loading_create_cuestionario
                        ?
                            <div className="spinner-grow text-primary align-middle" role="status">
                                <span className="sr-only align-middle">Loading...</span>
                            </div>
                            :
                            <></>
                        }
                    </div>
                </form>
                {this.state.pregunta_create_open?
                    <PreguntaIndividual
                    pregunta_seleccionada = {this.state.select_tipo_pregunta}
                    success_function={this.props.success_function} 
                    error_function={this.props.error_function}
                    callback_add_pregunta={this.callbackADDPregunta}
                    callback_closed={this.closePregunta}
                />
                :
                <></>
                }
                
            </div>
        )
    }
    

}

export default crear_usuario;