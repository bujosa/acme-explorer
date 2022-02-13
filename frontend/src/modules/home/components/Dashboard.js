import { useEffect, useState } from 'react';
import api from '../../../api';
import { toast } from 'react-toastify';
import { ListTrip } from './ListTrip';
import { Container, Pagination, PaginationItem, PaginationLink } from 'reactstrap';

export function Dashboard () {
  const [state, setState] = useState({
    loaded: false,
    trips: [],
    page: 0,
    perPage: 10,
    pages: 1
  });

  useEffect(() => {
    loadTrips({ state, setState });
  }, [state.page]);

  return (state.loaded
    ? <Container id='dashboard'>
      <ListTrip trips={state.trips} className='py-5' />
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
