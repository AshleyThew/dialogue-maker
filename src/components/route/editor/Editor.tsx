import * as React from "react";
import styled from "@emotion/styled";
import { DialogueContextCombined } from "../../DialogueContext";
import { ReactConfirmAlertProps, confirmAlert } from "react-confirm-alert";
import { EditableInput } from "../../editor/Inputs";

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

export const Editor = (props: { context: DialogueContextCombined; ret: ReactConfirmAlertProps }): JSX.Element => {
	const update = () => {
		props.context.setExtra(props.context.extra);
	};
	return (
		<>
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
