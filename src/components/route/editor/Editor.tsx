import * as React from "react";
import styled from "@emotion/styled";
import { DialogueContextCombined } from "../../DialogueContext";
import { ReactConfirmAlertProps, confirmAlert } from "react-confirm-alert";
import { EditableInput } from "../../editor/Inputs";
import { ActionProps } from "../../editor/Action";
import { ConditionProps } from "../../editor/Condition";
import { VariableProps } from "../../editor/Variables";

namespace S {
	export const DemoButton = styled.button<{ hover?; background? }>`
		background: ${(props) => props.background || "rgb(60, 60, 60)"} !important;
		font-size: 14px;
		padding: 0px 2px;
		border: none;
		color: white;
		outline: none;
		cursor: pointer;
		margin: 2px;
		border-radius: 3px;

		&:hover {
			background: ${(props) => props.hover || "rgb(255, 217, 0)"} !important;
		}

		&:disabled {
			cursor: not-allowed;
		}
	`;

	export const MoveButton = styled.button<{ hover?; background? }>`
		background: ${(props) => props.background || "rgb(60, 60, 60)"} !important;
		font-size: 14px;
		padding: 5px 10px;
		border: none;
		color: white;
		outline: none;
		cursor: pointer;
		margin: 2px;
		border-radius: 3px;

		&:hover {
			background: ${(props) => props.hover || "rgb(9, 111, 207)"} !important;
		}

		&:disabled {
			cursor: not-allowed;
		}
	`;

	export const CustomUI = styled.div`
		max-height: 100vh;
		overflow: auto;
		text-align: center;
		width: fit-content;
		min-width: 40vw;
		padding: 40px;
		background: #28bae6;
		box-shadow: 0 20px 75px rgba(0, 0, 0, 0.23);
		color: #fff;

		> h1 {
			margin-top: 0;
		}

		> button {
			width: 160px;
			padding: 10px;
			border: 1px solid #fff;
			margin: 10px;
			cursor: pointer;
			background: none;
			color: #fff;
			font-size: 14px;
		}
	`;

	export const Element = styled(DemoButton)`
		display: inline-block;
		text-overflow: ellipsis;
		overflow: hidden;
	`;
}

const MapEditor = (props: {
	values: {};
	current: {};
	set: () => void;
	def: {};
	refresh?: () => void;
	filter?: boolean;
	opened?: ReactConfirmAlertProps;
}): JSX.Element => {
	const [value, setValue] = React.useState("");
	const [type, setType] = React.useState("array");

	const types = ["array", "object"];

	return (
		<>
			{Object.keys(props.values)
				.filter((key) => {
					var reg = /(.*?)\[(.*?)]/;
					return !props.filter || !reg.test(key);
				})
				.map((key) => {
					const remove = Object.keys(props.def).length > 0 && Object.keys(props.def).indexOf(key) === -1;
					return (
						<S.Element
							key={key}
							title={key}
							onClick={() => {
								var val = props.values[key];
								if (Array.isArray(val)) {
									if (typeof props.current[key] === "undefined") {
										props.current[key] = [];
									}
									open(<ArrayEditor values={props.values[key]} current={props.current[key]} set={props.set} />, props.opened);
								} else if (val instanceof Object && val.constructor === Object) {
									if (typeof props.current[key] === "undefined") {
										props.current[key] = {};
									}
								}
							}}
						>
                            {remove === true && (
								<span
									style={{ color: "indianred", cursor: "pointer" }}
									onClick={() => {
										delete props.values[key];
										delete props.current[key];
										props.set();
										props.refresh();
									}}
									title={"Delete"}
								>
									&#x2716;
								</span>
							)}
							{key}
						</S.Element>
					);
				})}
			<br />
			<EditableInput value={value} setValue={setValue} style={{ background: "gray" }} autoFocus />
			<select style={{ marginLeft: "10px" }} value={type} onChange={(value) => setType(value.target.value)}>
				{types.map((opt) => {
					return <option value={opt}>{opt}</option>;
				})}
			</select>
			<S.DemoButton
				onClick={() => {
					if (typeof props.current[value] === "undefined") {
						switch (type) {
							case "array": {
								props.values[value] = [];
								props.current[value] = [];
								break;
							}
							case "object": {
								props.values[value] = {};
								props.current[value] = {};
								break;
							}
						}
						props.set();
						props.refresh();
					}
				}}
				disabled={typeof props.current[value] !== "undefined"}
			>
				Add
			</S.DemoButton>
			<br />
		</>
	);
};

const ArrayEditor = (props: {
	values: any[];
	current: any[];
	set: () => void;
	refresh?: () => void;
	opened?: ReactConfirmAlertProps;
}): JSX.Element => {
	const [value, setValue] = React.useState("");

	const moveUp = (index: number) => {
        if (index !== 0) {
            const temp = props.values[index];
            props.values[index] = props.values[index - 1];
            props.values[index - 1] = temp;
            props.set();
            props.refresh();
        }
    };

    const moveDown = (index: number) => {
        if (index !== props.values.length - 1) {
            const temp = props.values[index];
            props.values[index] = props.values[index + 1];
            props.values[index + 1] = temp;
            props.set();
            props.refresh();
        }
    };

	return (
		<>
			{props.values.map((value, index) => {
				const remove = props.current?.length && props.current.indexOf(value) !== -1;
				return (
					<div key={value} style={{ display: "inline-block" }}>
						<S.Element title={value}>
							<S.MoveButton onClick={() => moveUp(index)}>&lt;</S.MoveButton>
							{remove === true && (
								<span
									style={{ color: "indianred", cursor: "pointer" }}
									onClick={() => {
										props.current.splice(props.current.indexOf(value), 1);
										props.values.splice(props.values.indexOf(value), 1);
										props.set();
										props.refresh();
									}}
									title={"Delete"}
								>
									&#x2716;
								</span>
							)}
							{value}
                            <S.MoveButton onClick={() => moveDown(index)}>&gt;</S.MoveButton>
						</S.Element>
					</div>
				);
			})}
			<br />
			<EditableInput value={value} setValue={setValue} style={{ background: "gray" }} autoFocus />

			<S.DemoButton
				onClick={() => {
					if (props.values.indexOf(value) === -1) {
						props.values.push(value);
						props.current.push(value);
						props.set();
						props.refresh();
					}
				}}
				disabled={props.values.indexOf(value) !== -1}
			>
				Add
			</S.DemoButton>
			<br />
		</>
	);
};

const open = (element: JSX.Element, ret: ReactConfirmAlertProps) => {
	const opened = {
		customUI: () => {
			const refresh = () => open(element, ret);
			return (
				<S.CustomUI>
					{React.cloneElement(element, { opened, refresh })}
					<button
						onClick={() => {
							confirmAlert(ret);
						}}
					>
						Back
					</button>
				</S.CustomUI>
			);
		},
	};
	confirmAlert(opened);
};

type DefinitionType = "action" | "condition";

const createDefaultVariable = (): VariableProps => ({
	type: "text",
	placeholder: "",
	source: "",
	optional: false,
});

const normalizeVariable = (variable: VariableProps): VariableProps => {
	return {
		type: variable?.type || "text",
		placeholder: variable?.placeholder || "",
		source: variable?.source || "",
		optional: Boolean((variable as any)?.optional),
	};
};

const DefinitionEditor = (props: {
	type: DefinitionType;
	context: DialogueContextCombined;
	set: () => void;
	refresh?: () => void;
}): JSX.Element => {
	const [name, setName] = React.useState("");
	const [variables, setVariables] = React.useState<VariableProps[]>([]);
	const [actionable, setActionable] = React.useState(false);
	const [editing, setEditing] = React.useState<string>(undefined);
	const [error, setError] = React.useState("");

	const isAction = props.type === "action";
	const storageKey = isAction ? "customActions" : "customConditions";
	const nameKey = isAction ? "action" : "condition";

	if (!Array.isArray(props.context.extra[storageKey])) {
		props.context.extra[storageKey] = [];
	}

	const definitions = props.context.extra[storageKey] as (ActionProps | ConditionProps)[];

	const clearEditor = () => {
		setName("");
		setVariables([]);
		setActionable(false);
		setEditing(undefined);
		setError("");
	};

	const updateVariable = (index: number, update: Partial<VariableProps>) => {
		setVariables((prev) => {
			const next = [...prev];
			next[index] = {
				...next[index],
				...update,
			};
			return next;
		});
	};

	const addVariable = () => {
		setVariables((prev) => [...prev, createDefaultVariable()]);
	};

	const removeVariable = (index: number) => {
		setVariables((prev) => prev.filter((_value, variableIndex) => variableIndex !== index));
	};

	const saveDefinition = () => {
		const trimmed = name.trim();
		if (trimmed.length === 0) {
			setError(`${nameKey} is required.`);
			return;
		}

		const cleanedVariables = variables.map((variable) => normalizeVariable(variable));
		const missingListSource = cleanedVariables.findIndex((variable) => variable.type === "list" && variable.source.trim().length === 0);
		if (missingListSource !== -1) {
			setError(`Variable ${missingListSource + 1} must set a source when type is list.`);
			return;
		}

		const next = definitions.filter((entry) => {
			const entryName = entry[nameKey];
			if (editing) {
				return entryName !== editing;
			}
			return entryName !== trimmed;
		});

		if (isAction) {
			next.push({ action: trimmed, variables: cleanedVariables });
		} else {
			next.push({ condition: trimmed, variables: cleanedVariables, actionable });
		}

		props.context.extra[storageKey] = next;
		props.set();
		clearEditor();
		props.refresh();
	};

	const editDefinition = (definition: ActionProps | ConditionProps) => {
		setName(definition[nameKey]);
		setVariables((definition.variables || []).map((variable) => normalizeVariable(variable)));
		if (!isAction) {
			setActionable(Boolean((definition as ConditionProps & { actionable?: boolean }).actionable));
		}
		setEditing(definition[nameKey]);
		setError("");
	};

	const removeDefinition = (definitionName: string) => {
		props.context.extra[storageKey] = definitions.filter((entry) => entry[nameKey] !== definitionName);
		props.set();
		if (editing === definitionName) {
			clearEditor();
		}
		props.refresh();
	};

	return (
		<>
			<h1>{isAction ? "Custom Actions" : "Custom Conditions"}</h1>
			<p style={{ marginBottom: "8px" }}>
				These are saved locally and available in the editor dropdowns.
			</p>
			<div style={{ maxHeight: "35vh", overflow: "auto", marginBottom: "12px" }}>
				{definitions.length === 0 && <div style={{ marginBottom: "8px" }}>No custom entries yet.</div>}
				{definitions.map((definition) => {
					const definitionName = definition[nameKey];
					return (
						<div key={definitionName} style={{ marginBottom: "6px" }}>
							<S.Element title={definitionName}>
								<span style={{ marginRight: "8px" }}>{definitionName}</span>
								<span
									style={{ color: "rgb(255, 217, 0)", cursor: "pointer", marginRight: "6px" }}
									onClick={() => editDefinition(definition)}
									title="Edit"
								>
									&#9998;
								</span>
								<span style={{ color: "indianred", cursor: "pointer" }} onClick={() => removeDefinition(definitionName)} title="Delete">
									&#x2716;
								</span>
							</S.Element>
						</div>
					);
				})}
			</div>
			<div style={{ marginBottom: "8px" }}>
				<input
					value={name}
					onChange={(e) => setName(e.target.value)}
					style={{ width: "100%", background: "gray", color: "white", borderRadius: "5px", border: "none", padding: "8px" }}
					placeholder={nameKey}
					autoFocus
				/>
			</div>
			<div style={{ marginBottom: "8px", textAlign: "left" }}>
				<div style={{ marginBottom: "6px", fontWeight: "bold" }}>Variables</div>
				{variables.length === 0 && <div style={{ marginBottom: "8px" }}>No variables yet.</div>}
				{variables.map((variable, index) => {
					return (
						<div key={`variable-${index}`} style={{ border: "1px solid rgba(255,255,255,0.35)", borderRadius: "5px", padding: "8px", marginBottom: "8px" }}>
							<div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
								<select
									value={variable.type || "text"}
									onChange={(e) => updateVariable(index, { type: e.target.value as VariableProps["type"] })}
									style={{ background: "gray", color: "white", border: "none", borderRadius: "4px", padding: "6px" }}
								>
									<option value="text">text</option>
									<option value="number">number</option>
									<option value="list">list</option>
									<option value="modifier">modifier</option>
								</select>
								<input
									value={variable.placeholder || ""}
									onChange={(e) => updateVariable(index, { placeholder: e.target.value })}
									placeholder="placeholder"
									style={{ flexGrow: 1, background: "gray", color: "white", border: "none", borderRadius: "4px", padding: "6px" }}
								/>
								<S.DemoButton hover="rgb(248, 19, 19)" onClick={() => removeVariable(index)}>
									Delete
								</S.DemoButton>
							</div>
							{variable.type === "list" && (
								<input
									value={variable.source || ""}
									onChange={(e) => updateVariable(index, { source: e.target.value })}
									placeholder="source (example: items or quest[-1])"
									style={{ width: "100%", background: "gray", color: "white", border: "none", borderRadius: "4px", padding: "6px", marginBottom: "8px" }}
								/>
							)}
							<label style={{ cursor: "pointer" }}>
								<input
									type="checkbox"
									checked={Boolean((variable as any).optional)}
									onChange={(e) => updateVariable(index, { optional: e.target.checked } as any)}
								/>{" "}
								Optional
							</label>
						</div>
					);
				})}
				<S.DemoButton onClick={addVariable}>Add Variable</S.DemoButton>
			</div>
			{!isAction && (
				<label style={{ display: "block", marginBottom: "8px", cursor: "pointer" }}>
					<input type="checkbox" checked={actionable} onChange={(e) => setActionable(e.target.checked)} /> Actionable
				</label>
			)}
			{error.length > 0 && <div style={{ color: "indianred", marginBottom: "8px" }}>{error}</div>}
			<S.DemoButton onClick={saveDefinition}>{editing ? "Update" : "Add"}</S.DemoButton>
			{editing && (
				<S.DemoButton hover="rgb(248, 19, 19)" onClick={clearEditor}>
					Cancel Edit
				</S.DemoButton>
			)}
			<br />
		</>
	);
};

export const Editor = (props: { context: DialogueContextCombined; ret: ReactConfirmAlertProps }): JSX.Element => {
	const update = () => {
		props.context.setExtra(props.context.extra);
	};
	return (
		<>
			<S.DemoButton
				onClick={() =>
					open(
						<DefinitionEditor type="action" context={props.context} set={update} />,
						props.ret
					)
				}
			>
				Custom Actions
			</S.DemoButton>
			<S.DemoButton
				onClick={() =>
					open(
						<DefinitionEditor type="condition" context={props.context} set={update} />,
						props.ret
					)
				}
			>
				Custom Conditions
			</S.DemoButton>
			<S.DemoButton
				onClick={() =>
					open(
						<MapEditor
							values={props.context.sources}
							current={props.context.extra["sources"] || {}}
							def={props.context.def["sources"] || []}
							set={update}
						/>,
						props.ret
					)
				}
			>
				Sources
			</S.DemoButton>
			<S.DemoButton
				onClick={() =>
					open(
						<MapEditor
							values={props.context.switchs}
							current={props.context.extra["switchs"] || {}}
							def={props.context.def["switchs"] || []}
							set={update}
						/>,
						props.ret
					)
				}
			>
				Switchs
			</S.DemoButton>
			<br />
		</>
	);
};
