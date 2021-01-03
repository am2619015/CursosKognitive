import * as Cookies from "js-cookie";

//var inFifteenMinutes = new Date(new Date().getTime() + 15 * 60 * 1000);

export const setSessionCookie_session = (session) => {
  Cookies.remove("session");
  //Cookies.set("session", session, { expires:1}); // expira el acceso en 1 dia de uso
  Cookies.set("session", session); //expira al cerrar el navegador
  //Cookies.set("session", session, { secure:true});
  //console.log("cookie agregada de "+session.userName);
};

export const getSessionCookie_session = () => {
  const sessionCookie = Cookies.get("session");

  if (sessionCookie === undefined) {
    return {};
  } else {
    return JSON.parse(sessionCookie);
  }
};

export const removeSession_session = () =>{
    Cookies.remove("session");
  }


  export const setSessionCookie_role = (rol) => {
    Cookies.remove("role");
    Cookies.set("role", rol); // expira el acceso en 1 dia de uso
    //Cookies.set("role", rol, { secure:true});
    //console.log("cookie agregada de "+rol.role);
  };
  
  export const getSessionCookie_role = () => {
    const sessionCookie = Cookies.get("role");
  
    if (sessionCookie === undefined) {
      return {};
    } else {
      return JSON.parse(sessionCookie);
    }
  };
  
  export const removeSession_role = () =>{
      Cookies.remove("role");
    }