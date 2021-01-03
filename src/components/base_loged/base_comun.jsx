import BaseSystemLogin from "../login_form/base_loginSystem";
import history from '../history';


class BaseLogout extends BaseSystemLogin {
    componentDidMount(){
       this.showMsg("Logeado "+this.usuario_Logeado());
       this.showMsg("rol logeado "+this.role_Logeado());
       if(!this.usuario_Logeado()){
        history.push("/logout");
        history.go("/logout");
       }
     }

}

export default BaseLogout;
