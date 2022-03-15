import { TripThumbnail } from './TripThumbnail';
import classNames from 'classnames';

export function ListTrip ({ trips, onApply, className }) {
  return (
      trips.length ?
    <div className={classNames('grid-container', className)}>
      {trips.map(trip => <TripThumbnail key={trip.id} trip={trip}  onApply={onApply} />)}
    </div> : <h3>No hay viajes actualmente.</h3>
  );
}
