import React from 'react';
import {Helmet} from 'react-helmet';
import FormLogin from '../login_form/login';
import Header from "../header/header";
import Footer from "../footer/footer";


class home extends React.Component {

      render = () =>(
        <>
          <Helmet>
                <meta charSet="utf-8" />
                <title>Cursos Kognitive</title>
                <link rel="canonical" href="https://cursos.kognitivecapsa.com" />
                <meta name="description" content="Aqui encontraras los distintos cursos de Kogntive Capsa donde aprenderas sobre disntintos temas de tu interes" />
          </Helmet>
          <Header />
            <FormLogin />
          <Footer />
        </>
    )

}

export default home;