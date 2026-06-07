import { Conditions } from '../../editor/Condition';
import {
  BaseNodeModel,
  BaseNodeModelOptions,
  BaseNodeModelGenerics,
} from '../base';
import { NpcFactory } from './NpcNodeFactory';

export interface TraitConfig {
  trait: string;
  args: { [key: string]: string };
}

export type NpcEntityType = 'ARMOR_STAND' | 'PLAYER' | 'CAT';

export type EquipmentSlot =
  | 'HAND'
  | 'OFF_HAND'
  | 'FEET'
  | 'LEGS'
  | 'CHEST'
  | 'HEAD';

export const EQUIPMENT_SLOTS: EquipmentSlot[] = [
  'HAND',
  'OFF_HAND',
  'FEET',
  'LEGS',
  'CHEST',
  'HEAD',
];

export interface NpcNodeModelOptions extends BaseNodeModelOptions {
  locations?: string[];
  traits?: TraitConfig[];
  conditions?: Conditions;
  entityType?: NpcEntityType;
  equipment?: Partial<Record<EquipmentSlot, string>>;
}

export class NpcNodeModel extends BaseNodeModel<
  BaseNodeModelGenerics<NpcNodeModelOptions>
> {
  constructor(options: NpcNodeModelOptions = {}) {
    super({
      type: 'npc',
      title: options.title || 'NPC',
      editableTitle: true,
      color: NpcFactory.options.color,
      inputs: 0,
      outputs: 1,
      locations: options.locations || [],
      traits: options.traits || [],
      conditions: options.conditions || new Conditions(),
      entityType: options.entityType || 'PLAYER',
      equipment: options.equipment || {},
      ...options,
    } as any);
  }

  serialize() {
    return {
      ...super.serialize(),
      locations: this.options.locations,
      traits: this.options.traits,
      conditions: this.options.conditions.serialize(),
      entityType: this.options.entityType,
      equipment: this.options.equipment,
    };
  }

  deserialize(event: any): void {
    super.deserialize(event);
    this.options.locations = event.data.locations || [];
    this.options.traits = event.data.traits || [];
    this.options.entityType = event.data.entityType || 'PLAYER';
    this.options.equipment = event.data.equipment || {};
    this.options.conditions = new Conditions(
      event.data.conditions.conditions,
      event.data.conditions.args,
      event.data.conditions.ors,
      event.data.conditions.negates,
    );
  }

  doClone(lookupTable: {}, clone: any): void {
    super.doClone(lookupTable, clone);
    clone.options.locations = JSON.parse(JSON.stringify(clone.options.locations || []));
    clone.options.traits = JSON.parse(JSON.stringify(clone.options.traits || []));
    clone.options.equipment = JSON.parse(JSON.stringify(clone.options.equipment || {}));
    const data = JSON.parse(JSON.stringify(clone.options.conditions));
    clone.options.conditions = new Conditions(
      data.conditions,
      data.args,
      data.ors,
      data.negates,
    );
  }
}
