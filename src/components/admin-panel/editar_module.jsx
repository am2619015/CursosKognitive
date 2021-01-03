import React from 'react';
import Base from "../base_loged/base_comun";
import { MDBContainer,MDBModal,MDBModalHeader,MDBModalBody,MDBModalFooter,MDBBtn,MDBProgress,MDBInput} from "mdbreact";
import axios from 'axios';

class editar_dato extends Base {

    //// se permiten maximo 10 inputs de edicion estos se usan dinamicamente
    constructor(props){
        super(props);

           this.state = {
            email_admin: this.decencriptado_valores(this.get_usuarioNombre().split("§")[1]),
            id_dato : this.props.dato_id,
            modal8: false,
            loading_datos_editar:true,
            editado_disparado:false,
            errorMysql:false,
            errorMysql_msg:"",
            thisClass:this,
            datos_construir_form:this.props.inputs_datos,
            nombre_mostrarObjeto:"",
            value_input1:"",
            value_input2:"",
            value_input3:"",
            value_input4:"",
            value_input5:"",
            value_input6:"",
            value_input7:"",
            value_input8:"",
            value_input9:"",
            value_input10:"",
            value_input11:"",
            value_input12:"",
            input_name:"",
            input_base64:""
           }



        this.handler_edit_dato_modal = this.handler_edit_dato_modal.bind(this);
        this.handle_get_datos_editar = this.handle_get_datos_editar.bind(this);
    }

    // al montarlo se muestra automaticamente y se obtienen los datos a editar del servidor gracias al id pasado como props, hay varias props a mirar 
    // se envia dsed tablas_datos_visuales siempre que fue construido para funcionar en conjunto
    componentDidMount(){
       // this.showMsg("dato id obtenido de "+this.props.dato_id)
        this.toogle_modal_editar();
        this.handle_get_datos_editar();
    }

    componentWillUnmount(){
        
    }


      //// funcion para obtener valores de cualquier input
      get_Inputs_Values_edicion = (value, type) =>{
        // this.showMsg("valor de "+value+" = "+type);
         this.setState({
         [type]: value
         });
     }


     /// funcion que abre o cierra el modal
    toogle_modal_editar = () => {
        this.setState({
            modal8: this.state.modal8?false:true
        });

        if(this.state.modal8){
            //this.showMsg("procediendo a cerrar modal");
            this.props.callback_closed("Cancelado","Modal Cerrado");
        }
      }


      

      /// editando ya con confirmacion
      handler_edit_dato_modal = () =>{
        this.showMsg("----> Procediendo a editar si validacion fuera correcta");
        this.showMsg("ejemplo como "+this.state.value_input1);
        
        const thisClass=this;

        async function msg_error_inicial(value,titulo,msg) {
            return await Promise.resolve(thisClass.props.error_function(value,titulo,msg));
          };
    
          async function estados_iniciales() {
            return await Promise.resolve(thisClass.setState({
                editado_disparado:true
            }));
          }
    
        msg_error_inicial(false,"","").then(function(){
                estados_iniciales().then(process_resolving());
        });

            function process_resolving(){
                        

                        var validado=true;//// como el usuario puede ir todo en blanco menos email entonces no hay nada que validar
                        var msg_mostrar_error="";

                        //// solo se valida de cursos que la foto exista el resto podria ir en blanco
                        if(thisClass.props.typo_edicion.localeCompare("cursos") ===0){
                            if(thisClass.state.input_base64.trim().localeCompare("")===0){
                                validado=false;
                                msg_mostrar_error="La foto debe ser subida nuevamente si desea editarlo";
                            }
                            if(thisClass.state.value_input2.trim().localeCompare("")===0){
                                validado=false;
                                msg_mostrar_error="Ingrese una Descripcion para editarlo";
                            }
                            if(thisClass.state.value_input1.trim().localeCompare("")===0){
                                validado=false;
                                msg_mostrar_error="Ingrese un Titulo para editarlo";
                            }
                            
                        }

                        ///// validacion caducidad cursos

                        if(thisClass.props.typo_edicion.localeCompare("caducidad_cursos") ===0){
                            if(thisClass.state.value_input1.trim().localeCompare("")===0){
                                validado=false;
                                msg_mostrar_error="Ingrese una Fecha de caducidad para editarlo";    
                            }
                        }

                        if(validado){       
                            //thisClass.props("Procedo a editar con dato "+thisClass.state.value_input1);  
                
                                var info_editar;
                                //// ---------------------------------------------- se aumentara para proximos typos es necesario a futuro agregar aqui
                                switch(thisClass.props.typo_edicion){
                                    case "users":
                                        info_editar= {
                                            email_admin : thisClass.state.email_admin,
                                            typo: thisClass.props.typo_edicion,
                                            dato_1 : thisClass.state.value_input1,
                                            dato_2: thisClass.state.value_input2,
                                            dato_3: thisClass.state.value_input3,
                                            dato_4: thisClass.state.value_input4
                                        };
                                    break;
                
                                    case "cursos":
                                        info_editar= {
                                            email_admin : thisClass.state.email_admin,
                                            typo: thisClass.props.typo_edicion,
                                            dato_1 : thisClass.state.id_dato,
                                            dato_2 : thisClass.state.value_input1,
                                            dato_3: thisClass.state.value_input2,
                                            dato_4: thisClass.state.input_base64
                                        };
                                    break;

                                    case "caducidad_cursos":
                                        info_editar= {
                                            email_admin : thisClass.state.email_admin,
                                            typo: thisClass.props.typo_edicion,
                                            dato_1 : thisClass.state.id_dato,
                                            dato_2 : thisClass.state.value_input1
                                        };
                                    break;

                                    default:
                                        info_editar= {
                                        email_admin : "error_no_busca"
                                    };
                                }
                
                
                                axios.post(`${thisClass.get_ip_server()}/apis/admin_panel/editando_db.php`, { info_editar })
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
                                                                                editado_disparado:false,
                                                                                modal8: thisClass.state.modal8?false:true
                                                                                });
                
                                                                                thisClass.props.callback_closed("Incorrecto",res.data.codigoHTML);
                                                                            }else if(res.data.mensaje==="correcto"){
                
                                                                                thisClass.setState({
                                                                                    errorMysql:false,
                                                                                    errorMysql_msg:res.data.codigoHTML,
                                                                                    editado_disparado:false,
                                                                                    modal8: thisClass.state.modal8?false:true
                                                                                });
                
                                                                                thisClass.showMsg("actualziado con exito");
                
                                                                                thisClass.props.callback_closed("Correcto",thisClass.props.nombre_visualtypo+" editado exitosamente");
                                                                                
                                                                            }
                                                                    
                                                                    }).catch((error) => {
                                                                        thisClass.showMsg("error de "+error);
                                                                        thisClass.setState({
                                                                                errorMysql:true,
                                                                                errorMysql_msg:"No se pudo contactar con el servidor",
                                                                                editado_disparado:false,
                                                                                modal8: thisClass.state.modal8?false:true
                                                                            });
                
                                                                            thisClass.props.callback_closed("Incorrecto","No se pudo contactar con el servidor");
                                                                    });
                            }else{
                                //this.props.callback_closed("Incorrecto","La foto debe ser subida nuevamente si desea editarlo");
                                thisClass.props.error_function(true,"Error",msg_mostrar_error);
                                thisClass.setState({
                                    editado_disparado:false
                                });
                            }
                
            }
      }

      // al inicio obtengo datos en base al id que se paso por parametro me da igual el typo no hay que editar ya que construye todo dinamicamente
      handle_get_datos_editar = () => {
        this.showMsg("----> obteniendo los datos a editar de "+this.props.typo_edicion);
        

        const user= {
            id : this.state.id_dato,
            email_admin : this.state.email_admin,
            typo: this.props.typo_edicion
        };

        const thisClass=this;

        async function msg_error_inicial(value,titulo,msg) {
            return await Promise.resolve(thisClass.props.error_function(value,titulo,msg));
          };
    
          
        msg_error_inicial(false,"","").then(process_resolving());

        function process_resolving(){
                axios.post(`${thisClass.get_ip_server()}/apis/admin_panel/get_datos_db_editar.php`, { user })
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
                                                                loading_datos_editar:false
                                                                });

                                                                for (let i = 0; i < thisClass.state.datos_construir_form.length; i++) {
                                                                    let temp_number = 'value_input' + (i+1)
                                                                    thisClass.setState({
                                                                        [temp_number]:""
                                                                    });
                                                                }

                                                                thisClass.props.callback_closed("Incorrecto",res.data.codigoHTML);


                                                            }else if(res.data.mensaje==="correcto"){

                                                                
                                                                var datos = JSON.parse(res.data.codigoHTML);

                                                                thisClass.setState({
                                                                    errorMysql:false,
                                                                    errorMysql_msg:res.data.codigoHTML,
                                                                    loading_datos_editar:false
                                                                });

                                                                    for (let i = 0; i < (thisClass.state.datos_construir_form.length+1); i++) {
                                                                        let temp_number = 'value_input' + (i+1)
                                                                        //thisClass.showMsg("valor de "+datos[0][i]);
                                                                        thisClass.setState({
                                                                            [temp_number]:datos[0][i]
                                                                        });
                                                                    }
                                                                
                                                                
                                                                    thisClass.showMsg("obtenido correctamente como "+thisClass.state.value_input1 +" "+thisClass.state.value_input2);

                                                                /*this.myRef_email_update.current.value = this.state.email;
                                                                this.myRef_nombres_update.current.value = this.state.nombres;
                                                                this.myRef_apellidos_update.current.value = this.state.apellidos;
                                                                this.myRef_telefono_update.current.value = this.state.telefono;*/
                                                            }
                                                    
                                                    }).catch((error) => {
                                                        thisClass.showMsg("error de "+error);
                                                        thisClass.setState({
                                                                errorMysql:true,
                                                                errorMysql_msg:"No se pudo contactar con el servidor",
                                                                loading_datos_editar:false
                                                            });

                                                            for (let i = 0; i < thisClass.state.datos_construir_form.length; i++) {
                                                                let temp_number = 'value_input' + (i+1)
                                                                thisClass.setState({
                                                                    [temp_number]:""
                                                                });
                                                            }

                                                            thisClass.props.callback_closed("Incorrecto","No se pudo contactar con el servidor");
                                                    });
            }
      }

      ////// capturado del input file de la edicion por el momento solo admite un input file de guardado, si hay mas de uno abra problemas
      estado_input_file = (e) =>{
        const toBase64 = file => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });

        const thisClass=this;

        async function get_file_base64(file) {
            var base64_img = await toBase64(file);
           // thisClass.showMsg(base64_img);
            thisClass.setState({
                input_name:file.name,
                input_base64:base64_img
            });
         }


        if(e.target.files[0]!== undefined){
            this.showMsg("Input escogida de "+e.target.files[0].name);
            get_file_base64(e.target.files[0]);
        }else{
            this.showMsg("Input quitada");
            thisClass.setState({
                input_name:"",
                input_base64:""
            });
        }
      }

      ///// renderizado del objeto
      render = () =>{
         
        const {thisClass,datos_construir_form } = this.state;

        //// funcion donde construyo dinamicamente, esto podria necesitar ser editado en caso de recibir otro type de input que requiera tratamiento especial
        function construir_cuerpo_form(){
            var input_datos = [];

            //thisClass.showMsg("datos a contruir de "+datos_construir_form.length)

            for (let i = 0; i < datos_construir_form.length; i++) {
                if(datos_construir_form[i].split("╚")[0].localeCompare("email")===0){
                    //thisClass.showMsg("se encontro objeto tipo email");
                  
                    input_datos.push(
                        <MDBInput key={i} id={"value_input"+(i+1)} label={datos_construir_form[i].split("╚")[1]} 
                        getValue={value => thisClass.get_Inputs_Values_edicion(value, "value_input"+(i+1))} value={thisClass.state['value_input' + (i+1)]}    
                        type={datos_construir_form[i].split("╚")[0]} readOnly/>
                    );
                }else if(datos_construir_form[i].split("╚")[0].localeCompare("file")===0){
                    input_datos.push(
                        <MDBInput key={i} id={"value_input"+(i+1)} label="" 
                        accept={datos_construir_form[i].split("╚")[1].split("|")[1]}
                        onChange = {thisClass.estado_input_file}
                        type={datos_construir_form[i].split("╚")[0]} 
                        />
                    );
                }else if(datos_construir_form[i].split("╚")[0].localeCompare("textarea")===0){
                    input_datos.push(
                        <MDBInput key={i} id={"value_input"+(i+1)} label="" 
                        getValue={value => thisClass.get_Inputs_Values_edicion(value, "value_input"+(i+1))}  value={thisClass.state['value_input' + (i+1)]}
                        type={datos_construir_form[i].split("╚")[0]} rows="5"/>
                    );
                }else{
                    input_datos.push(
                        <MDBInput key={i} id={"value_input"+(i+1)} label={datos_construir_form[i].split("╚")[1]} 
                        getValue={value => thisClass.get_Inputs_Values_edicion(value, "value_input"+(i+1))} value={thisClass.state['value_input' + (i+1)]}
                        type={datos_construir_form[i].split("╚")[0]} />
                    );
                }  
            }

            
            
            return(
                <div id="cont_v_edit">
                    {input_datos}
                </div>
            )
        }

        return(
                <MDBContainer>
                <MDBModal className="modal-dialog-centered" isOpen={this.state.modal8} toggle={this.toogle_modal_editar}>
                <MDBModalHeader className="text-center" titleClass="w-100 font-weight-bold" toggle={this.toogle_modal_editar}>Editando {this.props.nombre_visualtypo}</MDBModalHeader>
                <MDBModalBody className="ml-2 mr-2">
                    {this.state.loading_datos_editar?
                        <div className="mt-4">
                            <span className="titulo_carga_bar">Cargando ...</span>
                            <MDBProgress className="my-2 progress_bar_infinite" material value={40} height="10px" color="light-blue darken-1" />
                        </div>
                    :
                            <form>
                                {construir_cuerpo_form()}
                            </form>
                    }
                </MDBModalBody>
                <MDBModalFooter className="justify-content-center">
                                <div className="text-center mt-4">
                                    <MDBBtn color="indigo text-white" type="button" className={thisClass.state.editado_disparado ? "disabled" : ""} 
                                            onClick={this.handler_edit_dato_modal}>Actualizar</MDBBtn>
                                    {this.state.editado_disparado?
                                     <div className="spinner-grow text-primary align-middle" role="status">
                                        <span className="sr-only align-middle">Loading...</span>
                                    </div>
                                    :
                                    <></>
                                    }
                                    
                                </div>
                </MDBModalFooter>
                </MDBModal>
            </MDBContainer>
          )
      }

}

export default editar_dato;