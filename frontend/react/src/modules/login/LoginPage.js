import { Link } from 'react-router-dom';
import { LoginContainer } from './components/LoginContainer';
import { toast } from 'react-toastify';
import FieldGroup from '../../components/field-group/FieldGroup';
import { useForm } from '../../hooks/useForm';
import api from '../../api';
import { store } from '../../state/store';
import { loadUser } from '../../components/app/App.slice';
import SweetAlert from 'react-bootstrap-sweetalert';

export function LoginPage () {
  const { state, setState, onSubmit, onInputChange } = useForm({
    name: 'login',
    onSubmit: handleOnSubmit,
    initState: {
      loaded: true,
      model: {
        email: '',
        password: '',
        forgot: false
      },
      error: {}
    }
  });
  return (
    state.loaded
      ? <>
        <SweetAlert
          title='No te preocupes ...'
          content='Danos tu correo registrado'
          type='input'
          placeholder='correo@email.com'
          show={state.model.forgot}
          onConfirm={(email) => onForgetPassword({ email, setState })}
          onCancel={() => toggleSweetAlert({ setState })}
          validationMsg='¡Debes ingresar un correo!'
        />
        <LoginContainer>
          <img
            className='mb-4 logo-img' src='images/logo.png'
            alt='Logo'
          />
          <form className='form' name='login'>
            <FieldGroup
              id='email'
              name='email'
              type='email'
              placeholder='correo@email.com'
              bsSize='lg'
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
              bsSize='lg'
              onChange={onInputChange}
              help={state.error.password}
            />
            <button
              className='btn btn-lg btn-success btn-block'
              onClick={onSubmit}
              type='submit'
            >
              Iniciar Sesión
            </button>

            <hr className='my-4' />
            <div>
              <Link to='/register'><span className='text-center new-account'>Regístrate</span></Link>
            </div>
            <div>
              <a
                role='button' onClick={(event) => toggleSweetAlert({ event, setState, value: true })}
                className='text-center'
              >
                ¿Perdiste la contraseña?
              </a>
            </div>
          </form>
        </LoginContainer>
      </>
      : <div className='loader' />
  );
}

async function handleOnSubmit ({ setState, state }) {
  setState((state) => ({ ...state, loaded: false }));
  try {
    const user = await api.identity.login(state.model);
    location.hash = '#/';
    store.dispatch(loadUser(user));
  } catch (e) {
    toast.error(`Error al autenticarte. Por favor, trata otra vez. ${e.message}`);
    setState((state) => ({ ...state, loaded: true }));
  }
}

async function onForgetPassword ({ email, setState }) {
  setState((state) => ({ ...state, loaded: false }));
  try {
    await api.identity.forgotPassword(email);
    toast.success('Se envió un correo para que restaures la contraseña. Verifícalo.');
    toggleSweetAlert({ setState });
  } catch (e) {
    toast.error(`Error al cambiar contraseña. ${e.message}`);
  } finally {
    setState((state) => ({ ...state, loaded: true }));
  }
}

function toggleSweetAlert ({ event, setState, value }) {
  if (event) event.preventDefault();
  setState(state => ({
    ...state,
    ...{
      model: {
        ...state.model,
        forgot: value ?? !state.model.forgot
      }
    }
  }));
}
