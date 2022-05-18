import { DefaultPortModel } from "@projectstorm/react-diagrams";
import { DeserializeEvent } from "@projectstorm/react-canvas-core";
import { BaseNodeModel, BaseNodeModelGenerics, BaseNodeModelOptions } from "../base";
import { Conditions } from "../../editor/Condition";
import { Actions } from "../../editor/Action";

export interface ActionNodeModelOptions extends BaseNodeModelOptions {
	actions?: Actions;
}

export interface ActionNodeModelGenerics extends BaseNodeModelGenerics<ActionNodeModelOptions> {}

export class ActionNodeModel extends BaseNodeModel<ActionNodeModelGenerics> {
	constructor(options?: ActionNodeModelOptions);
	constructor(options: any = {}, defaultActions?: Conditions[]) {
		if (typeof options === "string") {
			options = {
				title: options,
				action: defaultActions,
			};
		}
		super({
			type: "action",
			title: "Action",
			editableTitle: false,
			inputs: 1,
			outputs: 1,
			actions: defaultActions || new Actions(),
			...options,
		});
	}

	doClone(lookupTable: {}, clone: any): void {
		super.doClone(lookupTable, clone);
	}

	deserialize(event: DeserializeEvent<this>) {
		super.deserialize(event);
		this.options.actions = new Actions(event.data.actions.actions, event.data.actions.args);
	}

	serialize(): any {
		return {
			...super.serialize(),
			actions: this.options.actions.serialize(),
		};
	}

	getInPorts(): DefaultPortModel[] {
		return this.portsIn;
	}

	getOutPorts(): DefaultPortModel[] {
		return this.portsOut;
	}
}
