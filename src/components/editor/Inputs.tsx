import React from "react";
import PropTypes from "prop-types";
import { components, GroupBase, OptionProps } from "react-select";
import styled from "@emotion/styled";
import Select, { createFilter } from "react-select";
import TextareaAutosize from "react-textarea-autosize";
import { CustomMenuList } from "./CustomMenu";

namespace S {
	export const Input = styled.input`
		background: rgba(187, 187, 187, 0.3);
		flex-grow: 1;
		padding: 5px 5px;
		border: none;
		border-radius: 5px;
	`;

	export const TextArea = styled(TextareaAutosize)`
		background: transparent;
		border: none;
		text-align: center;
		border-radius: 5px;
	`;

	export const Dropdown = styled(Select)<{ minWidth: string }>`
		flex-grow: 1;
		padding: 5px 2px;
		border: none;
		border-radius: 4px;

		svg {
			max-width: 10px;
		}
	`;
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
}

const CustomOption = ({ children, ...props }) => {
	// eslint-disable-next-line no-unused-vars
	const { onMouseMove, onMouseOver, ...rest } = props.innerProps;
	const newProps = { ...props, innerProps: rest } as OptionProps<unknown, boolean, GroupBase<unknown>>;
	return <components.Option {...newProps}>{children}</components.Option>;
};

CustomOption.propTypes = {
	innerProps: PropTypes.object.isRequired,
	children: PropTypes.node.isRequired,
};

export const EditableInput = (props: EditableInputProps) => {
	var disabled = props.editable !== undefined && !props.editable;
	const getSize = (value) => {
		return Math.max(value.length + 2, Math.max(props?.placeholder?.length || 0, props.minLength || 5));
	};
	const size = getSize(props.value);
	return (
		<S.Input
			data-no-drag
			disabled={disabled}
			style={{ ...props.style, maxWidth: size + "ch", textAlign: "center" }}
			defaultValue={props.value}
			placeholder={props.placeholder}
			size={size}
			onKeyDown={(e) => {
				if (e.key.length === 1 && props.pattern && !props.pattern.test(e.key)) {
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
						const formatNumber = parseInt(value.replace(/,/g, "")).toLocaleString();
						e.target.value = formatNumber;
					}
				}
				e.target.size = getSize(e.target.value);
				e.target.style.maxWidth = e.target.size + "ch";
			}}
			onBlur={(e) => {
				props.setValue(e.target.value);
			}}
		/>
	);
};

interface EditableTextProps {
	value: string;
	setValue: any;
	style?: React.CSSProperties;
	minLength?: number;
	placeholder?: string;
}

export const EditableText = (props: EditableTextProps) => {
	return (
		<S.TextArea
			data-no-drag
			defaultValue={props.value}
			placeholder={props.placeholder}
			style={{
				resize: "none",
				width: Math.max(...props.value.split("\n").map((line) => line.length + 2), props.minLength || 5) + "ch",
			}}
			onChange={(e) => {
				var lines = e.target.value.split("\n");
				e.target.style.width = Math.max(...lines.map((line) => line.length + 2), props.minLength || 5) + "ch";
			}}
			onBlur={(e) => {
				props.setValue(e.target.value);
			}}
		/>
	);
};

export const DropdownInput = (props: {
	values: any[];
	setValue: any;
	value: string;
	placeholder?: string;
	minLength?: number;
	width?: string;
	right?: number;
}) => {
	const style = {
		container: (_provided, state) => ({ display: "inline-block", flexGrow: "0!important", minWidth: state.selectProps.minWidth }),
		dropdownIndicator: () => ({ padding: "0 0" }),
		menuList: (provided) => ({ ...provided, padding: "0 0" }),
		menu: (provided) => ({ ...provided, margin: "0 0", top: "", right: props.right, width: props.width || "100%", fontSize: "11px" }),
		indicatorSeparator: () => ({ display: "none" }),
		control: (provided) => ({ ...provided, minHeight: "0" }),
		valueContainer: (provided) => ({ ...provided, padding: "0 0" }),
		selectContainer: (provided) => ({ ...provided, padding: "0 0" }),
		input: (provided) => ({ ...provided, width: "100%", minWidth: Math.max(props?.placeholder?.length || 0, props.minLength || 2) + "ch" }),
		option: (provided) => ({ ...provided, padding: "2px 0px", minHeight: "16px" }),
	};

	var minWidth = Math.max(props.value.length + 4, props.placeholder.length + 4, 2) + "ch";

	return (
		<S.Dropdown
			components={{ Option: CustomOption, MenuList: CustomMenuList }}
			filterOption={createFilter({ ignoreAccents: false })}
			styles={style}
			value={props.value ? { label: props.value, value: props.value } : props.value}
			options={props.values}
			placeholder={props.placeholder}
			onChange={(e) => {
				props.setValue(e["value"]);
			}}
			minWidth={minWidth}
		/>
	);
};
