import styled from "@emotion/styled";
import React from "react";
import Select from "react-select";
import TextareaAutosize from "react-textarea-autosize";

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

	export const Dropdown = styled(Select)`
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

export const EditableInput = (props: EditableInputProps) => {
	var disabled = props.editable !== undefined && !props.editable;
	return (
		<S.Input
			data-no-drag
			disabled={disabled}
			style={{ ...props.style, maxWidth: Math.max(props.value.length + 1, props.minLength || 5) + "ch", textAlign: "center" }}
			defaultValue={props.value}
			placeholder={props.placeholder}
			size={Math.max(props.value.length + 1, props.minLength || 5)}
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
				e.target.size = Math.max(e.target.value.length + 1, props.minLength || 5);
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

export const DropdownInput = (props: { values: string[]; setValue: any; value: string; placeholder?: string }) => {
	const options = [...props.values.map((option) => ({ label: option, value: option }))];
	const style = {
		container: () => ({ display: "inline-block", flexGrow: "0!important" }),
		dropdownIndicator: () => ({ padding: "0 0" }),
		menuList: (provided) => ({ ...provided, padding: "0 0" }),
		menu: (provided) => ({ ...provided, width: "", margin: "0 0", top: "" }),
		indicatorSeparator: () => ({ display: "none" }),
		control: (provided) => ({ ...provided, minHeight: "0" }),
		valueContainer: (provided) => ({ ...provided, padding: "0 0" }),
		selectContainer: (provided) => ({ ...provided, padding: "0 0" }),
		input: (provided) => ({ ...provided, width: "100%" }),
	};

	return (
		<S.Dropdown
			styles={style}
			value={{ label: props.value, value: props.value }}
			options={options}
			placeholder={props.placeholder}
			onChange={(e) => {
				props.setValue(e["value"]);
			}}
		/>
	);
};
