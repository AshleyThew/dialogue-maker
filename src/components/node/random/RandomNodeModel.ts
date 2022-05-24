import { BaseNodeModel, BaseNodeModelGenerics, BaseNodeModelOptions } from "../base";

export interface RandomNodeModelOptions extends BaseNodeModelOptions {}

export interface RandomNodeModelGenerics extends BaseNodeModelGenerics<RandomNodeModelOptions> {}

export class RandomNodeModel extends BaseNodeModel<RandomNodeModelGenerics> {
	constructor(options?: RandomNodeModelOptions);
	constructor(options: any = {}) {
		if (typeof options === "string") {
			options = {};
		}
		super({
			type: "random",
			title: "Random",
			editableTitle: false,
			inputs: 1,
			outputs: 1,
			...options,
		});
	}
}
