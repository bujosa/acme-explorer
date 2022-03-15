import ApiClient from './ApiClient';
import IdentityAPI from './Identity';
import TripAPI from "./Trip";
import FinderAPI from "./Finder";

const ApiSingleton = () => {
  const api = new ApiClient();

  return {
    identity: new IdentityAPI({ apiClient: api }),
    trip: new TripAPI({ apiClient: api }),
    finder: new FinderAPI({ apiClient: api }),
  };
};

export default ApiSingleton();
