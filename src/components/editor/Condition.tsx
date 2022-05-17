import React from "react";
import styled from "@emotion/styled";
import Select from "react-select";

export interface VariableProps {
	source?: string;
	type?: "text" | "number" | "list" | undefined;
	placeholder?: string;
}

export interface ConditionProps {
	condition: string;
	variables: VariableProps[];
}

namespace S {
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

export const ConditionDropdown = (props: { values: string[]; setValue: any; value: string; placeholder?: string }) => {
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
