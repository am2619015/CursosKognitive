import React from "react";
import {Helmet} from 'react-helmet';
import {MDBRow,MDBContainer} from 'mdbreact';
import Base from "../base_loged/base_comun";
import Header from "../header/header";
import "./curso.css";
import Footer from "../footer/footer";
import axios from 'axios';
import history from '../history';
import { Link } from 'react-router-dom';
import ArrowBack from '../arrow_back/arrow';

var talleres_disponibles = [];

class curso extends Base {


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
            id_curso: params.id,
            errorMysql:false,
            errorMysql_msg:"",
            loading:false,
            acceso_caducado:false,
            nombre_curso:"",
            descripcion_curso:"",
            date_caducidad : ""
        }
    }

    componentWillUnmount(){
        talleres_disponibles = [];
    }


    componentDidMount(){
        this.showMsg("Cargando cursos con role "+this.state.role+" para el usuario "+this.state.usuario);
        this.showMsg("este curso es con id "+this.state.id_curso);

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
              this.showMsg(res);
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
                history.push("/");
                history.go("/");
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

                        if(res.data.codigoHTML.includes("cookie_erronea")){
                            history.push("/logout");
                          history.go("/logout");
                          }
                          else{
                            history.push("/");
                            history.go("/");  
                          }
                        
                    }else{

                        this.showMsg("aun nose caduca el acceso al curso");


                        /// como aun no se caduca el curso aqui ira otro axios obteniendo los datos de los talleres a mostrar

                                        const user_login2 = {
                                            email : this.state.usuario,
                                            curso_id: this.state.id_curso
                                        };

                                        this.showMsg("----> ENVIANDO "+user_login2.email+" - "+user_login2.curso_id);


                                        axios.post(`${this.get_ip_server()}/apis/get_titulo_descript_curso_usuario.php`, { user_login2 })
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
                                                    errorMysql:true,
                                                    errorMysql_msg:res.data.codigoHTML,
                                                    loading:false
                                                    });
                                                }else if(res.data.mensaje==="correcto"){
                                                    

                                                    

                                                    var datos_curso = JSON.parse(res.data.codigoHTML);
                                                    
                                                    //this.showMsg("datos_curso "+datos_curso[0][0]+" - "+datos_curso[0][1]);

                                                    this.setState({
                                                        errorMysql:false,
                                                        errorMysql_msg:"",
                                                        loading:true,
                                                        acceso_caducado:false,
                                                        nombre_curso:datos_curso[0][0],
                                                        descripcion_curso:datos_curso[0][1],
                                                        date_caducidad : fecha_caducidad[0][0]
                                                    });

                                                                            axios.post(`${this.get_ip_server()}/apis/get_info_talleres_curso.php`, { user_login2 })
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
                                                                                    errorMysql:true,
                                                                                    errorMysql_msg:res.data.codigoHTML,
                                                                                    loading:false
                                                                                    });
                                                                                }else if(res.data.mensaje==="correcto"){
                                                                                    

                                                                                    var talleres = JSON.parse(res.data.codigoHTML);

                                                                                    talleres.forEach(element => {
                                                                                        talleres_disponibles.push(element);
                                                                                    });

                                                                                    this.setState({
                                                                                        errorMysql:false,
                                                                                        errorMysql_msg:"",
                                                                                        loading:false
                                                                                    });


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

    render() {
        var cont=1;
        var id_curso = this.state.id_curso;
        function talleres_obtenidos_usuario() {
            /// falta mostrar un resultado y diseño mas agradable para dicho curso asi como el punta del mismo
            return (
                <MDBRow>
                {talleres_disponibles.map((value) => (
                    <div key={value[0]} className="col-lg-4 col-md-6 contenedor_taller">


                            <div className="card text-center taller_card">
                                <div className=" card-header blue darken-3 white-text">
                                    TALLER NUMERO {cont++}
                                </div>
                                <div className="card-body">
                                <h4 className="card-title">{value[1]}</h4>
                                <p className="card-text">{value[2]}</p>
                                <Link className="btn-default btn Ripple-parents btn-sm black-text" to={`/taller/${value[0]},${id_curso}`} >Resolver taller
                                </Link>
                                </div>
                                <div className="card-footer text-muted blue darken-3 white-text">
                                <p className="mb-0 white-text">Nota : {value[7]===null?"no resuelto":value[7]+"/20"}</p>
                                </div>
                            </div>
                        </div>
                ))}
              </MDBRow>
            );
          }

        if(this.usuario_Logeado()){
            if(this.role_Logeado()==="estudiante"){
                return (
                    <>
                    <Helmet>
                            <meta charSet="utf-8" />
                            <title>Talleres de Curso de Kognitive</title>
                            <link rel="canonical" href="https://cursos.kognitivecapsa.com" />
                            <meta name="description" content="Distintos Talleres de Kognitive Capsa" />
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
                                    <ArrowBack url_back={"/cursos/"} />
                                    <div className="info_caducidad"><span>Su acceso al curso caduca el : {this.state.date_caducidad} a media noche.</span></div>
                                    <div className="contenedor_grilla_talleres">
                                        <h1 className="h3 text-center mb-4 titulo_small_caps">{this.state.nombre_curso}</h1>
                                        <p className="text-justify mb-4 descripcion_curso">{this.state.descripcion_curso}</p>
                                        {talleres_obtenidos_usuario()}
                                    </div>
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
                            <title>Talleres de Curso de Kognitive</title>
                            <link rel="canonical" href="https://cursos.kognitivecapsa.com" />
                            <meta name="description" content="Distintos Talleres de Kognitive Capsa" />
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
                            <title>Talleres de Curso de Kognitive</title>
                            <link rel="canonical" href="https://cursos.kognitivecapsa.com" />
                            <meta name="description" content="Distintos Talleres de Kognitive Capsa" />
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

export default curso;