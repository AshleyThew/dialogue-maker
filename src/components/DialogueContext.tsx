import * as React from 'react';
import { Application } from '../Application';
import { ActionProps } from './editor/Action';
import { ConditionProps } from './editor/Condition';
import * as Sources from '../sources/';
import * as vars from '../vars';
import { parse } from 'secure-json-parse';

// Add a simple UUID generator function
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface DialogueTab {
  id: string; // Will be a UUID
  title: string;
  model: any;
  trees?: { [key: string]: any };
  activeTree?: string;
}

export interface DialogueContextInterface {
  conditions: ConditionProps[];
  actions: ActionProps[];
  switchs: { [key: string]: string[] };
  sources?: { [key: string]: string[] };
  app: Application;
  setApp: Function;
  repo: string;
  setRepo: (repo: string) => void;
  sync: boolean;
  toggleSync: () => void;
  refreshStored: () => void;
  // Tab management
  tabs: DialogueTab[];
  activeTabId: string | null; // Changed from index to UUID
  addTab: (title: string, model: any, trees?: { [key: string]: any }) => string; // Return tab UUID
  saveActiveTab: () => void;
  closeTab: (tabId: string) => void; // Take UUID instead of index
  setActiveTab: (tabId: string) => void; // Take UUID instead of index
}

export interface DialogueContextExtraInterface {
  extra: {};
  setExtra: (extra: {}) => void;
  def: {};
}

export interface DialogueContextCombined
  extends DialogueContextInterface,
    DialogueContextExtraInterface {}

export const DialogueContext =
  React.createContext<DialogueContextCombined | null>(null);

const { quests, switchs, ...other } = Sources;
const conditions = vars.conditions as ConditionProps[];
const actions = vars.actions as ActionProps[];

export const DialogueContextProvider = (props) => {
  const [sources, setSources] = React.useState({
    ...other,
    // QUESTS
    ...quests,
  });
  const [repo, setRepo] = React.useState(
    localStorage.getItem('minescape.repo') || 'MineScape-me/MineScape/main'
  );
  const [app, setApp] = React.useState<Application>(null);
  const [webSocket, setWebSocket] = React.useState<WebSocket>(null);
  const [sync, setSync] = React.useState(false);
  const [def, setDefault] = React.useState({});
  const [tabs, setTabs] = React.useState<DialogueTab[]>([]);
  const [activeTabId, setActiveTabId] = React.useState<string | null>(null);

  var stored = parse(localStorage.getItem('minescape-extra'));
  if (!stored) {
    stored = {};
  }
  const [extra, setExtra] = React.useState<DialogueContextCombined>(stored);

  // Tab management functions
  const addTab = (
    title: string,
    model: any,
    trees: { [key: string]: any } = {}
  ): string => {
    const id = generateUUID();
    const newTab: DialogueTab = {
      id,
      title,
      model,
      trees,
    };

    // Set all existing tabs to inactive
    setTabs((prevTabs) => {
      return [...prevTabs.map((tab) => ({ ...tab, active: false })), newTab];
    });

    // Set this tab as active
    setTabActive(id);
    return id;
  };

  const closeTab = (tabId: string) => {
    setTabs((prevTabs) => {
      const tabIndex = prevTabs.findIndex((tab) => tab.id === tabId);
      if (tabIndex === -1) return prevTabs; // Tab not found
      const newTabs = prevTabs.filter((tab) => tab.id !== tabId);

      // If we closed the active tab and there are still tabs left
      if (tabId === activeTabId && newTabs.length > 0) {
        // Try to activate the tab to the left, or the first tab
        const newActiveIndex = Math.max(0, tabIndex - 1);
        const newActiveId = newTabs[newActiveIndex].id;
        newTabs[newActiveIndex] = { ...newTabs[newActiveIndex] };

        // Schedule activeTab update for next render
        setTimeout(() => {
          setTabActive(newActiveId);
        }, 0);
      } else if (newTabs.length === 0) {
        // Set activeTab to null when no tabs are left
        setTimeout(() => {
          setTabActive(null);
        }, 0);
      }

      return newTabs;
    });
  };

  const setTabActive = (tabId: string | null) => {
    saveActiveTab();
    setTabs((prevTabs) => {
      if (tabId !== null && prevTabs.some((tab) => tab.id === tabId)) {
        setActiveTabId(tabId);
        return prevTabs.map((tab) => ({
          ...tab,
          active: tab.id === tabId,
        }));
      }
      return prevTabs;
    });
  };

  const saveActiveTab = () => {
    if (!activeTabId) return;

    const currentTab = tabs.find((tab) => tab.id === activeTabId);
    if (!currentTab) return;

    const model = app.getModel();
    const serialize = app.getModel().serialize();
    const trees = {};
    Object.keys(app.getTrees()).forEach((key) => {
      trees[key] = app.getTrees()[key].serialize();
    });

    const zoomLevel = model.getZoomLevel();
    const offsetX = model.getOffsetX();
    const offsetY = model.getOffsetY();

    setTabs((prevTabs) => {
      const newTabs = prevTabs.map((tab) => {
        if (tab.id === currentTab.id) {
          return {
            ...tab,
            model: serialize,
            trees: trees,
            zoomLevel: zoomLevel,
            offsetX: offsetX,
            offsetY: offsetY,
          };
        }
        return tab;
      });

      return newTabs;
    });
  };

  const context: DialogueContextCombined = {
    conditions,
    actions,
    switchs,
    sources,
    app,
    setApp,
    repo,
    setRepo,
    sync,
    toggleSync: () => {
      setSync((value) => !value);
    },
    refreshStored: () => {
      var stored = parse(localStorage.getItem('minescape-extra'));
      if (!stored) {
        stored = {};
      }
      setExtra(stored);
    },
    extra,
    setExtra: (extra) => {
      localStorage.setItem('minescape-extra', JSON.stringify(extra));
      setExtra(extra as DialogueContextCombined);
    },
    def,
    // Updated tab management in context
    tabs,
    activeTabId,
    addTab,
    closeTab,
    saveActiveTab,
    setActiveTab: setTabActive,
  };

  React.useEffect(() => {
    setDefault(parse(JSON.stringify(context)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connectToWebsocket = async () => {
    if (app && sync) {
      webSocket?.close();
      const ws = new WebSocket('ws://localhost:21902/');
      setWebSocket(ws);
      const timer = setInterval(() => {
        if (ws.readyState === 1) {
          clearInterval(timer);
          console.log('WebSocket connected.');
        }
      }, 10);
      ws.onmessage = (message) => {
        var data = parse(message.data);
        switch (data.type) {
          case 'join':
            console.log(data.message);
            break;
          case 'dialogue':
            app.addDialogue(data.title, data.dialogue, data.link);
            break;
          case 'option':
            app.addOption(data.options, data.link);
            break;
        }
      };
      ws.onclose = (ev) => {
        console.log(ev);
        clearInterval(timer);
        setSync(false);
        console.log('WebSocket closed.');
      };
      ws.onerror = (event) => {
        ws.close();
      };
    } else {
      webSocket?.close();
    }
  };

  React.useEffect(() => {
    connectToWebsocket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sync, app]);

  const mergeMap = (merge: {}, extra: {}) => {
    Object.keys(merge).forEach((key) => {
      const val = merge[key];
      const add = extra[key];
      if (typeof val !== 'undefined' && typeof add === 'undefined') {
        if (Array.isArray(val)) {
          extra[key] = [];
        } else if (typeof val === 'object') {
          extra[key] = {};
        }
      }
      if (typeof add !== 'undefined' && typeof val !== 'undefined') {
        if (Array.isArray(val) && add.length) {
          var set = new Set([...val, ...add]);
          merge[key] = [...set];
        } else if (val instanceof Object && val.constructor === Object) {
          merge[key] = mergeMap(val, add);
        }
      }
    });
    Object.keys(extra).forEach((key) => {
      if (
        typeof extra[key] !== 'undefined' &&
        typeof merge[key] === 'undefined'
      ) {
        merge[key] = extra[key];
      }
    });
    return merge;
  };

  React.useEffect(() => {
    var stored = parse(localStorage.getItem('minescape-extra'));
    if (!stored) {
      stored = {};
    }
    const { extra: ignore, ...merge } = context;
    mergeMap(merge, stored);
    if (Object.keys(extra).length === 0) {
      setExtra(stored);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extra, sources, Object.keys(sources).length]);

  React.useEffect(() => {
    fetch(`https://raw.githubusercontent.com/${repo}/dialogue/paths.txt`)
      .then((data) => data.text())
      .then((data) => {
        var github = data
          .split('\n')
          .filter((line) => line !== '')
          .map((file) =>
            file.replace('dialogue/regions/', '').replace('.json', '')
          )
          .sort();
        var files = [...new Set([...github])];
        setSources((sources) => ({
          ...sources,
          dialogues: files,
          github: github,
        }));
        setDefault((def: any) => {
          def.sources.dialogues = files;
          def.sources.github = github;
          return def;
        });
      })
      .catch((e) => {
        console.log(e);
      });
    if (repo) {
      localStorage.setItem('minescape.repo', repo);
    }
  }, [repo]);

  return (
    <DialogueContext.Provider value={context}>
      {props.children}
    </DialogueContext.Provider>
  );
};
