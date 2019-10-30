import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  MenuItemConstructorOptions,
  shell
} from 'electron';
import {
  appMenu,
  debugInfo,
  is,
  openNewGitHubIssue,
  openUrlMenuItem
} from 'electron-util';
import { updateClock } from './clock';
import config from './config';
import tray from './tray';

export function getQuickPreferencesSubmenu(): MenuItemConstructorOptions[] {
  return [
    {
      label: 'View as Timer',
      type: 'radio',
      enabled: !config.get('hideClock'),
      checked: config.get('timerView'),
      click(menuItem) {
        config.set('timerView', menuItem.checked);
        updateClock()
        tray.updateMenu();
        updateMenu();

        const [win] = BrowserWindow.getAllWindows();
        win.webContents.send('send-mailbox-content');
      }
    },
    {
      label: 'View as Clock',
      type: 'radio',
      enabled: !config.get('hideClock'),
      checked: !config.get('timerView'),
      click(menuItem) {
        config.set('timerView', !menuItem.checked);
        updateClock();
        tray.updateMenu();
        updateMenu();

        const [win] = BrowserWindow.getAllWindows();
        win.webContents.send('send-mailbox-content');
      }
    },
    {
      label: `Hide ${config.get('timerView') ? 'Timer' : 'Clock'}`,
      type: 'checkbox',
      checked: config.get('hideClock'),
      click(menuItem) {
        config.set('hideClock', menuItem.checked),
        updateClock();
        tray.updateMenu();
        updateMenu();

        const [win] = BrowserWindow.getAllWindows();
        win.webContents.send('send-mailbox-content');
      }
    }
  ];
}

export function getPreferencesSubmenu(): MenuItemConstructorOptions[] {
  return [
    {
      label: 'Filter No SLA (no-sla)',
      type: 'checkbox',
      checked: config.get('filterNoSLA'),
      click(menuItem) {
        config.set('filterNoSLA', menuItem.checked),
        updateClock();
        tray.updateMenu();
        updateMenu();

        const [win] = BrowserWindow.getAllWindows();
        win.webContents.send('send-mailbox-content');
      }
    },
    {
      label: 'Launch at Login',
      type: 'checkbox',
      checked: app.getLoginItemSettings().openAtLogin,
      click(menuItem) {
        app.setLoginItemSettings({
          openAtLogin: menuItem.checked
        });
        tray.updateMenu();
        updateMenu();

        const [win] = BrowserWindow.getAllWindows();
        win.webContents.send('send-mailbox-content');
      }
    }
  ];
}

export const logOutMenuItem: MenuItemConstructorOptions = {
  label: 'Log Out',
  click() {
    const [ win ] = BrowserWindow.getAllWindows();
    win.webContents.send('log-out');
  }
};

export const helpSubmenu: MenuItemConstructorOptions[] = [
  openUrlMenuItem({
    label: 'Website',
    url: 'https://github.com/simonroth/sla-clock'
  }),
  openUrlMenuItem({
    label: 'Source Code',
    url: 'https://github.com/simonroth/sla-clock'
  }),
  {
    label: 'Report an Issue…',
    click() {
      const body = `
<!-- Please succinctly describe your issue and steps to reproduce it. -->


---

${debugInfo()}`;

      openNewGitHubIssue({
        user: 'simonroth',
        repo: 'sla-clock',
        body
      });
    }
  }
];

export const debugSubmenu: MenuItemConstructorOptions[] = [
  {
    label: 'Show Settings',
    click() {
      config.openInEditor();
    }
  },
  {
    label: 'Show App Data',
    click() {
      shell.openItem(app.getPath('userData'));
    }
  },
  {
    type: 'separator'
  },
  {
    label: 'Delete Settings',
    click() {
      config.clear();

      app.relaunch();
      app.quit();
    }
  },
  {
    label: 'Delete App Data',
    click() {
      shell.moveItemToTrash(app.getPath('userData'));

      app.relaunch();
      app.quit();
    }
  }
];

export default function updateMenu(): Menu {
  const template: MenuItemConstructorOptions[] = [
    appMenu([
      {
        label: 'SLA Clock Preferences',
        submenu: [
          ...getQuickPreferencesSubmenu(),
          ...getPreferencesSubmenu()
        ]
      },
      {
        type: 'separator'
      },
      logOutMenuItem
    ]),
    {
      role: 'editMenu'
    },
    {
      role: 'help',
      submenu: helpSubmenu
    }
  ];

  if (is.development) {
    template.push({
      label: 'Debug',
      submenu: debugSubmenu
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu)

  return menu;
}
