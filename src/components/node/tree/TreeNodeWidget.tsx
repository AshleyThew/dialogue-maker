import { BaseNodeProps, BaseNodeWidget } from '../base';
import { TreeNodeModel } from './TreeNodeModel';

import { DialogueContext } from '../../DialogueContext';
import React from 'react';
import { DropdownInput } from '../../editor/Inputs';
import { StartNodeModel } from '../start/StartNodeModel';

export interface TreeNodeProps extends BaseNodeProps<TreeNodeModel> {}

export class TreeNodeWidget extends BaseNodeWidget<TreeNodeProps> {
  render() {
    return super.construct(
      <div style={{ display: 'flex' }}>
        {super.renderInPorts(true)}
        <TreeBlock tree={this.props} />
      </div>,
    );
  }

  renderHeader(): JSX.Element {
    return <></>;
  }

  renderInPorts(_required?: boolean): JSX.Element {
    return undefined;
  }
}

export const TreeBlock = (props: { tree: TreeNodeProps }): JSX.Element => {
  const context = React.useContext(DialogueContext);
  const { app } = context;
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);
  const values = ['', 'default', ...Object.keys(app.getTrees())].map(
    (tree) => ({ label: tree, value: tree }),
  );

  const setValue = (e) => {
    props.tree.node.getOptions().tree = e;
    props.tree.node.getOptions().start = '';
    forceUpdate();
  };

  const setStart = (e) => {
    props.tree.node.getOptions().start = e;
    forceUpdate();
  };

  const { tree: value, start } = props.tree.node.getOptions();

  const selectStart = value && value.length > 0;
  const targetModel = selectStart
    ? value === 'default'
      ? app.getModel()
      : app.getTrees()[value]
    : undefined;
  let startNodes: string[] = [];
  let targetStartNode: StartNodeModel | undefined;
  if (targetModel) {
    const starts = targetModel
      .getNodes()
      .filter((val) => val instanceof StartNodeModel) as StartNodeModel[];
    startNodes = ['', ...starts.map((s) => s.getOptions().title)];
    if (start) {
      targetStartNode = starts.find((s) => s.getOptions().title === start);
    }
  }
  let startValues = startNodes.map((start) => ({ label: start, value: start }));

  const jumpToStart = () => {
    if (!targetModel || !targetStartNode) return;
    const engine = app.getDiagramEngine();
    if (engine.getModel() !== targetModel) {
      context.tabs.forEach((tab) => {
        if (tab.id === context.activeTabId) {
          tab.activeTree = value === 'default' ? undefined : value;
        }
      });
      engine.setModel(targetModel);
    }
    targetModel
      .getSelectedEntities()
      .forEach((entity) => entity.setSelected(false));
    targetStartNode.setSelected(true);
    const zoom = targetModel.getZoomLevel() / 100;
    targetModel.setOffset(
      60 - targetStartNode.getX() * zoom,
      60 - targetStartNode.getY() * zoom,
    );
    app.forceUpdate();
  };

  const minWidth = Math.max(...values.map((sw) => sw.value.length + 5)) + 'ch';
  return (
    <>
      <div
        style={{
          color: 'black',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <DropdownInput
          values={values}
          value={value || ''}
          setValue={setValue}
          placeholder={'Tree'}
          width={minWidth}
        />
        {selectStart && (
          <DropdownInput
            values={startValues}
            value={start || ''}
            setValue={setStart}
            placeholder={'Select'}
            width={minWidth}
          />
        )}
        {targetStartNode && (
          <button
            type="button"
            onClick={jumpToStart}
            title={`Jump to start "${start}"`}
            style={{
              marginLeft: 4,
              padding: '2px 6px',
              cursor: 'pointer',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(0,0,0,0.4)',
              borderRadius: 3,
              fontSize: 11,
            }}
          >
            ↗
          </button>
        )}
      </div>
    </>
  );
};
