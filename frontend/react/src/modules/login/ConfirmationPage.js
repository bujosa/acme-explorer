import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../api';

export function ConfirmationPage () {
  const max = 5;
  const [searchParams] = useSearchParams();
  const [state, setState] = useState({
    loaded: false,
    token: searchParams.get('token'),
    message: '',
    error: false,
    count: max
  });

  useEffect(() => {
    if (state.count === max) {
      confirmUserToken({ state, setState });
    } else {
      if (!state.count) {
        location.hash = '#/login';
      } else {
        updateCounter({ setState });
      }
    }
  }, [state.count]);

  return (state.loaded
    ? <div className='d-flex flex-column py-5 justify-content-center align-items-center'>
      {state.error
        ? <div className='alert alert-danger' role='alert'>
          {state.message} Redireccionando al login en {state.count} ...
        </div>
        : <div className='alert alert-success' role='alert'>
          {state.message} Redireccionando al login en {state.count} ...
        </div>}
      </div>
    : <div className='loader' />);
}

async function confirmUserToken ({ state, setState }) {
  setState((state) => ({ ...state, loaded: false }));
  try {
    await api.identity.confirmUser({ token: state.token });
    setState((state) => ({
      ...state,
      loaded: true,
      message: 'El usuario ha sido activado exitosamente.',
      count: state.count - 1
    }));
  } catch (e) {
    setState((state) => ({
      ...state,
      loaded: true,
      error: true,
      message: e.message,
      count: state.count - 1
    }));
  }
}

async function updateCounter ({ setState }) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  setState(state => ({ ...state, count: state.count - 1 }));
}
