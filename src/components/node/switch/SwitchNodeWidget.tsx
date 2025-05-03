import * as _ from 'lodash';
import { BaseNodeProps, BaseNodeWidget, S } from '../base';
import { SwitchNodeModel } from './SwitchNodeModel';

import { DialogueContext } from '../../DialogueContext';
import React from 'react';
import { DropdownInput } from '../../editor/Inputs';
import { createLabels } from '../../../utils/Utils';

export interface SwitchNodeProps extends BaseNodeProps<SwitchNodeModel> {}

export class SwitchNodeWidget extends BaseNodeWidget<SwitchNodeProps> {
  render() {
    return super.construct(
      <div style={{ display: 'flex' }}>
        <SwitchBlock switch={this.props} />
        <div style={{ minWidth: '2.5%' }} />
        <div>
          {this.props.node.getOutPorts().map((port, index) => {
            var color =
              'linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2));';

            if (_.size(port.getLinks()) === 0) {
              color = 'linear-gradient(rgb(248, 8, 8), rgb(248, 8, 8))';
            }
            return (
              <div
                key={`p${index}`}
                style={{
                  color: 'black',
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                <div
                  style={{
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <S.PortOut color={color}>
                    <S.PortsContainer>
                      {this.generatePort(port)}
                    </S.PortsContainer>
                  </S.PortOut>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  renderOutPorts(required?: boolean): JSX.Element {
    return undefined;
  }
}

export const SwitchBlock = (props: {
  switch: SwitchNodeProps;
}): JSX.Element => {
  const { switchs } = React.useContext(DialogueContext);
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);
  const setValue = (e) => {
    props.switch.node.getOptions().switch = e;
    [...props.switch.node.getOutPorts()].forEach((port) => {
      _.forEach(port.getLinks(), (link) => {
        link.remove();
      });
      props.switch.node.removePort(port);
    });
    switchs[e].forEach((sw, index) => {
      props.switch.node.addOutPort(sw, index);
    });
    props.switch.engine.repaintCanvas();
    forceUpdate();
  };

  const minWidth =
    Math.max(...Object.keys(switchs).map((sw) => sw.length + 5)) + 'ch';

  // Error check: compare current out ports with context switchs
  const currentSwitch = props.switch.node.getOptions().switch;
  const expectedSwitchs = switchs[currentSwitch] || [];
  const currentPorts = props.switch.node
    .getOutPorts()
    .map((port) => port.getOptions().label);
  const mismatch =
    expectedSwitchs.length !== currentPorts.length ||
    !expectedSwitchs.every((sw, idx) => sw === currentPorts[idx]);

  return (
    <>
      <div
        style={{
          color: 'black',
          display: 'flex-column',
          justifyContent: 'space-between',
        }}
      >
        <DropdownInput
          values={createLabels(switchs)}
          value={props.switch.node.getOptions().switch || ''}
          setValue={setValue}
          placeholder={'Switch'}
          width={minWidth}
        />
        <br />
        {mismatch && (
          <div style={{ color: 'red', fontWeight: 'bold' }}>
            Error: Switch outputs do not match context definition.
          </div>
        )}
      </div>
    </>
  );
};
