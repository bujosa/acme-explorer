import { useState } from 'react';

export function EditUser ({ user, onCancel, onSave }) {
  const [firstname, setFirstname] = useState(user.firstname);
  const [lastname, setLastname] = useState(user.lastname);

  return (
    <tr>
      <td>
        <h4>
          <a
            className='pointer mx-3'
            onClick={() => onSave({
              firstname: firstname,
              lastname: lastname
            })}
          >
            <span><i className='fa fa-floppy-o' /></span>
          </a>
          <a
            className='pointer'
            onClick={onCancel}
          >
            <span><i className='fa fa-close' /></span>
          </a>
        </h4>
      </td>
      <th>{user.username}</th>
      <td><input
        className='form-control' name='firstname' value={firstname}
        onChange={(event) => setFirstname(event.target.value)}
          />
      </td>
      <td><input
        className='form-control' name='lastname' value={lastname}
        onChange={(event) => setLastname(event.target.value)}
          />
      </td>
      <td>{user.role}</td>
      <td>{user.email}</td>
      <td>{user.info.phone}</td>
      <td>{user.info.address}</td>
    </tr>
  );
}
