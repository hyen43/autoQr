const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const { fork } = require("child_process");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile("index.html");

  mainWindow.webContents.on("did-finish-load", () => {
    dialog
      .showOpenDialog(mainWindow, {
        properties: ["openFile"],
        filters: [{ name: "CSV Files", extensions: ["csv"] }],
      })
      .then((result) => {
        if (!result.canceled) {
          const csvPath = result.filePaths[0];
          mainWindow.webContents.send(
            "update-status",
            `CSV 파일 선택됨: ${csvPath}\n처리 중입니다...`
          );

          // 프로젝트 디렉토리 설정
          const projectDir = app.isPackaged
            ? path.join(path.dirname(app.getPath("exe")), "autoQr")
            : path.join(path.dirname(__dirname), "autoQr");
          console.log(
            `Forking index.js with CSV Path: ${csvPath}, Project Dir: ${projectDir}`
          );

          const indexProcess = fork(path.join(__dirname, "index.js"), [], {
            env: { CSV_PATH: csvPath, PROJECT_DIR: projectDir },
            stdio: ["pipe", "pipe", "pipe", "ipc"],
          });

          indexProcess.stdout.on("data", (data) => {
            console.log(`[stdout] ${data}`);
            mainWindow.webContents.send("update-status", `${data}`);
          });

          indexProcess.stderr.on("data", (data) => {
            console.error(`[stderr] ${data}`);
            mainWindow.webContents.send("update-status", `에러: ${data}`);
          });

          indexProcess.on("message", (message) => {
            mainWindow.webContents.send("update-status", message);
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "완료",
              message: message,
              buttons: ["확인"],
            });
          });

          indexProcess.on("error", (error) => {
            mainWindow.webContents.send(
              "update-status",
              `에러: ${error.message}`
            );
            dialog.showErrorBox(
              "에러",
              `명함 생성 중 오류 발생: ${error.message}`
            );
          });

          indexProcess.on("exit", (code) => {
            if (code !== 0) {
              mainWindow.webContents.send(
                "update-status",
                `프로세스 종료 코드: ${code}`
              );
              dialog.showErrorBox(
                "에러",
                `프로세스가 비정상적으로 종료되었습니다. 코드: ${code}`
              );
            }
          });
        } else {
          mainWindow.webContents.send(
            "update-status",
            "CSV 파일 선택이 취소되었습니다."
          );
        }
      })
      .catch((err) => {
        mainWindow.webContents.send("update-status", `에러: ${err.message}`);
        dialog.showErrorBox("에러", err.message);
      });
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("ready", () => {
  if (process.platform === "darwin") {
    app.requestSingleInstanceLock();
  }
});
