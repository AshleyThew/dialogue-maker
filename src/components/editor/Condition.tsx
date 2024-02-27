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
	ors?: boolean[];
	negates?: boolean[];
}

export class Conditions implements ConditionalProps {
	conditions?: string[];
	args?: [string[]];
	ors?: boolean[];
	negates?: boolean[];

	constructor(conditions?: any, args?: any, ors?: boolean[], negates?: boolean[]) {
		this.conditions = conditions || [""];
		this.args = args || [];
		this.ors = ors || this.conditions.map(() => false);
		this.negates = negates || this.conditions.map(() => false);
	}

	serialize(): any {
		return {
			conditions: this.conditions,
			args: this.args,
			ors: this.ors,
			negates: this.negates,
		};
	}
}

export namespace C {
	export const Plus = styled.span`
		color: #02ff02;
		margin-right: 2px;

		cursor: pointer;
	`;
	export const Or = styled.span`
		color: #02a2ff;
		margin-right: 2px;

		cursor: pointer;
	`;
	export const Negate = styled.span`
		color: #e71195;
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
						{props.option.ors[cindex] && <span style={{ margin: "0px 5px" }}>OR</span>}
						{props.option.negates[cindex] && <span style={{ margin: "0px 5px" }}>!</span>}
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
									option.ors.push(false);
									option.negates.push(false);
									forceUpdate();
								}}
							>
								&#x271A;
							</C.Plus>
						)}
						{cond.length > 0 && cindex === option.conditions.length - 1 && (
							<C.Or
								data-no-drag
								title="Or condition"
								onClick={(e) => {
									option.conditions.push("");
									option.args.push([]);
									option.ors.push(true);
									option.negates.push(false);
									forceUpdate();
								}}
							>
								&#x2228;
							</C.Or>
						)}
						{option.conditions[0].length > 0 && (
							<C.Negate
								data-no-drag
								title="Negate condition"
								onClick={() => {
									option.negates[cindex] = !option.negates[cindex];
									forceUpdate();
								}}
							>
								!!
							</C.Negate>
						)}
						{option.conditions[0].length > 0 && (
							<C.DeleteRow
								data-no-drag
								title="Remove condition"
								onClick={() => {
									option.conditions.splice(cindex, 1);
									option.args.splice(cindex, 1);
									option.ors.splice(cindex, 1);
									option.negates.splice(cindex, 1);
									if (option.conditions.length === 0) {
										option.conditions.push("");
										option.args.push([]);
										option.ors.push(false);
										option.negates.push(false);
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
