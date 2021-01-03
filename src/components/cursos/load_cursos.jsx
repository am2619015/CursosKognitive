import React from "react";
import BaseSystemLogin from "../login_form/base_loginSystem";
import { MDBContainer,MDBRow,MDBBtn, MDBCard, MDBCardBody, MDBCardImage, MDBCardTitle, MDBCardText, MDBCol } from 'mdbreact';
import axios from 'axios';
import history from '../history';

var cursos_disponibles = [];

class LoadCursos extends BaseSystemLogin {


    constructor(props){
        super(props);

        this.state = {
            role: props.role,
            usuario: this.decencriptado_valores(this.get_usuarioNombre().split("§")[1]),
            errorMysql:false,
            errorMysql_msg:"",
            classeLoadCursos: this,
            cursos_d : [],
            loading : false
        }
    }

    componentWillUnmount(){
      cursos_disponibles = [];
  }

    componentDidMount(){
        this.showMsg("Cargando cursos con role "+this.state.role+" para el usuario "+this.state.usuario);

        const user_login = {
            name: this.state.usuario
          };
          this.setState({
            loading:true
          });
      
          axios.post(`${this.get_ip_server()}/apis/get_cursos_usuario.php`, { user_login })
            .then(res => {
              //this.showMsg(res);
             // this.showMsg(res.data);
             // this.showMsg(res.data.mensaje);
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

                if(res.data.codigoHTML.includes("cookie_erronea")){
                  history.push("/logout");
                history.go("/logout");
                }

              }else if(res.data.mensaje==="correcto"){
                

                var curso_server = JSON.parse(res.data.codigoHTML);
                //this.showMsg("obj = "+curso_server[0][1]);

                curso_server.forEach(element => {
                    cursos_disponibles.push(element);
                });

               // this.showMsg("cursos "+cursos_disponibles );

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

           // this.showMsg("ya caduco acceso ="+this.check_caducado_allready("2020-07-29"));

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
    

    render = () => {
        const clasePrincipal = this.state.classeLoadCursos;
        function cursos_obtenidos_usuario() {
            return (
                <MDBRow>
                {cursos_disponibles.map((value) => (
                  <MDBCol key={value[0]} md="4" className="curso_individual_load" style={{ maxWidth: "22rem" }}>
                        <MDBCard>
                            <MDBCardImage className="img-fluid" src={value[2]}
                            waves />
                            <MDBCardBody>
                                <MDBCardTitle>{value[3]}</MDBCardTitle>
                                <MDBCardText>{value[1]}</MDBCardText>
                                <MDBBtn id_curso ={value[0]} caducidad ={value[5]} href={`/curso/${value[0]}`}
                                className={clasePrincipal.check_caducado_allready(value[5])?"disabled":""}>
                                    {clasePrincipal.check_caducado_allready(value[5])?"Acceso Caducado":"Ingresar"}
                                </MDBBtn>
                            </MDBCardBody>
                        </MDBCard>
                    </MDBCol>
                ))}
              </MDBRow>
            );
          }

        return (
        <>
            
            <MDBContainer className="contenedor_cursos_load my-5">
            {this.state.loading
            ?
            <div className="main_load_cursos">
                <div className="spinner-grow text-success loader_spiner_cursos" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
            :
             cursos_obtenidos_usuario()
            }     
            </MDBContainer>
        </>
    )
        }

}

export default LoadCursos;
