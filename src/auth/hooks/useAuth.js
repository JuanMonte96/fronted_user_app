import { useReducer } from "react"
import Swal from "sweetalert2";
import { loginReducer } from '../reducers/loginReducer'
import { loginUsers } from "../services/authServices";
import { useNavigate } from "react-router-dom";

const initialLogin = JSON.parse(sessionStorage.getItem('login')) || {
    isAuth: false,
    isAdmin: false,
    user: undefined,
}

export const useAuth = () => {

    const [login, dispatch] = useReducer(loginReducer, initialLogin)

    const navigate = useNavigate();

    const handlerLogin = async ({ username, password }) => {

        try {
            const response = await loginUsers({ username, password })
            const token = response.data.token
            const claims = JSON.parse(window.atob(token.split('.')[1]));
            console.log(claims);
            const user = { username: claims.username }
            dispatch({
                type: 'login',
                payload: {user, isAdmin:claims.isAdmin},
            })
            sessionStorage.setItem('login', JSON.stringify({
                isAuth: true,
                isAdmin: claims.isAdmin,
                user,
            }));
            sessionStorage.setItem('token',`Bearer ${token}`);
            navigate('/users')
        } catch(error){

            if (error.response?.status == 401){
                Swal.fire(
                    'Error login',
                    'Username o password invalidos ',
                    'error'
                )
            } else if (error.response?.status == 403){
                Swal.fire(
                    'Error login',
                    'No tiene acceso o permisos al recurso!',
                    'error'
                )
            }else {
                throw error;
            }
        };
    };

    const handlerLogout = () => {
        dispatch({
            type: 'logout'
        });
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('login')
        sessionStorage.clear();
    };

    return {
        login,
        handlerLogin,
        handlerLogout
    };
};
