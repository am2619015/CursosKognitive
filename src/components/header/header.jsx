import React from 'react';
import { MDBNavbar, MDBNavbarBrand, MDBNavbarNav, MDBNavbarToggler, MDBCollapse, MDBNavItem, MDBNavLink } from 'mdbreact';
import BaseSystemLogin from "../login_form/base_loginSystem";

class header extends BaseSystemLogin {
    constructor(props) {
        super(props);
        this.state = {
          collapse: false,
          isWideEnough: false,
          ObjectClass:this,
          location: window.location.pathname
        };
        this.onClick_hamburgesa = this.onClick_hamburgesa.bind(this);
      }
    
      componentDidMount(){
        //this.showMsg("ruta de "+this.state.location);
      }

      onClick_hamburgesa() {
        this.setState({
          collapse: !this.state.collapse
        });
      }

      onclickKognitiveLogo = (e) =>{
          e.preventDefault();
          //this.showMsg("clickeando kognitive logo");
          window.location.href = "https://kognitivecapsa.com";
      }

    
      render() {
        return (
          <div>
            <header>
                <MDBNavbar color="blue darken-3" dark expand="md" fixed="top">
                  <MDBNavbarBrand href="#" onClick={this.onclickKognitiveLogo}>
                    <strong>Kognitive</strong>
                  </MDBNavbarBrand>
                  {!this.state.isWideEnough && this.usuario_Logeado() && <MDBNavbarToggler onClick={this.onClick_hamburgesa} />}
                    {this.usuario_Logeado()
                    ?
                    <MDBCollapse isOpen={this.state.collapse} navbar>
                        <MDBNavbarNav right>
                          {this.state.location.includes("curso/") || this.state.location.includes("taller/") || this.state.location.includes("/perfil")
                          ?
                                      this.role_Logeado().localeCompare("admin") !==0 ?
                                        <MDBNavItem>
                                            <MDBNavLink to="/cursos/">Regresar Cursos</MDBNavLink>
                                        </MDBNavItem>
                                      :
                                      <MDBNavItem>
                                          <MDBNavLink to="/admin_panel/">Regresar Admin Panel</MDBNavLink>
                                      </MDBNavItem>
                          :
                            <></>
                          }
                          {!this.state.location.includes("/perfil")
                          ?
                            <MDBNavItem>
                                <MDBNavLink to="/perfil/"><i className="fa fa-user icono_perfil"></i>Perfil</MDBNavLink>
                            </MDBNavItem>
                          :
                            <></>
                          }
                        <MDBNavItem>
                            <MDBNavLink to="/logout">Salir</MDBNavLink>
                        </MDBNavItem>
                        </MDBNavbarNav>
                    </MDBCollapse>
                    :
                      this.state.location.includes("/reset-password") || this.state.location.includes("/restore-password")
                            ?
                            <>
                            <MDBNavbarToggler onClick={this.onClick_hamburgesa} />
                              <MDBCollapse isOpen={this.state.collapse} navbar>
                                <MDBNavbarNav right>
                                  <MDBNavItem>
                                      <MDBNavLink to="/"><i className="fa fa-home mr-1"></i>Inicio</MDBNavLink>
                                  </MDBNavItem>
                                </MDBNavbarNav>
                              </MDBCollapse>
                            </>
                            :
                              <></>
                  
                    }
                    

                </MDBNavbar>
            </header>
          </div>
        );
      }
  }
  
  export default header;