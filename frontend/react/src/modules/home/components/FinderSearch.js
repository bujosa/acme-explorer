import {useForm} from "../../../hooks/useForm";
import {getErrorMessage} from "../../login/RegisterPage";
import FieldGroup from "../../../components/field-group/FieldGroup";
import {Button} from "reactstrap";
import SweetAlert from "react-bootstrap-sweetalert";

export function FinderSearch({finders = [], selectedFinder = {}, handleOnSearch, onSaveSearch, onSelectFinder, user}) {
    const maxPrice = 999;
    const {state, setState, onSubmit, onInputChange} = useForm({
        name: 'finder',
        onSubmit: handleOnSearch,
        getErrorMessage,
        initState: {
            loaded: true,
            showFinderName: false,
            finder: selectedFinder,
            model: {
                keyword: selectedFinder?.keyword ?? '',
                minPrice: selectedFinder?.minPrice ?? 0,
                maxPrice: selectedFinder?.maxPrice ?? maxPrice,
            },
            error: {}
        }
    });

    return (
      <>
      <SweetAlert
        title='Agrega un nombre para tu búsqueda'
        type='input'
        placeholder='nombre de mi búsqueda'
        show={state.showFinderName}
        onConfirm={(name => onSaveSearch({name, ...state.model}))}
        onCancel={() => toggleSweetAlert({ setState })}
        validationMsg='¡Debes ingresar un correo!'
      />
        <div className='py-3 row'>
            <div className='col-2'>
                { user ? <FieldGroup
                    id='finder'
                    name='finder'
                    type='select'
                    value={state.finder._id ?? ''}
                    options={finders.map(e => ({text: e.name, value: e._id}))}
                    onChange={(e) => {onInputChange(e); onSelectFinder(finders.find(r => r._id === e.target.value));}}
                /> : <div />}
            </div>
            <div className='col-4'>
                <FieldGroup
                    id='keyword'
                    name='keyword'
                    type='text'
                    value={state.model.keyword}
                    placeholder='busca en el titulo o la descripción ...'
                    onChange={onInputChange}
                    help={state.error.keyword}
                />
            </div>
            <div className='col-2'>
                <FieldGroup
                    id='minPrice'
                    name='minPrice'
                    type='number'
                    min='0'
                    step='any'
                    value={state.model.minPrice}
                    placeholder='precio mínimo ...'
                    onChange={onInputChange}
                    help={state.error.minPrice}
                />
            </div>
            <div className='col-2'>
                <FieldGroup
                    id='maxPrice'
                    name='maxPrice'
                    type='number'
                    max={maxPrice}
                    value={state.model.maxPrice}
                    step='any'
                    placeholder='precio máximo ...'
                    onChange={onInputChange}
                    help={state.error.maxPrice}
                />
            </div>
            <div className='col-2'>
                <Button onClick={onSubmit} color='primary' className='btn-md'><span><i
                    className='fa fa-search'/></span> Buscar</Button>
                {!selectedFinder.id && (state.model.keyword || state.model.minPrice || state.model.maxPrice) ?
                    <a style={{'cursor': 'pointer'}} onClick={(e) => toggleSweetAlert({e, setState, value: true})}><i className='mx-2 fa fa-save'/></a> : <div/>}
            </div>
        </div>
      </>
    );
}

function toggleSweetAlert ({ event, setState, value }) {
  if (event) event.preventDefault();
  setState(state => ({
    ...state,
    showFinderName: value ?? !state.showFinderName
  }));
}
