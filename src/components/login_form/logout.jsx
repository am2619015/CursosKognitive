import React from "react";
import BaseSystemLogin from "./base_loginSystem";
import history from '../history';
import {removeSession_session,removeSession_role} from "../cookies";

class LogoutForm extends BaseSystemLogin {

    componentDidMount(){
        removeSession_session();
        removeSession_role();
        history.push("/");
        history.go("/");
    }
            render = () =>(
                <>
                    <div></div>
                </>
            )
}

export default LogoutForm;
