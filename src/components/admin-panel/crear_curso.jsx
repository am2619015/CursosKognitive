import React from 'react';
import Base from "../base_loged/base_comun";
import { MDBTabPane,MDBBtn,MDBInput, MDBRow,MDBCol} from "mdbreact";
import axios from 'axios';

class crear_curso extends Base {

    
    constructor(props){
        super(props);

           this.state = {
            email_admin: this.decencriptado_valores(this.get_usuarioNombre().split("§")[1]),
            errorMysql:false,
            errorMysql_msg:"",
            loading_create_curso:false,
            image_name:"",
            image_base64:"",
            nombre_curso:"",
            descripcion_curso:""
           }



           this.estado_cambio_input_foto=this.estado_cambio_input_foto.bind(this);
           this.handle_crear_curso=this.handle_crear_curso.bind(this);

    }


    componentDidMount(){
        this.showMsg("Objeto crear curso cargado");
        //this.props.success_function(true,"Titulo de esto ","contenido de esto de esto de esto");
        //this.props.error_function(true,"fffffffffff","aaaaaaaaaaaaaaaaaa");
    }

    componentWillUnmount(){
        
    }

    //////// handle escogido foto 
    estado_cambio_input_foto = (e) => {

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
                image_name:file.name,
                image_base64:base64_img
            });
         }


        if(e.target.files[0]!== undefined){
            this.showMsg("Imagen escogida de "+e.target.files[0].name);
            get_file_base64(e.target.files[0]);
        }else{
            this.showMsg("Imagen quitada");
            thisClass.setState({
                image_name:"",
                image_base64:""
            });
        }
        
    }

    ////// handle de agregando el curso evento disparado al clickear boton
    handle_crear_curso = () => {
        //this.showMsg(" Datos --> "+this.state.nombre_curso+" --> "+this.state.descripcion_curso+" --> "+this.state.image_base64)  
        
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
            if(thisClass.state.nombre_curso.trim().localeCompare("")!==0){
                if(thisClass.state.descripcion_curso.trim().localeCompare("")!==0){
                    if(thisClass.state.image_base64.trim().localeCompare("")!==0){
                        //// se procede a crear el curso con axios


                        thisClass.setState({
                            loading_create_curso:true
                        })

                        const user= {
                            email_admin: thisClass.state.email_admin,
                            titulo_c: thisClass.state.nombre_curso,
                            descripcion_c:thisClass.state.descripcion_curso,
                            imagen_c:thisClass.state.image_base64
                        };
            
                        
                        axios.post(`${thisClass.get_ip_server()}/apis/admin_panel/crear_curso.php`, { user })
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
                                                                                    loading_create_curso:false
                                                                                    });
            
                                                                                    thisClass.props.error_function(true,"Error",thisClass.state.errorMysql_msg); 
            
                                                                                }else if(res.data.mensaje==="correcto"){
                            
                                                                                    /// resultado si es correcta

                                                                                    ///en success simplemente si limpian estados para limpiar inputs visuales y tambien se emite success_function
                                                                                    /// ademas de loading para el boton
        
                                                                                    thisClass.setState({
                                                                                        image_name:"",
                                                                                        image_base64:"",
                                                                                        nombre_curso:"",
                                                                                        descripcion_curso:"",
                                                                                        errorMysql:false,
                                                                                        errorMysql_msg:res.data.codigoHTML,
                                                                                        loading_create_curso:false
                                                                                    });
                                                                                    
                                                                                    thisClass.props.success_function(true,"Correcto","Curso Creado exitosamente");
                            
                                                                                }
                                                                        
                                                                        }).catch((error) => {
                                                                            thisClass.showMsg("error de "+error);
                                                                            thisClass.setState({
                                                                                    errorMysql:true,
                                                                                    errorMysql_msg:"No se pudo contactar con el servidor",
                                                                                    loading_create_curso:false
                                                                                });
            
                                                                                thisClass.props.error_function(true,"Error",thisClass.state.errorMysql_msg); 
                                                                        }); 

                    }else{
                        thisClass.props.error_function(true,"Error","Ingrese una imagen para el curso");
                    }
                }else{
                    thisClass.props.error_function(true,"Error","Ingrese la descripcion del curso");
                }
            }else{
                thisClass.showMsg("error sin nombre ingresado");
                thisClass.props.error_function(true,"Error","Ingrese el nombre del curso");
            }

        }
    }

    //// funcion para obtener valores de cualquier input
    get_Inputs_Values_curso = (value, type) =>{
        // this.showMsg("valor de "+value+" = "+type);
         this.setState({
         [type]: value
         });
     }

    

    render = () =>(
        <MDBTabPane key="1" tabId="1" role="tabpanel">
                <div className="mt-5">
                    <form>
                        <div className="grey-text">
                                <MDBInput label="Nombre del curso" icon="book" group type="text" validate error="wrong"
                                    success="right"  
                                    getValue={value => this.get_Inputs_Values_curso(value, "nombre_curso")} value={this.state.nombre_curso}
                                    className="input_curso"/>
                                <MDBInput   className="mb-4" type="textarea" label="Descripcion del curso"
                                            getValue={value => this.get_Inputs_Values_curso(value, "descripcion_curso")} value={this.state.descripcion_curso} 
                                            rows="5" group ref={this.myRef_descripcion_curso}/>
                                <MDBRow>
                                    <MDBCol size="12" md='8' className="mb-4">
                                        <div className="input-group">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text label_input_image" id="inputGroupFileAddon01">
                                                Imagen Curso
                                                </span>
                                            </div>
                                            <div className="custom-file">
                                                <input
                                                type="file"
                                                className="custom-file-input"
                                                id="inputGroupFile01"
                                                accept="image/x-png,image/jpeg"
                                                aria-describedby="inputGroupFileAddon01"
                                                onChange = {this.estado_cambio_input_foto}
                                                />
                                                <label className="custom-file-label" htmlFor="inputGroupFile01">
                                                    {this.state.image_name.trim().length<=0?"Escoja la foto":this.state.image_name}
                                                </label>
                                            </div>
                                        </div>
                                    </MDBCol>
                                    <MDBCol size="12" md='4'>
                                        <img src={this.state.image_base64} className="img-fluid" alt="" />
                                    </MDBCol>
                                </MDBRow>
                        </div>
                        <div className="text-center mt-2">
                            <MDBBtn type="button" className={this.state.loading_create_curso ? "disabled" : ""} onClick={this.handle_crear_curso}>Crear Curso</MDBBtn>
                            {this.state.loading_create_curso
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
        </MDBTabPane>
    )

}

export default crear_curso;