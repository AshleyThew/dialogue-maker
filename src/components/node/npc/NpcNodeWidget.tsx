import * as React from 'react';
import {
  DropdownInput,
  EditableInput,
  EditableText,
} from '../../editor/Inputs';
import { BaseNodeProps, BaseNodeWidget } from '../base';
import * as sources from '../../../sources';
import {
  NpcNodeModel,
  NpcEntityType,
  TraitConfig,
  EQUIPMENT_SLOTS,
} from './NpcNodeModel';
import { createLabels, validateLocationFormat } from '../../../utils/Utils';
import { ConditionBlock } from '../../editor/Condition';
import styled from '@emotion/styled';

export interface NpcNodeProps extends BaseNodeProps<NpcNodeModel> {}

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

const traitList = createLabels(sources.trait_schemas);
const itemList = createLabels(sources.items);

const TraitItem: React.FC<{
  config: TraitConfig;
  onChange: () => void;
  onRemove: () => void;
}> = ({ config, onChange, onRemove }) => {
  const schema = (sources.trait_schemas as any)[config.trait] || {};
  return (
    <div style={{ marginBottom: 4 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: '0 0 auto' }}>
          <DropdownInput
            values={traitList}
            value={config.trait}
            setValue={(v) => {
              config.trait = v;
              config.args = {};
              onChange();
            }}
            placeholder="Select trait..."
            width="100%"
          />
        </div>
        {Object.entries(schema).map(([field, def]: [string, any]) => (
          <div key={field} style={{ flex: 1 }}>
            {def.type === 'source' ? (
              <DropdownInput
                values={createLabels((sources as any)[def.source] || [])}
                value={config.args[field] || ''}
                setValue={(v) => {
                  config.args[field] = v;
                  onChange();
                }}
                placeholder={def.source}
                width="100%"
                creatable
              />
            ) : (
              <EditableInput
                value={config.args[field] || ''}
                setValue={(v) => {
                  config.args[field] = v;
                  onChange();
                }}
                placeholder={def.type}
              />
            )}
          </div>
        ))}
        <RemoveButton as="button" onClick={onRemove} title="Remove trait">
          &#x268A;
        </RemoveButton>
      </div>
    </div>
  );
};

export class NpcNodeWidget extends BaseNodeWidget<NpcNodeProps> {
  private customSlots = new Set<string>();

  render() {
    const node = this.props.node;
    const locations = node.getOptions().locations;
    const traits = node.getOptions().traits;
    const equipment = node.getOptions().equipment || {};
    const itemValues = new Set(itemList.map((i: any) => i.value));
    Object.entries(equipment).forEach(([slot, value]) => {
      if (value && !itemValues.has(value)) {
        this.customSlots.add(slot);
      }
    });
    const entityTypeOptions = [
      { label: 'PLAYER', value: 'PLAYER' },
      { label: 'ARMOR_STAND', value: 'ARMOR_STAND' },
      { label: 'CAT', value: 'CAT' },
    ];
    return super.construct(
      <div>
        <div
          style={{
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <label>Entity Type:</label>
          <DropdownInput
            values={entityTypeOptions}
            value={node.getOptions().entityType || 'PLAYER'}
            setValue={(v) => {
              node.getOptions().entityType = v as NpcEntityType;
              this.forceUpdate();
            }}
            width="140px"
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label>Traits:</label>
            <AddButton
              onClick={() => {
                traits.push({ trait: '', args: {} });
                this.forceUpdate();
              }}
              as="button"
              title="Add trait"
            >
              &#x271A; Add Trait
            </AddButton>
          </div>
          {traits.map((config, idx) => (
            <TraitItem
              key={idx}
              config={config}
              onChange={() => this.forceUpdate()}
              onRemove={() => {
                traits.splice(idx, 1);
                this.forceUpdate();
              }}
            />
          ))}
        </div>
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label>Equipment:</label>
            {EQUIPMENT_SLOTS.some((s) => !(s in equipment)) && (
              <AddButton
                as="button"
                title="Add equipment slot"
                onClick={() => {
                  const next = EQUIPMENT_SLOTS.find((s) => !(s in equipment));
                  if (next) {
                    node.getOptions().equipment![next] = '';
                    this.forceUpdate();
                  }
                }}
              >
                &#x271A; Add Slot
              </AddButton>
            )}
          </div>
          {EQUIPMENT_SLOTS.filter((slot) => slot in equipment).map((slot) => {
            const usedSlots = EQUIPMENT_SLOTS.filter(
              (s) => s in equipment && s !== slot,
            );
            const slotOptions = EQUIPMENT_SLOTS.filter(
              (s) => !usedSlots.includes(s),
            ).map((s) => ({ label: s, value: s }));
            return (
              <div
                key={slot}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: 4,
                  gap: 6,
                }}
              >
                <div style={{ flex: '0 0 100px' }}>
                  <DropdownInput
                    values={slotOptions}
                    value={slot}
                    setValue={(newSlot) => {
                      if (newSlot !== slot) {
                        const item = equipment[slot];
                        delete node.getOptions().equipment![slot];
                        node.getOptions().equipment![newSlot as any] = item;
                        this.forceUpdate();
                      }
                    }}
                    width="100%"
                  />
                </div>
                <AddButton
                  as="button"
                  title={
                    this.customSlots.has(slot)
                      ? 'Switch to item list'
                      : 'Enter custom MATERIAL:DAMAGE'
                  }
                  onClick={() => {
                    this.customSlots.has(slot)
                      ? this.customSlots.delete(slot)
                      : this.customSlots.add(slot);
                    node.getOptions().equipment![slot] = undefined;
                    this.forceUpdate();
                  }}
                  style={{ fontSize: '0.85em', marginLeft: 0 }}
                >
                  {this.customSlots.has(slot) ? '☰' : '✎'}
                </AddButton>
                <div style={{ flex: 1 }}>
                  {this.customSlots.has(slot) ? (
                    <EditableInput
                      value={equipment[slot] || ''}
                      setValue={(v) => {
                        node.getOptions().equipment![slot] = v || undefined;
                        this.forceUpdate();
                      }}
                      placeholder="MATERIAL:DAMAGE"
                    />
                  ) : (
                    <DropdownInput
                      values={itemList}
                      value={equipment[slot] || ''}
                      setValue={(v) => {
                        node.getOptions().equipment![slot] = v || undefined;
                        this.forceUpdate();
                      }}
                      placeholder="Select item..."
                      width="100%"
                    />
                  )}
                </div>
                <RemoveButton
                  as="button"
                  title="Remove slot"
                  onClick={() => {
                    delete node.getOptions().equipment![slot];
                    this.forceUpdate();
                  }}
                >
                  &#x268A;
                </RemoveButton>
              </div>
            );
          })}
        </div>
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
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
          </div>
          {locations.map((loc, idx) => {
            const isValid = validateLocationFormat(loc);
            return (
              <div
                key={`${idx}-${loc}`}
                style={{
                  marginBottom: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
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
                  title="Remove this location"
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
      </div>,
    );
  }
}
