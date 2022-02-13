import { useState } from 'react';
import { toast } from 'react-toastify';
import Validator from '../helpers/validator';

export function useForm ({ initState, name, onSubmit, onInputChange, getErrorMessage }) {
  const [state, setState] = useState(initState);
  const payload = {
    state, setState, name, onSubmit, onInputChange, getErrorMessage
  };

  return {
    state,
    setState,
    onSubmit: (event) => handleOnSubmit({ event, ...payload }),
    onInputChange: (event) => handleOnInputChange({ event, ...payload })
  };
}

function handleOnSubmit (params) {
  const { event, onSubmit } = params;
  event.preventDefault();
  if (isFormInValid(params)) {
    document.querySelectorAll(':invalid').forEach(item => item.classList.add('is-invalid'));
    toast.error('Revisa los errores del formulario y vuelve a intentar.');
    return;
  }

  return onSubmit(params);
}

function handleOnInputChange ({ event, state, setState, getErrorMessage = () => {} }) {
  const attrObj = {};
  const attrErrorObj = {};
  const eventTarget = event.target;
  const eventObj = { name: eventTarget.name, value: eventTarget.value, element: eventTarget, state };

  if (eventTarget.type === 'file') {
    attrObj[eventTarget.name] = eventTarget.files[0];
  } else {
    attrObj[eventTarget.name] = eventTarget.value;
  }

  attrErrorObj[eventTarget.name] = getGenericErrorMessage(eventObj).concat(getErrorMessage(eventObj) ?? []);

  setState(state => ({
    ...state,
    model: { ...state.model, ...attrObj },
    error: { ...state.error, ...attrErrorObj }
  }));
}

function getGenericErrorMessage ({ value, element }) {
  const error = [];

  if (element.required && !value) {
    error.push('Debes completar este campo.');
  }

  if (element.min && value.length < element.min) {
    error.push(`El campo no puede tener menos de ${element.min} caracteres.`);
  }

  if (element.max && value.length > element.max) {
    error.push(`El campo no puede tener más de ${element.max} caracteres.`);
  }

  if (element.name === 'email' && !Validator.validateEmail(value)) {
    error.push('Email no es valido, por favor verifica.');
  }

  if (element.type === 'tel' && element.pattern && !element.checkValidity()) {
    error.push('Debes introducir solamente números');
  }

  return error;
}

function isFormInValid ({ name, state }) {
  const form = document.forms[name];
  let invalid = 0;

  Object.keys(state.error).forEach(key => {
    invalid += state.error[key].length;
  });
  if (form) {
    invalid += !form.checkValidity();
  }

  return invalid;
}
