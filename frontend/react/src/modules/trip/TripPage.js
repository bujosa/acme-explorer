import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { store } from '../../state/store';

export function TripPage () {
  const { app: { user } } = store.getState();
  const params = useParams();
  const [state, setState] = useState({
    loaded: false,
    trip: null,
  });

  useEffect(() => {
    loadTrip({ id: params.slug, setState });
  }, [params.slug]);

  return <div>
	  <h1>Trip detail page ...</h1>
  </div>;
}

function loadTrip({}){

}