const electron = require('electron');
const url = require('url');
const path = require('path');
const {
    protocol
} = require('electron/main');
const {
    app,
    BrowserWindow,
    Menu,
    ipcMain
} = electron;
process.env.NODE_ENV = 'production';
let mainwindow;
let addWindow;
//listen for the app to be ready
app.on('ready', () => {
    //create new window
    mainwindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    });
    //load htmt into window
    mainwindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainwindow.html'),
        protocol: 'file',
        slashes: true
    }));
    //quit app when closed
    mainwindow.on('closed', () => {
        app.quit()
    })
    //build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //insert menu
    Menu.setApplicationMenu(mainMenu)
});
//handle create add window

const createAddWindow = () => {
    addWindow = new BrowserWindow({
        width: 250,
        height: 200,
        title: 'Add shopping List',
        webPreferences: {
            nodeIntegration: true
        }
    });
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addwindow.html'),
        protocol: 'file',
        slashes: true
    }))
    addWindow.on('close', () => {
        addWindow = null
    })
};


//catcj item add
ipcMain.on('item:add', (e, item) => {
    console.log(item)
    mainwindow.webContents.send('item:add', item);
    addWindow.close()
})


const mainMenuTemplate = [{
    label: 'File',
    submenu: [{
            label: 'Add Item',
            accelerator: process.platform == 'darwin' ? 'Command+S' : 'Ctrl+S',
            click() {
                createAddWindow();
            }
        },
        {
            label: 'Clear Items',
            click() {
                mainwindow.webContents.send('item:clear')
            }
        },
        {
            label: 'Quit',
            accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
            click() {
                app.quit();
            }
        }
    ]
}]

//if mac 
if (process.platform == 'darwin') {
    mainMenuTemplate.unshift({});
};

//add developer tools if not in production

if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [{
                label: 'Dev tools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}
