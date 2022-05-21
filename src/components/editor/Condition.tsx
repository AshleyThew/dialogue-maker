import React from "react";
import styled from "@emotion/styled";
import { DialogueContext } from "../DialogueContext";
import { DropdownInput } from "./Inputs";
import { VariableEditor, VariableProps } from "./Variables";

export interface ConditionProps {
	condition: string;
	variables: VariableProps[];
	actionable?: boolean;
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
	export const Delete = styled.span`
		color: #ee0c0c;
		margin-right: -10px;
		position: relative;
		left: -13px;

		cursor: pointer;
	`;
}

export const ConditionBlock = (props: { option: ConditionalProps; remove: Function; allowActionable: boolean }): JSX.Element => {
	const { keys, conditions } = React.useContext(DialogueContext);
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
						<DropdownInput
							values={selectable}
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
									for (var i = vindex + 1; i < val.length; i++) {
										val[i] = "";
									}
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
					</div>
				);
			})}
		</div>
	);
};
