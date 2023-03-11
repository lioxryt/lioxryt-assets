const { app, BrowserWindow } = require('electron')
const path = require('path')

// modify your existing createWindow() function
function createWindow () {
  const win = new BrowserWindow({
    autoHideMenuBar: true,
    width: 1024,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  win.loadFile('index.html')
}

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
  })

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})