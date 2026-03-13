import React from 'react';
import { BaseNodeProps, BaseNodeWidget } from '../base';
import { C, ConditionBlock } from '../../editor/Condition';
import { ActionBlock } from '../../editor/Action';
import { DropdownInput, EditableInput } from '../../editor/Inputs';
import { DialogueContext } from '../../DialogueContext';
import { createLabels } from '../../../utils/Utils';
import {
  ActionBuilderRow,
  ActionBuilderRowType,
  ActionBuilderNodeModel,
} from './ActionBuilderNodeModel';

export interface ActionBuilderNodeProps extends BaseNodeProps<ActionBuilderNodeModel> {}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  marginBottom: '3px',
};

const rowControlStyle: React.CSSProperties = {
  fontWeight: 700,
  cursor: 'pointer',
  marginRight: '2px',
};

const rowTypeOptions = createLabels([
  'track',
  'debug',
  'movement',
  'repeat',
  'actionType',
  'itemsRequired',
  'itemsReplace',
  'initCheck',
  'validCheck',
  'startAction',
  'finishAction',
  'cancelAction',
  'tickConsumer',
]);

const ActionBuilderBlock = (props: {
  node: ActionBuilderNodeModel;
  repaint: () => void;
}) => {
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);
  const context = React.useContext(DialogueContext);
  const builder = props.node.getOptions().builder;
  builder.rows = builder.rows || [];
  if (builder.rows.length === 0) {
    builder.rows.push(new ActionBuilderRow({ type: 'track' }));
  }

  const update = () => {
    forceUpdate();
    props.repaint();
  };

  const items = createLabels(context?.sources?.items || []);

  const renderTypeFields = (row: ActionBuilderRow) => {
    if (row.type === 'movement') {
      return (
        <>
          <span>distance</span>
          <EditableInput
            value={String(row.distance || 1)}
            setValue={(value) => {
              row.distance = Number(value || 1);
              update();
            }}
            placeholder="1.0"
            minLength={4}
          />
        </>
      );
    }

    if (row.type === 'repeat') {
      return (
        <>
          <span>repeatTime</span>
          <EditableInput
            value={String(row.repeatTime || 1)}
            setValue={(value) => {
              row.repeatTime = Number(value || 1);
              update();
            }}
            placeholder="ticks"
            minLength={4}
            number
          />
        </>
      );
    }

    if (row.type === 'actionType') {
      return (
        <>
          <span>class</span>
          <EditableInput
            value={row.actionType || ''}
            setValue={(value) => {
              row.actionType = value;
              update();
            }}
            placeholder="com.example.MyAction"
            minLength={24}
          />
        </>
      );
    }

    if (row.type === 'itemsRequired') {
      return (
        <>
          <DropdownInput
            values={items}
            value={row.item || ''}
            setValue={(value: string) => {
              row.item = value;
              update();
            }}
            placeholder="item"
          />
          <EditableInput
            value={String(row.amount || 1)}
            setValue={(value) => {
              row.amount = Number(value || 1);
              update();
            }}
            placeholder="x"
            minLength={2}
            number
          />
          <label>
            <input
              data-no-drag
              type="checkbox"
              checked={row.takeAtStart}
              onChange={() => {
                row.takeAtStart = !row.takeAtStart;
                update();
              }}
            />{' '}
            takeAtStart
          </label>
        </>
      );
    }

    if (row.type === 'itemsReplace') {
      return (
        <>
          <DropdownInput
            values={items}
            value={row.item || ''}
            setValue={(value: string) => {
              row.item = value;
              update();
            }}
            placeholder="required"
          />
          <DropdownInput
            values={items}
            value={row.replacement || ''}
            setValue={(value: string) => {
              row.replacement = value;
              update();
            }}
            placeholder="replacement"
          />
          <EditableInput
            value={String(row.replacementAmount || 1)}
            setValue={(value) => {
              row.replacementAmount = Number(value || 1);
              update();
            }}
            placeholder="x"
            minLength={2}
            number
          />
        </>
      );
    }

    if (row.type === 'tickConsumer') {
      return (
        <>
          <span>ticks</span>
          <EditableInput
            value={String(row.ticks || 1)}
            setValue={(value) => {
              row.ticks = Number(value || 1);
              update();
            }}
            minLength={3}
            number
          />
          <span>offset</span>
          <EditableInput
            value={String(row.offset || 0)}
            setValue={(value) => {
              row.offset = Number(value || 0);
              update();
            }}
            minLength={3}
            number
          />
        </>
      );
    }

    return undefined;
  };

  return (
    <div style={{ color: 'black', minWidth: '320px', maxWidth: '600px' }}>
      {builder.rows.map((row, index) => (
        <div
          key={`builder-row-${index}`}
          style={{
            borderTop: '1px solid rgba(0,0,0,0.2)',
            paddingTop: '4px',
            marginBottom: '6px',
          }}
        >
          <div style={{ ...rowStyle, flexWrap: 'wrap' }}>
            <C.Plus
              data-no-drag
              title="Insert step after"
              style={rowControlStyle}
              onClick={() => {
                builder.rows.splice(
                  index + 1,
                  0,
                  new ActionBuilderRow({ type: 'track' }),
                );
                update();
              }}
            >
              +
            </C.Plus>
            <C.DeleteRow
              data-no-drag
              title="Remove step"
              style={rowControlStyle}
              onClick={() => {
                builder.rows.splice(index, 1);
                if (builder.rows.length === 0) {
                  builder.rows.push(new ActionBuilderRow({ type: 'track' }));
                }
                update();
              }}
            >
              -
            </C.DeleteRow>
            <DropdownInput
              values={rowTypeOptions}
              value={row.type || ''}
              setValue={(value: ActionBuilderRowType) => {
                row.type = value;
                update();
              }}
              placeholder="option"
              minLength={12}
            />
            {renderTypeFields(row)}
            {(row.type === 'initCheck' || row.type === 'validCheck') && (
              <ConditionBlock
                option={row.conditions}
                remove={undefined}
                allowActionable={true}
              />
            )}
            {(row.type === 'startAction' ||
              row.type === 'finishAction' ||
              row.type === 'cancelAction' ||
              row.type === 'tickConsumer') && (
              <ActionBlock option={row.actions} remove={undefined} />
            )}
          </div>
        </div>
      ))}

      <div>
        <C.Plus
          data-no-drag
          title="Add row"
          onClick={() => {
            builder.rows.push(new ActionBuilderRow({ type: 'track' }));
            update();
          }}
        >
          &#x271A;
        </C.Plus>
      </div>
    </div>
  );
};

export class ActionBuilderNodeWidget extends BaseNodeWidget<ActionBuilderNodeProps> {
  render() {
    return super.construct(
      <ActionBuilderBlock
        node={this.props.node}
        repaint={() => this.props.engine.repaintCanvas()}
      />,
    );
  }
}
