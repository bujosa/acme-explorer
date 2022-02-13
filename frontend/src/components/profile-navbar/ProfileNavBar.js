import { useState } from 'react';
import { ProfileModal } from '../profile-modal/ProfileModal';
import { NavBar } from '../navbar/NavBar';

export function ProfileNavBar (props) {
  const [state, setState] = useState({
    showProfileModal: false
  });

  const toggleProfileModal = () => {
    setState({ showProfileModal: !state.showProfileModal });
  };

  return (
    <>
      <ProfileModal user={props.user} showProfileModal={state.showProfileModal} toggleProfileModal={toggleProfileModal} />
      <NavBar user={props.user} logout={props.logout} toggleProfileModal={toggleProfileModal} />
    </>
  );
}
