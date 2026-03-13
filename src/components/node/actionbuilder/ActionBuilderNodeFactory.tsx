import { ActionBuilderNodeModel } from './ActionBuilderNodeModel';
import { ActionBuilderNodeWidget } from './ActionBuilderNodeWidget';
import { BaseNodeFactory } from '../base';

export class ActionBuilderNodeFactory extends BaseNodeFactory<ActionBuilderNodeModel> {
  constructor() {
    super('actionbuilder', 'ActionBuilder', '#9b4f00e6');
  }

  generateReactWidget(event): JSX.Element {
    return <ActionBuilderNodeWidget engine={this.engine} node={event.model} />;
  }

  generateModel(event): ActionBuilderNodeModel {
    return new ActionBuilderNodeModel({ color: this.options.color });
  }
}

export const ActionBuilderFactory = new ActionBuilderNodeFactory();
