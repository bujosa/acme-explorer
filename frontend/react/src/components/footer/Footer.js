import { Navbar } from 'reactstrap';

export function Footer () {
  return (
    <footer>
      <Navbar color='dark' dark>
        <div className='copyright'>
          <p>
            Acme Explorer - {new Date().getFullYear()} &copy; Todos los derechos reservados
          </p>
        </div>
      </Navbar>
    </footer>
  );
}
