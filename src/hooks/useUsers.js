import { useContext, useReducer, useState } from "react";
import { usersReducer } from "../Reducers/usersReducer";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { findAll, remove, save, update } from "../services/userService";
import { AuthContext } from "../auth/context/AuthContext";

const initialUsers = []

const initialUserForm = {
    id: 0,
    username: '',
    password: '',
    email: '',
    admin: false,
};
const initialErrors = {
    username: '',
    password: '',
    email: ''
};
export const useUsers = () => {

    const [users, dispatch] = useReducer(usersReducer, initialUsers);
    const [userSelected, setUserSeleted] = useState(initialUserForm);
    const [visibleForm, setVisibleForm] = useState(false);
    const [errors, setErrors] = useState(initialErrors)
    const navigate = useNavigate()
    const { login, handlerLogout } = useContext(AuthContext)


    const getUsers = async () => {
        try {
            const result = await findAll()
            console.log(result)
            dispatch({
                type: 'loadingUsers',
                payload: result.data,
            });
        } catch (error) {
            if (error.response?.status == 401) {
                handlerLogout();
            }
        }

    }

    const handlerAddUser = async (user) => {
        //console.log(user);

        if (!login.isAdmin) return;

        let response;
        try {
            if (user.id === 0) {
                response = await save(user);
            } else {
                response = await update(user)
            }
            dispatch({
                type: (user.id === 0) ? 'addUser' : 'updateUser',
                payload: response.data,
            })

            Swal.fire(
                (user.id === 0)
                    ? "Usuario Creado"
                    : 'Usuario actualizado',
                (user.id === 0)
                    ? "El Usuario a sido creado con exito"
                    : "El Usuario a sido actualizado con exito",
                "success"
            );

            handlerCloseForm();
            navigate('/users')
        } catch (error) {
            if (error.response && error.response.status == 400) {
                setErrors(error.response.data)

            } else if (error.response && error.response.status == 500 &&
                error.response.data?.message?.includes('constraint')
            ) {
                if (error.response.data?.message?.includes('UK_username')) {
                    setErrors({ username: 'El username ya existe' })
                }
                if (error.response.data?.message?.includes('UK_email')) {
                    setErrors({ email: 'El email ya existe' })
                }
            } else if (error.response?.status == 401) {
                handlerLogout();
            } else {
                throw error;
            }
        }
    };

    const handlerRemoveUser = (id) => {
        //console.log(id);

        Swal.fire({
            title: "Esta seguro de eliminar este usuario?",
            text: "Cuidado no podra recuperar este usuario despues de eliminado",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await remove(id)
                    dispatch({
                        type: 'removeUser',
                        payload: id
                    })

                    Swal.fire({
                        title: "Usuario eliminado!",
                        text: "El usuario a si eliminado con exito",
                        icon: "success"
                    })
                } catch (error) {
                    if (error.response?.status == 401) {
                        handlerLogout();
                    }
                }
            }
        });
    };

    const handlerUserSelectedForm = (user) => {
        //console.log (user)
        setVisibleForm(true)
        setUserSeleted({ ...user })
    };

    const handlerOpenForm = () => {
        setVisibleForm(true)
    }

    const handlerCloseForm = () => {
        setVisibleForm(false);
        setUserSeleted(initialUserForm);
        setErrors({});
    }

    return {
        users,
        userSelected,
        initialUserForm,
        visibleForm,
        errors,
        handlerRemoveUser,
        handlerAddUser,
        handlerUserSelectedForm,
        handlerCloseForm,
        handlerOpenForm,
        getUsers,

    }
}
