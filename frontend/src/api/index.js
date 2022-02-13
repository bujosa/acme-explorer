import ApiClient from './ApiClient';
import IdentityAPI from './Identity';
import TripAPI from "./Trip";

const ApiSingleton = () => {
  const api = new ApiClient();

  return {
    identity: new IdentityAPI({ apiClient: api }),
    trip: new TripAPI({ apiClient: api }),
  };
};

export default ApiSingleton();
