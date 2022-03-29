const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, BrowserWindow, Menu, ipcMain } = electron;

let addWindow;
let mainWindow;
//Listen for app to be ready

app.on('ready', function(){
  //Create new window
  mainWindow = new BrowserWindow({ 
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "preload.js") // use a preload script
  }
});
  // Load html into window
 // mainWindow.loadFile('mainWindow.html');
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'mainWindow.html'),
    protocol: 'file',
    slashes: true
  }));
  // Quit app when closed
  mainWindow.on('closed', function(){
    app.quit();
  });

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainManuTemplate);
  // Insert menu
  Menu.setApplicationMenu(mainMenu);
});

// Handle create add window
function createAddWindow(){
  //Create new window
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: 'Add ToDo note'
  });
  // Load html into window
 // mainWindow.loadFile('mainWindow.html');
 addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addWindow.html'),
    protocol: 'file',
    slashes: true
  }));
  // Garbage collection handle
  addWindow.on('close', function(){
    addWindow = null;
  });
}

// Catch note:add
ipcMain.on('note:add', function(e, note){
  console.log(note);
  mainWindow.webContents.send('note:add', note);
  addWindow.close();
});

// Create menu template
const mainManuTemplate = [
  {
    label:'File',
    submenu:[
      {
        label: 'Add note',
        click(){
          createAddWindow();
        }
      },
      {
        label: 'Clear note'
      },
      {
        label: 'Quit',
        accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click(){
          app.quit();
        }
      }
    ]
  }
];

// If mac, add empty object to menu
if(process.platform == 'darwin'){
  mainManuTemplate.unshift({});
}

// Add developer tools is not in prod
if(process.env.NODE_ENV !== 'production'){
  mainManuTemplate.push({
    label: 'Developer Tools',
    submenu:[
      {
        label: 'Toggle DevTools',
        accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(note, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]
  });
}