import React from "react";
import { DialogueContext } from "../DialogueContext";
import { VariableEditor, VariableProps } from "./Variables";
import { C } from "./Condition";
import { DropdownInput } from "./Inputs";

export interface ActionProps {
	action: string;
	variables: VariableProps[];
}

export interface ActionsProps {
	actions?: string[];
	args?: [string[]];
}

export class Actions implements ActionsProps {
	actions?: string[];
	args?: [string[]];

	constructor(actions?: any, args?: any) {
		this.actions = actions || [""];
		this.args = args || [];
	}

	serialize(): any {
		return {
			actions: this.actions,
			args: this.args,
		};
	}
}

export const ActionBlock = (props: { option: ActionsProps; remove: Function }): JSX.Element => {
	const { actionKeys, actions } = React.useContext(DialogueContext);
	const [, forceUpdate] = React.useReducer((x) => x + 1, 0);
	const { option } = props;

	return (
		<div style={{ display: "table", borderSpacing: "0px" }}>
			{option.actions.map((act, cindex) => {
				const action: ActionProps = actions.find((action) => action.action === act);
				return (
					<div key={`c${cindex}`} style={{ display: "flex", alignItems: "center" }}>
						{cindex !== 0 ? (
							<C.Delete
								data-no-drag
								title="Remove condition"
								onClick={() => {
									option.actions.splice(cindex, 1);
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
							values={actionKeys}
							value={option.actions[cindex]}
							placeholder="Action"
							setValue={(value: string) => {
								option.actions[cindex] = value;
								const action: ActionProps = actions.find((action) => action.action === value);
								option.args[cindex] = Array(action.variables.length).fill("");
								forceUpdate();
							}}
						/>
						{action &&
							action.variables.map((variable, vindex) => {
								const setValue = (value: string) => {
									option.args[cindex][vindex] = value;
									forceUpdate();
								};

								var key = `v${vindex}`;
								return <VariableEditor key={key} variable={variable} args={option.args[cindex]} index={vindex} setValue={setValue} />;
							})}
						{act.length > 0 && cindex === option.actions.length - 1 && (
							<C.Plus
								data-no-drag
								title="Add condition"
								onClick={(e) => {
									option.actions.push("");
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
