import { Conditions } from '../../editor/Condition';
import {
  BaseNodeModel,
  BaseNodeModelOptions,
  BaseNodeModelGenerics,
} from '../base';
import { NpcFactory } from './NpcNodeFactory';

export interface NpcNodeModelOptions extends BaseNodeModelOptions {
  name?: string;
  skin?: string;
  locations?: string[];
  conditions?: Conditions;
}

export class NpcNodeModel extends BaseNodeModel<
  BaseNodeModelGenerics<NpcNodeModelOptions>
> {
  constructor(options: NpcNodeModelOptions = {}) {
    super({
      type: 'npc',
      title: options.title || 'NPC',
      color: NpcFactory.options.color,
      inputs: 0,
      outputs: 1,
      name: options.name || '',
      skin: options.skin || '',
      locations: options.locations || [],
      conditions: options.conditions || new Conditions(),
      ...options,
    } as any);
  }
  serialize() {
    return {
      ...super.serialize(),
      name: this.options.name,
      skin: this.options.skin,
      locations: this.options.locations,
      conditions: this.options.conditions.serialize(),
    };
  }
  deserialize(event: any): void {
    super.deserialize(event);
    this.options.name = event.data.name || '';
    this.options.skin = event.data.skin || '';
    this.options.locations = event.data.location || [];
    this.options.conditions = new Conditions(
      event.data.conditions.conditions,
      event.data.conditions.args,
      event.data.conditions.ors,
      event.data.conditions.negates
    );
  }

  doClone(lookupTable: {}, clone: any): void {
    super.doClone(lookupTable, clone);
    const data = JSON.parse(JSON.stringify(clone.options.conditions));
    clone.options.conditions = new Conditions(
      data.conditions,
      data.args,
      data.ors,
      data.negates
    );
  }
}
