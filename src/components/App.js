import React from 'react';
import "../styles/index.css";
import "../styles/font-awesome.min.css";
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'
import RouteHome from "./Pages/home";
import RouteLogout from "./login_form/logout";
import Cursos from "./cursos/cursos";
import Curso_Individual from './curso/curso';
import Taller_Individual from './taller/taller';
import PerfilUser from './perfil/perfil';
import ResetPassword from './olvido_password/olv_pass';
import RestorePassword from './restore_password/restore_pass';
import AdminPanel from './admin-panel/panel_base';

const App = () => (
    <Router>
       <Switch>
          <Route path='/' exact component={ () => <RouteHome />}/>
          <Route path='/logout' exact component={ () => <RouteLogout />}/>
          <Route path='/cursos' exact component={ () => <Cursos />}/>
          <Route path='/curso/:id' component= {Curso_Individual}/>
          <Route path='/taller/:id_taller,:id_curso' component= {Taller_Individual}/>
          <Route path='/perfil' exact component = { ()=> <PerfilUser/>}/>
          <Route path='/reset-password' exact component = { ()=> <ResetPassword/>}/>
          <Route path='/restore-password/:token_key' component= {RestorePassword}/>
          <Route path='/admin_panel' exact component={ () => <AdminPanel />}/>

          <Route component = {() => (
                    <section className="h-100">
                    <header className="container h-100">
                      <div className="d-flex align-items-center justify-content-center h-100">
                        <div className="d-flex flex-column">
                        <h1>Error 404</h1>
                        <span>Pagina no encontrada</span>
                        </div>
                      </div>
                    </header>
                  </section>
                )}/>
       </Switch>
    </Router>
  )

export default App;
