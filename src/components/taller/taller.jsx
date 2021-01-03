import React from "react";
import {Helmet} from 'react-helmet';
import { MDBBtn,MDBContainer, MDBTabPane, MDBTabContent, MDBNav, MDBNavItem, MDBNavLink,MDBModal, MDBModalBody, MDBModalHeader, MDBModalFooter } from "mdbreact";
import Base from "../base_loged/base_comun";
import Header from "../header/header";
import "./taller.css";
import Footer from "../footer/footer";
import axios from 'axios';
import history from '../history';
import { scroller,Element  } from "react-scroll";
import $ from 'jquery';
import ArrowBack from "../arrow_back/arrow";

var datos_construir_traller = "";
var datos_cuestionario = "";

class taller extends Base {


    constructor(props){
        super(props);

        if(!this.usuario_Logeado()){ 
            history.push("/");
            history.go("/");
           }

        const { match: { params } } = this.props;
        this.state = {
            role : this.role_Logeado(),
            usuario: this.decencriptado_valores(this.get_usuarioNombre().split("§")[1]),
            id_curso: params.id_curso,
            id_taller:params.id_taller,
            errorMysql:false,
            errorMysql_msg:"",
            loading:false,
            acceso_caducado:false,
            titulo_taller :"",
            descripcion_taller:"",
            is_last_taller_curso:false,
            intentos_restantes:999,
            videos : [],
            activeItem_video: "1",
            mostrar_cuestionario:false,
            permite_ver_cuestionario:true,
            nota_previa:0,
            material_url_taller:"",
            id_cuestionario:0,
            objectoClase:this,
            errorMysql_cuest:false,
            errorMysql_msg_cuest:"",
            loading_cuest:false,
            cuestionario : [],
            loading_calificacion : false,
            errorMysql_calif:false,
            errorMysql_calif_msg:"",
            loading_mail_sender : false,
            errorMysql_mail_sender:false,
            errorMysql_mail_sender_msg:"",
            calificacion_cuestionario: 0,
            cuestionario_calificado :false,
            modal14: false
        }

        this.handleCuestionarioClick = this.handleCuestionarioClick.bind(this);
        this.loading_cuestionario = this.loading_cuestionario.bind(this);
        this.handler_CalificacionCuestionario = this.handler_CalificacionCuestionario.bind(this);
        this.handling_calificacion_cuestionario = this.handling_calificacion_cuestionario.bind(this);
        this.toggle_modales_general = this.toggle_modales_general.bind(this);
        this.if_last_taller = this.if_last_taller.bind(this);
        this.get_num_intentos_restantes = this.get_num_intentos_restantes.bind(this);
        this.increase_num_intentos_last_taller = this.increase_num_intentos_last_taller.bind(this);
    }

    toggle_tab_video = tab => e => {
        if (this.state.activeItem_video !== tab) {

            $(".videos_cursos_play").trigger('pause');

          this.setState({
            activeItem_video: tab
          });
        }
      };


    handleCuestionarioClick = () =>{
        /// llamado unicamente cuando termino de calificar el cuestionario ya que puede ser que aun no califica
        if(!this.state.permite_ver_cuestionario){
            this.showMsg("clickeado resolver cuestionario segunda vez");

            this.loading_cuestionario();

            this.setState({
                mostrar_cuestionario:true,
            });  
        }
        /// llamado como estado inicial ya que muestra o no muestra el cuestionario al inicio 
        if(!this.state.mostrar_cuestionario){
            this.showMsg("clickeado resolver cuestionario ");

            this.loading_cuestionario();

            this.setState({
                mostrar_cuestionario:true,
            });  
        }  
        /// timeout que hace scroll a un objeto ya sea que se muestre o no
        setTimeout(() => {
            const scrollType = {
                containerId: "root",
                duration: 500,
                delay: 50,
                smooth: true, // linear “easeInQuint” “easeOutCubic” 
                offset: -100,
             };
             scroller.scrollTo("element_cuestionario",scrollType);
        }, 600);
    }

    componentWillUnmount(){
       datos_construir_traller = "";
       datos_cuestionario = "";
    }

    componentDidMount(){
        this.showMsg("Cargando Taller con role "+this.state.role+" para el usuario "+this.state.usuario);
        this.showMsg("este taller pertenece al curso es con id "+this.state.id_curso);
        this.showMsg("taller tiene id de "+this.state.id_taller);
        this.setState({
             loading:true
            });

            

        const user_login = {
            name: this.state.usuario,
            curso : this.state.id_curso
          };

            //this.showMsg("---> enviando datos "+user_login.name+" - "+user_login.curso);
          // salida del curso donde se comprueba si primero tiene acceso por fecha de caducidad al mismo
          axios.post(`${this.get_ip_server()}/apis/get_fecha_caducidad_curso_usuario.php`, { user_login })
            .then(res => {
              //this.showMsg(res);
              //.log(res.data);
              //this.showMsg(res.data.mensaje);
              //this.showMsg(res.data.codigoHTML);
             // var cursos = JSON.parse(res.data.mensaje);
              //this.showMsg("----> cursos");
              //this.showMsg(cursos);
              if(res.data.mensaje==="incorrecto"){
                this.setState({
                  errorMysql:true,
                  errorMysql_msg:res.data.codigoHTML,
                  loading:false,
                  acceso_caducado:true
                });

                if(res.data.codigoHTML.includes("cookie_erronea")){
                    history.push("/logout");
                  history.go("/logout");
                  }
                  else{
                    history.push("/");
                    history.go("/");  
                  }
                  
              }else if(res.data.mensaje==="correcto"){
                
                var fecha_caducidad = JSON.parse(res.data.codigoHTML);
                if(fecha_caducidad[0] === undefined){
                    this.showMsg("no existe la fecha de tal curso o el estudiante no tiene acceso ni nunca lo tuvo");
                    history.push("/");
                    history.go("/");
                }else{
                    this.showMsg(fecha_caducidad[0][0]);

                    if(this.check_caducado_allready(fecha_caducidad[0][0])){
                        this.showMsg("ya caduco su acceso al curso");

                        this.setState({
                            errorMysql:false,
                            errorMysql_msg:"",
                            loading:false,
                            acceso_caducado:true
                        });

                        history.push("/");
                        history.go("/");  
                    }else{

                        this.showMsg("aun nose caduca el acceso al curso por lo que puede acceder a este taller");

                        /// como aun no se caduca el curso aqui ira otro axios obteniendo los datos de los talleres a mostrar

                                        const user_login2 = {
                                            email : this.state.usuario,
                                            curso_id: this.state.id_curso,
                                            taller_id: this.state.id_taller
                                        };

                                        this.showMsg("----> ENVIANDO "+user_login2.email+" - "+user_login2.curso_id);

                                        axios.post(`${this.get_ip_server()}/apis/get_info_construir_taller.php`, { user_login2 })
                                                .then(res => {
                                                // this.showMsg(res);
                                                 //this.showMsg(res.data);
                                                 //this.showMsg(res.data.mensaje);
                                                 //this.showMsg(res.data.codigoHTML);
                                                // var cursos = JSON.parse(res.data.mensaje);
                                                //this.showMsg("----> cursos");
                                                //this.showMsg(cursos);
                                                    
                                                    if(res.data.mensaje==="incorrecto"){
                                                        this.setState({
                                                        errorMysql:true,
                                                        errorMysql_msg:res.data.codigoHTML,
                                                        loading:false
                                                        });
                                                    }else if(res.data.mensaje==="correcto"){
                                                        

                                                        datos_construir_traller = JSON.parse(res.data.codigoHTML);

                                                        this.showMsg("Mostrando datos para construir el taller "+datos_construir_traller[0]);

                                                        
                                                        this.showMsg("url de material didactico -->"+datos_construir_traller[0][9]);

                                                        var videos_temp = [];
                                                        for (var i = 3; i <=6;i++){
                                                            if(datos_construir_traller[0][i]!=null){
                                                                videos_temp.push(datos_construir_traller[0][i]);
                                                            }
                                                        }
                                                        //this.showMsg("videos de "+videos_temp+ "con largo de "+videos_temp.length);
                                                        
                                                        var material_didactico = datos_construir_traller[0][9]!==null?datos_construir_traller[0][9]:"";

                                                        var nota_taller_temp = datos_construir_traller[0][7]!==null?datos_construir_traller[0][7]:0;

                                                        this.setState({
                                                            errorMysql:false,
                                                            errorMysql_msg:"",
                                                            loading:true,
                                                            acceso_caducado:false,
                                                            titulo_taller:datos_construir_traller[0][1],
                                                            descripcion_taller:datos_construir_traller[0][2],
                                                            videos:videos_temp,
                                                            nota_previa:nota_taller_temp,
                                                            material_url_taller:material_didactico,
                                                            id_cuestionario: datos_construir_traller[0][8]
                                                        });



                                                        this.if_last_taller(); // funcionamiento de si es el ultimo taller de un curso


                                                    }
                                                }).catch((error) => {
                                                this.showMsg("error de "+error);
                                                this.setState({
                                                    errorMysql:true,
                                                    errorMysql_msg:"No se pudo contactar con el servidor",
                                                    loading:false
                                                });
                                                });


                    }
                }
                
              }
            }).catch((error) => {
              this.showMsg("error de "+error);
              this.setState({
                errorMysql:true,
                errorMysql_msg:"No se pudo contactar con el servidor",
                loading:false,
                acceso_caducado:true
              });
              history.push("/");
              history.go("/");
            });



    }

    /// funcion que solo corre en ultimos talleres
    if_last_taller = () =>{

        const info_taller = {
            email : this.state.usuario,
            taller_id: this.state.id_taller
        };

        axios.post(`${this.get_ip_server()}/apis/get_if_taller_final.php`, { info_taller })
                                                            .then(res => {

                                                                //this.showMsg(res);
                                                                this.showMsg("es ultimo taller = "+res.data.codigoHTML.includes("1"));

                                                                

                                                                if(res.data.codigoHTML.includes("1")){
                                                                    this.setState({
                                                                        errorMysql:false,
                                                                        errorMysql_msg:"",
                                                                        loading:true,
                                                                        is_last_taller_curso : res.data.codigoHTML.includes("1")
                                                                    });

                                                                    this.get_num_intentos_restantes();
                                                                }else{
                                                                    this.setState({
                                                                        errorMysql:false,
                                                                        errorMysql_msg:"",
                                                                        loading:false,
                                                                        is_last_taller_curso : res.data.codigoHTML.includes("1")
                                                                    });
                                                                }


                                                            }).catch((error) => {
                                                                this.showMsg("error de "+error);
                                                                this.setState({
                                                                    errorMysql:true,
                                                                    errorMysql_msg:"No se pudo contactar con el servidor"
                                                                });
                                                                });
                                                                
    }

    /// funcion que solo corre en ultimos talleres
    get_num_intentos_restantes = () =>{

        const info_taller = {
            email : this.state.usuario,
            curso_id: this.state.id_curso,
            taller_id: this.state.id_taller
        };

        axios.post(`${this.get_ip_server()}/apis/get_numero_intentos_restantes_taller.php`, { info_taller })
                                                            .then(res => {

                                                                this.showMsg(res);
                                                                
                                                                var respuestaJson = JSON.parse(res.data.codigoHTML);
                                                                this.showMsg("numero de intentos restantes para el taller es de = "+respuestaJson[0]);

                                                                this.setState({
                                                                    errorMysql:false,
                                                                    errorMysql_msg:"",
                                                                    loading:false,
                                                                    intentos_restantes : respuestaJson[0]
                                                                });
                                                                   

                                                            }).catch((error) => {
                                                                this.showMsg("error de "+error);
                                                                this.setState({
                                                                    errorMysql:true,
                                                                    errorMysql_msg:"No se pudo contactar con el servidor"
                                                                });
                                                                });

    }

    loading_cuestionario = () =>{

        if(this.state.intentos_restantes>0){

        this.setState({
            loading_cuest:true,
           });

           const user_login = {
            id_cuestionario : this.state.id_cuestionario,
            email_usuario_solicita: this.state.usuario
        };

        axios.post(`${this.get_ip_server()}/apis/get_cuestionario.php`, { user_login })
                                                .then(res => {
                                                 //this.showMsg(res);
                                                 //this.showMsg(res.data);
                                                 //this.showMsg(res.data.mensaje);
                                                 //this.showMsg(res.data.codigoHTML);
                                                // var cursos = JSON.parse(res.data.mensaje);
                                                //this.showMsg("----> cursos");
                                                //this.showMsg(cursos);
                                                
                                        
                                                if(res.data.mensaje==="incorrecto"){
                                                    this.setState({
                                                    errorMysql_cuest:true,
                                                    errorMysql_msg_cuest:res.data.codigoHTML,
                                                    loading_cuest:false
                                                    });
                                                }else if(res.data.mensaje==="correcto"){
                                                    

                                                    setTimeout(() => {
                                                        const scrollType = {
                                                            containerId: "root",
                                                            duration: 500,
                                                            delay: 50,
                                                            smooth: true, // linear “easeInQuint” “easeOutCubic” 
                                                            offset: -100,
                                                         };
                                                         scroller.scrollTo("element_cuestionario",scrollType);
                                                    }, 600);



                                                    datos_cuestionario = JSON.parse(res.data.codigoHTML);

                                                    this.showMsg("--> cuestionario  "+datos_cuestionario[0]);



                                                    this.setState({
                                                        errorMysql_cuest:false,
                                                        errorMysql_msg_cuest:"",
                                                        loading_cuest:false,
                                                        cuestionario: datos_cuestionario,
                                                        cuestionario_calificado:false,
                                                        permite_ver_cuestionario:true
                                                    });


                                                }
                                                }).catch((error) => {
                                                this.showMsg("error de "+error);
                                                this.setState({
                                                    errorMysql_cuest:true,
                                                    errorMysql_msg_cuest:"No se pudo contactar con el servidor",
                                                    loading_cuest:false
                                                });
                                                });
        }
    }



    check_caducado_allready = (date_caducidad) =>{
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        today = yyyy + '-' + mm + '-' + dd;
        var time_today = new Date(today).getTime();
        var time_caducidad = new Date(date_caducidad).getTime();
        if(time_today>time_caducidad){
            return true;
        }
        return false;
    }

    
    /// permite escoger multiples opciones
    handler_changue_SeleccionMultipleVarias = (e) =>{
        this.showMsg("clickeado seleccion multiple varias");
        if(!$(e.target).parents("li").hasClass("selected")){
            $(e.target).parents("li").addClass("selected");
        }else{
            $(e.target).parents("li").removeClass("selected");
        }
    }
    /// permite escoger una unica opcion y solo una
    handler_changue_SeleccionMultiple = (e) =>{
        this.showMsg("clickeado seleccion multiple");
        // primero desclickeo lo que sea que este clickeado previamente
        $(e.target).parents("li").parent().find(".selected").find(".check").each(function(){
            if($(this).is(':checked')){
                $(this).prop('checked', false);
                $(this).parents("li").removeClass("selected");
            }
        });
        // luego relizo el funcionamiento normal previo con la diferencia que antes de añadir selected, quito todos los demas selected
        if(!$(e.target).parents("li").hasClass("selected")){
            $(e.target).parents("li").parent().find(".selected").removeClass("selected");
            $(e.target).parents("li").addClass("selected");
        }else{
            $(e.target).parents("li").removeClass("selected");
        }
    }

    handler_CalificacionCuestionario = () =>{
        this.showMsg("--> Procediendo a calificar el cuestionario");

        var cuestionario = $(".contenedor_total_cuestionario");

        var preguntas = cuestionario.find(".contenedor_pregunta");

        var array_respuestas = [];

        $.each( preguntas, function( key, value ) {
            var respondido = "";

            if($(value).find(".opciones_respuesta").find("li.selected").length>1){
                $(value).find(".opciones_respuesta").find("li.selected").find("span").each(function() {
                    respondido+="╚"+$(this).html();
                });
            }else{
                $(value).find(".opciones_respuesta").find("li.selected").find("span").each(function() {
                    respondido=$(this).html();
                });
            }

           array_respuestas.push(respondido);
          });

          // envio por ajax el array_respuestas a comprar con las respuestas
          this.handling_calificacion_cuestionario(array_respuestas);
    }

    toggle_modales_general = nr => () => {
        let modalNumber = 'modal' + nr;
        this.showMsg("cuestionario calificado de "+this.state.cuestionario_calificado);
        if(this.state.cuestionario_calificado){
            this.setState({
                [modalNumber]: !this.state[modalNumber],
                cuestionario_calificado:false,
                permite_ver_cuestionario:false
              });
        }else{
            this.setState({
                [modalNumber]: !this.state[modalNumber],
                cuestionario_calificado:false
              });
        } 
      }

    handling_calificacion_cuestionario = (respuestas) =>{


        this.setState({
            loading_calificacion:true,
            cuestionario_calificado:true
           });
        
           

        const user_login = {
            id_cuestionario : this.state.id_cuestionario,
            respuestas_cuestionario : respuestas,
            cod_acc : this.return_codAcc(),
            email_user : this.state.usuario,
            id_curso : this.state.id_curso,
            id_t : this.state.id_taller
        };



        axios.post(`${this.get_ip_server()}/apis/handle_calificacion_cuestionario.php`, { user_login })
                                                .then(res => {
                                                 //this.showMsg(res);
                                                 //this.showMsg(res.data);
                                                 //this.showMsg(res.data.mensaje);
                                                 //this.showMsg(res.data.codigoHTML);
                                                // var cursos = JSON.parse(res.data.mensaje);
                                                //this.showMsg("----> cursos");
                                                //this.showMsg(cursos);
                                                
                                        
                                                if(res.data.mensaje==="incorrecto"){
                                                    this.setState({
                                                    errorMysql_calif:true,
                                                    errorMysql_calif_msg:res.data.codigoHTML,
                                                    loading_calificacion:false
                                                    });
                                                }else if(res.data.mensaje==="correcto"){
                                                    

                                                    //datos_cuestionario = JSON.parse(res.data.codigoHTML);

                                                    //this.showMsg("--> cuestionario  "+datos_cuestionario[0]);
                                                    var calficacion_resp = res.data.codigoHTML;

                                                    calficacion_resp = Math.round((calficacion_resp + Number.EPSILON) * 100) / 100;
                                                    
                                                    this.showMsg("---> CALIFICACION DEL ESTUDIANTE DE "+calficacion_resp+"/20");


                                                    var nota_previatemp = this.state.nota_previa;
                                                    if(calficacion_resp>nota_previatemp){
                                                        nota_previatemp = calficacion_resp;
                                                    }

                                                    this.setState({
                                                        errorMysql_calif:false,
                                                        errorMysql_calif_msg:"",
                                                        loading_calificacion:false,
                                                        calificacion_cuestionario: calficacion_resp,
                                                        nota_previa:nota_previatemp
                                                    });

                                                    this.handle_sending_EmailNotificacion();
                                                    this.increase_num_intentos_last_taller();

                                                }
                                                }).catch((error) => {
                                                this.showMsg("error de "+error);
                                                this.setState({
                                                    errorMysql_calif:true,
                                                    errorMysql_calif_msg:"No se pudo contactar con el servidor",
                                                    loading_calificacion:false
                                                });
                                                });
    }


    

    handle_sending_EmailNotificacion = () =>{
        const user_login = {
            cod_acc : this.return_codAcc(),
            email : this.state.usuario,
            curso_id : this.state.id_curso,
            taller_id : this.state.id_taller,
            puntaje : this.state.calificacion_cuestionario
        };

        this.setState({
            errorMysql_mail_sender:false,
            errorMysql_mail_sender_msg:"",
            loading_mail_sender:true
        });

        axios.post(`${this.get_ip_server()}/mail_sender/taller_completado/index.php`, { user_login })
                                                .then(res => {
                                                 this.showMsg(res);
                                                 this.showMsg(res.data);
                                                 this.showMsg(res.data.mensaje);
                                                 this.showMsg(res.data.codigoHTML);
                                                // var cursos = JSON.parse(res.data.mensaje);
                                                //this.showMsg("----> cursos");
                                                //this.showMsg(cursos);
                                                
                                        
                                                if(res.data.mensaje==="incorrecto"){
                                                    this.setState({
                                                    errorMysql_mail_sender:true,
                                                    errorMysql_mail_sender_msg:res.data.codigoHTML,
                                                    loading_mail_sender:false
                                                    });
                                                }else if(res.data.mensaje==="correcto"){

                                                    this.showMsg("---> Email enviado correctamente ");

                                                    this.setState({
                                                        errorMysql_mail_sender:false,
                                                        errorMysql_mail_sender_msg:res.data.codigoHTML,
                                                        loading_mail_sender:false
                                                    });
                                                }
                                                
                                                }).catch((error) => {
                                                this.showMsg("error de "+error);
                                                this.setState({
                                                    errorMysql_mail_sender:true,
                                                    errorMysql_mail_sender_msg:"No se pudo contactar con el servidor",
                                                    loading_mail_sender:false
                                                });
                                                });


    }


    increase_num_intentos_last_taller = () =>{
        if(this.state.is_last_taller_curso){
            this.showMsg("Actualziando los numeros de intentos del taller");

            const info_taller= {
                email : this.state.usuario,
                curso_id : this.state.id_curso,
                taller_id : this.state.id_taller
            };

            axios.post(`${this.get_ip_server()}/apis/insert_or_update_intentos_taller.php`, { info_taller })
                                                .then(res => {
                                                 this.showMsg(res);
                                                // this.showMsg(res.data);
                                                 //this.showMsg(res.data.mensaje);
                                                 //this.showMsg(res.data.codigoHTML);
                                                // var cursos = JSON.parse(res.data.mensaje);
                                                //this.showMsg("----> cursos");
                                                //this.showMsg(cursos);
                                                
                                        
                                                if(res.data.mensaje==="incorrecto"){
                                                    this.setState({
                                                    errorMysql_mail_sender:true,
                                                    errorMysql_mail_sender_msg:res.data.codigoHTML
                                                    });
                                                }else if(res.data.mensaje==="correcto"){

                                                    this.showMsg("---> Intentos aumentados falta actualizar la interfaz ");

                                                    this.setState({
                                                        errorMysql_mail_sender:false,
                                                        errorMysql_mail_sender_msg:res.data.codigoHTML
                                                    });

                                                    this.get_num_intentos_restantes();
                                                }
                                                
                                                }).catch((error) => {
                                                this.showMsg("error de "+error);
                                                this.setState({
                                                    errorMysql_mail_sender:true,
                                                    errorMysql_mail_sender_msg:"No se pudo contactar con el servidor"
                                                });
                                                });
        }
    }


    render() {
        const videos_temp = this.state.videos;
        const Class_objeto = this.state.objectoClase;
        const material_url = this.state.material_url_taller;
        function videos_instructivos_mostrar() {
            var cont=0;
            var cont2=0;
            return (
                <MDBContainer>
                    <MDBNav className="nav-tabs mt-5">
                        {videos_temp.map((value) => (
                            <MDBNavItem key={cont2++}>
                                <MDBNavLink link to="#" active={Class_objeto.state.activeItem_video === cont2.toString()} onClick={Class_objeto.toggle_tab_video(cont2.toString())} role="tab" >
                                    Video {cont2}
                                </MDBNavLink>
                            </MDBNavItem>
                        ))}
                    </MDBNav>
                    <MDBTabContent activeItem={Class_objeto.state.activeItem_video} >
                            {videos_temp.map((value) => (
                                        <MDBTabPane key={cont++} tabId={cont.toString()} role="tabpanel">
                                                    <div className="embed-responsive embed-responsive-16by9">
                                                        <video controls={true} className="embed-responsive-item videos_cursos_play">
                                                            <source src={`${Class_objeto.get_ip_server()}/content/${value}`} type="video/mp4" />
                                                        </video>
                                                    </div>
                                        </MDBTabPane>
                            ))}
                    </MDBTabContent>
              </MDBContainer>
            );
          }

          const cuestionario_temp = this.state.cuestionario;

          function construyendo_cuestionario(){
              return ( 
                <div className="contenedor_total_cuestionario">
                {cuestionario_temp.map((value)=>(
                    <div key={value[0]} pregunta_num={value[0]} className="contenedor_pregunta">
                        <div className="pregunta_estilo">{value[0]}. {value[2]}</div>
                        {load_segun_tipo_pregunta(value[1],value)}
                    </div>
                ))}
                    <MDBContainer>
                        <MDBBtn color="teal lighten-2 darken-4 text-white" className="btn-lg btn-block" onClick={Class_objeto.toggle_modales_general(14)}>Enviar Respuestas</MDBBtn>
                        <MDBModal isOpen={Class_objeto.state.modal14} toggle={Class_objeto.toggle_modales_general(14)} centered className="modal-dialog-scrollable">
                        <MDBModalHeader toggle={Class_objeto.toggle_modales_general(14)}>
                            {Class_objeto.state.cuestionario_calificado
                            ?
                            "Resultado del Cuestionario"
                            :
                            "Cuestionario Resuelto?"
                            }
                            
                            </MDBModalHeader>
                        <MDBModalBody>
                            {Class_objeto.state.cuestionario_calificado
                            ?
                                Class_objeto.state.loading_calificacion
                                ?
                                <div className="main_load_curso_spiner_2">
                                    <div className="spinner-grow text-success loader_spiner_cursos" role="status">
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                </div>
                                :
                                <div>
                                    <p className="h6 text-center mb-4 bold_weight">Calificacion {Class_objeto.state.calificacion_cuestionario}/{20}</p>
                                    {Class_objeto.state.loading_mail_sender
                                    ?
                                    <div className="main_load_curso_spiner_2">
                                        <div className="spinner-grow text-success loader_spiner_cursos" role="status">
                                            <span className="sr-only">Loading...</span>
                                        </div>
                                    </div>
                                    :
                                        <>
                                            <p className="h6 text-center mb-4 result_email_send"> {Class_objeto.state.errorMysql_mail_sender_msg}</p>
                                            <p className="h6 text-center mb-4 italic-gray">Si no lo encuentras revisa tu bandeja de correo no deseado.</p>
                                        </>
                                    }
                                </div>
                                    

                            :
                            <>
                                <p className="h6 text-center mb-4">Esta seguro que termino el cuestionario, <b>recuerda</b> que una vez <b>enviado</b> se <b>acentara</b> la nota del mismo.</p>
                                <p className="h6 text-center mb-4">Tenga en cuenta que se guardara la nota mas alta para los primeros talleres</p>
                                </>
                            }
                           
                        </MDBModalBody>
                        <MDBModalFooter>
                            {Class_objeto.state.cuestionario_calificado?
                            <MDBBtn color="primary" onClick={Class_objeto.toggle_modales_general(14)}>Terminar</MDBBtn>
                            :
                            <>
                                <MDBBtn color="blue-grey text-white" onClick={Class_objeto.toggle_modales_general(14)}>Seguir Resolviendo</MDBBtn>
                                <MDBBtn color="primary" onClick={Class_objeto.handler_CalificacionCuestionario}>Enviar Respuestas</MDBBtn>
                            </>
                            }
                            
                        </MDBModalFooter>
                        </MDBModal>
                    </MDBContainer>

                </div>
              );
          }

         function load_segun_tipo_pregunta(param,pregunta_cuestionario) {
            switch(param) {
              case 'texto_seleccion_multiple_varias_respuestas':
                return <div>
                            <ol type="a" className="texto_seleccion_multiple_varias_respuestas opciones_respuesta">
                                {pregunta_cuestionario[3].split("╚").map((value,key)=>(
                                  <li key={key}><label><input type="checkbox" className="check checkboxStyleCuest" onChange={Class_objeto.handler_changue_SeleccionMultipleVarias}/><span>{value}</span></label></li>
                                ))}
                            </ol>
                        </div>;
                case 'texto_seleccion_multiple':
                    return <div>
                                <ol type="a" className="texto_seleccion_multiple opciones_respuesta">
                                    {pregunta_cuestionario[3].split("╚").map((value,key)=>(
                                    <li key={key}><label><input type="checkbox" className="check checkboxStyleCuest" onChange={Class_objeto.handler_changue_SeleccionMultiple}/><span>{value}</span></label></li>
                                    ))}
                                </ol>
                            </div>;
                    case 'imagen_seleccion_multiple':
                        return <div>
                            <img src={pregunta_cuestionario[4]} alt={`imagen_pregunta_${pregunta_cuestionario[0]}`} className="img-fluid"/>
                                <ol type="a" className="imagen_seleccion_multiple opciones_respuesta mt-4">
                                    {pregunta_cuestionario[3].split("╚").map((value,key)=>(
                                    <li key={key}><label><input type="checkbox" className="check checkboxStyleCuest" onChange={Class_objeto.handler_changue_SeleccionMultiple}/><span>{value}</span></label></li>
                                    ))}
                                </ol>
                            </div>;
                        case 'imagen_tabla_seleccion_multiple':
                        return <div>
                        <img src={pregunta_cuestionario[4]} alt={`imagen_pregunta_${pregunta_cuestionario[0]}`} className="img-fluid"/>
                            <ol type="a" className="imagen_tabla_seleccion_multiple opciones_respuesta mt-4">
                                {pregunta_cuestionario[3].split("╚").map((value,key)=>(
                                <li key={key}>
                                    <label>
                                        <input type="checkbox" className="check checkboxStyleCuest" onChange={Class_objeto.handler_changue_SeleccionMultiple}/>
                                        <img src={pregunta_cuestionario[key+5]} alt={`imagen_respuesta_${pregunta_cuestionario[0]}_${key+1}`} className="img-fluid img_selecSmall mb-4 mr-4"/>
                                        <span className="resp_invc">{value}</span>
                                        <input type="text" className={`input_respuesta_${pregunta_cuestionario[0]}_${key+1}`}/>
                                    </label>
                                </li>
                                ))}
                            </ol>
                        </div>;
              default:
                return <></>;
            }
          }


          function load_material_educativo_curso(){
            if(material_url!==null && material_url!==""){
              return(
                  <>
                    <h2 className="h4 text-center mb-4 titulo_small_caps separacion_titulos_taller-1">MATERIAL DE LECTURA PARA EL TALLER</h2>
                    <div className="logo_pdf_material_clase" onClick={opening_material_educativo}>
                        <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 58 58" style={{'enableBackground':'new 0 0 58 58'}} xmlSpace="preserve"><g><path d="M39.57,25.259c0.149-0.209,0.207-0.343,0.23-0.415c-0.123-0.065-0.286-0.197-1.175-0.197c-0.505,0-1.139,0.022-1.811,0.108c0.815,0.627,1.014,0.944,1.547,0.944C38.594,25.7,39.262,25.69,39.57,25.259z"/><path d="M20.536,32.634c0.149-0.047,1.019-0.444,2.64-3.436c-2.138,1.201-3.008,2.188-3.07,2.744C20.095,32.034,20.068,32.276,20.536,32.634z"/><path d="M51.5,39V13.978c0-0.766-0.092-1.333-0.55-1.792L39.313,0.55C38.964,0.201,38.48,0,37.985,0H8.963C7.777,0,6.5,0.916,6.5,2.926V39H51.5z M37.5,3.391c0-0.458,0.553-0.687,0.877-0.363l10.095,10.095C48.796,13.447,48.567,14,48.109,14H37.5V3.391z M18.432,31.755c0.182-1.628,2.195-3.332,5.985-5.068c1.504-3.296,2.935-7.357,3.788-10.75c-0.998-2.172-1.968-4.99-1.261-6.643c0.248-0.579,0.557-1.023,1.134-1.215c0.228-0.076,0.804-0.172,1.016-0.172c0.504,0,0.947,0.649,1.261,1.049c0.295,0.376,0.964,1.173-0.373,6.802c1.348,2.784,3.258,5.62,5.088,7.562c1.311-0.237,2.439-0.358,3.358-0.358c1.566,0,2.515,0.365,2.902,1.117c0.32,0.622,0.189,1.349-0.39,2.16c-0.557,0.779-1.325,1.191-2.22,1.191c-1.216,0-2.632-0.768-4.211-2.285c-2.837,0.593-6.151,1.651-8.828,2.822c-0.836,1.774-1.637,3.203-2.383,4.251c-1.023,1.438-1.907,2.107-2.782,2.107h0c-0.348,0-0.682-0.113-0.967-0.326C18.506,33.216,18.366,32.347,18.432,31.755z"/><path d="M21.222,45.858c-0.142-0.196-0.34-0.36-0.595-0.492c-0.255-0.132-0.593-0.198-1.012-0.198h-1.23v3.992h1.504c0.2,0,0.398-0.034,0.595-0.103c0.196-0.068,0.376-0.18,0.54-0.335c0.164-0.155,0.296-0.371,0.396-0.649c0.1-0.278,0.15-0.622,0.15-1.032c0-0.164-0.023-0.354-0.068-0.567C21.456,46.26,21.363,46.055,21.222,45.858z"/><path d="M29.343,18.174c-0.716,2.474-1.659,5.145-2.674,7.564c2.09-0.811,4.362-1.519,6.496-2.02C31.815,22.15,30.466,20.192,29.343,18.174z"/><path d="M6.5,41v15c0,1.009,1.22,2,2.463,2h40.074c1.243,0,2.463-0.991,2.463-2V41H6.5z M22.896,48.429c-0.173,0.415-0.415,0.764-0.725,1.046c-0.31,0.282-0.684,0.501-1.121,0.656s-0.921,0.232-1.449,0.232h-1.217V54h-1.641V43.924h2.898c0.428,0,0.852,0.068,1.271,0.205c0.419,0.137,0.795,0.342,1.128,0.615c0.333,0.273,0.602,0.604,0.807,0.991s0.308,0.822,0.308,1.306C23.156,47.552,23.069,48.014,22.896,48.429z M32.952,50.808c-0.178,0.588-0.403,1.08-0.677,1.477s-0.581,0.709-0.923,0.937s-0.672,0.398-0.991,0.513c-0.319,0.114-0.611,0.187-0.875,0.219C29.222,53.984,29.026,54,28.898,54h-3.814V43.924h3.035c0.848,0,1.593,0.135,2.235,0.403s1.176,0.627,1.6,1.073s0.74,0.955,0.95,1.524c0.209,0.569,0.314,1.155,0.314,1.757C33.219,49.511,33.13,50.22,32.952,50.808z M41.9,45.168h-4.635v3.172h4.211v1.121h-4.211V54h-1.668V43.924H41.9V45.168z"/><path d="M30.765,46.282c-0.287-0.333-0.677-0.602-1.169-0.807s-1.13-0.308-1.914-0.308h-0.957v7.629h1.627c1.112,0,1.914-0.355,2.406-1.066s0.738-1.741,0.738-3.09c0-0.419-0.05-0.834-0.15-1.244C31.245,46.986,31.052,46.615,30.765,46.282z"/><path d="M28.736,9.712c-0.098,0.033-1.33,1.757,0.096,3.216C29.781,10.813,28.779,9.698,28.736,9.712z"/></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg>
                    </div>

                    <p className="h6 text-center mb-4 italic-gray">Presiona la imagen para descargar el material</p>
                </>
              );
            }else{
                return <></>;
            }
          }

          function opening_material_educativo(){
            Class_objeto.showMsg("procediendo a abrir material educativo");
            var url = material_url;
            window.open(url);
          }

        if(this.usuario_Logeado()){
            if(this.role_Logeado()==="estudiante"){
                return (
                    <>
                    <Helmet>
                            <meta charSet="utf-8" />
                            <title>Taller de Kognitive</title>
                            <link rel="canonical" href="https://cursos.kognitivecapsa.com" />
                            <meta name="description" content="Taller de Kognitive Capsa" />
                    </Helmet>
                    <Header/>
                    <main>
                    <MDBContainer className="contenedor_curso my-5">
                        {this.state.loading
                        ?
                            <div className="main_load_curso_spiner">
                                <div className="spinner-grow text-success loader_spiner_cursos" role="status">
                                    <span className="sr-only">Loading...</span>
                                </div>
                            </div>
                        :
                            this.state.errorMysql
                            ?
                            <div>Error mysql de : {this.state.errorMysql_msg} Contacte con el administrador</div>
                            :

                            this.state.acceso_caducado
                                ?
                                        <>
                                        </>
                                :
                                <>
                                    <ArrowBack url_back={`/curso/${this.state.id_curso}`} />
                                    <h1 className="h4 text-center mb-4 titulo_principal_taller">{this.state.titulo_taller}</h1>
                                    <p className="h6 text-center mb-4 italic-gray">{this.state.descripcion_taller}</p>
                                    <p className="italic-gray">Primero revisa nuestros vídeos instructivos, repitelos las veces que consideres necesarias,
                                                                y repasalos hasta dominar el tema propuesto, cuando te sientas con confianza realiza el cuestionario
                                                                para aprobar el taller.</p>
                                    <h2 className="h4 text-center mb-4 titulo_small_caps separacion_titulos_taller-1">VIDEOS INSTRUCTIVOS DE APRENDIZAJE</h2>
                                    {videos_instructivos_mostrar()}

                                    {load_material_educativo_curso()}

                                    
                                    <h2 className="h4 text-center mb-4 titulo_small_caps separacion_titulos_taller-2">CUESTIONARIO DEL TALLER</h2>

                                    <div className="h6 text-center mb-4 bold_weight nota_taller_visual"> <span>Nota del taller :</span> {this.state.nota_previa!==0?
                                    <>
                                        <span>
                                        {this.state.nota_previa}
                                        </span>
                                        <p className="h6 text-center mb-4 italic-gray">
                                            {!this.state.is_last_taller_curso?
                                            "Recuerda que puedes mejorar tu nota y repetir el cuestionario en los primeros talleres las veces que desees"
                                            :
                                            <>    
                                                Este es un taller final, tiene un numero limitado de intentos, la nota mas alta se mantendra
                                                <br></br><br></br>
                                                <span><strong>  Numero Intentos Restantes : {this.state.intentos_restantes<=0?0:this.state.intentos_restantes}</strong></span>
                                            </>
                                            }
                                        </p>
                                    </>
                                    :
                                        <p className="h6 text-center mb-4 italic-gray">
                                            {!this.state.is_last_taller_curso?
                                            <span>No resuelto aun</span>
                                            :
                                            <>
                                                <span>No resuelto aun, ademas es un taller final con numero limitado de intentos</span>
                                                <br></br><br></br>
                                                <span><strong>  Numero Intentos Restantes : {this.state.intentos_restantes<=0?0:this.state.intentos_restantes}</strong></span>
                                            </>
                                            }
                                        </p>
                                    }</div>
                                    <MDBBtn href="#" className={`blue darken-1 btn-lg btn-block text-white ${this.state.intentos_restantes<=0?"disabled":""}`} onClick={this.handleCuestionarioClick}>Resolver cuestionario</MDBBtn>
                                    {this.state.mostrar_cuestionario
                                    ?
                                        <Element className="contenedor_cuestionario" name="element_cuestionario">
                                            {this.state.loading_cuest?
                                                <div className="main_load_curso_spiner_2">
                                                    <div className="spinner-grow text-success loader_spiner_cursos" role="status">
                                                        <span className="sr-only">Loading...</span>
                                                    </div>
                                                </div>
                                            :
                                            <>
                                            {this.state.permite_ver_cuestionario
                                            ?
                                            construyendo_cuestionario()
                                            :
                                                <></>
                                            }
                                            
                                            </>
                                            }
                                            
                                        </Element>
                                    :
                                    <>
                                    </>
                                    }
                                </>  

                                 
                        }
                    </MDBContainer>
                       
                    </main>
                    <Footer />
                    </>
                  );
            }else if(this.role_Logeado()==="profesor"){
                return (
                    <>
                    <Helmet>
                            <meta charSet="utf-8" />
                            <title>Taller de Kognitive</title>
                            <link rel="canonical" href="https://cursos.kognitivecapsa.com" />
                            <meta name="description" content="Taller de Kognitive Capsa" />
                    </Helmet>
                    <Header/>
                    <main>
                        <MDBContainer className="contenedor_curso my-5">
                        <div>En construccion, no existe aun la funcionalidad del maestro, que vera mensajes de sus cursos, estudiantes y calficaciones de sus cursos</div>
                        </MDBContainer>
                    </main>
                    <Footer />
                    </>
                );
            }else{
                return (
                    <>
                    <Helmet>
                            <meta charSet="utf-8" />
                            <title>Taller de Kognitive</title>
                            <link rel="canonical" href="https://cursos.kognitivecapsa.com" />
                            <meta name="description" content="Taller de Kognitive Capsa" />
                    </Helmet>
                    <Header />
                    <main>
                        <MDBContainer className="contenedor_cursos my-5">
                    <div>Error su rol no existe, contactese con el Administrador</div>
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

export default taller;