import { TreeNodeModel } from "./TreeNodeModel";
import { TreeNodeWidget } from "./TreeNodeWidget";
import { BaseNodeFactory } from "../base";

export class TreeNodeFactory extends BaseNodeFactory<TreeNodeModel> {
	constructor() {
		super("tree", "Tree", "#e02e87e6");
	}

	generateReactWidget(event): JSX.Element {
		return <TreeNodeWidget engine={this.engine} node={event.model} />;
	}

	generateModel(event): TreeNodeModel {
		return new TreeNodeModel({ color: this.options.color });
	}
}

export const TreeFactory = new TreeNodeFactory();
