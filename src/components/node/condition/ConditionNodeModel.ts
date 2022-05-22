import { DefaultPortModel } from "@projectstorm/react-diagrams";
import { DeserializeEvent } from "@projectstorm/react-canvas-core";
import { BaseNodeModel, BaseNodeModelGenerics, BaseNodeModelOptions } from "../base";
import { Conditions } from "../../editor/Condition";

export interface ConditionNodeModelOptions extends BaseNodeModelOptions {
	conditions?: Conditions;
}

export interface ConditionNodeModelGenerics extends BaseNodeModelGenerics<ConditionNodeModelOptions> {}

export class ConditionNodeModel extends BaseNodeModel<ConditionNodeModelGenerics> {
	constructor(options?: ConditionNodeModelOptions);
	constructor(options: any = {}, defaultConditions?: Conditions[]) {
		if (typeof options === "string") {
			options = {
				conditions: defaultConditions,
			};
		}
		super({
			type: "condition",
			title: "Condition",
			editableTitle: false,
			inputs: 1,
			outputs: 0,
			conditions: defaultConditions || new Conditions(),
			...options,
		});
		this.addOutPort("true", 0);
		this.addOutPort("false", 1);
	}

	doClone(lookupTable: {}, clone: any): void {
		super.doClone(lookupTable, clone);
		console.log(clone);
		const data = JSON.parse(JSON.stringify(clone.options.conditions));
		clone.options.conditions = new Conditions(data.conditions, data.args);
	}

	deserialize(event: DeserializeEvent<this>) {
		super.deserialize(event);
		this.options.conditions = new Conditions(event.data.conditions.conditions, event.data.condition.args);
	}

	serialize(): any {
		return {
			...super.serialize(),
			conditions: this.options.conditions.serialize(),
		};
	}

	getInPorts(): DefaultPortModel[] {
		return this.portsIn;
	}

	getOutPorts(): DefaultPortModel[] {
		return this.portsOut;
	}
}
