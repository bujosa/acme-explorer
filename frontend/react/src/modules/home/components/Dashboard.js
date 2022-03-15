import { useEffect, useState } from 'react';
import api from '../../../api';
import { toast } from 'react-toastify';
import { ListTrip } from './ListTrip';
import { Container, Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import {FinderSearch} from "./FinderSearch";
import {store} from "../../../state/store";

export function Dashboard () {
  const { user } = store.getState().app;
  const [state, setState] = useState({
    loaded: false,
    loadedFinder: !user,
    selectedFinder: '',
    finders: [],
    trips: [],
    page: 0,
    perPage: 10,
    pages: 1
  });

  useEffect(() => {
    loadTrips({ state, setState });
    if(user){
     loadFinder( {state, setState})
    }
  }, [state.page, user]);

  return (state.loaded
    ? <Container id='dashboard'>
      {state.loadedFinder ? <FinderSearch handleOnSearch={({state}) => onSearchTrips({setState, state})}
                                          selectedFinder={state.selectedFinder}
                                          onSaveSearch={(model => onSaveSearch({setState, model}))}
                                          onSelectFinder={(selectedFinder) => onSelectFinder({state, setState, selectedFinder})}
                                          user={user} finders={state.finders}/> : <div className='loader' />}
      <ListTrip trips={state.trips} className='py-2' />
      <Pagination listClassName='justify-content-center'>
        <PaginationItem>
          <PaginationLink
            onClick={() => setState(state => ({ ...state, page: 0 }))}
            first
          />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
            onClick={() => setState(state => ({ ...state, page: Math.max(0, state.page - 1) }))}
            previous
          />
        </PaginationItem>
        {[...Array(state.pages).keys()].map(page =>
          <PaginationItem key={page} active={state.page === page}>
            <PaginationLink onClick={() => setState(state => ({ ...state, page: page }))}>
              {page + 1}
            </PaginationLink>
          </PaginationItem>
        )}
        <PaginationItem>
          <PaginationLink
            onClick={() => setState(state => ({ ...state, page: Math.min(state.page + 1, state.pages - 1) }))}
            next
          />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
            onClick={() => setState(state => ({ ...state, page: state.pages - 1 }))}
            last
          />
        </PaginationItem>
      </Pagination>
    </Container>
    : <div className='loader' />);
}

async function loadTrips ({ state, setState }) {
  setState((state) => ({ ...state, loaded: false }));
  try {
    const { records, pages } = await api.trip.list({
      page: state.page,
      perPage: state.perPage
    });
    setState((state) => ({ ...state, pages: Math.ceil(pages), trips: records, loaded: true }));
  } catch (e) {
    setState((state) => ({ ...state, loaded: true }));
    toast.error(`Error al cargar los viajes. ${e.message}`);
  }
}

async function loadFinder ({ setState }) {
  setState((state) => ({ ...state, loadedFinder: false }));
  try {
    const finders = await api.finder.list();
    setState((state) => ({ ...state, finders, loadedFinder: true }));
  } catch (e) {
    setState((state) => ({ ...state, loadedFinder: true }));
    toast.error(`Error al cargar las búsquedas. ${e.message}`);
  }
}

async function onSelectFinder ({state, setState, selectedFinder}) {
  if(!selectedFinder){
   setState((state) => ({ ...state, selectedFinder: {} }));
   loadTrips({state, setState});
  }else{
   setState((state) => ({ ...state, loaded: false }));
  try {
    const { records, pages } = await api.finder.getTrips(selectedFinder._id);
    setState((state) => ({ ...state, selectedFinder: selectedFinder, pages: Math.ceil(pages), trips: records, loaded: true }));
  } catch (e) {
    setState((state) => ({ ...state, loaded: true }));
    toast.error(`Error al buscar en los viajes. ${e.message}`);
  }
  }
}

async function onSearchTrips ({ setState, state: { model } }) {
  setState((state) => ({ ...state, loaded: false }));
  try {
    const { records, pages } = await api.trip.list(model);
    setState((state) => ({ ...state, pages: Math.ceil(pages), selectedFinder: model, trips: records, loaded: true }));
  } catch (e) {
    setState((state) => ({ ...state, loaded: true }));
    toast.error(`Error al buscar en los viajes. ${e.message}`);
  }
}

async function onSaveSearch ({ setState, model }) {
  setState((state) => ({ ...state, loaded: false }));
  try {
    const record = await api.finder.create(model);
    onSelectFinder({setState, selectedFinder: record});
    loadFinder({setState});
  } catch (e) {
    setState((state) => ({ ...state, loaded: true }));
    toast.error(`Error al guardar un finder. ${e.message}`);
  }
}


