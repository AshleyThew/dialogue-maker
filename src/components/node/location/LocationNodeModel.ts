import {
  BaseNodeModel,
  BaseNodeModelOptions,
  BaseNodeModelGenerics,
} from '../base';
import { DeserializeEvent } from '@projectstorm/react-canvas-core';
import { LocationFactory } from './LocationNodeFactory';

export interface LocationNodeModelOptions extends BaseNodeModelOptions {
  locationType?: string; // "location" or "area"
  locations?: string[]; // Array of strings: "x, y, z, yaw, pitch"
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
      ...options,
    } as any);
  }

  doClone(lookupTable: {}, clone: any): void {
    super.doClone(lookupTable, clone);
  }

  deserialize(event: DeserializeEvent<this>) {
    super.deserialize(event);
    this.options.locationType = event.data.locationType || 'area';
    this.options.locations = event.data.locations || [];
  }

  serialize(): any {
    return {
      ...super.serialize(),
      locationType: this.options.locationType,
      locations: this.options.locations,
    };
  }

  getLocationType(): string {
    return this.options.locationType || 'area';
  }

  getLocations(): string[] {
    return this.options.locations || [];
  }
}
