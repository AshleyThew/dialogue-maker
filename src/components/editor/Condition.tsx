import React from 'react';
import styled from '@emotion/styled';
import { DialogueContext } from '../DialogueContext';
import { DropdownInput } from './Inputs';
import { VariableEditor, VariableProps } from './Variables';
import { createLabels } from '../../utils/Utils';

export interface ConditionProps {
  condition: string;
  variables: VariableProps[];
  actionable?: boolean;
}

export interface ConditionalProps {
  conditions?: string[];
  args?: [string[]];
  ors?: boolean[];
  negates?: boolean[];
}

export class Conditions implements ConditionalProps {
  conditions?: string[];
  args?: [string[]];
  ors?: boolean[];
  negates?: boolean[];

  constructor(
    conditions?: any,
    args?: any,
    ors?: boolean[],
    negates?: boolean[],
  ) {
    this.conditions = conditions || [''];
    this.args = args || [];
    this.ors = ors || this.conditions.map(() => false);
    this.negates = negates || this.conditions.map(() => false);
  }

  serialize(): any {
    return {
      conditions: this.conditions,
      args: this.args,
      ors: this.ors,
      negates: this.negates,
    };
  }
}

export namespace C {
  export const Plus = styled.span`
    color: #02ff02;
    margin-right: 2px;

    cursor: pointer;
  `;
  export const Or = styled.span`
    color: #02a2ff;
    margin-right: 2px;

    cursor: pointer;
  `;
  export const AndOrToggle = styled.span`
    color: #02a2ff;
    margin: 0 4px;
    padding: 0 4px;
    border: 1px solid #02a2ff;
    border-radius: 3px;
    font-size: 10px;
    font-weight: bold;
    cursor: pointer;
    user-select: none;

    &:hover {
      background: rgba(2, 162, 255, 0.2);
    }
  `;
  export const Negate = styled.span`
    color: #e71195;
    margin-right: 2px;

    cursor: pointer;
  `;
  export const DeleteLine = styled.span`
    color: #ee0c0c;
    margin-right: -10px;
    position: relative;
    left: -13px;

    cursor: pointer;
  `;

  export const DeleteRow = styled.span`
    color: #ee0c0c;
    position: relative;

    cursor: pointer;
  `;

  export const AddGroup = styled.span`
    display: none;
  `;
}

export const ConditionBlock = (props: {
  option: ConditionalProps;
  remove: Function;
  allowActionable: boolean;
}): JSX.Element => {
  const { conditions } = React.useContext(DialogueContext);
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);
  const { option } = props;

  // Backward compat: ensure arrays are populated
  if (!option.ors || option.ors.length !== option.conditions.length) {
    option.ors = option.conditions.map(() => false);
  }
  if (!option.negates || option.negates.length !== option.conditions.length) {
    option.negates = option.conditions.map(() => false);
  }

  const hasRealCondition = option.conditions[0]?.length > 0;
  const lastCondIndex = option.conditions.length - 1;

  // Build AND-groups: a new group starts at i=0 or wherever ors[i]=true
  const groups: number[][] = [];
  option.conditions.forEach((_, i) => {
    if (i === 0 || option.ors[i]) {
      groups.push([i]);
    } else {
      groups[groups.length - 1].push(i);
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {groups.map((groupIndices, gidx) => {
        const grouped = groupIndices.length > 1;
        return (
          <React.Fragment key={`g${gidx}`}>
            {gidx > 0 && (
              // OR divider between groups — click to merge into AND
              <C.AndOrToggle
                data-no-drag
                title="OR — click to change to AND"
                onClick={() => {
                  option.ors[groupIndices[0]] = false;
                  forceUpdate();
                }}
              >
                OR
              </C.AndOrToggle>
            )}
            <div
              style={{
                borderLeft: grouped
                  ? '2px solid rgba(0,255,0,0.35)'
                  : undefined,
                paddingLeft: grouped ? 4 : undefined,
              }}
            >
              {groupIndices.map((cindex, rowInGroup) => {
                const cond = option.conditions[cindex];
                const condition: ConditionProps = conditions.find(
                  (c) => c.condition === cond,
                );
                const isFirstOverall = cindex === 0;
                const isLast = cindex === lastCondIndex;
                return (
                  <div
                    key={`c${cindex}`}
                    style={{ display: 'flex', alignItems: 'center' }}
                  >
                    {props.remove && isFirstOverall && (
                      <C.DeleteLine
                        data-no-drag
                        title="Remove option"
                        style={{ WebkitTextStroke: '1px black' }}
                        onClick={() => {
                          props.remove();
                          forceUpdate();
                        }}
                      >
                        &#x268B;
                      </C.DeleteLine>
                    )}
                    {rowInGroup > 0 && (
                      // AND badge within group — click to split into OR
                      <C.AndOrToggle
                        data-no-drag
                        title="AND — click to change to OR"
                        onClick={() => {
                          option.ors[cindex] = true;
                          forceUpdate();
                        }}
                      >
                        AND
                      </C.AndOrToggle>
                    )}
                    {option.negates[cindex] && (
                      <span style={{ margin: '0px 5px' }}>!</span>
                    )}
                    <DropdownInput
                      values={createLabels(conditions, 'condition')}
                      value={option.conditions[cindex]}
                      placeholder="If"
                      setValue={(value: string) => {
                        option.conditions[cindex] = value;
                        const found: ConditionProps = conditions.find(
                          (c) => c.condition === value,
                        );
                        option.args[cindex] = Array(
                          found?.variables.length ?? 0,
                        ).fill('') as any;
                        forceUpdate();
                      }}
                    />
                    {condition &&
                      condition.variables.map((variable, vindex) => {
                        const setValue = (value: string) => {
                          option.args[cindex][vindex] = value;
                          forceUpdate();
                        };
                        return (
                          <VariableEditor
                            key={`v${vindex}`}
                            variable={variable}
                            args={option.args[cindex]}
                            index={vindex}
                            setValue={setValue}
                          />
                        );
                      })}
                    {cond.length > 0 && (
                      <C.Plus
                        data-no-drag
                        title="Add AND condition"
                        onClick={() => {
                          const insertAt = cindex + 1;
                          option.conditions.splice(insertAt, 0, '');
                          (option.args as string[][]).splice(insertAt, 0, []);
                          option.ors.splice(insertAt, 0, false);
                          option.negates.splice(insertAt, 0, false);
                          forceUpdate();
                        }}
                      >
                        &#x271A;
                      </C.Plus>
                    )}
                    {cond.length > 0 && (
                      <C.Or
                        data-no-drag
                        title="Add OR condition"
                        onClick={() => {
                          const insertAt = cindex + 1;
                          option.conditions.splice(insertAt, 0, '');
                          (option.args as string[][]).splice(insertAt, 0, []);
                          option.ors.splice(insertAt, 0, true);
                          option.negates.splice(insertAt, 0, false);
                          forceUpdate();
                        }}
                      >
                        &#x2228;
                      </C.Or>
                    )}
                    {hasRealCondition && (
                      <C.Negate
                        data-no-drag
                        title="Negate condition"
                        onClick={() => {
                          option.negates[cindex] = !option.negates[cindex];
                          forceUpdate();
                        }}
                      >
                        !!
                      </C.Negate>
                    )}
                    {hasRealCondition && (
                      <C.DeleteRow
                        data-no-drag
                        title="Remove condition"
                        onClick={() => {
                          option.conditions.splice(cindex, 1);
                          (option.args as string[][]).splice(cindex, 1);
                          option.ors.splice(cindex, 1);
                          option.negates.splice(cindex, 1);
                          if (option.conditions.length === 0) {
                            option.conditions.push('');
                            (option.args as string[][]).push([]);
                            option.ors.push(false);
                            option.negates.push(false);
                          }
                          forceUpdate();
                        }}
                      >
                        &#x268A;
                      </C.DeleteRow>
                    )}
                  </div>
                );
              })}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
