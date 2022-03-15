import { Label, Input, InputGroupText, FormGroup, FormFeedback, InputGroup } from 'reactstrap';

export default function FieldGroup (props) {
  let { id, label, help, customControl, inputAddon, ...rest } = props;
  const invalid = help && help.length > 0;
  const validProps = help ? { ...(invalid ? { invalid: invalid } : { valid: !invalid }) } : {};
  const errors = help
    ? help.map((error, index) => {
      return <FormFeedback key={index}>{error}</FormFeedback>;
    })
    : null;
  inputAddon = inputAddon ?? getInputAddon(props.type);

  const renderFinalControl = () => {
    if (customControl) return customControl(props);
    let FinalControl;
    if (props.type === 'select') {
      let { options, ...formOptions } = rest;
      if (Array.isArray(options) && options.length > 0 &&
                typeof options[0] === 'string') {
        options = options.map(option => {
          return { text: option, value: option };
        });
      }

      FinalControl = (
        <Input type='select' {...validProps} {...formOptions}>
          <option value=''>Escoge una ...</option>
          {options && options.map(option => {
            return (
              <option value={option.value} key={option.value}>
                {option.text}
              </option>
            );
          })}
        </Input>
      );
    } else {
      FinalControl = <Input {...validProps} {...rest} />;
    }
    return FinalControl;
  };

  return (
    <FormGroup id={id}>
      {label && <Label>{label}</Label>}
      {inputAddon &&
        <InputGroup>
          <InputGroupText>{inputAddon}</InputGroupText>
          {renderFinalControl()}
          {errors}
        </InputGroup>}
      {!inputAddon && renderFinalControl()}
      {errors}
    </FormGroup>
  );
}

function getInputAddon (type) {
  switch (type) {
    case 'text':
      return <i className='fa fa-text-width' aria-hidden='true' />;
    case 'password':
      return <i className='fa fa-lock' aria-hidden='true' />;
    case 'email':
      return <i className='fa fa-envelope' aria-hidden='true' />;
    case 'tel':
      return <i className='fa fa-phone' aria-hidden='true' />;
    case 'number':
      return <i className='fa fa-sort-numeric-asc' aria-hidden='true' />;
  }
}
