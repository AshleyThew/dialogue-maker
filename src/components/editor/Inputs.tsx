import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { components, GroupBase, OptionProps } from 'react-select';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import Select, { createFilter } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import TextareaAutosize, {
  TextareaAutosizeProps,
} from 'react-textarea-autosize';
import { CustomMenuList } from './CustomMenu';
import { DialogueContext } from '../DialogueContext';

namespace S {
  const dropdownStyle = css`
    flex-grow: 1;
    padding: 5px 2px;
    border: none;
    border-radius: 4px;
    color: #000;
    svg {
      max-width: 10px;
    }
  `;

  export const Input = styled.input`
    background: rgba(187, 187, 187, 0.3);
    flex-grow: 1;
    padding: 5px 5px;
    border: none;
    border-radius: 5px;
    font: inherit;
  `;

  export const DisplayInput = styled.div`
    background: rgba(187, 187, 187, 0.3);
    flex-grow: 1;
    padding: 5px 5px;
    border: none;
    border-radius: 5px;
    font: inherit;
    display: inline-block;
    cursor: text;
    white-space: nowrap;
    overflow: hidden;
  `;

  export const TextArea = styled(TextareaAutosize)`
    background: transparent;
    border: none;
    text-align: center;
    border-radius: 5px;
    font: inherit;
  `;

  export const DisplayTextArea = styled.div`
    background: transparent;
    border: none;
    text-align: center;
    border-radius: 5px;
    font: inherit;
    display: inline-block;
    cursor: text;
    white-space: pre-wrap;
    word-break: break-word;
    overflow: hidden;
  `;

  export const Dropdown = styled(Select)<{ minWidth: string }>`
    ${dropdownStyle}
  `;

  export const CreatableDropdown = styled(CreatableSelect)<{
    minWidth: string;
  }>`
    ${dropdownStyle}
  `;
}

const MC_STYLES: Record<string, React.CSSProperties> = {
  '0': { color: '#000000' },
  '1': { color: '#0000AA' },
  '2': { color: '#00AA00' },
  '3': { color: '#00AAAA' },
  '4': { color: '#AA0000' },
  '5': { color: '#AA00AA' },
  '6': { color: '#FFAA00' },
  '7': { color: '#AAAAAA' },
  '8': { color: '#555555' },
  '9': { color: '#5555FF' },
  a: { color: '#55FF55' },
  b: { color: '#55FFFF' },
  c: { color: '#FF5555' },
  d: { color: '#FF55FF' },
  e: { color: '#FFFF55' },
  f: { color: '#FFFFFF' },
  l: { fontWeight: 'bold' },
  m: { textDecoration: 'line-through' },
  n: { textDecoration: 'underline' },
  o: { fontStyle: 'italic' },
};

function parseMinecraftColors(text: string): React.ReactNode {
  const parts = text.split(/([&§][0-9a-fklmnor])/i);
  const result: React.ReactNode[] = [];
  let currentStyle: React.CSSProperties = {};
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (/^[&§][0-9a-fklmnor]$/i.test(part)) {
      const code = part[1].toLowerCase();
      if (code === 'r') {
        currentStyle = {};
      } else if (code in MC_STYLES) {
        if ('0123456789abcdef'.includes(code)) {
          currentStyle = {
            ...currentStyle,
            color: (MC_STYLES[code] as any).color,
          };
        } else {
          currentStyle = { ...currentStyle, ...MC_STYLES[code] };
        }
      }
    } else if (part) {
      const lines = part.split('\n');
      for (let j = 0; j < lines.length; j++) {
        if (j > 0) {
          result.push(<br key={`br-${i}-${j}`} />);
          currentStyle = {};
        }
        if (lines[j]) {
          result.push(
            <span key={`${i}-${j}`} style={{ ...currentStyle }}>
              {lines[j]}
            </span>,
          );
        }
      }
    }
  }
  return <>{result}</>;
}

interface EditableInputProps {
  value: string;
  setValue: any;
  style?: React.CSSProperties;
  minLength?: number;
  placeholder?: string;
  pattern?: RegExp;
  number?: boolean;
  editable?: boolean;
  autoFocus?: boolean;
}

const CustomOption = ({ children, ...props }) => {
  // eslint-disable-next-line no-unused-vars
  const { onMouseMove, onMouseOver, ...rest } = props.innerProps;
  const newProps = { ...props, innerProps: rest } as OptionProps<
    unknown,
    boolean,
    GroupBase<unknown>
  >;
  return <components.Option {...newProps}>{children}</components.Option>;
};

CustomOption.propTypes = {
  innerProps: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
};

export const EditableInput = (props: EditableInputProps) => {
  const disabled = props.editable !== undefined && !props.editable;
  const [focused, setFocused] = React.useState(props.autoFocus === true);
  const [displayValue, setDisplayValue] = React.useState(props.value);

  React.useEffect(() => {
    if (!focused) setDisplayValue(props.value);
  }, [props.value, focused]);

  const getSize = (value: string) =>
    Math.max(
      value.length + 2,
      Math.max(props?.placeholder?.length || 0, props.minLength || 5),
    );

  const size = getSize(displayValue);
  const widthCh = size + 'ch';

  if (focused && !disabled) {
    return (
      <S.Input
        data-no-drag
        spellCheck={false}
        style={{
          ...props.style,
          width: widthCh,
          maxWidth: widthCh,
          textAlign: 'center',
        }}
        defaultValue={displayValue}
        placeholder={props.placeholder}
        size={size}
        autoFocus
        onKeyDown={(e) => {
          if (
            e.key.length === 1 &&
            props.pattern &&
            !props.pattern.test(e.key)
          ) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
        }}
        onChange={(e) => {
          if (props.number) {
            const {
              target: { value },
            } = e;
            if (value.length > 0) {
              const formatNumber = parseInt(
                value.replace(/,/g, ''),
              ).toLocaleString();
              e.target.value = formatNumber;
            }
          }
          setDisplayValue(e.target.value);
          const s = getSize(e.target.value);
          e.target.size = s;
          e.target.style.width = s + 'ch';
          e.target.style.maxWidth = s + 'ch';
        }}
        onBlur={(e) => {
          props.setValue(e.target.value, e.target);
          setDisplayValue(e.target.value);
          setFocused(false);
        }}
      />
    );
  }

  return (
    <S.DisplayInput
      data-no-drag
      style={{
        ...props.style,
        ...(props.style?.width ? {} : { width: widthCh }),
        textAlign: 'center',
      }}
      onClick={() => !disabled && setFocused(true)}
    >
      {displayValue ? (
        parseMinecraftColors(displayValue)
      ) : (
        <span style={{ opacity: 0.4 }}>{props.placeholder}</span>
      )}
    </S.DisplayInput>
  );
};

interface EditableTextProps {
  value: string;
  setValue: any;
  style?: TextareaAutosizeProps['style'];
  minLength?: number;
  placeholder?: string;
}

export const EditableText = (props: EditableTextProps) => {
  const { app } = useContext(DialogueContext);
  const [focused, setFocused] = React.useState(false);
  const [displayValue, setDisplayValue] = React.useState(props.value);

  React.useEffect(() => {
    if (!focused) setDisplayValue(props.value);
  }, [props.value, focused]);

  const getWidth = (value: string) =>
    Math.max(
      ...value.split('\n').map((line) => line.length + 2),
      props.minLength || 5,
    ) + 'ch';

  if (focused) {
    return (
      <S.TextArea
        data-no-drag
        spellCheck={false}
        defaultValue={displayValue}
        placeholder={props.placeholder}
        autoFocus
        style={{
          ...props.style,
          resize: 'none',
          width: getWidth(displayValue),
        }}
        onChange={(e) => {
          setDisplayValue(e.target.value);
          e.target.style.width = getWidth(e.target.value);
        }}
        onBlur={(e) => {
          props.setValue(e.target.value);
          setDisplayValue(e.target.value);
          setFocused(false);
          app.getDiagramEngine().repaintCanvas();
        }}
      />
    );
  }

  return (
    <div
      data-no-drag
      style={{ cursor: 'text', textAlign: 'center', width: '100%' }}
      onClick={() => setFocused(true)}
    >
      <S.DisplayTextArea style={{ ...props.style, width: getWidth(displayValue) }}>
        {displayValue ? (
          parseMinecraftColors(displayValue)
        ) : (
          <span style={{ opacity: 0.4 }}>{props.placeholder}</span>
        )}
      </S.DisplayTextArea>
    </div>
  );
};

export const DropdownInput = React.forwardRef(
  (
    props: {
      values: any[];
      setValue: any;
      value: string;
      placeholder?: string;
      minLength?: number;
      width?: string;
      right?: number;
      creatable?: boolean;
    },
    ref: React.Ref<any>,
  ) => {
    const style = {
      container: (_provided, state) => ({
        display: 'inline-block',
        flexGrow: '0!important',
        minWidth: state.selectProps.minWidth,
      }),
      dropdownIndicator: () => ({ padding: '0 0' }),
      menuList: (provided) => ({ ...provided, padding: '0 0' }),
      menu: (provided) => ({
        ...provided,
        margin: '0 0',
        top: '',
        right: props.right,
        width: props.width || '100%',
        fontSize: '11px',
      }),
      indicatorSeparator: () => ({ display: 'none' }),
      control: (provided) => ({ ...provided, minHeight: '0' }),
      valueContainer: (provided) => ({ ...provided, padding: '0 0' }),
      selectContainer: (provided) => ({ ...provided, padding: '0 0' }),
      input: (provided) => ({
        ...provided,
        width: '100%',
        minWidth:
          Math.max(props?.placeholder?.length || 0, props.minLength || 2) +
          'ch',
      }),
      option: (provided) => ({
        ...provided,
        padding: '2px 0px',
        minHeight: '16px',
      }),
    };

    var minWidth =
      Math.max(
        props.value.length + 4,
        props.placeholder ? props.placeholder.length + 4 : 0,
        2,
      ) + 'ch';

    if (props.creatable) {
      return (
        <S.CreatableDropdown
          ref={ref}
          components={{ Option: CustomOption, MenuList: CustomMenuList }}
          filterOption={createFilter({ ignoreAccents: false })}
          styles={style}
          value={
            props.value
              ? { label: props.value, value: props.value }
              : props.value
          }
          options={props.values}
          placeholder={props.placeholder}
          onChange={(e) => {
            props.setValue(e['value']);
          }}
          formatCreateLabel={(value) => `Add "${value}"`}
          minWidth={minWidth}
        />
      );
    }

    return (
      <S.Dropdown
        ref={ref}
        components={{ Option: CustomOption, MenuList: CustomMenuList }}
        filterOption={createFilter({ ignoreAccents: false })}
        styles={style}
        value={
          props.value ? { label: props.value, value: props.value } : props.value
        }
        options={props.values}
        placeholder={props.placeholder}
        onChange={(e) => {
          props.setValue(e['value']);
        }}
        minWidth={minWidth}
      />
    );
  },
);
