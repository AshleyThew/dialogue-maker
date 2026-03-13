import {
  BaseNodeModel,
  BaseNodeModelOptions,
  BaseNodeModelGenerics,
} from '../base';
import { DeserializeEvent } from '@projectstorm/react-canvas-core';
import { Conditions } from '../../editor/Condition';
import { LocationFactory } from './LocationNodeFactory';

export interface LocationNodeModelOptions extends BaseNodeModelOptions {
  locationType?: string; // "location" or "area"
  locations?: string[]; // Array of strings: "x, y, z, yaw, pitch"
  conditions?: Conditions;
}

export class LocationNodeModel extends BaseNodeModel<
  BaseNodeModelGenerics<LocationNodeModelOptions>
> {
  constructor(options: LocationNodeModelOptions = {}) {
    super({
      type: 'location',
      title: 'Location',
      inputs: 0,
      outputs: 1,
      color: LocationFactory.options.color,
      locationType: 'area',
      locations: ['0, 0, 0, 0, 0'],
      conditions: new Conditions(),
      ...options,
    } as any);
  }

  doClone(lookupTable: {}, clone: any): void {
    super.doClone(lookupTable, clone);
    const data = JSON.parse(JSON.stringify(clone.options));
    const conditionData = JSON.parse(JSON.stringify(clone.options.conditions));
    clone.options.locationType = data.locationType || 'area';
    clone.options.locations = data.locations || ['0, 0, 0, 0, 0'];
    clone.options.conditions = new Conditions(
      conditionData?.conditions,
      conditionData?.args,
      conditionData?.ors,
      conditionData?.negates,
    );
  }

  deserialize(event: DeserializeEvent<this>) {
    super.deserialize(event);
    this.options.locationType = event.data.locationType || 'area';
    this.options.locations = event.data.locations || [];
    this.options.conditions = new Conditions(
      event.data.conditions?.conditions,
      event.data.conditions?.args,
      event.data.conditions?.ors,
      event.data.conditions?.negates,
    );
  }

  serialize(): any {
    return {
      ...super.serialize(),
      locationType: this.options.locationType,
      locations: this.options.locations,
      conditions: this.options.conditions.serialize(),
    };
  }

  getLocationType(): string {
    return this.options.locationType || 'area';
  }

  getLocations(): string[] {
    return this.options.locations || [];
  }
}
