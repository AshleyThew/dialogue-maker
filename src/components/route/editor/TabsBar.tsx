import * as React from 'react';
import { DialogueContext } from '../../DialogueContext';
import styled from '@emotion/styled';
import { confirmAlert } from 'react-confirm-alert';
import { EditableInput } from '../../editor/Inputs';
import { DiagramModel } from '@projectstorm/react-diagrams';
import { StartFactory } from '../../node/start/StartNodeFactory';

namespace S {
  export const TabsContainer = styled.div`
    display: flex;
    background: rgb(30, 30, 30);
    border-bottom: 1px solid rgb(60, 60, 60);
    overflow-x: auto;
    flex-wrap: nowrap;
  `;

  export const Tab = styled.div<{ active: boolean; isHome?: boolean }>`
    padding: 8px 16px;
    background: ${(props) =>
      props.active ? 'rgb(45, 45, 45)' : 'rgb(30, 30, 30)'};
    border-right: 1px solid rgb(60, 60, 60);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    white-space: nowrap;
    user-select: none;
    ${(props) =>
      props.isHome &&
      `
      font-weight: ${props.active ? 'bold' : 'normal'};
      background: ${props.active ? 'rgb(50, 50, 50)' : 'rgb(35, 35, 35)'};
    `}

    &:hover {
      background: ${(props) =>
        props.active
          ? props.isHome
            ? 'rgb(50, 50, 50)'
            : 'rgb(45, 45, 45)'
          : 'rgb(40, 40, 40)'};
    }
  `;

  export const TabText = styled.span`
    margin-right: 8px;
  `;

  export const CloseButton = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    font-size: 12px;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  `;

  export const NewTabButton = styled.div`
    padding: 8px 16px;
    background: rgb(35, 35, 35);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    white-space: nowrap;
    user-select: none;
    margin-left: auto;
    border-left: 1px solid rgb(60, 60, 60);

    &:hover {
      background: rgb(45, 45, 45);
    }
  `;

  export const EmptyMessage = styled.div`
    padding: 8px 16px;
    color: #888;
    font-style: italic;
  `;

  export const CustomUI = styled.div`
    text-align: center;
    width: fit-content;
    min-width: 40vw;
    padding: 40px;
    background: #28bae6;
    box-shadow: 0 20px 75px rgba(0, 0, 0, 0.23);
    color: #fff;

    > h1 {
      margin-top: 0;
    }

    > button {
      width: 160px;
      padding: 10px;
      border: 1px solid #fff;
      margin: 10px;
      cursor: pointer;
      background: none;
      color: #fff;
      font-size: 14px;
    }
  `;
}

export const TabsBar: React.FC = () => {
  const context = React.useContext(DialogueContext);

  // Memoize the tab click handler to prevent unnecessary re-renders
  const handleTabClick = React.useCallback(
    (tabId: string) => {
      if (!context) return;

      // Use the tab's ID instead of index
      context.setActiveTab(tabId);
    },
    [context]
  );

  // Handler for creating a new dialogue tab with popup
  const handleNewTab = React.useCallback(() => {
    if (!context || !context.app) return;

    confirmAlert({
      customUI: ({ onClose }) => {
        let dialogueName = 'New Dialogue';
        return (
          <S.CustomUI>
            <h1>Create New Dialogue</h1>
            <p>Enter a name for your new dialogue:</p>
            <EditableInput
              value={dialogueName}
              setValue={(e) => (dialogueName = e)}
              style={{ background: 'gray' }}
              autoFocus
            />
            <div />
            <button
              onClick={() => {
                // Create a new diagram model
                var newModel = new DiagramModel();
                const node = StartFactory.generateModel(undefined);
                node.setPosition(50, 50);
                node.getOptions().editableTitle = false;
                node.setupPorts();
                newModel.addNode(node);

                // Create a new tab with the user-provided name
                context.addTab(dialogueName, newModel.serialize(), {});

                // Apply the model to the current application
                context.app.setModel(newModel, {});

                onClose();
              }}
            >
              Create
            </button>
            <button onClick={onClose}>Cancel</button>
          </S.CustomUI>
        );
      },
    });
  }, [context]);

  if (!context) return null;

  const { tabs, activeTabId, closeTab } = context;

  return (
    <S.TabsContainer>
      {tabs.length === 0 ? (
        <S.EmptyMessage>No open tabs</S.EmptyMessage>
      ) : (
        tabs.map((tab) => (
          <S.Tab
            key={tab.id}
            active={tab.id === activeTabId}
            onClick={() => handleTabClick(tab.id)}
          >
            <S.TabText>{tab.title || 'Untitled'}</S.TabText>
            <S.CloseButton
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
            >
              ×
            </S.CloseButton>
          </S.Tab>
        ))
      )}
      <S.NewTabButton onClick={handleNewTab}>+ New Dialogue</S.NewTabButton>
    </S.TabsContainer>
  );
};
