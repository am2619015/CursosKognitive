import React from "react";
import {MDBContainer, MDBFooter } from "mdbreact";
import "./footer_estilo.css";

const Footer = () => {
  return (
    <MDBFooter color="blue darken-3" className="footer_final font-small">
      <div className="footer-copyright text-center py-3">
        <MDBContainer fluid>
          &copy; {new Date().getFullYear()} Copyright: <a href="https://kognitivecapsa.com"> KognitiveCapsa.com </a>
        </MDBContainer>
      </div>
    </MDBFooter>
  );
}

export default Footer;