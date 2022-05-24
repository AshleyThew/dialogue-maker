import { AcitonFactory as ActionFactory } from "./action/ActionNodeFactory";
import { BaseNodeFactory, BaseNodeModel, BaseNodeModelGenerics, BaseNodeModelOptions } from "./base";
import { ConditionFactory } from "./condition/ConditionNodeFactory";
import { DialogueFactory } from "./dialogue/DialogueNodeFactory";
import { OptionFactory } from "./option/OptionNodeFactory";
import { RandomFactory } from "./random/RandomNodeFactory";
import { StartFactory } from "./start/StartNodeFactory";

export * from "./dialogue/DialogueNodeFactory";
export * from "./dialogue/DialogueNodeModel";
export * from "./dialogue/DialogueNodeWidget";

export * from "./option/OptionNodeFactory";
export * from "./option/OptionNodeModel";
export * from "./option/OptionNodeWidget";

export * from "./condition/ConditionNodeFactory";
export * from "./condition/ConditionNodeModel";
export * from "./condition/ConditionNodeWidget";

export * from "./action/ActionNodeFactory";
export * from "./action/ActionNodeModel";
export * from "./action/ActionNodeWidget";

export * from "./random/RandomNodeFactory";
export * from "./random/RandomNodeModel";
export * from "./random/RandomNodeWidget";

export const NodeFactories: BaseNodeFactory<BaseNodeModel<BaseNodeModelGenerics<BaseNodeModelOptions>>>[] = [
	DialogueFactory,
	OptionFactory,
	ConditionFactory,
	ActionFactory,
	RandomFactory,
];

export const AllNodeFactories: BaseNodeFactory<BaseNodeModel<BaseNodeModelGenerics<BaseNodeModelOptions>>>[] = [StartFactory, ...NodeFactories];
