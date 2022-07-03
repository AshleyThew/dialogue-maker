import { DeserializeEvent } from "@projectstorm/react-canvas-core";
import { BaseNodeModel, BaseNodeModelGenerics, BaseNodeModelOptions } from "../base";
import { TreeFactory, TreeNodeFactory } from "./TreeNodeFactory";

export interface TreeNodeModelOptions extends BaseNodeModelOptions {
	tree?: string;
	start?: string;
}

export interface TreeNodeModelGenerics extends BaseNodeModelGenerics<TreeNodeModelOptions> {
	tree?: string;
	start?: string;
}

export class TreeNodeModel extends BaseNodeModel<TreeNodeModelGenerics> {
	constructor(options?: TreeNodeModelOptions);
	constructor(options: any = {}) {
		if (typeof options === "string") {
			options = {
				tree: "",
				start: "",
			};
		}
		super({
			type: "tree",
			title: "Tree",
			editableTitle: false,
			inputs: 1,
			outputs: 0,
			...options,
		});
	}

	deserialize(event: DeserializeEvent<this>) {
		super.deserialize(event);
		this.options.tree = event.data.tree;
		this.options.start = event.data.start;
		this.options.color = TreeFactory.options.color;
	}

	serialize(): any {
		return {
			...super.serialize(),
			tree: this.options.tree,
			start: this.options.start,
		};
	}
}
