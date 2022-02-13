import { EditableUser } from './EditableUser';

export function ListUser ({ users, onDelete, onEdit }) {
  return (
    <table className='table'>
      <thead>
        <tr>
          <th>&nbsp;</th>
          <th>Usario</th>
          <th>Nombre</th>
          <th>Appellido</th>
          <th>Rol</th>
          <th>Correo</th>
          <th>Teléfono</th>
          <th>Dirección</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) =>
          <EditableUser key={user.username} user={user} onDelete={onDelete} onEdit={onEdit} />
        )}
      </tbody>
    </table>
  );
}
