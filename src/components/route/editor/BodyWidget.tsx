import * as React from 'react';
import { Application } from '../../../Application';
import { AllNodeFactories } from '../../node';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import { DialogueSidebar } from './DialogueSidebar';
import styled from '@emotion/styled';
import {
  BaseNodeModel,
  BaseNodeModelGenerics,
  BaseNodeModelOptions,
} from '../../node/base';
import { showDirectoryPicker, showOpenFilePicker } from 'file-system-access';
import { DiagramModel } from '@projectstorm/react-diagrams';
import {
  DialogueContext,
  DialogueContextCombined,
  DialogueContextInterface,
} from '../../DialogueContext';
import { DropdownInput } from '../../editor/Inputs';
import { Tray } from './Tray';
import { StartFactory } from '../../node/start/StartNodeFactory';
import { confirmAlert } from 'react-confirm-alert'; // Import
import { EditableInput } from '../../editor/Inputs';
import { Editor } from './Editor';
import { createLabels } from '../../../utils/Utils';
import { parse } from 'secure-json-parse';
import { TabsBar } from './TabsBar';

namespace S {
  export const Body = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    min-height: 100%;
  `;

  export const Header = styled.div`
    display: flex;
    background: rgb(30, 30, 30);
    flex-grow: 0;
    flex-shrink: 0;
    color: white;
    font-family: Helvetica, Arial, sans-serif;
    padding: 10px;
    align-items: center;
  `;

  export const Content = styled.div`
    display: flex;
    flex-grow: 1;
  `;

  export const Layer = styled.div`
    position: relative;
    flex-grow: 1;
  `;

  export const Toolbar = styled.div`
    background: black;
    padding: 5px;
    display: flex;
    flex-shrink: 0;
  `;

  export const DemoButton = styled.button<{ hover?; background? }>`
    background: ${(props) => props.background || 'rgb(60, 60, 60)'};
    font-size: 14px;
    padding: 5px 10px;
    border: none;
    color: white;
    outline: none;
    cursor: pointer;
    margin: 2px;
    border-radius: 3px;

    &:hover {
      background: ${(props) => props.hover || 'rgb(0, 192, 255)'};
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.7;
    }
  `;

  export const SavingIndicator = styled.div`
    display: inline-flex;
    align-items: center;
    color: #fff;
    font-size: 13px;
    margin-left: 8px;

    &::before {
      content: '';
      width: 12px;
      height: 12px;
      border: 2px solid rgba(255, 255, 255, 0.4);
      border-top-color: #fff;
      border-radius: 50%;
      margin-right: 6px;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
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

const loadFile = async (
  app: Application,
  context: DialogueContextInterface
) => {
  var fileHandle: FileSystemFileHandle[];
  try {
    fileHandle = await showOpenFilePicker({
      multiple: false,
      types: [{ accept: { 'json/*': ['.json'] } }],
    });
  } catch (error) {
    return;
  }

  fileHandle[0].getFile().then((file) => {
    file.text().then((data) => {
      try {
        const model = parse(data);
        let trees = {};
        if (model.trees) {
          Object.entries(model.trees).forEach((entry) => {
            const [key, value] = entry;
            trees[key] = value;
          });
          delete model['trees'];
        }

        // Add as a new tab
        const title = file.name.replace('.json', '');

        context.addTab(title, model, trees);
        document.title = `${title} - Dialogue Maker`;

        // Apply the tab without calling context.setApp
        const newModel = deserializeModel(app, model, context);
        let newTrees = {};

        if (trees) {
          Object.entries(trees).forEach((entry) => {
            const [key, value] = entry;
            newTrees[key] = deserializeModel(app, value, context);
          });
        }

        app.setModel(newModel, newTrees);
      } catch (e) {
        console.error('Failed to parse file:', e);
      }
    });
  });
};

const loadFromFileHandle = async (
  app: Application,
  context: DialogueContextInterface,
  fileHandle: FileSystemFileHandle,
  titleOverride?: string
) => {
  try {
    const file = await fileHandle.getFile();
    const data = await file.text();
    const model = parse(data);
    let trees = {};

    if (model.trees) {
      Object.entries(model.trees).forEach((entry) => {
        const [key, value] = entry;
        trees[key] = value;
      });
      delete model['trees'];
    }

    const title = titleOverride || file.name.replace('.json', '');
    const tabId = context.addTab(title, model, trees);
    document.title = `${title} - Dialogue Maker`;

    const newModel = deserializeModel(app, model, context);
    let newTrees = {};

    if (trees) {
      Object.entries(trees).forEach((entry) => {
        const [key, value] = entry;
        newTrees[key] = deserializeModel(app, value, context);
      });
    }

    app.setModel(newModel, newTrees);
    return tabId;
  } catch (e) {
    console.error('Failed to parse file:', e);
    return null;
  }
};

const listJsonFilesInDirectory = async (
  directoryHandle: FileSystemDirectoryHandle,
  parent = ''
): Promise<{ path: string; handle: FileSystemFileHandle }[]> => {
  const files: { path: string; handle: FileSystemFileHandle }[] = [];

  for await (const [name, entry] of directoryHandle.entries()) {
    const path = parent ? `${parent}/${name}` : name;
    if (entry.kind === 'directory') {
      const nested = await listJsonFilesInDirectory(
        entry as FileSystemDirectoryHandle,
        path
      );
      files.push(...nested);
      continue;
    }

    if (entry.kind === 'file' && name.toLowerCase().endsWith('.json')) {
      files.push({ path, handle: entry as FileSystemFileHandle });
    }
  }

  return files.sort((a, b) => a.path.localeCompare(b.path));
};

const createOutput = (app: Application) => {
  const output = app.getModel().serialize() as any;
  const trees = { ...app.getTrees() };
  output.trees = {};

  Object.entries(trees).forEach((entry) => {
    const [key, value] = entry;
    output.trees[key] = value.serialize();
  });

  return output;
};

const sanitizeFileName = (value: string) => {
  const sanitized = value
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, ' ')
    .trim();

  return sanitized.length > 0 ? sanitized : 'dialogue';
};

const ensureReadWritePermission = async (
  handle: FileSystemFileHandle
): Promise<boolean> => {
  try {
    if (!handle.queryPermission) {
      return true;
    }

    const options = { mode: 'readwrite' as const };
    let permission = await handle.queryPermission(options);
    if (permission === 'granted') {
      return true;
    }

    if (handle.requestPermission) {
      permission = await handle.requestPermission(options);
      return permission === 'granted';
    }

    return false;
  } catch {
    return false;
  }
};

type SaveResult = {
  status: 'saved' | 'cancelled' | 'failed';
  handle?: FileSystemFileHandle;
  fileName?: string;
};

const loadGithub = async (
  app: Application,
  location: string,
  context: DialogueContextInterface
) => {
  fetch(
    `https://raw.githubusercontent.com/${context.repo}/dialogue/regions/${location}.json`
  )
    .then((data) => data.text())
    .then((data) => {
      try {
        const model = parse(data);
        let trees = {};
        if (model.trees) {
          Object.entries(model.trees).forEach((entry) => {
            const [key, value] = entry;
            trees[key] = value;
          });
          delete model['trees'];
        }

        // Add as a new tab
        var names = location.split('/');
        var title = names[names.length - 1];
        context.addTab(title, model, trees);
        document.title = `${title} - Dialogue Maker`;

        // Apply the tab without calling context.setApp
        const newModel = deserializeModel(app, model, context);
        let newTrees = {};

        if (trees) {
          Object.entries(trees).forEach((entry) => {
            const [key, value] = entry;
            newTrees[key] = deserializeModel(app, value, context);
          });
        }

        app.setModel(newModel, newTrees);
      } catch (e) {
        console.error('Failed to parse GitHub data:', e);
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const deserializeModel = (
  app: Application,
  model: any,
  context: DialogueContextInterface
): DiagramModel => {
  var newModel = new DiagramModel();
  newModel.deserializeModel(model, app.getDiagramEngine());
  newModel.getNodes().forEach((node) => {
    if (node instanceof BaseNodeModel) {
      node.fix(context);
    }
  });
  return newModel;
};

const saveFile = async (
  app: Application,
  context: DialogueContextInterface,
  existingHandle?: FileSystemFileHandle
) => {
  let fileHandle = existingHandle;
  if (!fileHandle) {
    try {
      fileHandle = await showSaveFilePicker({
        types: [{ accept: { 'json/*': ['.json'] } }],
      });
    } catch (error) {
      return { status: 'cancelled' } as SaveResult;
    }
  }

  const hasPermission = await ensureReadWritePermission(fileHandle);
  if (!hasPermission) {
    return { status: 'cancelled' } as SaveResult;
  }

  const output = createOutput(app);
  try {
    const stream = await fileHandle.createWritable();
    await stream.write(JSON.stringify(output, null, 2));
    await stream.close();
  } catch (error) {
    return { status: 'failed' } as SaveResult;
  }

  const tab = context.tabs.find((tab) => tab.id === context.activeTabId);
  if (tab) {
    tab.title = fileHandle.name.replace('.json', '');
    app.forceUpdate();
  }

  return { status: 'saved', handle: fileHandle } as SaveResult;
};

const saveFileToDirectory = async (
  app: Application,
  context: DialogueContextInterface,
  directoryHandle: FileSystemDirectoryHandle
) => {
  try {
    const tab = context.tabs.find((entry) => entry.id === context.activeTabId);
    const fileName = `${sanitizeFileName(tab?.title || 'dialogue')}.json`;
    const fileHandle = await directoryHandle.getFileHandle(fileName, {
      create: true,
    });

    const hasPermission = await ensureReadWritePermission(fileHandle);
    if (!hasPermission) {
      return { status: 'cancelled' } as SaveResult;
    }

    const output = createOutput(app);
    const stream = await fileHandle.createWritable();
    await stream.write(JSON.stringify(output, null, 2));
    await stream.close();

    return {
      status: 'saved',
      handle: fileHandle,
      fileName,
    } as SaveResult;
  } catch (error) {
    return { status: 'failed' } as SaveResult;
  }
};

const clear = async (app: Application, context: DialogueContextInterface) => {
  confirmAlert({
    customUI: ({ onClose }) => {
      let value = 'New Diagram';
      return (
        <S.CustomUI>
          <h1>New Diagram</h1>
          <p>Enter a name for your new diagram:</p>
          <EditableInput
            value={value}
            setValue={(e) => (value = e)}
            style={{ background: 'gray' }}
            autoFocus
          />
          <div />
          <button
            onClick={() => {
              var newModel = new DiagramModel();
              const node = StartFactory.generateModel(undefined);
              node.setPosition(50, 50);
              node.getOptions().editableTitle = false;
              node.setupPorts();
              newModel.addNode(node);

              const tab = context.tabs.find(
                (tab) => tab.id === context.activeTabId
              );
              tab.model = newModel.serialize();
              tab.trees = {};
              tab.title = value;
              app.setModel(newModel, {});
              context.setApp(app);
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
};

const Buttons = (props): JSX.Element => {
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);
  const context = React.useContext(DialogueContext);
  const [github, setGithub] = React.useState('');
  const [localFolder, setLocalFolder] = React.useState<FileSystemDirectoryHandle | null>(null);
  const [localFolderName, setLocalFolderName] = React.useState('');
  const [localFiles, setLocalFiles] = React.useState<string[]>([]);
  const [localSelection, setLocalSelection] = React.useState('');
  const [localFileHandles, setLocalFileHandles] = React.useState<Record<string, FileSystemFileHandle>>({});
  const [tabFileHandles, setTabFileHandles] = React.useState<Record<string, FileSystemFileHandle>>({});
  const [isSaving, setIsSaving] = React.useState(false);
  const localInputRef = React.useRef<any>(null);

  const show = { refresh: true };

  const refreshLocalFolderFiles = React.useCallback(async (directoryHandle: FileSystemDirectoryHandle) => {
    const files = await listJsonFilesInDirectory(directoryHandle);
    const lookup = files.reduce((result, file) => {
      result[file.path] = file.handle;
      return result;
    }, {} as Record<string, FileSystemFileHandle>);

    setLocalFileHandles(lookup);
    setLocalFiles(files.map((entry) => entry.path));
  }, []);

  React.useEffect(() => {
    const liveIds = new Set(context.tabs.map((tab) => tab.id));
    setTabFileHandles((current) => {
      const filtered = Object.entries(current).reduce((result, entry) => {
        const [tabId, handle] = entry;
        if (liveIds.has(tabId)) {
          result[tabId] = handle;
        }
        return result;
      }, {} as Record<string, FileSystemFileHandle>);
      return filtered;
    });
  }, [context.tabs]);

  const clearLocal = () => {
    clear(props.app, context);
    setGithub('');
  };

  const openEditor = () => {
    const alert = {
      customUI: ({ onClose }) => {
        return (
          <S.CustomUI>
            <Editor context={context} ret={alert} />
            {show.refresh && (
              <button
                onClick={() => {
                  context.refreshStored();
                  show.refresh = false;
                  openEditor();
                }}
              >
                Refresh
              </button>
            )}
            <button
              onClick={() => {
                show.refresh = true;
                onClose();
                forceUpdate();
              }}
            >
              Close
            </button>
          </S.CustomUI>
        );
      },
    };
    confirmAlert(alert);
  };

  const changeGithub = () => {
    confirmAlert({
      customUI: ({ onClose }) => {
        let value = context.repo;
        return (
          <S.CustomUI>
            <h1>Change Values</h1>
            <EditableInput
              value={value}
              setValue={(e) => (value = e)}
              style={{ background: 'gray' }}
              autoFocus
            />
            <div />
            <button
              onClick={() => {
                context.setRepo(value);
                onClose();
                forceUpdate();
              }}
            >
              Set
            </button>
          </S.CustomUI>
        );
      },
    });
  };

  const selectLocalFolder = async () => {
    try {
      const folderHandle = await showDirectoryPicker();
      setLocalFolder(folderHandle);
      setLocalFolderName(folderHandle.name || 'Selected Folder');
      await refreshLocalFolderFiles(folderHandle);
      setLocalSelection('');
    } catch (error) {
      return;
    }
  };

  const loadLocalFile = async (path: string) => {
    const handle = localFileHandles[path];
    if (!handle) {
      return;
    }

    const title = path.replace('.json', '').split('/').pop() || path;
    const tabId = await loadFromFileHandle(props.app, context, handle, title);
    if (tabId) {
      setTabFileHandles((current) => ({
        ...current,
        [tabId]: handle,
      }));
      // Reset dropdown after file loads and blur it.
      setLocalSelection('');
      if (localInputRef.current) {
        localInputRef.current.blur();
      }
    }
  };

  const saveActiveFile = async () => {
    const activeTabId = context.activeTabId;
    if (!activeTabId) {
      return;
    }

    setIsSaving(true);
    // Let React paint the spinner before doing heavier serialization/write work.
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });

    try {
      const existingHandle = tabFileHandles[activeTabId];

      // First preference: save directly back to known file handle.
      // On cancel/deny, fallback once to classic Save As.
      if (existingHandle) {
        const savedHandle = await saveFile(props.app, context, existingHandle);
        if (savedHandle.status === 'saved' && savedHandle.handle) {
          setTabFileHandles((current) => ({
            ...current,
            [activeTabId]: savedHandle.handle,
          }));
          return;
        }

        const pickedHandle = await saveFile(props.app, context);
        if (pickedHandle.status === 'saved' && pickedHandle.handle) {
          setTabFileHandles((current) => ({
            ...current,
            [activeTabId]: pickedHandle.handle,
          }));
        }
        return;
      }

      // Second preference: save into selected local folder by active tab title.
      // On cancel/deny, fallback once to classic Save As.
      if (localFolder) {
        const result = await saveFileToDirectory(props.app, context, localFolder);
        if (result.status === 'saved' && result.handle) {
          await refreshLocalFolderFiles(localFolder);
          setLocalSelection(result.fileName || '');
          setTabFileHandles((current) => ({
            ...current,
            [activeTabId]: result.handle,
          }));
          return;
        }

        const pickedHandle = await saveFile(props.app, context);
        if (pickedHandle.status === 'saved' && pickedHandle.handle) {
          setTabFileHandles((current) => ({
            ...current,
            [activeTabId]: pickedHandle.handle,
          }));
        }
        return;
      }

      // Fallback: open the classic save file dialog.
      const pickedHandle = await saveFile(props.app, context);
      if (pickedHandle.status === 'saved' && pickedHandle.handle) {
        setTabFileHandles((current) => ({
          ...current,
          [activeTabId]: pickedHandle.handle,
        }));
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <S.DemoButton
        hover="rgb(29, 167, 29)"
        disabled={isSaving}
        onClick={() => loadFile(props.app, context)}
      >
        Load
      </S.DemoButton>
      <S.DemoButton onClick={saveActiveFile} disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save'}
      </S.DemoButton>
      <S.DemoButton hover="rgb(248, 19, 19)" onClick={clearLocal} disabled={isSaving}>
        Clear
      </S.DemoButton>
      <S.DemoButton hover="rgb(224, 186, 15)" onClick={openEditor} disabled={isSaving}>
        Edit
      </S.DemoButton>
      {isSaving && <S.SavingIndicator>Saving</S.SavingIndicator>}
      <div style={{ marginLeft: 'auto' }} />
      <DropdownInput
        values={createLabels(context.sources.dialogues)}
        value={github}
        setValue={(e) => {
          setGithub(e);
          loadGithub(props.app, e, context);
        }}
        placeholder={`Github (${context.sources.dialogues?.length})`}
        width={'200px'}
        right={0}
      />
      <S.DemoButton onClick={changeGithub} disabled={isSaving}>Change</S.DemoButton>
      <S.DemoButton onClick={selectLocalFolder} hover="rgb(121, 194, 60)" disabled={isSaving}>
        {localFolderName ? `Folder: ${localFolderName}` : 'Select Folder'}
      </S.DemoButton>
      {localFolder && (
        <>
          <DropdownInput
            ref={localInputRef}
            values={createLabels(localFiles)}
            value={localSelection}
            setValue={(e) => {
              loadLocalFile(e);
            }}
            placeholder={`Local (${localFiles.length})`}
            width={'200px'}
            right={0}
          />
        </>
      )}
      {context.sync ? (
        <S.DemoButton
          background="rgb(214, 248, 19)"
          hover="rgb(60, 60, 60)"
          onClick={context.toggleSync}
        >
          Sync
        </S.DemoButton>
      ) : (
        <S.DemoButton
          background="rgb(60, 60, 60)"
          hover="rgb(214, 248, 19)"
          onClick={context.toggleSync}
        >
          Sync
        </S.DemoButton>
      )}
      ;
    </>
  );
};

export class BodyWidget extends React.Component {
  static contextType = DialogueContext;
  previousActiveTabId: string | null = null;
  isUpdating = false;

  state = {
    app: new Application(() => {
      this.forceUpdate();
    }),
  };

  triggerCreate = () => {
    const context = this.context as DialogueContextInterface;
    // Create a blank diagram without showing any popup
    var newModel = new DiagramModel();
    const node = StartFactory.generateModel(undefined);
    node.setPosition(50, 50);
    node.getOptions().editableTitle = false;
    node.setupPorts();
    newModel.addNode(node);

    context.addTab('New Diagram', newModel.serialize(), {});
    this.state.app.setModel(newModel, {});
    context.setApp(this.state.app);
  };

  componentDidMount() {
    let value = this.context as DialogueContextInterface;
    const { app, setApp } = value;
    if (!app) {
      setApp(this.state.app);
    }

    // If there are no tabs, prompt to create a new one
    if (value.tabs.length === 0 && !this.isUpdating) {
      this.triggerCreate();
    }

    // Store the initial active tab id for comparison
    this.previousActiveTabId = value.activeTabId;
  }

  componentDidUpdate() {
    const context = this.context as DialogueContextCombined;

    // Check if there are no tabs and we're not currently updating
    if (context.tabs.length === 0 && !this.isUpdating) {
      this.triggerCreate();
      return;
    }

    // Only apply active tab changes if the tab has actually changed
    if (
      context.activeTabId !== this.previousActiveTabId &&
      context.activeTabId !== null
    ) {
      this.previousActiveTabId = context.activeTabId;

      // Find the tab by ID
      const activeTab = context.tabs.find(
        (tab) => tab.id === context.activeTabId
      );
      if (activeTab) {
        // Apply the active tab without triggering a re-render
        const model = deserializeModel(
          this.state.app,
          activeTab.model,
          context
        );
        let trees = {};

        if (activeTab.trees) {
          Object.entries(activeTab.trees).forEach((entry) => {
            const [key, value] = entry;
            trees[key] = deserializeModel(this.state.app, value, context);
          });
        }

        // Use a flag to track if we're currently updating to prevent recursion
        if (!this.isUpdating) {
          this.isUpdating = true;

          this.state.app.setModel(model, trees);

          if (activeTab.activeTree && trees[activeTab.activeTree]) {
            this.state.app
              .getDiagramEngine()
              .setModel(trees[activeTab.activeTree]);
          }

          this.isUpdating = false;
        }

        // Update document title
        document.title = `${activeTab.title}${
          activeTab.activeTree ? ` - ${activeTab.activeTree}` : ''
        } - Dialogue Maker`;
      }
    }
  }

  render() {
    return (
      <S.Body>
        <S.Toolbar>
          <Buttons app={this.state.app} />
        </S.Toolbar>
        <TabsBar />
        <S.Content>
          <Tray
            app={this.state.app}
            context={this.context as DialogueContextInterface}
          />
          <S.Layer
            onDrop={(event) => {
              var data = parse(
                event.dataTransfer.getData('storm-diagram-node')
              );

              var node: BaseNodeModel<
                BaseNodeModelGenerics<BaseNodeModelOptions>
              > = null!;
              const factory = AllNodeFactories.find(
                (factory) => factory.options.id === data.id
              );
              node = factory.generateModel(undefined);
              node.setupPorts();
              if (data.extra) {
                Object.entries(data.extra).forEach((entry) => {
                  const [key, value] = entry;
                  node.getOptions()[key] = value;
                });
              }
              sessionStorage.setItem('latest-node', node.getID());

              var point = this.state.app
                .getDiagramEngine()
                .getRelativeMousePoint(event);
              node.setPosition(point);
              this.state.app.getDiagramEngine().getModel().addNode(node);
              this.state.app.forceUpdate();
            }}
            onDragOver={(event) => {
              event.preventDefault();
            }}
          >
            <DialogueSidebar>
              <CanvasWidget engine={this.state.app.getDiagramEngine()} />
            </DialogueSidebar>
          </S.Layer>
        </S.Content>
      </S.Body>
    );
  }
}
