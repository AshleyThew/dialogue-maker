import React from "react";
import styled from "@emotion/styled";
import { DialogueContext } from "../DialogueContext";
import { DropdownInput } from "./Inputs";
import { VariableEditor, VariableProps } from "./Variables";
import { createLabels } from "../../utils/Utils";

export interface ConditionProps {
	condition: string;
	variables: VariableProps[];
}

export interface ConditionalProps {
	conditions?: string[];
	args?: [string[]];
}

export class Conditions implements ConditionalProps {
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
	export const Plus = styled.span`
		color: #02ff02;
		margin-right: 2px;

		cursor: pointer;
	`;
	export const DeleteLine = styled.span`
		color: #ee0c0c;
		margin-right: -10px;
		position: relative;
		left: -13px;

		cursor: pointer;
	`;

	export const DeleteRow = styled.span`
		color: #ee0c0c;
		position: relative;

		cursor: pointer;
	`;
}

export const ConditionBlock = (props: { option: ConditionalProps; remove: Function; allowActionable: boolean }): JSX.Element => {
	const { conditions } = React.useContext(DialogueContext);
	const [, forceUpdate] = React.useReducer((x) => x + 1, 0);
	const { option } = props;
	return (
		<div style={{ display: "table", borderSpacing: "0px" }}>
			{option.conditions.map((cond, cindex) => {
				const condition: ConditionProps = conditions.find((condition) => condition.condition === cond);
				return (
					<div key={`c${cindex}`} style={{ display: "flex", alignItems: "center" }}>
						{props.remove && cindex === 0 && (
							<C.DeleteLine
								data-no-drag
								title="Remove option"
								style={{ WebkitTextStroke: "1px black" }}
								onClick={() => {
									props.remove();
									forceUpdate();
								}}
							>
								&#x268B;
							</C.DeleteLine>
						)}
						<DropdownInput
							values={createLabels(conditions, "condition")}
							value={option.conditions[cindex]}
							placeholder="If"
							setValue={(value: string) => {
								option.conditions[cindex] = value;
								const condition: ConditionProps = conditions.find((condition) => condition.condition === value);
								option.args[cindex] = Array(condition.variables.length).fill("");
								forceUpdate();
							}}
						/>
						{condition &&
							condition.variables.map((variable, vindex) => {
								const setValue = (value: string) => {
									const val = option.args[cindex];
									val[vindex] = value;
									forceUpdate();
								};

								var key = `v${vindex}`;
								return <VariableEditor key={key} variable={variable} args={option.args[cindex]} index={vindex} setValue={setValue} />;
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
						{option.conditions[0].length > 0 && (
							<C.DeleteRow
								data-no-drag
								title="Remove condition"
								onClick={() => {
									option.conditions.splice(cindex, 1);
									option.args.splice(cindex, 1);
									if (option.conditions.length === 0) {
										option.conditions.push("");
										option.args.push([]);
									}
									forceUpdate();
								}}
							>
								&#x268A;
							</C.DeleteRow>
						)}
					</div>
				);
			})}
		</div>
	);
};
