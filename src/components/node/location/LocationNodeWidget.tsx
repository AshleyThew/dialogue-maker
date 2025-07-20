import * as React from 'react';
import styled from '@emotion/styled';
import { BaseNodeProps, BaseNodeWidget } from '../base';
import { LocationNodeModel } from './LocationNodeModel';
import { EditableText, DropdownInput } from '../../editor/Inputs';
import { validateLocationFormat } from '../../../utils/Utils';

export interface LocationNodeProps extends BaseNodeProps<LocationNodeModel> {}

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

export class LocationNodeWidget extends BaseNodeWidget<LocationNodeProps> {
  render() {
    const node = this.props.node;
    const locations = node.getLocations();
    return super.construct(
      <div>
        <div>
          <label>Type: </label>
          <DropdownInput
            values={[{ label: 'Area', value: 'area' }]}
            value={node.getLocationType()}
            placeholder="Type"
            setValue={(value: string) => {
              node.getOptions().locationType = value;
              this.forceUpdate();
            }}
            width="120px"
          />
        </div>
        <div>
          <label>Locations:</label>
          <AddButton
            onClick={() => {
              node.getLocations().push('0, 0, 0, 0, 0');
              this.forceUpdate();
            }}
            as="button"
            title="Add location"
          >
            &#x271A; Add Location
          </AddButton>
          {locations.map((loc, idx) => {
            const isDisabled = locations.length === 1;
            const isValid = validateLocationFormat(loc);
            return (
              <div
                key={`${idx}-${loc}`}
                style={{
                  marginBottom: 4,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <EditableText
                  value={loc}
                  setValue={(val) => {
                    node.getLocations()[idx] = val;
                    this.forceUpdate();
                  }}
                  placeholder="x, y, z, yaw, pitch"
                  style={{
                    background: isValid ? undefined : '#ffeaea',
                    border: isValid ? undefined : '1px solid #ff4d4f',
                  }}
                />
                <RemoveButton
                  disabled={isDisabled}
                  title={
                    isDisabled
                      ? 'At least one location is required'
                      : 'Remove this location'
                  }
                  as="button"
                  onClick={() => {
                    if (!isDisabled) {
                      node.getLocations().splice(idx, 1);
                      this.forceUpdate();
                    }
                  }}
                >
                  &#x268A;
                </RemoveButton>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
