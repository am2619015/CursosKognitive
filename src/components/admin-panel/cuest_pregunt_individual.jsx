import React from 'react';
import Base from "../base_loged/base_comun";
import { MDBContainer,MDBModal,MDBModalHeader,MDBModalBody,MDBModalFooter,MDBBtn,MDBInput, MDBRow, MDBCol,MDBPopover,MDBPopoverBody,MDBIcon } from "mdbreact";

class editar_dato extends Base {

    //// se permiten maximo 10 inputs de edicion estos se usan dinamicamente
    constructor(props){
        super(props);

           this.state = {
            email_admin: this.decencriptado_valores(this.get_usuarioNombre().split("§")[1]),
            thisClass:this,
            id_pregunta : this.props.pregunta_seleccionada,
            modal8: false,
            txt_pregunta:"",
            txt_posible_respuesta:"",
            data_posibles_respuestas:"",
            agregando_pregunta:false,
            select_respuestaCorrect:"0",
            respuestas_correctas_multiples:"",
            image_name_pregunta:"",
            image_base64_pregunta:"",
            img1_name:"",
            img1_base64:"",
            img2_name:"",
            img2_base64:"",
            img3_name:"",
            img3_base64:"",
            img4_name:"",
            img4_base64:""
           }

           this.toogle_modal_pregunta = this.toogle_modal_pregunta.bind(this);
           this.get_Inputs_Values = this.get_Inputs_Values.bind(this);
           this.handleChange_selects = this.handleChange_selects.bind(this);
           this.handler_add_pregunta = this.handler_add_pregunta.bind(this);
    }


    componentDidMount(){
        this.showMsg("pregunta a cargar de  "+this.state.id_pregunta);
        this.toogle_modal_pregunta();
    }

    componentWillUnmount(){
        
    }

       //// funcion para obtener valores de cualquier input
    get_Inputs_Values = (value, type) =>{
            // this.showMsg("valor de "+value+" = "+type);
            this.setState({
            [type]: value
            });
        }

       //// handlers para distintos tipos de datos algunos dinamicos son para selects,checkbox e inputs de files
    handleChange_selects = (e) => {
            let {name, value} = e.target;
            this.setState({
            [name]: value,
            });
        }

     /// funcion que abre o cierra el modal
    toogle_modal_pregunta = () => {
        const thisClass=this;
        
        async function cambio_estado_modal(){
            return await Promise.resolve(thisClass.setState({
                    modal8: thisClass.state.modal8?false:true
            }));
        }
        cambio_estado_modal().then(function(){
            accion_final();
        })

            function accion_final(){
                //thisClass.showMsg("modal de"+thisClass.state.modal8)
                if(!thisClass.state.modal8){
                    //thisClass.showMsg("procediendo a cerrar modal");
                    thisClass.props.callback_closed("Cancelado","Modal Cerrado");
                }
            }
      }

      ///// comprobar de si se agregara la pregunta este handler es global para todas las preguntas pero cada uno requiere su validacion distinta////
      handler_add_pregunta = () =>{

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

                //// router de a que validacion ira ya que sera distinta para cada uno //////
                function process_resolving(){
                    switch (thisClass.state.id_pregunta) {
                        case "1":
                            resolucion_pregunta_tipo1();
                        break;
                    
                        case "2":
                            resolucion_pregunta_tipo2();
                        break;
                        case "3":
                            resolucion_pregunta_tipo3();
                        break;
                        case "4":
                            resolucion_pregunta_tipo4();
                        break;

                        default:
                            thisClass.showMsg("Error no se realiza ya que no llegaria aqui");
                    }
                }

                function resolucion_pregunta_tipo1(){
                    
                    if(thisClass.state.txt_pregunta.trim().localeCompare("")===0){
                        thisClass.props.error_function(true,"Error","Escriba el texto de la pregunta");
                    }else if(thisClass.state.data_posibles_respuestas.trim().split("╚").length<2){
                        thisClass.props.error_function(true,"Error","Escriba al menos 2 posibles respuestas");
                    }else if(thisClass.state.select_respuestaCorrect.localeCompare("0")===0){
                        thisClass.props.error_function(true,"Error","Escoja la respuesta correcta");
                    }else{
                        thisClass.showMsg("posible respuestas de "+thisClass.state.data_posibles_respuestas);
                        

                        let tipo_pregunta="";
                        switch (thisClass.state.id_pregunta) {
                            case "1":
                                tipo_pregunta="texto_seleccion_multiple";
                            break;
                        
                            case "2":
                                tipo_pregunta="texto_seleccion_multiple_varias_respuestas";
                            break;
                            case "3":
                                tipo_pregunta="imagen_seleccion_multiple";
                            break;
                            case "4":
                                tipo_pregunta="imagen_tabla_seleccion_multiple";
                            break;

                            default:
                                tipo_pregunta="error";
                        }

                        if(tipo_pregunta.localeCompare("error")!==0){
                            
                            thisClass.props.callback_add_pregunta(tipo_pregunta,thisClass.state.txt_pregunta.trim(),thisClass.state.data_posibles_respuestas.trim(),
                                            thisClass.state.data_posibles_respuestas.trim().split("╚")[parseInt(thisClass.state.select_respuestaCorrect-1)],null,null,
                                            null,null,null); // pasar como parametro pregunta añadir
                            thisClass.toogle_modal_pregunta();
                            
                        }else{
                            thisClass.props.error_function(true,"Error","Error tipo de pregunta no valido contacte con el administrador");
                        }
                    }
                }


                function resolucion_pregunta_tipo2(){
                    
                    if(thisClass.state.txt_pregunta.trim().localeCompare("")===0){
                        thisClass.props.error_function(true,"Error","Escriba el texto de la pregunta");
                    }else if(thisClass.state.data_posibles_respuestas.trim().split("╚").length<3){
                        thisClass.props.error_function(true,"Error","Escriba al menos 3 posibles respuestas");
                    }else if(thisClass.state.respuestas_correctas_multiples.trim().split("╚").length<2){
                        thisClass.props.error_function(true,"Error","Ingrese al menos 2 respuestas correctas en este tipo de pregunta de seleccion mutliple de varias respuestas");
                    }else{
                        thisClass.showMsg("posible respuestas de "+thisClass.state.data_posibles_respuestas);
                        

                        let tipo_pregunta="";
                        switch (thisClass.state.id_pregunta) {
                            case "1":
                                tipo_pregunta="texto_seleccion_multiple";
                            break;
                        
                            case "2":
                                tipo_pregunta="texto_seleccion_multiple_varias_respuestas";
                            break;
                            case "3":
                                tipo_pregunta="imagen_seleccion_multiple";
                            break;
                            case "4":
                                tipo_pregunta="imagen_tabla_seleccion_multiple";
                            break;

                            default:
                                tipo_pregunta="error";
                        }

                        if(tipo_pregunta.localeCompare("error")!==0){
                            
                            thisClass.props.callback_add_pregunta(tipo_pregunta,thisClass.state.txt_pregunta.trim(),thisClass.state.data_posibles_respuestas.trim(),
                                            thisClass.state.respuestas_correctas_multiples.trim(),null,null,
                                            null,null,null); // pasar como parametro pregunta añadir
                            thisClass.toogle_modal_pregunta();
                            
                        }else{
                            thisClass.props.error_function(true,"Error","Error tipo de pregunta no valido contacte con el administrador");
                        }
                    }
                }


                function resolucion_pregunta_tipo3(){
                    
                    if(thisClass.state.txt_pregunta.trim().localeCompare("")===0){
                        thisClass.props.error_function(true,"Error","Escriba el texto de la pregunta");
                    }else if(thisClass.state.data_posibles_respuestas.trim().split("╚").length<2){
                        thisClass.props.error_function(true,"Error","Escriba al menos 2 posibles respuestas");
                    }else if(thisClass.state.select_respuestaCorrect.localeCompare("0")===0){
                        thisClass.props.error_function(true,"Error","Escoja la respuesta correcta");
                    }else if(thisClass.state.image_base64_pregunta.localeCompare("")===0){
                        thisClass.props.error_function(true,"Error","Escoja la imagen de la pregunta");
                    }else{
                        thisClass.showMsg("posible respuestas de "+thisClass.state.data_posibles_respuestas);
                        

                        let tipo_pregunta="";
                        switch (thisClass.state.id_pregunta) {
                            case "1":
                                tipo_pregunta="texto_seleccion_multiple";
                            break;
                        
                            case "2":
                                tipo_pregunta="texto_seleccion_multiple_varias_respuestas";
                            break;
                            case "3":
                                tipo_pregunta="imagen_seleccion_multiple";
                            break;
                            case "4":
                                tipo_pregunta="imagen_tabla_seleccion_multiple";
                            break;

                            default:
                                tipo_pregunta="error";
                        }

                        if(tipo_pregunta.localeCompare("error")!==0){
                            
                            thisClass.props.callback_add_pregunta(tipo_pregunta,thisClass.state.txt_pregunta.trim(),thisClass.state.data_posibles_respuestas.trim(),
                                            thisClass.state.data_posibles_respuestas.trim().split("╚")[parseInt(thisClass.state.select_respuestaCorrect-1)],
                                            thisClass.state.image_base64_pregunta,null,null,null,null); // pasar como parametro pregunta añadir
                            thisClass.toogle_modal_pregunta();
                            
                        }else{
                            thisClass.props.error_function(true,"Error","Error tipo de pregunta no valido contacte con el administrador");
                        }
                    }
                }

                function resolucion_pregunta_tipo4(){
                    
                    if(thisClass.state.txt_pregunta.trim().localeCompare("")===0){
                        thisClass.props.error_function(true,"Error","Escriba el texto de la pregunta");
                    }else if(thisClass.state.data_posibles_respuestas.trim().split("╚").length!==4){
                        thisClass.props.error_function(true,"Error","Escriba las 4 posibles respuestas que corresponden con cada imagen");
                    }else if(thisClass.state.select_respuestaCorrect.localeCompare("0")===0){
                        thisClass.props.error_function(true,"Error","Escoja la respuesta correcta");
                    }else if(thisClass.state.image_base64_pregunta.localeCompare("")===0){
                        thisClass.props.error_function(true,"Error","Escoja la imagen de la pregunta");
                    }else if(thisClass.state.img1_base64.localeCompare("")===0){
                        thisClass.props.error_function(true,"Error","Escoja la imagen para la primera pregunta");
                    }else if(thisClass.state.img2_base64.localeCompare("")===0){
                        thisClass.props.error_function(true,"Error","Escoja la imagen para la segunda pregunta");
                    }else if(thisClass.state.img3_base64.localeCompare("")===0){
                        thisClass.props.error_function(true,"Error","Escoja la imagen para la tercera pregunta");
                    }else if(thisClass.state.img4_base64.localeCompare("")===0){
                        thisClass.props.error_function(true,"Error","Escoja la imagen para la cuarta pregunta");
                    }else{
                        thisClass.showMsg("posible respuestas de "+thisClass.state.data_posibles_respuestas);
                        

                        let tipo_pregunta="";
                        switch (thisClass.state.id_pregunta) {
                            case "1":
                                tipo_pregunta="texto_seleccion_multiple";
                            break;
                        
                            case "2":
                                tipo_pregunta="texto_seleccion_multiple_varias_respuestas";
                            break;
                            case "3":
                                tipo_pregunta="imagen_seleccion_multiple";
                            break;
                            case "4":
                                tipo_pregunta="imagen_tabla_seleccion_multiple";
                            break;

                            default:
                                tipo_pregunta="error";
                        }

                        if(tipo_pregunta.localeCompare("error")!==0){
                            
                            thisClass.props.callback_add_pregunta(tipo_pregunta,thisClass.state.txt_pregunta.trim(),thisClass.state.data_posibles_respuestas.trim(),
                                            thisClass.state.data_posibles_respuestas.trim().split("╚")[parseInt(thisClass.state.select_respuestaCorrect-1)],
                                            thisClass.state.image_base64_pregunta,thisClass.state.img1_base64,thisClass.state.img2_base64,thisClass.state.img3_base64,thisClass.state.img4_base64); // pasar como parametro pregunta añadir
                            thisClass.toogle_modal_pregunta();
                            
                        }else{
                            thisClass.props.error_function(true,"Error","Error tipo de pregunta no valido contacte con el administrador");
                        }
                    }
                }


                


      }
    
      ///// renderizado del objeto
      render = () =>{
        const{thisClass,id_pregunta}  = this.state;

        function load_preguntas(){
            switch (id_pregunta) {
                case "1":
                    return (pregunta_texto_seleccion_multiple())

                case "2":
                    return (pregunta_texto_seleccion_multiple_varias_respuestas())

                case "3":
                    return (pregunta_imagen_seleccion_multiple())

                case "4":
                    return (pregunta_imagen_tabla_seleccion_multiple())
            
                default:
                    return(
                    <div>Error pregunta no posible a cargar</div>)
            }
        }

        function pregunta_texto_seleccion_multiple(){

            function opciones_respuesta(){
                let opciones = [];
                if(thisClass.state.data_posibles_respuestas.trim().localeCompare("")!==0){
                    thisClass.state.data_posibles_respuestas.trim().split("╚").map((value,key) => (
                        opciones.push(<option key={key} value={key+1}>{value}</option>)
                    ));
                }
                return (opciones)
            }

            function handle_add_posible_respuesta(){

                async function msg_error_inicial(value,titulo,msg) {
                    return await Promise.resolve(thisClass.props.error_function(value,titulo,msg));
                };

                msg_error_inicial(false,"","").then(function(){
                        if(thisClass.state.txt_posible_respuesta.trim().localeCompare("")!==0){

                            let valor_introducir=thisClass.state.txt_posible_respuesta.trim();
        
                            let arreglo_datos_ingresados=thisClass.state.data_posibles_respuestas.split("╚");
                            let valor_previamente_ingresado=false;
                            arreglo_datos_ingresados.forEach(element => {
                                if(element.trim().localeCompare(valor_introducir)===0){
                                    valor_previamente_ingresado=true;
                                }
                            });
        
                            if(!valor_previamente_ingresado){
                                let separador = thisClass.state.data_posibles_respuestas.trim().localeCompare("")===0?"":"╚";
                                thisClass.setState({
                                        data_posibles_respuestas:thisClass.state.data_posibles_respuestas+separador+valor_introducir,
                                        txt_posible_respuesta:""
                                });
                            }else{
                                thisClass.props.error_function(true,"Error","No puede ingresar dos veces la misma opcion de respuesta");
                            }
        
                        }else{
                            thisClass.setState({
                                    txt_posible_respuesta:""
                            });    
                        }
                });
               
            }
            return(
                <MDBContainer>
                    <MDBInput label="Escriba la Pregunta" icon="question" group type="text" validate error="wrong"
                                    success="right"  
                                    getValue={value => thisClass.get_Inputs_Values(value, "txt_pregunta")} value={thisClass.state.txt_pregunta}
                    />
                    <MDBRow>
                        <MDBCol size="10">
                            <MDBInput label="Posible respuesta"  group type="text" validate error="wrong"
                                            success="right"  
                                            getValue={value => thisClass.get_Inputs_Values(value, "txt_posible_respuesta")} value={thisClass.state.txt_posible_respuesta}
                            />
                        </MDBCol>
                        <MDBCol size="2">
                            <MDBBtn color="primary" onClick={handle_add_posible_respuesta}>+</MDBBtn>
                        </MDBCol>
                    </MDBRow>
                    <span className="grey-text">Posibles respuestas Ingresadas = {thisClass.state.data_posibles_respuestas.trim().localeCompare("")===0?"0":thisClass.state.data_posibles_respuestas.trim().split("╚").length}</span>

                    <div className="padreSelects_respCorrect mt-2">
                                                    <select  name="select_respuestaCorrect" className="browser-default custom-select" 
                                                    onChange={thisClass.handleChange_selects}
                                                    value={thisClass.state.select_respuestaCorrect}
                                                    >
                                                        <option value="0">Seleccione Respuesta Correcta</option>
                                                        {opciones_respuesta()}
                                                    </select>
                    </div>
                    
                </MDBContainer>
            )
        }

        function pregunta_texto_seleccion_multiple_varias_respuestas(){
            
            function opciones_respuesta(){
                let opciones = [];
                if(thisClass.state.data_posibles_respuestas.trim().localeCompare("")!==0){
                    thisClass.state.data_posibles_respuestas.trim().split("╚").map((value,key) => (
                        opciones.push(<option key={key} value={key+1}>{value}</option>)
                    ));
                }
                return (opciones)
            }

            function handle_add_respuestas(){
                async function msg_error_inicial(value,titulo,msg) {
                    return await Promise.resolve(thisClass.props.error_function(value,titulo,msg));
                };

                msg_error_inicial(false,"","").then(function(){
                    ///respuestas_correctas_multiples
                    if(thisClass.state.select_respuestaCorrect.trim().localeCompare("0")!==0){
                        let respuesta_a_agregar=thisClass.state.data_posibles_respuestas.split("╚")[thisClass.state.select_respuestaCorrect-1];
                        let valor_previo_existente=false;
                        let arreglo_previo=thisClass.state.respuestas_correctas_multiples.split("╚");

                        arreglo_previo.forEach(element => {
                            if(element.trim().localeCompare(respuesta_a_agregar)===0){
                                valor_previo_existente=true;
                            }    
                        });

                        if(!valor_previo_existente){
                        let separador = thisClass.state.respuestas_correctas_multiples.trim().localeCompare("")===0?"":"╚"
                        thisClass.setState({
                            respuestas_correctas_multiples:thisClass.state.respuestas_correctas_multiples+separador+respuesta_a_agregar.trim(),
                            select_respuestaCorrect:"0"
                        })
                        
                            thisClass.showMsg("Seleccionado un valor valido de "+thisClass.state.respuestas_correctas_multiples); 
                        }else{
                            thisClass.props.error_function(true,"Error","Ya selecciono esta Respuesta como valor valido"); 
                        }   
                        
                    }else{
                        thisClass.props.error_function(true,"Error","Seleccione un valor valido para agregar a las respuestas correctas");   
                    }
                });  
            }

            function handle_add_posible_respuesta(){

                async function msg_error_inicial(value,titulo,msg) {
                    return await Promise.resolve(thisClass.props.error_function(value,titulo,msg));
                };

                msg_error_inicial(false,"","").then(function(){
                        if(thisClass.state.txt_posible_respuesta.trim().localeCompare("")!==0){

                            let valor_introducir=thisClass.state.txt_posible_respuesta.trim();
        
                            let arreglo_datos_ingresados=thisClass.state.data_posibles_respuestas.split("╚");
                            let valor_previamente_ingresado=false;
                            arreglo_datos_ingresados.forEach(element => {
                                if(element.trim().localeCompare(valor_introducir)===0){
                                    valor_previamente_ingresado=true;
                                }
                            });
        
                            if(!valor_previamente_ingresado){
                                let separador = thisClass.state.data_posibles_respuestas.trim().localeCompare("")===0?"":"╚";
                                thisClass.setState({
                                        data_posibles_respuestas:thisClass.state.data_posibles_respuestas+separador+valor_introducir,
                                        txt_posible_respuesta:""
                                });
                            }else{
                                thisClass.props.error_function(true,"Error","No puede ingresar dos veces la misma opcion de respuesta");
                            }
        
                        }else{
                            thisClass.setState({
                                    txt_posible_respuesta:""
                            });    
                        }
                });
               
            }
            return(
                <MDBContainer>
                    <MDBInput label="Escriba la Pregunta" icon="question" group type="text" validate error="wrong"
                                    success="right"  
                                    getValue={value => thisClass.get_Inputs_Values(value, "txt_pregunta")} value={thisClass.state.txt_pregunta}
                    />
                    <MDBRow>
                        <MDBCol size="10">
                            <MDBInput label="Posible respuesta"  group type="text" validate error="wrong"
                                            success="right"  
                                            getValue={value => thisClass.get_Inputs_Values(value, "txt_posible_respuesta")} value={thisClass.state.txt_posible_respuesta}
                            />
                        </MDBCol>
                        <MDBCol size="2">
                            <MDBBtn color="primary" onClick={handle_add_posible_respuesta}>+</MDBBtn>
                        </MDBCol>
                    </MDBRow>
                    <span className="grey-text">Posibles respuestas Ingresadas = {thisClass.state.data_posibles_respuestas.trim().localeCompare("")===0?"0":thisClass.state.data_posibles_respuestas.trim().split("╚").length}</span>
                    <MDBRow>
                        <MDBCol size="10">
                            <div className="padreSelects_respCorrect mt-2 mb-2">
                                                            <select  name="select_respuestaCorrect" className="browser-default custom-select" 
                                                            onChange={thisClass.handleChange_selects}
                                                            value={thisClass.state.select_respuestaCorrect}
                                                            >
                                                                <option value="0">Seleccione Respuesta Correcta</option>
                                                                {opciones_respuesta()}
                                                            </select>
                            </div>
                        </MDBCol>
                        <MDBCol size="2">
                            <MDBBtn color="primary" onClick={handle_add_respuestas}>+</MDBBtn>
                        </MDBCol>
                    </MDBRow>
                    
                    <span className="grey-text">Respuestas Correctas Seleccionadas = {thisClass.state.respuestas_correctas_multiples.trim().localeCompare("")===0?"0":thisClass.state.respuestas_correctas_multiples.trim().split("╚").length}</span>

                </MDBContainer>
            )
        }

        function pregunta_imagen_seleccion_multiple(){
            function opciones_respuesta(){
                let opciones = [];
                if(thisClass.state.data_posibles_respuestas.trim().localeCompare("")!==0){
                    thisClass.state.data_posibles_respuestas.trim().split("╚").map((value,key) => (
                        opciones.push(<option key={key} value={key+1}>{value}</option>)
                    ));
                }
                return (opciones)
            }

            function handle_add_posible_respuesta(){

                async function msg_error_inicial(value,titulo,msg) {
                    return await Promise.resolve(thisClass.props.error_function(value,titulo,msg));
                };

                msg_error_inicial(false,"","").then(function(){
                        if(thisClass.state.txt_posible_respuesta.trim().localeCompare("")!==0){

                            let valor_introducir=thisClass.state.txt_posible_respuesta.trim();
        
                            let arreglo_datos_ingresados=thisClass.state.data_posibles_respuestas.split("╚");
                            let valor_previamente_ingresado=false;
                            arreglo_datos_ingresados.forEach(element => {
                                if(element.trim().localeCompare(valor_introducir)===0){
                                    valor_previamente_ingresado=true;
                                }
                            });
        
                            if(!valor_previamente_ingresado){
                                let separador = thisClass.state.data_posibles_respuestas.trim().localeCompare("")===0?"":"╚";
                                thisClass.setState({
                                        data_posibles_respuestas:thisClass.state.data_posibles_respuestas+separador+valor_introducir,
                                        txt_posible_respuesta:""
                                });
                            }else{
                                thisClass.props.error_function(true,"Error","No puede ingresar dos veces la misma opcion de respuesta");
                            }
        
                        }else{
                            thisClass.setState({
                                    txt_posible_respuesta:""
                            });    
                        }
                });
               
            }

                //////// handle escogido foto 
                function estado_cambio_input_foto_pregunta(e){

                    const toBase64 = file => new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = error => reject(error);
                    });

                    async function get_file_base64(file) {
                        var base64_img = await toBase64(file);
                    // thisClass.showMsg(base64_img);
                        thisClass.setState({
                            image_name_pregunta:file.name,
                            image_base64_pregunta:base64_img
                        });
                    }


                    if(e.target.files[0]!== undefined){
                        thisClass.showMsg("Imagen escogida de "+e.target.files[0].name);
                        get_file_base64(e.target.files[0]);
                    }else{
                        thisClass.showMsg("Imagen quitada");
                        thisClass.setState({
                            image_name_pregunta:"",
                            image_base64_pregunta:""
                        });
                    }
                    
                }

                
            return(
                <MDBContainer>
                    <MDBInput label="Escriba la Pregunta acerca de imagen" icon="question" group type="text" validate error="wrong"
                                    success="right"  
                                    getValue={value => thisClass.get_Inputs_Values(value, "txt_pregunta")} value={thisClass.state.txt_pregunta}
                    />
                    <MDBRow>
                        <MDBCol size="10">
                            <MDBInput label="Posible respuesta acerca de imagen"  group type="text" validate error="wrong"
                                            success="right"  
                                            getValue={value => thisClass.get_Inputs_Values(value, "txt_posible_respuesta")} value={thisClass.state.txt_posible_respuesta}
                            />
                        </MDBCol>
                        <MDBCol size="2">
                            <MDBBtn color="primary" onClick={handle_add_posible_respuesta}>+</MDBBtn>
                        </MDBCol>
                    </MDBRow>
                    <span className="grey-text">Posibles respuestas Ingresadas = {thisClass.state.data_posibles_respuestas.trim().localeCompare("")===0?"0":thisClass.state.data_posibles_respuestas.trim().split("╚").length}</span>

                    <div className="padreSelects_respCorrect mt-2">
                                                    <select  name="select_respuestaCorrect" className="browser-default custom-select" 
                                                    onChange={thisClass.handleChange_selects}
                                                    value={thisClass.state.select_respuestaCorrect}
                                                    >
                                                        <option value="0">Seleccione Respuesta Correcta</option>
                                                        {opciones_respuesta()}
                                                    </select>
                    </div>

                    <div className="input-group mt-4">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text label_input_image" id="input_img_pregunta_span">
                                                Imagen de la Pregunta
                                                </span>
                                            </div>
                                            <div className="custom-file">
                                                <input
                                                type="file"
                                                className="custom-file-input"
                                                id="input_img_pregunta"
                                                accept="image/x-png,image/jpeg"
                                                aria-describedby="input_img_pregunta_span"
                                                onChange = {estado_cambio_input_foto_pregunta}
                                                />
                                                <label className="custom-file-label" htmlFor="input_img_pregunta">
                                                    {thisClass.state.image_name_pregunta.trim().length<=0?"Escoja la foto":thisClass.state.image_name_pregunta}
                                                </label>
                                            </div>
                        </div>
                    
                </MDBContainer>
            )
        }

        function pregunta_imagen_tabla_seleccion_multiple(){
            function opciones_respuesta(){
                let opciones = [];
                if(thisClass.state.data_posibles_respuestas.trim().localeCompare("")!==0){
                    thisClass.state.data_posibles_respuestas.trim().split("╚").map((value,key) => (
                        opciones.push(<option key={key} value={key+1}>{value}</option>)
                    ));
                }
                return (opciones)
            }

            function handle_add_posible_respuesta(){

                async function msg_error_inicial(value,titulo,msg) {
                    return await Promise.resolve(thisClass.props.error_function(value,titulo,msg));
                };

                msg_error_inicial(false,"","").then(function(){
                        if(thisClass.state.txt_posible_respuesta.trim().localeCompare("")!==0){

                            let valor_introducir=thisClass.state.txt_posible_respuesta.trim();
        
                            let arreglo_datos_ingresados=thisClass.state.data_posibles_respuestas.split("╚");
                            let valor_previamente_ingresado=false;
                            arreglo_datos_ingresados.forEach(element => {
                                if(element.trim().localeCompare(valor_introducir)===0){
                                    valor_previamente_ingresado=true;
                                }
                            });
        
                            if(!valor_previamente_ingresado){
                                let separador = thisClass.state.data_posibles_respuestas.trim().localeCompare("")===0?"":"╚";
                                thisClass.setState({
                                        data_posibles_respuestas:thisClass.state.data_posibles_respuestas+separador+valor_introducir,
                                        txt_posible_respuesta:""
                                });
                            }else{
                                thisClass.props.error_function(true,"Error","No puede ingresar dos veces la misma opcion de respuesta");
                            }
        
                        }else{
                            thisClass.setState({
                                    txt_posible_respuesta:""
                            });    
                        }
                });
               
            }

                //////// handle escogido foto 
                function estado_cambio_input_foto_pregunta(e){

                    const toBase64 = file => new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = error => reject(error);
                    });

                    async function get_file_base64(file) {
                        var base64_img = await toBase64(file);
                    // thisClass.showMsg(base64_img);
                        thisClass.setState({
                            image_name_pregunta:file.name,
                            image_base64_pregunta:base64_img
                        });
                    }


                    if(e.target.files[0]!== undefined){
                        thisClass.showMsg("Imagen escogida de "+e.target.files[0].name);
                        get_file_base64(e.target.files[0]);
                    }else{
                        thisClass.showMsg("Imagen quitada");
                        thisClass.setState({
                            image_name_pregunta:"",
                            image_base64_pregunta:""
                        });
                    }
                    
                }

                /// handle fotos

                function estado_cambio_input_fotos_multiples(e,name_input,name_data_input){

                    const toBase64 = file => new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = error => reject(error);
                    });

                    async function get_file_base64(file) {
                        var base64_img = await toBase64(file);
                    // thisClass.showMsg(base64_img);
                        thisClass.setState({
                            [name_input]:file.name,
                            [name_data_input]:base64_img
                        });
                    }


                    if(e.target.files[0]!== undefined){
                        thisClass.showMsg("Imagen escogida de "+e.target.files[0].name);
                        get_file_base64(e.target.files[0]);
                    }else{
                        thisClass.showMsg("Imagen quitada");
                        thisClass.setState({
                            [name_input]:"",
                            [name_data_input]:""
                        });
                    }
                    
                }

                

                
            return(
                <MDBContainer>
                    <MDBInput label="Escriba la Pregunta acerca de imagen" icon="question" group type="text" validate error="wrong"
                                    success="right"  
                                    getValue={value => thisClass.get_Inputs_Values(value, "txt_pregunta")} value={thisClass.state.txt_pregunta}
                    />
                    <MDBRow>
                        <MDBCol size="10">
                            <MDBInput label="Posible respuesta acerca de imagen"  group type="text" validate error="wrong"
                                            success="right"  
                                            getValue={value => thisClass.get_Inputs_Values(value, "txt_posible_respuesta")} value={thisClass.state.txt_posible_respuesta}
                            />
                        </MDBCol>
                        <MDBCol size="2">
                            <MDBBtn color="primary" className={thisClass.state.data_posibles_respuestas.trim().split("╚").length===4?"disabled":""} onClick={handle_add_posible_respuesta}>+</MDBBtn>
                        </MDBCol>
                    </MDBRow>
                    <span className="grey-text">Posibles respuestas Ingresadas = {thisClass.state.data_posibles_respuestas.trim().localeCompare("")===0?"0":thisClass.state.data_posibles_respuestas.trim().split("╚").length}</span>

                    <div className="padreSelects_respCorrect mt-2">
                                                    <select  name="select_respuestaCorrect" className="browser-default custom-select" 
                                                    onChange={thisClass.handleChange_selects}
                                                    value={thisClass.state.select_respuestaCorrect}
                                                    >
                                                        <option value="0">Seleccione Respuesta Correcta</option>
                                                        {opciones_respuesta()}
                                                    </select>
                    </div>

                    <div className="input-group mt-4 mb-4">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text label_input_image" id="input_img_pregunta_span">
                                                Imagen de la Pregunta
                                                </span>
                                            </div>
                                            <div className="custom-file">
                                                <input
                                                type="file"
                                                className="custom-file-input"
                                                id="input_img_pregunta"
                                                accept="image/x-png,image/jpeg"
                                                aria-describedby="input_img_pregunta_span"
                                                onChange = {estado_cambio_input_foto_pregunta}
                                                />
                                                <label className="custom-file-label" htmlFor="input_img_pregunta">
                                                    {thisClass.state.image_name_pregunta.trim().length<=0?"Escoja la foto":thisClass.state.image_name_pregunta}
                                                </label>
                                            </div>
                        </div>

                    <span className="grey-text">Imagenes respuestas </span>

                    <div className="input-group mt-1">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text label_input_image" id="input_img_pregunta_1_span">
                                                Imagen respuesta 1
                                                </span>
                                            </div>
                                            <div className="custom-file">
                                                <input
                                                type="file"
                                                className="custom-file-input"
                                                id="input_img_pregunta_1"
                                                accept="image/x-png,image/jpeg"
                                                aria-describedby="input_img_pregunta_1_span"
                                                onChange = {e=>estado_cambio_input_fotos_multiples(e,"img1_name","img1_base64")}
                                                />
                                                <label className="custom-file-label" htmlFor="input_img_pregunta_1">
                                                    {thisClass.state.img1_name.trim().length<=0?"Escoja la foto":thisClass.state.img1_name}
                                                </label>
                                            </div>
                    </div>

                    <div className="input-group mt-1">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text label_input_image" id="input_img_pregunta_2_span">
                                                Imagen respuesta 2
                                                </span>
                                            </div>
                                            <div className="custom-file">
                                                <input
                                                type="file"
                                                className="custom-file-input"
                                                id="input_img_pregunta_2"
                                                accept="image/x-png,image/jpeg"
                                                aria-describedby="input_img_pregunta_2_span"
                                                onChange = {e=>estado_cambio_input_fotos_multiples(e,"img2_name","img2_base64")}
                                                />
                                                <label className="custom-file-label" htmlFor="input_img_pregunta_2">
                                                    {thisClass.state.img2_name.trim().length<=0?"Escoja la foto":thisClass.state.img2_name}
                                                </label>
                                            </div>
                    </div>
                    <div className="input-group mt-1">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text label_input_image" id="input_img_pregunta_3_span">
                                                Imagen respuesta 3
                                                </span>
                                            </div>
                                            <div className="custom-file">
                                                <input
                                                type="file"
                                                className="custom-file-input"
                                                id="input_img_pregunta_3"
                                                accept="image/x-png,image/jpeg"
                                                aria-describedby="input_img_pregunta_3_span"
                                                onChange = {e=>estado_cambio_input_fotos_multiples(e,"img3_name","img3_base64")}
                                                />
                                                <label className="custom-file-label" htmlFor="input_img_pregunta_3">
                                                    {thisClass.state.img3_name.trim().length<=0?"Escoja la foto":thisClass.state.img3_name}
                                                </label>
                                            </div>
                    </div>
                    <div className="input-group mt-1">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text label_input_image" id="input_img_pregunta_4_span">
                                                Imagen respuesta 4
                                                </span>
                                            </div>
                                            <div className="custom-file">
                                                <input
                                                type="file"
                                                className="custom-file-input"
                                                id="input_img_pregunta_4"
                                                accept="image/x-png,image/jpeg"
                                                aria-describedby="input_img_pregunta_4_span"
                                                onChange = {e=>estado_cambio_input_fotos_multiples(e,"img4_name","img4_base64")}
                                                />
                                                <label className="custom-file-label" htmlFor="input_img_pregunta_4">
                                                    {thisClass.state.img4_name.trim().length<=0?"Escoja la foto":thisClass.state.img4_name}
                                                </label>
                                            </div>
                    </div>
                    
                </MDBContainer>
            )
        }

        return(
                <MDBContainer>
                <MDBModal className="modal-dialog-centered" isOpen={this.state.modal8} toggle={this.toogle_modal_pregunta}>
                <MDBModalHeader className="text-center" titleClass="w-100 font-weight-bold" toggle={this.toogle_modal_pregunta}>
                    Pregunta Cuestionario
                    <MDBPopover popover className="full_with_popover" clickable placement="bottom" domElement>
                            <span><MDBIcon icon="question-circle" className="pointer ml-2" /></span>
                            <div>
                            <MDBPopoverBody className="text-center">
                                <img src={`${thisClass.get_ip_server()}/content/images/preg_tipo_${thisClass.state.id_pregunta}.png`} className="img-fluid" alt="info_cuestionario" />
                            </MDBPopoverBody>
                            </div>
                    </MDBPopover>
                </MDBModalHeader>
                <MDBModalBody className="ml-2 mr-2">
                    {load_preguntas()}
                </MDBModalBody>
                <MDBModalFooter className="justify-content-center">
                                <div className="text-center mt-4">
                                    <MDBBtn color="indigo text-white" type="button" className={this.state.agregando_pregunta ? "disabled" : ""} 
                                            onClick={this.handler_add_pregunta}>Agregar</MDBBtn>
                                    {this.state.agregando_pregunta?
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