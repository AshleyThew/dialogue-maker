import React from "react";
import styled from "@emotion/styled";
import Select from "react-select";
import { DialogueContext } from "../DialogueContext";
import { EditableInput } from "./Inputs";

export interface VariableProps {
	source?: string;
	type?: "text" | "number" | "list" | undefined;
	placeholder?: string;
}

export interface ConditionProps {
	condition: string;
	variables: VariableProps[];
	actionable?: boolean;
}

export interface ConditionalProps {
	conditions?: string[];
	args?: [string[]];
}

export class Conditional implements ConditionalProps {
	conditions?: string[];
	args?: [string[]];

	constructor(conditions?: any, args?: any) {
		this.conditions = conditions || [""];
		this.args = args || [];
	}

	serialize(): any {
		return {
			conditions: this.conditions,
			args: this.args,
		};
	}
}

export namespace C {
	export const Dropdown = styled(Select)`
		flex-grow: 1;
		padding: 5px 2px;
		border: none;
		border-radius: 4px;

		svg {
			max-width: 10px;
		}
	`;

	export const Plus = styled.span`
		color: #02ff02;
		margin-right: 2px;

		cursor: pointer;
	`;
	export const Delete = styled.span`
		color: #ee0c0c;
		margin-right: -10px;
		position: relative;
		left: -13px;

		cursor: pointer;
	`;
}

export const ConditionBlock = (props: { option: ConditionalProps; remove: Function; allowActionable: boolean }): JSX.Element => {
	const { keys, conditions, sources } = React.useContext(DialogueContext);
	const [, forceUpdate] = React.useReducer((x) => x + 1, 0);
	const { option } = props;
	var selectable = keys;
	if (!props.allowActionable) {
		selectable = conditions.filter((cond) => !cond.actionable).map((cond) => cond.condition);
	}
	return (
		<div style={{ display: "table", borderSpacing: "0px" }}>
			{option.conditions.map((cond, cindex) => {
				const condition: ConditionProps = conditions.find((condition) => condition.condition === cond);
				return (
					<div key={`c${cindex}`} style={{ display: "flex", alignItems: "center" }}>
						{cindex !== 0 ? (
							<C.Delete
								data-no-drag
								title="Remove condition"
								onClick={() => {
									option.conditions.splice(cindex, 1);
									option.args.splice(cindex, 1);
									forceUpdate();
								}}
							>
								&#x268A;
							</C.Delete>
						) : (
							props.remove && (
								<C.Delete
									data-no-drag
									title="Remove option"
									style={{ WebkitTextStroke: "1px black" }}
									onClick={() => {
										props.remove();
										forceUpdate();
									}}
								>
									&#x268B;
								</C.Delete>
							)
						)}
						<ConditionDropdown
							values={selectable}
							value={option.conditions[cindex]}
							setValue={(value: string) => {
								option.conditions[cindex] = value;
								const condition: ConditionProps = conditions.find((condition) => condition.condition === value);
								option.args[cindex] = Array(condition.variables.length).fill("");
								forceUpdate();
							}}
						/>
						{condition &&
							condition.variables.map((variable, vindex) => {
								var key = `v${vindex}`;
								var pattern = undefined;
								var number = false;
								const setValue = (value: string) => {
									option.args[cindex][vindex] = value;
									forceUpdate();
								};
								switch (variable.type) {
									case "number":
										number = true;
										pattern = /^[0-9]*$/;
									// eslint-disable-next-line no-fallthrough
									case "text": {
										return (
											<EditableInput
												key={key}
												style={{ margin: "5px 2px", alignSelf: "flex-end" }}
												value={option.args[cindex][vindex]}
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
										return (
											<ConditionDropdown
												values={keys}
												key={key}
												value={option.args[cindex][vindex]}
												setValue={setValue}
												placeholder={variable.placeholder}
											/>
										);
									}
									default: {
										return <div key={vindex} />;
									}
								}
							})}
						{cond.length > 0 && cindex === option.conditions.length - 1 && (
							<C.Plus
								data-no-drag
								title="Add condition"
								onClick={(e) => {
									option.conditions.push("");
									option.args.push([]);
									forceUpdate();
								}}
							>
								&#x271A;
							</C.Plus>
						)}
					</div>
				);
			})}
		</div>
	);
};

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
		<C.Dropdown
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
