import { NpcNodeModel } from './NpcNodeModel';
import { BaseNodeFactory } from '../base/BaseNodeFactory';
import { NpcNodeWidget } from './NpcNodeWidget';

export class NpcNodeFactory extends BaseNodeFactory<NpcNodeModel> {
  constructor() {
    super('npc', 'NPC Info', '#6e4b1e');
  }
  generateModel(event: any) {
    return new NpcNodeModel({ color: this.options.color });
  }
  generateReactWidget(event: { model: NpcNodeModel }) {
    return <NpcNodeWidget node={event.model} engine={this.engine} />;
  }
}

export const NpcFactory = new NpcNodeFactory();
