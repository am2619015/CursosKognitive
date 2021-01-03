import React from "react";
import {Helmet} from 'react-helmet';
import {MDBContainer} from 'mdbreact';
import Base from "../base_loged/base_comun";
import Header from "../header/header";
import "./cursos_estilos.css";
import Footer from "../footer/footer";
import LoadCursos from "../cursos/load_cursos";

class cursos extends Base {


    render() {
        if(this.usuario_Logeado()){
            if(this.role_Logeado()==="estudiante"){
                return (
                    <>
                    <Helmet>
                            <meta charSet="utf-8" />
                            <title>Cursos Kognitive</title>
                            <link rel="canonical" href="https://cursos.kognitivecapsa.com" />
                            <meta name="description" content="Distintos Cursos de Kognitive Capsa" />
                    </Helmet>
                    <Header/>
                    <main>
                        <MDBContainer className="contenedor_cursos my-5">
                            <h1 className="h5 text-center mb-4 titulo_cursos">CURSOS DISPONIBLES</h1>
                            <LoadCursos role = {this.role_Logeado()} />
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
                            <title>Cursos Kognitive</title>
                            <link rel="canonical" href="https://cursos.kognitivecapsa.com" />
                            <meta name="description" content="Distintos Cursos de Kognitive Capsa" />
                    </Helmet>
                    <Header/>
                    <main>
                        <MDBContainer className="contenedor_cursos my-5">
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
                            <title>Cursos Kognitive</title>
                            <link rel="canonical" href="https://cursos.kognitivecapsa.com" />
                            <meta name="description" content="Distintos Cursos de Kognitive Capsa" />
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

export default cursos;