import React from "react";
import { DialogueContext } from "../DialogueContext";
import { DropdownInput, EditableInput } from "./Inputs";

export interface VariableProps {
	source?: string;
	type?: "text" | "number" | "list" | undefined;
	placeholder?: string;
	required?: boolean;
}

export const VariableEditor = (props: { variable: VariableProps; setValue: Function; value: string }): JSX.Element => {
	const { sources } = React.useContext(DialogueContext);
	const { variable, setValue, value } = props;
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
					value={value}
					setValue={setValue}
					minLength={2}
					placeholder={variable.placeholder}
					pattern={pattern}
					number={number}
				/>
			);
		}
		case "list": {
			const keys = sources[variable.source];
			return <DropdownInput values={keys} value={value} setValue={setValue} placeholder={variable.placeholder} />;
		}
		default: {
			return <div />;
		}
	}
};
