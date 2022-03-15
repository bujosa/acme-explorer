import { LoginContainer } from './components/LoginContainer';
import FieldGroup from '../../components/field-group/FieldGroup';
import { useForm } from '../../hooks/useForm';
import api from '../../api';
import { toast } from 'react-toastify';
import { Navigate, useSearchParams } from 'react-router-dom';
import { getErrorMessage } from './RegisterPage';

export function RestorePage () {
  const [searchParams] = useSearchParams();
  const { state, onSubmit, onInputChange } = useForm({
    name: 'restore',
    onSubmit: handleOnSubmit,
    getErrorMessage,
    initState: {
      loaded: true,
      model: {
        password: '',
        password_confirm: '',
        token: searchParams.get('token')
      },
      error: {}
    }
  });

  if (!state.model.token) return <Navigate to='/' />;
  return (state.loaded
    ? <LoginContainer>
      <img
        className='mb-4 logo-img' src='images/logo.png'
        alt='Logo'
      />
      <form className='form' name='restore'>
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
        <FieldGroup
          id='password_confirm'
          name='password_confirm'
          type='password'
          placeholder='confirma contraseña'
          required
          autoComplete='true'
          min='6'
          bsSize='lg'
          onChange={onInputChange}
          help={state.error.password_confirm}
        />
        <button
          className='btn btn-lg btn-success btn-block my-4'
          onClick={onSubmit}
          type='submit'
        >
          Cambiar contraseña
        </button>
      </form>
    </LoginContainer>
    : <div className='loader' />);
}

async function handleOnSubmit ({ setState, state }) {
  setState((state) => ({ ...state, loaded: false }));
  try {
    await api.identity.restorePassword(state.model);
    location.hash = '#/login';
  } catch (e) {
    toast.error(`Error al cambiar la contraseña. ${e.message}`);
    setState((state) => ({ ...state, loaded: true }));
  }
}
