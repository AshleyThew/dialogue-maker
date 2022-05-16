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
}

export const EditableInput = (props: { value: string; setValue; style?: React.CSSProperties }) => {
	return (
		<S.Input
			data-no-drag
			style={props.style}
			defaultValue={props.value}
			size={props.value.length + 1}
			onChange={(e) => {
				e.target.size = Math.max(e.target.value.length + 1, 5);
			}}
			onBlur={(e) => {
				props.setValue(e.target.value);
			}}
		/>
	);
};

export const EditableText = (props: { value: string; setValue; style?: React.CSSProperties }) => {
	return (
		<S.TextArea
			data-no-drag
			defaultValue={props.value}
			style={{
				resize: "none",
				width: Math.max(...props.value.split("\n").map((line) => line.length + 2), 5) + "ch",
			}}
			onChange={(e) => {
				var lines = e.target.value.split("\n");
				e.target.style.width = Math.max(...lines.map((line) => line.length + 2), 5) + "ch";
			}}
			onBlur={(e) => {
				props.setValue(e.target.value);
			}}
		/>
	);
};
