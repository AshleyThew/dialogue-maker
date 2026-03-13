import { DefaultPortModel } from '@projectstorm/react-diagrams';
import { DeserializeEvent } from '@projectstorm/react-canvas-core';
import {
  BaseNodeModel,
  BaseNodeModelGenerics,
  BaseNodeModelOptions,
} from '../base';
import { Conditions, ConditionProps } from '../../editor/Condition';
import { ActionProps, Actions } from '../../editor/Action';
import { DialogueContextInterface } from '../../DialogueContext';
import { ActionBuilderFactory } from './ActionBuilderNodeFactory';
import { parse } from 'secure-json-parse';

export type ActionBuilderRowType =
  | 'track'
  | 'debug'
  | 'movement'
  | 'repeat'
  | 'actionType'
  | 'itemsRequired'
  | 'itemsReplace'
  | 'initCheck'
  | 'validCheck'
  | 'startAction'
  | 'finishAction'
  | 'cancelAction'
  | 'tickConsumer';

export interface ActionBuilderRowProps {
  type?: ActionBuilderRowType;
  actionType?: string;
  distance?: number;
  repeatTime?: number;
  item?: string;
  amount?: number;
  takeAtStart?: boolean;
  replacement?: string;
  replacementAmount?: number;
  ticks?: number;
  offset?: number;
  actions?: any;
  conditions?: any;
}

export class ActionBuilderRow implements ActionBuilderRowProps {
  type?: ActionBuilderRowType;
  actionType?: string;
  distance?: number;
  repeatTime?: number;
  item?: string;
  amount?: number;
  takeAtStart?: boolean;
  replacement?: string;
  replacementAmount?: number;
  ticks?: number;
  offset?: number;
  actions?: Actions;
  conditions?: Conditions;

  constructor(row: ActionBuilderRowProps = {}) {
    const actions: any = row.actions;
    const conditions: any = row.conditions;

    this.type = row.type || 'track';
    this.actionType = row.actionType || '';
    this.distance = Number(row.distance || 1);
    this.repeatTime = Number(row.repeatTime || 1);
    this.item = row.item || '';
    this.amount = Number(row.amount || 1);
    this.takeAtStart = !!row.takeAtStart;
    this.replacement = row.replacement || '';
    this.replacementAmount = Number(row.replacementAmount || 1);
    this.ticks = Number(row.ticks || 1);
    this.offset = Number(row.offset || 0);
    this.actions =
      actions instanceof Actions
        ? actions
        : new Actions(actions?.actions, actions?.args);
    this.conditions =
      conditions instanceof Conditions
        ? conditions
        : new Conditions(
            conditions?.conditions,
            conditions?.args,
            conditions?.ors,
            conditions?.negates,
          );
  }

  serialize() {
    return {
      type: this.type,
      actionType: this.actionType,
      distance: this.distance,
      repeatTime: this.repeatTime,
      item: this.item,
      amount: this.amount,
      takeAtStart: this.takeAtStart,
      replacement: this.replacement,
      replacementAmount: this.replacementAmount,
      ticks: this.ticks,
      offset: this.offset,
      actions: this.actions.serialize(),
      conditions: this.conditions.serialize(),
    };
  }
}

export interface ActionBuilderConfigProps {
  rows?: ActionBuilderRowProps[];
}

export class ActionBuilderConfig implements ActionBuilderConfigProps {
  rows?: ActionBuilderRow[];

  constructor(config: ActionBuilderConfigProps = {}) {
    this.rows = (config.rows || []).map((row) =>
      row instanceof ActionBuilderRow ? row : new ActionBuilderRow(row),
    );

    if (this.rows.length === 0) {
      this.rows.push(new ActionBuilderRow({ type: 'track' }));
    }
  }

  serialize() {
    return {
      rows: this.rows.map((row) => row.serialize()),
    };
  }
}

export interface ActionBuilderNodeModelOptions extends BaseNodeModelOptions {
  builder?: ActionBuilderConfig;
}

export interface ActionBuilderNodeModelGenerics extends BaseNodeModelGenerics<ActionBuilderNodeModelOptions> {}

export class ActionBuilderNodeModel extends BaseNodeModel<ActionBuilderNodeModelGenerics> {
  constructor(options?: ActionBuilderNodeModelOptions);
  constructor(options: any = {}) {
    super({
      type: 'actionbuilder',
      title: 'ActionBuilder',
      editableTitle: false,
      inputs: 1,
      outputs: 1,
      builder: options.builder || new ActionBuilderConfig(),
      ...options,
    });
  }

  doClone(lookupTable: {}, clone: any): void {
    super.doClone(lookupTable, clone);
    const data = parse(JSON.stringify(clone.options.builder));
    clone.options.builder = new ActionBuilderConfig(data);
  }

  deserialize(event: DeserializeEvent<this>) {
    super.deserialize(event);
    this.options.builder = new ActionBuilderConfig(event.data.builder);
    this.options.color = ActionBuilderFactory.options.color;
  }

  serialize(): any {
    return {
      ...super.serialize(),
      builder: this.options.builder.serialize(),
    };
  }

  getInPorts(): DefaultPortModel[] {
    return this.portsIn;
  }

  getOutPorts(): DefaultPortModel[] {
    return this.portsOut;
  }

  private fixActions(actions: Actions, actionDefs: ActionProps[]) {
    actions.actions.forEach((act, index) => {
      const action: ActionProps = actionDefs.find(
        (entry) => entry.action === act,
      );
      if (!actions.args[index]) {
        actions.args[index] = [];
      }
      while (
        action &&
        action.variables.length &&
        actions.args[index].length < action.variables.length
      ) {
        actions.args[index].push('');
      }
    });
  }

  private fixConditions(
    conditions: Conditions,
    conditionDefs: ConditionProps[],
  ) {
    conditions.conditions.forEach((cond, index) => {
      const condition: ConditionProps = conditionDefs.find(
        (entry) => entry.condition === cond,
      );
      if (!conditions.args[index]) {
        conditions.args[index] = [];
      }
      while (
        condition &&
        condition.variables.length &&
        conditions.args[index].length < condition.variables.length
      ) {
        conditions.args[index].push('');
      }
    });
  }

  fix(context: DialogueContextInterface) {
    const builder = this.options.builder;
    builder.rows.forEach((row) => {
      if (
        row.type === 'startAction' ||
        row.type === 'finishAction' ||
        row.type === 'cancelAction' ||
        row.type === 'tickConsumer'
      ) {
        this.fixActions(row.actions, context.actions);
      }

      if (row.type === 'initCheck' || row.type === 'validCheck') {
        this.fixConditions(row.conditions, context.conditions);
      }
    });
  }
}
