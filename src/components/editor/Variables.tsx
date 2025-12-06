import React from 'react';
import { DialogueContext } from '../DialogueContext';
import { DropdownInput, EditableInput } from './Inputs';
import { createLabels } from '../../utils/Utils';

export interface VariableProps {
  source?: string;
  type?: 'text' | 'number' | 'list' | 'modifier' | undefined;
  placeholder?: string;
  required?: boolean;
}

export const VariableEditor = (props: {
  variable: VariableProps;
  setValue: Function;
  index: number;
  args: string[];
}): JSX.Element => {
  const { sources } = React.useContext(DialogueContext);
  const { variable, setValue, index, args } = props;
  var pattern = undefined;
  var number = false;
  switch (variable.type) {
    case 'number':
      number = true;
      pattern = /^[0-9]*$/;
      return (
        <EditableInput
          style={{ margin: '5px 2px', alignSelf: 'flex-end' }}
          value={args[index]}
          setValue={setValue}
          minLength={2}
          placeholder={variable.placeholder}
          pattern={pattern}
          number={number}
        />
      );
    case 'modifier':
      pattern = /^[+-]?[0-9]+$/;
      number = true;
      return (
        <EditableInput
          style={{ margin: '5px 2px', alignSelf: 'flex-end' }}
          value={args[index]}
          setValue={setValue}
          minLength={2}
          placeholder={variable.placeholder}
          pattern={pattern}
          number={number}
        />
      );
    case 'text': {
      return (
        <EditableInput
          style={{ margin: '5px 2px', alignSelf: 'flex-end' }}
          value={args[index]}
          setValue={setValue}
          minLength={2}
          placeholder={variable.placeholder}
          pattern={pattern}
          number={number}
        />
      );
    }
    case 'list': {
      var source = variable.source;
      var matches = /\[(.*?)\]/.exec(source);
      if (matches) {
        const number = Number(matches[1]);
        source = source.replace(matches[1], args[index + number]);
      }
      return (
        <DropdownInput
          values={createLabels(sources[source])}
          value={args[index]}
          setValue={setValue}
          placeholder={variable.placeholder}
        />
      );
    }
    default: {
      return <div />;
    }
  }
};
