import React from 'react';
import Base from "../base_loged/base_comun";
import {MDBBtn,MDBInput,MDBCol,MDBProgress,MDBAlert,MDBPopover,MDBIcon,MDBPopoverBody,MDBContainer,MDBModal,MDBModalHeader,MDBModalBody} from "mdbreact";
import axios from 'axios';

class modificar_taller extends Base {

    
    constructor(props){
        super(props);

           this.state = {
            email_admin: this.decencriptado_valores(this.get_usuarioNombre().split("§")[1]),
            thisClass:this,
            errorMysql:false,
            errorMysql_msg:"",
            modal8: false,
            loading_crear_taller:true,
            nombre_taller:"",
            descripcion_taller:"",
            select_cursos:"0",
            select_cuestionario:"0",
            select_num_videos:"1",
            material_didactico:false,
            taller_3_intentos:false,
            sobrescribirfiles:false,
            datos1:[],
            datos2:[],
            max_size_file_upload:35,
            video_data_1:null,
            video_data_1_name:"",
            video_data_2:null,
            video_data_2_name:"",
            video_data_3:null,
            video_data_3_name:"",
            video_data_4:null,
            video_data_4_name:"",
            material_didactico_data:null,
            material_didactico_name:"",
            accion_updating_taller:false,
            showing_msg_carga_minutos:false
           }

           this.handle_get_datos_crear_taller = this.handle_get_datos_crear_taller.bind(this);
           this.handle_update_taller = this.handle_update_taller.bind(this);
           this.handleChange_selects = this.handleChange_selects.bind(this);
           this.handleChange_checkbox = this.handleChange_checkbox.bind(this);
           this.handleCambio_InputsFile = this.handleCambio_InputsFile.bind(this);
           this.validate_size_file = this.validate_size_file.bind(this);

    }


    componentDidMount(){
        this.showMsg("Modificar taller cargado para id "+this.props.dato_id+" tipo "+this.props.typo_edicion);
        this.toogle_modal_editar();
        this.handle_get_datos_crear_taller();
        
        //this.props.callback_carga(this,"clase_crear_taller");
    }

    componentWillUnmount(){
        this.setState({
            datos1:[],
            datos2:[]
        })
    }




      //// funcion para obtener valores de cualquier input
   get_Inputs_Values = (value, type) =>{
    // this.showMsg("valor de "+value+" = "+type);
     this.setState({
     [type]: value
     });
 }








///// al iniciar el objeto instanciado ya se piden los datos asyincronamente, estos datos son necesarios para construir el formulario que creara el taller
///// luego de eso aqui mismo obtiene en base al id de props pasadas al objeto obtiene los datos que estan en la db para editarlos posteriormente
 handle_get_datos_crear_taller = () => {
    this.showMsg("----> obteniendo los datos para poder crear el taller");
    
    const thisClass=this;

    const user= {
        email_admin : this.state.email_admin,
    };


    async function msg_error_inicial(value,titulo,msg) {
        return await Promise.resolve(thisClass.props.error_function(value,titulo,msg));
      };

      async function estados_iniciales() {
        return await Promise.resolve(thisClass.setState({
            loading_crear_taller:true,
            datos1:[],
            datos2:[]
        }));
      }

    msg_error_inicial(false,"","").then(function(){
            estados_iniciales().then(process_resolving());
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
                                                            loading_crear_taller:false
                                                            });

                                                            thisClass.props.error_function(true,"Error",res.data.codigoHTML);

                                                        }else if(res.data.mensaje==="correcto"){

                                                            var datos1 = JSON.parse(res.data.codigoHTML);
                                                            var datos2 = JSON.parse(res.data.codigoHTML2);

                                                                

                                                                datos1.forEach(element => {
                                                                    thisClass.state.datos1.push(element);
                                                                });

                                                                datos2.forEach(element => {
                                                                    thisClass.state.datos2.push(element);
                                                                });

                                                                thisClass.setState({
                                                                    errorMysql:false,
                                                                    errorMysql_msg:res.data.codigoHTML,
                                                                    loading_crear_taller:true
                                                                });
                                                                
                                                                ///// segundo axios /////
                                                                const user= {
                                                                    id : thisClass.props.dato_id,
                                                                    email_admin : thisClass.state.email_admin,
                                                                    typo: thisClass.props.typo_edicion
                                                                };
                                                            
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
                                                                                                                loading_crear_taller:false
                                                                                                                });
                                                            
                                                                                                            }else if(res.data.mensaje==="correcto"){
                                                                                                                

                                                                                                                var datos_obtenidos = JSON.parse(res.data.codigoHTML);

                                                                                                                thisClass.showMsg("Obtenido datos a editar correctamente "+datos_obtenidos[0]);

                                                                                                                /*this.setState({
                                                                                                                    errorMysql:false,
                                                                                                                    errorMysql_msg:"",
                                                                                                                    loading_crear_taller:false
                                                                                                                    });*/

                                                                                                                thisClass.setState({
                                                                                                                    errorMysql:false,
                                                                                                                    errorMysql_msg:"",
                                                                                                                    loading_crear_taller:false,
                                                                                                                    nombre_taller:datos_obtenidos[0][1],
                                                                                                                    descripcion_taller:datos_obtenidos[0][3],
                                                                                                                    select_cursos:datos_obtenidos[0][0],
                                                                                                                    select_cuestionario:datos_obtenidos[0][2],
                                                                                                                    select_num_videos:datos_obtenidos[0][4],
                                                                                                                    material_didactico:datos_obtenidos[0][5].localeCompare("1")===0?true:false,
                                                                                                                    taller_3_intentos:datos_obtenidos[0][6].localeCompare("1")===0?true:false,
                                                                                                                    video_data_1:null,
                                                                                                                    video_data_1_name:"",
                                                                                                                    video_data_2:null,
                                                                                                                    video_data_2_name:"",
                                                                                                                    video_data_3:null,
                                                                                                                    video_data_3_name:"",
                                                                                                                    video_data_4:null,
                                                                                                                    video_data_4_name:"",
                                                                                                                    material_didactico_data:null,
                                                                                                                    material_didactico_name:"",
                                                                                                                    showing_msg_carga_minutos:false,
                                                                                                                    sobrescribirfiles:false
                                                                                                                }); 

                                                                                                                
                                                            
                                                                                                            }
                                                                                                    
                                                                                                    }).catch((error) => {
                                                                                                        thisClass.showMsg("error de "+error);
                                                                                                        thisClass.setState({
                                                                                                                errorMysql:true,
                                                                                                                errorMysql_msg:"No se pudo contactar con el servidor",
                                                                                                                loading_crear_taller:false
                                                                                                            });

                                                                                                            thisClass.props.error_function(true,"Error","No se pudo contactar con el servidor v2");
                                                            
                                                                                                    });

                                                        }
                                                
                                                }).catch((error) => {
                                                    thisClass.showMsg("error de "+error);
                                                    thisClass.setState({
                                                            errorMysql:true,
                                                            errorMysql_msg:"No se pudo contactar con el servidor",
                                                            loading_crear_taller:false
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

    handleChange_checkbox = (e,name) => {
        let isChecked = e.target.checked;
        this.setState({
            [name]: isChecked,
          });
      }
      
   handleCambio_InputsFile = (e,name,name2) =>{
    if(e.target.files[0]!== undefined){
        this.showMsg("Input escogido de "+e.target.files[0].name);
        this.setState({
            [name]: e.target.files[0],
            [name2]: e.target.files[0].name
        });
    }else{
        this.showMsg("Input quitado");
        this.setState({
            [name]: null,
            [name2]: ""
        });
    }
   }

   validate_size_file = (file,maxSize) =>{
        var FileSize = file.size / 1024 / 1024; // in MiB
        if(FileSize>maxSize){
            return false;
        }else{
            return true;
        }
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


  //// handling que se encarga de cuando creamos un taller
  handle_update_taller = () =>{
    //this.showMsg("clickeado enviar con curso picker de "+this.state.select_cursos+" ademas cuestionario picker de "+this.state.select_cuestionario);
    //this.showMsg("con material didactico = "+this.state.material_didactico);
    //this.showMsg("con taller 3 intentos = "+this.state.taller_3_intentos);
    this.showMsg("sobreescritura en "+this.state.sobrescribirfiles);
    this.showMsg(" a validar numero de video "+this.state.select_num_videos);
     
    const thisClass=this;

    var validado_correctamente=true;
    var msg_error_validacion="";


        async function msg_error_inicial(value,titulo,msg) {
            return await Promise.resolve(thisClass.props.error_function(value,titulo,msg));
        };
    
        async function estados_iniciales() {
            return await Promise.resolve(thisClass.setState({
                accion_updating_taller:true
            }));
        }

        msg_error_inicial(false,"","").then(function(){
            estados_iniciales().then(process_resolving());
        });


    function process_resolving(){

        thisClass.showMsg("es un taller ultimos intentos "+thisClass.state.taller_3_intentos);

        if(thisClass.state.material_didactico === true){
            if(thisClass.state.material_didactico_data === undefined || thisClass.state.material_didactico_data ===null){
                validado_correctamente=false;
                msg_error_validacion="Ingrese el material didactico del taller"; 
            }else{
                if(!thisClass.validate_size_file(thisClass.state.material_didactico_data,thisClass.state.max_size_file_upload)){
                    validado_correctamente=false;
                    msg_error_validacion="El material didactico excede los "+thisClass.state.max_size_file_upload+"MB de tamaño maximo";   
                }
            }
        }

        for (let i = 1; i <= thisClass.state.select_num_videos; i++) {
            //this.showMsg("valor de "+this.state["video_data_"+i])
            if(thisClass.state["video_data_"+i] === undefined || thisClass.state["video_data_"+i]===null){
                validado_correctamente=false;
                msg_error_validacion="Ingrese el video numero "+i; 
            }else{
                //this.showMsg("-------------------tamaño de archivo valido = "+this.validate_size_file(this.state["video_data_"+i],25));
                if(!thisClass.validate_size_file(thisClass.state["video_data_"+i],thisClass.state.max_size_file_upload)){
                    validado_correctamente=false;
                    msg_error_validacion="Video numero "+i+" excede los "+thisClass.state.max_size_file_upload+"MB de tamaño maximo";   
                }
            }
        }

        if(thisClass.state.descripcion_taller.trim()<=0){
            validado_correctamente=false;
            msg_error_validacion="Escriba un descripcion para el taller";    
        }
        if(thisClass.state.select_cuestionario==="0"){
            validado_correctamente=false;
            msg_error_validacion="Seleccione el cuestionario que aparecera en el taller";    
        }
        if(thisClass.state.nombre_taller.trim()<=0){
            validado_correctamente=false;
            msg_error_validacion="Escriba un nombre para el taller";    
        }
        if(thisClass.state.select_cursos==="0"){
            validado_correctamente=false;
            msg_error_validacion="Seleccione un curso al que pertenece este taller";
        }
 
        if(!validado_correctamente){
            thisClass.props.error_function(true,"Error",msg_error_validacion);
            thisClass.setState({
                accion_updating_taller:false
            });
        }else{
            thisClass.showMsg("se procede a enviar por axios los archivos asi como la db");


            //this.props.callback_closed("Correcto",this.props.nombre_visualtypo+" editado exitosamente");

            thisClass.setState({
                showing_msg_carga_minutos:true
            });

            let formData = new FormData();
            
            /// acumulo datos y armo el form para el envio ------------------------------------------------------------------
            formData.append('email_admin', thisClass.state.email_admin);/// email
            if(thisClass.state.material_didactico === true){ /// material de estar usando
                formData.append('material', thisClass.state.material_didactico_data);
            }
            //formData.append('video1', this.state.video_data_1);
            for (let i = 1; i <= thisClass.state.select_num_videos; i++) { //// todos los videos que se esten usando
                formData.append('video'+i, thisClass.state["video_data_"+i]);
            }
                formData.append('id_curso',thisClass.state.select_cursos);
                formData.append('nombre_taller',thisClass.state.nombre_taller);
                formData.append('cuestionario_taller',thisClass.state.select_cuestionario);
                formData.append('descripcion_taller',thisClass.state.descripcion_taller);
                var taller_3intentos=thisClass.state.taller_3_intentos?1:0;
                formData.append('taller_3_intentos',taller_3intentos);
                formData.append('num_videos',thisClass.state.select_num_videos);
                formData.append('sobrescribirfiles',thisClass.state.sobrescribirfiles?"si":"no");
                formData.append('id_editar',thisClass.props.dato_id);

            //console.log('>> formData >> ', formData);


            axios.post(`${thisClass.get_ip_server()}/apis/admin_panel/update_taller.php`, formData ,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                  }
            }).then(res => {
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
                                                            accion_updating_taller:false,
                                                            showing_msg_carga_minutos:false
                                                            });

                                                            thisClass.props.callback_closed("Incorrecto",res.data.codigoHTML);

                                                        }else if(res.data.mensaje==="correcto"){
                                                            thisClass.setState({
                                                                accion_updating_taller:false,
                                                                nombre_taller:"",
                                                                descripcion_taller:"",
                                                                select_cursos:"0",
                                                                select_cuestionario:"0",
                                                                select_num_videos:"1",
                                                                material_didactico:false,
                                                                taller_3_intentos:false,
                                                                video_data_1:null,
                                                                video_data_1_name:"",
                                                                video_data_2:null,
                                                                video_data_2_name:"",
                                                                video_data_3:null,
                                                                video_data_3_name:"",
                                                                video_data_4:null,
                                                                video_data_4_name:"",
                                                                material_didactico_data:null,
                                                                material_didactico_name:"",
                                                                showing_msg_carga_minutos:false,
                                                                sobrescribirfiles:false
                                                            }); 
                                                            thisClass.showMsg("----- EDITADO CON EXITO ----")
                                                            thisClass.props.callback_closed("Correcto",thisClass.props.nombre_visualtypo+" y sus archivos actualizados con exito");
                                                        }

                                                }).catch((error) => {
                                                    thisClass.showMsg("error de "+error);
                                                    thisClass.setState({
                                                            errorMysql:true,
                                                            errorMysql_msg:"No se pudo contactar con el servidor",
                                                            accion_updating_taller:false,
                                                            showing_msg_carga_minutos:false
                                                        });

                                                        thisClass.props.callback_closed("Incorrecto","No se pudo contactar con el servidor");
                                                });


        } 
        
    }
 
  }



  ///////// render de la aplicacion

    render = () =>{

        const {thisClass,select_num_videos } = this.state;

        function cursos_picker(){
            var d_curs = [];
            thisClass.state.datos1.map((value,key)=>(
                d_curs.push(<option key={key} value={value[0]}>Curso {value[0]} = {value[1]}</option>)
            ));

            //console.log("datos 1 v2 de"+thisClass.state.datos1);

            return (
                <div className="padreSelects_taller">
                    <select  name="select_cursos" className="browser-default custom-select" 
                    onChange={thisClass.handleChange_selects}
                    value={thisClass.state.select_cursos}
                    >
                    <option value="0">Escoja a que curso pertenece</option>
                    {d_curs}
                    </select>
                </div>
            )
        }


        function cuestionario_picker(){
            var d_cuest = [];
            thisClass.state.datos2.map((value,key)=>(
                d_cuest.push(<option key={key} value={value[0]}>Cuestionario {value[0]} con {value[1]} preguntas, ejemplo : {value[2]}</option>)
            ));

            //console.log("datos 2 v2 de"+thisClass.state.datos2);

            return (
                <div className="padreSelects_taller">
                    <select  name="select_cuestionario" className="browser-default custom-select" 
                    onChange={thisClass.handleChange_selects}
                    value={thisClass.state.select_cuestionario}
                    >
                    <option value="0">Escoja cuestionario a resolver del taller</option>
                    {d_cuest}
                    </select>
                </div>
            )
        }


        function inputs_videos(){

            var inp_videos = [];
            
            for (let i = 1; i <= select_num_videos; i++) {
                inp_videos.push(<div key={i} className="input-group mt-2 input_video_editar">
                    <div className="input-group-prepend">
                        <span className="input-group-text label_input_image" id={`inputGroupFileAddon0${i}`}>
                        Video Numero {i}
                        </span>
                    </div>
                    <div className="custom-file">
                        <input
                        type="file"
                        className="custom-file-input"
                        id={`input_video${i}`}
                        accept="video/quicktime, video/3g2, video/3gp, video/3gp2, video/3gpp, video/asf, video/asx, video/avi, video/divx, video/m4v,  video/mp4, video/mpe, video/x-m4v, video/mpeg, video/mpg, video/ogg, video/wmv"
                        aria-describedby={`inputGroupFileAddon0${i}`}
                        onChange = {e => thisClass.handleCambio_InputsFile(e,"video_data_"+i,"video_data_"+i+"_name")}
                        />
                        <label className="custom-file-label" htmlFor={`input_video${i}`}>
                            {thisClass.state["video_data_"+i+"_name"]===undefined || thisClass.state["video_data_"+i+"_name"].trim().length<=0?"Escoja el video":thisClass.state["video_data_"+i+"_name"]}
                        </label>
                    </div>
                </div>)
            }

            return(
                <MDBCol size="12" md='8' className="mt-4">
                    {inp_videos}
                </MDBCol>
            )
        }

        return(

            <MDBContainer className="padre_modal_editTaller">
                <MDBModal className="modal-dialog-centered" isOpen={this.state.modal8} toggle={this.toogle_modal_editar}>
                    <MDBModalHeader className="text-center" titleClass="w-100 font-weight-bold" toggle={this.toogle_modal_editar}>Editando {this.props.nombre_visualtypo}</MDBModalHeader>
                    <MDBModalBody className="ml-2 mr-2">


        {this.state.loading_crear_taller
            ?
            <div className="mt-4">
                <span className="titulo_carga_bar">Cargando ...</span>
                    <MDBProgress className="my-2 progress_bar_infinite" material value={40} height="10px" color="light-blue darken-1" />
            </div>
            :
                <div className={`mt-5 ${this.state.accion_updating_taller?"no_interaction_taller":""}`}>
                    <form>
                        <div className="grey-text">
                                {cursos_picker()}
                                <MDBInput label="Escriba nombre taller" icon="pencil-square-o" group type="text" validate error="wrong"
                                    success="right" getValue={value => this.get_Inputs_Values(value, "nombre_taller")} value={this.state.nombre_taller}/>
                                {cuestionario_picker()}
                                <MDBInput label="Escriba descripcion taller" group type="textarea" validate error="wrong" rows="5"
                                    success="right" getValue={value => this.get_Inputs_Values(value, "descripcion_taller")} value={this.state.descripcion_taller}/>
                                <div className="padreSelects_taller">
                                    <select  name="select_num_videos" className="browser-default custom-select" 
                                    onChange={this.handleChange_selects}
                                    value={thisClass.state.select_num_videos}
                                    >
                                    <option value="1">Taller tiene 1 video</option>
                                    <option value="2">Taller tiene 2 videos</option>
                                    <option value="3">Taller tiene 3 videos</option>
                                    <option value="4">Taller tiene 4 videos</option>
                                    </select>
                                </div>
                                
                                <div className="custom-control custom-checkbox text-center mt-4 mb-4">
                                    <input type="checkbox" className="custom-control-input" id="defaultUnchecked_6" name="sobrescribirfiles" 
                                    onChange={e => this.handleChange_checkbox(e,"sobrescribirfiles")}
                                    checked={thisClass.state.sobrescribirfiles}
                                    />
                                    <label className="custom-control-label" htmlFor="defaultUnchecked_6">Sobrescribir archivos en server </label>
                                    <MDBPopover popover clickable placement="top" domElement>
                                                                                <span><MDBIcon icon="question-circle" className="pointer ml-2" /></span>
                                                                                <div>
                                                                                <MDBPopoverBody className="text-center z-index-max">
                                                                                    <span className="text-center pointer">Si se selecciona Sobrescribir archivos, y selecciona por ejemplo un video llamado video1.mp4 y es un video que ya subio antes, el video subido previamente sera sobreescrito por el nuevo, hay que tener cuidado con que el video a subir sea distinto a otro subido previamente pero tenga el mismo nombre, videos y materiales nuevos, siempre deben tener nuevos nombres, en caso de un taller usar videos repetidos ya subidos previamente por otro taller solo dejar esta casilla sin marcar y escoger el video con el mismo nombre.</span>
                                                                                </MDBPopoverBody>
                                                                                </div>
                                    </MDBPopover>
                                </div>

                                {inputs_videos()}

                                <div className="custom-control custom-checkbox text-center mt-4">
                                    <input type="checkbox" className="custom-control-input" id="defaultUnchecked_7" name="material_didactico" 
                                    onChange={e => this.handleChange_checkbox(e,"material_didactico")}
                                    checked={thisClass.state.material_didactico}
                                    />
                                    <label className="custom-control-label" htmlFor="defaultUnchecked_7">Taller tiene material didactico</label>
                                </div>

                                {this.state.material_didactico ?
                                        <div className="input-group mt-4">
                                                            <div className="input-group-prepend">
                                                                <span className="input-group-text label_input_image" id="inputGroupFileAddon01">
                                                                Material
                                                                </span>
                                                            </div>
                                                            <div className="custom-file">
                                                                <input
                                                                type="file"
                                                                className="custom-file-input"
                                                                id="inputGroupFile01"
                                                                accept="application/msword, application/vnd.ms-excel, application/vnd.ms-powerpoint,text/plain, application/pdf"
                                                                aria-describedby="inputGroupFileAddon01"
                                                                onChange = {e => thisClass.handleCambio_InputsFile(e,"material_didactico_data","material_didactico_name")}
                                                                />
                                                                <label className="custom-file-label" htmlFor="inputGroupFile01">
                                                                {this.state.material_didactico_name===undefined || this.state.material_didactico_name.trim().length<=0?"Escoja el material":this.state.material_didactico_name}
                                                                </label>
                                                            </div>
                                        </div>
                                :
                                    <></>
                                }

                                <div className="custom-control custom-checkbox text-center mt-4 mb-4">
                                    <input type="checkbox" className="custom-control-input" id="defaultUnchecked_5" name="taller_3_intentos" 
                                    onChange={e => this.handleChange_checkbox(e,"taller_3_intentos")}
                                    checked={thisClass.state.taller_3_intentos}
                                    />
                                    <label className="custom-control-label" htmlFor="defaultUnchecked_5">Es un taller de solo 3 intentos</label>
                                </div>
                                

                                
                        </div>
                        <div className="text-center">
                        {this.state.showing_msg_carga_minutos
                            ?
                            <MDBAlert color="warning" >
                                Subiendo sus datos, tenga paciencia el proceso puede tomar algunos minutos, depende del numero de videos que tiene el taller, y el tamaño de los mismos, así como su velocidad de internet, cuando el proceso termine se le informara, si ocurriera un error también se informara en la interfaz, por ahora queda esperar…
                            </MDBAlert>
                            :
                            <></>
                        }
                            <MDBBtn type="button" className={this.state.accion_updating_taller ? "disabled" : ""} onClick={this.handle_update_taller}>Actualizar Taller</MDBBtn>
                            {this.state.accion_updating_taller
                            ?
                                <div className="spinner-grow text-primary align-middle" role="status">
                                    <span className="sr-only align-middle">Loading...</span>
                                </div>
                                :
                                <></>
                            }
                        </div>
                    </form>
                </div>}
        </MDBModalBody>
        </MDBModal>
    </MDBContainer>
        )
    }

}

export default modificar_taller;