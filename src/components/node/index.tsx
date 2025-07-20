import { ActionFactory } from './action/ActionNodeFactory';
import {
  BaseNodeFactory,
  BaseNodeModel,
  BaseNodeModelGenerics,
  BaseNodeModelOptions,
} from './base';
import { ConditionFactory } from './condition/ConditionNodeFactory';
import { DialogueFactory } from './dialogue/DialogueNodeFactory';
import { NoteFactory } from './note/NoteNodeFactory';
import { OptionFactory } from './option/OptionNodeFactory';
import { RandomFactory } from './random/RandomNodeFactory';
import { StartFactory } from './start/StartNodeFactory';
import { SwitchFactory } from './switch/SwitchNodeFactory';
import { TreeFactory } from './tree/TreeNodeFactory';
import { NpcFactory } from './npc/NpcNodeFactory';
import { LocationFactory } from './location/LocationNodeFactory';

export * from './dialogue/DialogueNodeFactory';
export * from './dialogue/DialogueNodeModel';
export * from './dialogue/DialogueNodeWidget';

export * from './option/OptionNodeFactory';
export * from './option/OptionNodeModel';
export * from './option/OptionNodeWidget';

export * from './condition/ConditionNodeFactory';
export * from './condition/ConditionNodeModel';
export * from './condition/ConditionNodeWidget';

export * from './action/ActionNodeFactory';
export * from './action/ActionNodeModel';
export * from './action/ActionNodeWidget';

export * from './random/RandomNodeFactory';
export * from './random/RandomNodeModel';
export * from './random/RandomNodeWidget';

export * from './note/NoteNodeFactory';
export * from './note/NoteNodeModel';
export * from './note/NoteNodeWidget';

export * from './switch/SwitchNodeFactory';
export * from './switch/SwitchNodeModel';
export * from './switch/SwitchNodeWidget';

export * from './tree/TreeNodeFactory';
export * from './tree/TreeNodeModel';
export * from './tree/TreeNodeWidget';

export * from './npc/NpcNodeModel';
export * from './npc/NpcNodeWidget';
export * from './npc/NpcNodeFactory';

export * from './location/LocationNodeFactory';
export * from './location/LocationNodeModel';
export * from './location/LocationNodeWidget';

export const NodeFactories: BaseNodeFactory<
  BaseNodeModel<BaseNodeModelGenerics<BaseNodeModelOptions>>
>[] = [
  DialogueFactory,
  OptionFactory,
  ConditionFactory,
  SwitchFactory,
  TreeFactory,
  ActionFactory,
  RandomFactory,
  NoteFactory,
  NpcFactory,
  LocationFactory,
];

export const AllNodeFactories: BaseNodeFactory<
  BaseNodeModel<BaseNodeModelGenerics<BaseNodeModelOptions>>
>[] = [StartFactory, ...NodeFactories];
