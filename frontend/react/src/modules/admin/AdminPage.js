import { useEffect, useState } from 'react';
import { Card, Col, Container, Nav, NavItem, NavLink, Row, TabContent, TabPane } from 'reactstrap';
import { ListUser } from './components/ListUser';
import { toast } from 'react-toastify';
import api from '../../api';
import swal from 'sweetalert';

export function AdminPage () {
  const [state, setState] = useState({
    loaded: false,
    users: []
  });

  useEffect(() => {
    loadUsers({ state, setState });
  }, []);

  return (state.loaded
    ? <>
      <Container fluid className='py-5'>
        <Row>
          <Col
            md={{
              offset: 1,
              size: 10
            }}
          >
            <h1><i className='fa fa fa-cog' /> Administración</h1>
            <Card className='p-4'>
              <Nav tabs>
                <NavItem>
                  <NavLink className='active'>Usuarios</NavLink>
                </NavItem>
              </Nav>
              <TabContent activeTab='1' className='py-4 px-2'>
                <TabPane tabId='1'>
                  <Row>
                    <Col md={12}>
                      <ListUser
                        users={state.users}
                        onDelete={(user) => onUserDelete({ setState, user })}
                        onEdit={(newUser, user) => onUserEdit({ setState, newUser, user })}
                      />
                    </Col>
                  </Row>
                </TabPane>
              </TabContent>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
    : <div className='loader' />);
}

async function loadUsers ({ setState }) {
  setState((state) => ({ ...state, loaded: false }));
  try {
    const records = await api.identity.list();
    setState((_) => ({ users: records, loaded: true }));
  } catch (e) {
    setState((state) => ({ ...state, loaded: true }));
    toast.error(`Error al cargar los usarios. ${e.message}`);
  }
}

async function onUserDelete ({ setState, user }) {
  const confirm = await swal({
    title: '¿estás seguro que quieres eliminar este usuario?',
    icon: 'warning',
    buttons: true,
    dangerMode: true
  });
  if (confirm) {
    setState((state) => ({ ...state, loaded: false }));
    try {
      await api.identity.delete(user.id);
      setState((state) => ({ users: state.users.filter((u) => u.id !== user.id), loaded: true }));
      toast.success('Usuario eliminado exitosamente.');
    } catch (e) {
      setState((state) => ({ ...state, loaded: true }));
      toast.error(`Error al borrar el usario. ${e.message}`);
    }
  }
}

async function onUserEdit ({ setState, newUser, user }) {
  try {
    setState((state) => ({ ...state, loaded: false }));
    await api.identity.put(user.id, newUser);
    setState((state) => ({ users: state.users.map((u) => u.id === user.id ? { ...u, ...newUser } : u), loaded: true }));
    toast.success('Usuario actualizado exitosamente.');
  } catch (e) {
    toast.error(`Error al modificar el usario. ${e.message}`);
  }
  return true;
}
