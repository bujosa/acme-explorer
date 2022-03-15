import { LoginContainer } from './components/LoginContainer';
import FieldGroup from '../../components/field-group/FieldGroup';
import { Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import { toast } from 'react-toastify';
import api from '../../api';

export function RegisterPage () {
  const { state, onSubmit, onInputChange } = useForm({
    name: 'signup',
    onSubmit: handleOnSubmit,
    getErrorMessage,
    initState: {
      loaded: true,
      model: {
        name: '',
        surname: '',
        email: '',
        password: '',
        password_confirm: '',
        phone: '',
        address: '',
      },
      error: {}
    }
  });

  return (
    state.loaded
      ? <>
        <LoginContainer>
          <img
            className='mb-4 logo-img' src='images/logo.png'
            alt='Logo'
          />
          <form className='form' name='signup'>
          <FieldGroup
              id='email'
              name='email'
              type='email'
              placeholder='correo@email.com'
              required
              onChange={onInputChange}
              help={state.error.email}
            />
            <FieldGroup
              id='password'
              name='password'
              type='password'
              placeholder='contraseña'
              required
              autoComplete='true'
              min='6'
              onChange={onInputChange}
              help={state.error.password}
            />
            <FieldGroup
              id='password_confirm'
              name='password_confirm'
              type='password'
              placeholder='confirma contraseña'
              required
              autoComplete='true'
              min='6'
              onChange={onInputChange}
              help={state.error.password_confirm}
            />
            <FieldGroup
              id='name'
              name='name'
              type='text'
              placeholder='nombre'
              required
              onChange={onInputChange}
              help={state.error.name}
            />
            <FieldGroup
              id='surname'
              name='surname'
              type='text'
              placeholder='apellido'
              required
              onChange={onInputChange}
              help={state.error.surname}
            />
            <FieldGroup
              id='phone'
              name='phone'
              type='tel'
              pattern='[0-9]+'
              placeholder='teléfono'
              required
              maxLength='15'
              onChange={onInputChange}
              help={state.error.phone}
            />
            <FieldGroup
              id='address'
              name='address'
              type='text'
              placeholder='dirección completa ...'
              onChange={onInputChange}
            />
            <Button onClick={onSubmit} color='success' className='btn-lg col-12 my-4'>¡Regístrame!</Button>
            <hr className='my-2' />
            <Link to='/login'><span className='text-center new-account'>¿ya tienes una cuenta?</span></Link>
          </form>
        </LoginContainer>
      </>
      : <div className='loader' />
  );
}

async function handleOnSubmit ({ setState, state }) {
  setState((state) => ({ ...state, loaded: false }));
  try {
    await api.identity.signup(state.model);
    toast.success(`Hemos enviado un correo a ${state.model.email}, 
    por favor confirmar la cuenta para poder acceder`);
    location.hash = '#/login';
  } catch (e) {
    setState((state) => ({ ...state, loaded: true }));
    toast.error(`Error al registrarte. Por favor, trata otra vez. ${e.message}`);
  }
}

export function getErrorMessage ({ name, value, state }) {
  const error = [];

  switch (name) {
    case 'username':
      if (value && value.length > 20) {
        error.push('El usuario no puede tener más de 20 caracteres.');
      }
      break;
    case 'password_confirm':
      if (value !== state.model.password) {
        error.push('Las contraseñas deben ser iguales.');
      }
      break;

    default:
      break;
  }

  return error;
}
