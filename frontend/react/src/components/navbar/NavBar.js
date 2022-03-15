import { Link } from 'react-router-dom';
import {
  NavbarBrand, Navbar, Nav, NavItem, NavLink,
  UncontrolledDropdown, DropdownItem, DropdownMenu,
  DropdownToggle, NavbarToggler, Collapse
} from 'reactstrap';
import { useStore } from '../../state/storeHooks';

export function NavBar ({ user, logout, toggleProfileModal }) {

  return (
    <Navbar
      color='dark'
      dark
      expand='lg'
    >
      <NavbarBrand tag={Link} to='/' className='menu-item'>
        <span>Acme Explorer</span>
      </NavbarBrand>
      <NavbarToggler onClick={function noRefCheck () {
      }}
      />
      <Collapse navbar>
        <Nav
          className='me-auto'
          navbar
        >
          <NavItem>
            <NavLink tag={Link} to='/'>
              Inicio
            </NavLink>
          </NavItem>
        </Nav>
        <Nav navbar>
          {user
            ? <UserLinks
                user={user} logout={logout}
                onClickUserImage={toggleProfileModal}
              />
            : <GuestLinks />}
        </Nav>
      </Collapse>
    </Navbar>
  );
}

function GuestLinks () {
  return (
    <>
      <NavLink tag={Link} to='/login'>
        Inicia sesión
      </NavLink>
      <NavLink tag={Link} to='/register'>
        Regístrate
      </NavLink>
    </>
  );
}

function UserLinks ({ user, logout, onClickUserImage }) {
  return (
    <>
      <NavItem>
        <div className='profile-picture'>
          <img
            onClick={onClickUserImage}
            className='pp-user'
            src='images/profile_placeholder.svg' alt='profile'
          />
        </div>
      </NavItem>
      <UncontrolledDropdown nav>
        <DropdownToggle nav caret>
          <span>{user.username}</span>
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem>
            {user.role === 'admin' &&
              <Link to='/admin'>
                Administración
              </Link>}
            {(user.role === 'manager' || user.role === 'explorer') &&
              <Link to='/profile'>
                Mi cuenta
              </Link>}
          </DropdownItem>
          <DropdownItem divider />
          <DropdownItem onClick={logout}>Salir</DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    </>
  );
}
