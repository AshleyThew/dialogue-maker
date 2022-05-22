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
			editableTitle: false,
			inputs: 0,
			outputs: 1,
			...options,
		});
	}

	doClone(lookupTable: {}, clone: any): void {
		super.doClone(lookupTable, clone);
	}

	getInPorts(): DefaultPortModel[] {
		return this.portsIn;
	}

	getOutPorts(): DefaultPortModel[] {
		return this.portsOut;
	}
}
