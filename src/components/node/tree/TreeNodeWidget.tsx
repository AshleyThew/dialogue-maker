import { BaseNodeProps, BaseNodeWidget } from "../base";
import { TreeNodeModel } from "./TreeNodeModel";

import { DialogueContext } from "../../DialogueContext";
import React from "react";
import { DropdownInput } from "../../editor/Inputs";
import { StartNodeModel } from "../start/StartNodeModel";

export interface TreeNodeProps extends BaseNodeProps<TreeNodeModel> {}

export class TreeNodeWidget extends BaseNodeWidget<TreeNodeProps> {
	render() {
		return super.construct(
			<div style={{ display: "flex" }}>
				{super.renderInPorts(true)}
				<TreeBlock tree={this.props} />
			</div>
		);
	}

	renderHeader(): JSX.Element {
		return <></>;
	}

	renderInPorts(_required?: boolean): JSX.Element {
		return undefined;
	}
}

export const TreeBlock = (props: { tree: TreeNodeProps }): JSX.Element => {
	const { app } = React.useContext(DialogueContext);
	const [, forceUpdate] = React.useReducer((x) => x + 1, 0);
	const values = ["", "default", ...Object.keys(app.getTrees())].map((tree) => ({ label: tree, value: tree }));

	const setValue = (e) => {
		props.tree.node.getOptions().tree = e;
		props.tree.node.getOptions().start = "";
		forceUpdate();
	};

	const setStart = (e) => {
		props.tree.node.getOptions().start = e;
		forceUpdate();
	};

	const { tree: value, start } = props.tree.node.getOptions();

	const selectStart = value && value.length > 0;
	let startNodes = [];
	if (selectStart) {
		const model = value === "default" ? app.getModel() : app.getTrees()[value];
		if (model) {
			const starts = model.getNodes().filter((val) => val instanceof StartNodeModel) as StartNodeModel[];
			startNodes = ["", ...starts.map((start) => start.getOptions().title)];
		}
	}
	let startValues = startNodes.map((start) => ({ label: start, value: start }));

	const minWidth = Math.max(...values.map((sw) => sw.value.length + 5)) + "ch";
	return (
		<>
			<div style={{ color: "black", display: "flex", justifyContent: "space-between" }}>
				<DropdownInput values={values} value={value || ""} setValue={setValue} placeholder={"Tree"} width={minWidth} />
				{selectStart && <DropdownInput values={startValues} value={start || ""} setValue={setStart} placeholder={"Start"} width={minWidth} />}
			</div>
		</>
	);
};
