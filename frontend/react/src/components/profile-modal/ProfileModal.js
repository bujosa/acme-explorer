import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import FieldGroup from '../field-group/FieldGroup';
import { useForm } from '../../hooks/useForm';
import api from '../../api';
import { toast } from 'react-toastify';
import { store } from '../../state/store';
import { loadUser } from '../app/App.slice';

export function ProfileModal ({ user, showProfileModal, toggleProfileModal }) {
  const { state, onSubmit, onInputChange } = useForm({
    name: 'profile',
    onSubmit: (params) => onProfileUpdate({ ...params, toggleProfileModal }),
    initState: {
      loaded: true,
      model: {
        id: user?.id,
        firstname: user?.firstname ?? '',
        lastname: user?.lastname ?? '',
        phone: user?.info?.phone ?? '',
        address: user?.info?.address ?? ''
      },
      error: {}
    }
  });

  return (
    <Modal
      isOpen={showProfileModal}
      toggle={toggleProfileModal}
    >
      <ModalHeader toggle={toggleProfileModal}>
        <i className='fa fa-user-circle' /> Perfil de usuario
      </ModalHeader>
      <ModalBody>
        <form className='form' name='profile'>
          <FieldGroup
            id='username'
            name='username'
            type='text'
            value={user?.username}
            required
            autoFocus
            disabled
          />
          <FieldGroup
            id='email'
            name='email'
            type='text'
            value={user?.email}
            required
            autoFocus
            disabled
          />
          <FieldGroup
            id='firstname'
            name='firstname'
            type='text'
            value={state.model.firstname}
            placeholder='nombre'
            required
            onChange={onInputChange}
            help={state.error.firstname}
          />
          <FieldGroup
            id='lastname'
            name='lastname'
            type='text'
            value={state.model.lastname}
            placeholder='apellido'
            required
            onChange={onInputChange}
            help={state.error.lastname}
          />
          <FieldGroup
            id='phone'
            name='phone'
            type='tel'
            value={state.model.phone}
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
            value={state.model.address}
            placeholder='dirección completa ...'
            onChange={onInputChange}
          />
        </form>
      </ModalBody>
      <ModalFooter>
        <Button onClick={toggleProfileModal}>
          Cancelar
        </Button>
        {' '}
        <Button
          color='success'
          onClick={onSubmit}
        >
          Actualizar
        </Button>
      </ModalFooter>
    </Modal>
  );
}

async function onProfileUpdate ({ state, setState, toggleProfileModal }) {
  try {
    setState((state) => ({ ...state, loaded: false }));
    await api.identity.put(state.model.id, state.model);
    store.dispatch(loadUser(await api.identity.me()));
    toggleProfileModal();
    toast.success('Perfil actualizado exitosamente.');
  } catch (e) {
    toast.error(`Error al actualizar el perfil. ${e.message}`);
  }
}
