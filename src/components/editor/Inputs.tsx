import styled from "@emotion/styled";
import React from "react";
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

	export const Select = styled.select`
		flex-grow: 1;
		padding: 5px 5px;
		border: none;
		border-radius: 5px;
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
