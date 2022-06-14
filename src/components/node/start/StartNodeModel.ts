import { DefaultPortModel } from "@projectstorm/react-diagrams";
import { BaseNodeModel, BaseNodeModelGenerics, BaseNodeModelOptions } from "../base";

export interface StartNodeModelOptions extends BaseNodeModelOptions {}

export interface StartNodeModelGenerics extends BaseNodeModelGenerics<StartNodeModelOptions> {}

export class StartNodeModel extends BaseNodeModel<StartNodeModelGenerics> {
	constructor(options?: StartNodeModelOptions);
	constructor(options: any = {}) {
		if (typeof options === "string") {
			options = {
				title: options,
			};
		}
		super({
			type: "start",
			title: "Start",
			editableTitle: true,
			inputs: 0,
			outputs: 1,
			...options,
		});
	}

	clone(lookupTable?: { [s: string]: any }) {
		return undefined;
	}

	getInPorts(): DefaultPortModel[] {
		return this.portsIn;
	}

	getOutPorts(): DefaultPortModel[] {
		return this.portsOut;
	}
}
