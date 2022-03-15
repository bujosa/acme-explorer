export function User ({ user, onEdit, onDelete }) {
  return (
    <tr>
      <td>
        <h4>
          <a
            className='pointer mx-3'
            onClick={() => onEdit(user)}
          >
            <span><i className='fa fa-edit' /></span>
          </a>
          <a
            className='pointer'
            onClick={() => onDelete(user)}
          >
            <span><i className='fa fa-trash' /></span>
          </a>
        </h4>
      </td>
      <th>{user.username}</th>
      <td>{user.firstname}</td>
      <td>{user.lastname}</td>
      <td>{user.role}</td>
      <td>{user.email}</td>
      <td>{user.info.phone}</td>
      <td>{user.info.address}</td>
    </tr>
  );
}
