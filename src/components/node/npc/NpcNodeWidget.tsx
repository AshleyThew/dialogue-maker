import * as React from 'react';
import {
  DropdownInput,
  EditableInput,
  EditableText,
} from '../../editor/Inputs';
import { BaseNodeProps, BaseNodeWidget } from '../base';
import { skins } from '../../../sources';
import { NpcNodeModel } from './NpcNodeModel';
import { createLabels, validateLocationFormat } from '../../../utils/Utils';
import { ConditionBlock } from '../../editor/Condition';
import styled from '@emotion/styled';

export interface NpcNodeProps extends BaseNodeProps<NpcNodeModel> {}

// Styled buttons similar to ConditionBlock
const AddButton = styled.span`
  color: #02ff02;
  background: none;
  border: none;
  font-size: 1em;
  margin-left: 4px;
  margin-top: 2px;
  cursor: pointer;
  font-weight: bold;
  transition: color 0.2s;
  &:hover {
    color: #00c900;
  }
`;

const RemoveButton = styled.span<{ disabled?: boolean }>`
  color: ${({ disabled }) => (disabled ? '#888' : '#ee0c0c')};
  background: none;
  border: none;
  font-size: 1em;
  margin-left: 8px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  font-weight: bold;
  transition: color 0.2s;
  &:hover {
    color: ${({ disabled }) => (disabled ? '#888' : '#b30000')};
  }
`;

// Extract SkinDropdown as a separate component to handle force update
const SkinDropdown: React.FC<{ node: NpcNodeModel }> = ({ node }) => {
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);
  return (
    <DropdownInput
      values={createLabels(skins)}
      value={node.getOptions().skin || ''}
      setValue={(v) => {
        node.getOptions().skin = v;
        forceUpdate();
      }}
      placeholder="Select skin..."
      width="100%"
    />
  );
};

export class NpcNodeWidget extends BaseNodeWidget<NpcNodeProps> {
  render() {
    const node = this.props.node;
    const locations = node.getOptions().locations;
    return super.construct(
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <strong>NPC Name:</strong>
          <div style={{ flex: 1 }}>
            <EditableInput
              value={this.props.node.getOptions().name}
              setValue={(v) => (this.props.node.getOptions().name = v)}
              placeholder="Name"
            />
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 8,
          }}
        >
          <strong>Skin:</strong>
          <div style={{ flex: 1 }}>
            <SkinDropdown node={this.props.node} />
          </div>
        </div>
        <div style={{ alignItems: 'center', marginBottom: 8 }}>
          <label>Locations:</label>
          <AddButton
            onClick={() => {
              node.getOptions().locations.push('0, 0, 0, 0, 0');
              this.forceUpdate();
            }}
            as="button"
            title="Add location"
          >
            &#x271A; Add Location
          </AddButton>
          {locations.map((loc, idx) => {
            const isValid = validateLocationFormat(loc);
            return (
              <div
                key={`${idx}-${loc}`}
                style={{
                  marginBottom: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center', // <-- add this line
                }}
              >
                <EditableText
                  value={loc}
                  setValue={(val) => {
                    node.getOptions().locations[idx] = val;
                    this.forceUpdate();
                  }}
                  placeholder="x, y, z, yaw, pitch"
                  style={{
                    background: isValid ? undefined : '#ffeaea',
                    border: isValid ? undefined : '1px solid #ff4d4f',
                  }}
                />
                <RemoveButton
                  title={'Remove this location'}
                  as="button"
                  onClick={() => {
                    node.getOptions().locations.splice(idx, 1);
                    this.forceUpdate();
                  }}
                >
                  &#x268A;
                </RemoveButton>
              </div>
            );
          })}
        </div>
        <div>
          <strong>Condition:</strong>
          <ConditionBlock
            option={this.props.node.getOptions().conditions}
            remove={undefined}
            allowActionable={true}
          />
        </div>
      </div>
    );
  }
}
