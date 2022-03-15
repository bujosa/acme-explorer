import { Routes, Route } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { TripPage } from "../trip/TripPage";

export function HomePage () {
  return (
    <Routes>
      <Route exact path='/' element={<Dashboard />} />
      <Route path='/trip/:slug' element={<TripPage />} />
    </Routes>
  );
}
