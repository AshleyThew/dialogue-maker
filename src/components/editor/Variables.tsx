import React from "react";
import { DialogueContext } from "../DialogueContext";
import { DropdownInput, EditableInput } from "./Inputs";

export interface VariableProps {
	source?: string;
	type?: "text" | "number" | "list" | undefined;
	placeholder?: string;
	required?: boolean;
}

export const VariableEditor = (props: { variable: VariableProps; setValue: Function; index: number; args: string[] }): JSX.Element => {
	const { sourcesKeys } = React.useContext(DialogueContext);
	const { variable, setValue, index, args } = props;
	var pattern = undefined;
	var number = false;
	switch (variable.type) {
		case "number":
			number = true;
			pattern = /^[0-9]*$/;
		// eslint-disable-next-line no-fallthrough
		case "text": {
			return (
				<EditableInput
					style={{ margin: "5px 2px", alignSelf: "flex-end" }}
					value={args[index]}
					setValue={setValue}
					minLength={2}
					placeholder={variable.placeholder}
					pattern={pattern}
					number={number}
				/>
			);
		}
		case "list": {
			var source = variable.source;
			var matches = /\[(.*?)\]/.exec(source);
			if (matches) {
				const number = Number(matches[1]);
				source = source.replace(matches[1], args[index + number]);
			}
			const keys = sourcesKeys[source];
			return <DropdownInput values={keys} value={args[index]} setValue={setValue} placeholder={variable.placeholder} />;
		}
		default: {
			return <div />;
		}
	}
};
