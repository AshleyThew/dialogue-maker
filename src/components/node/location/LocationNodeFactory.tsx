import { LocationNodeModel } from './LocationNodeModel';
import { LocationNodeWidget } from './LocationNodeWidget';
import { BaseNodeFactory } from '../base/';

export class LocationNodeFactory extends BaseNodeFactory<LocationNodeModel> {
  constructor() {
    super('location', 'Location', '#3a7bdd');
  }

  generateReactWidget(event): JSX.Element {
    return <LocationNodeWidget engine={this.engine} node={event.model} />;
  }

  generateModel(event): LocationNodeModel {
    return new LocationNodeModel({ color: this.options.color });
  }
}

export const LocationFactory = new LocationNodeFactory();
