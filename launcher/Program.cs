using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net.Sockets;
using System.Threading;
using System.Windows.Forms;

namespace TdevbingLauncher
{
    static class Program
    {
        private static NotifyIcon trayIcon;
        private static string appDir;
        private static string browserPath;

        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            appDir = AppDomain.CurrentDomain.BaseDirectory;
            browserPath = FindBrowser();

            // Khoi tao Tray Icon
            trayIcon = new NotifyIcon();
            trayIcon.Text = "tdevbing - Microsoft Rewards Automation";

            string iconPath = Path.Combine(appDir, "assets", "icon.ico");
            if (File.Exists(iconPath))
            {
                try
                {
                    trayIcon.Icon = new Icon(iconPath);
                }
                catch
                {
                    trayIcon.Icon = SystemIcons.Application;
                }
            }
            else
            {
                trayIcon.Icon = SystemIcons.Application;
            }

            // Menu chuot phai o Tray Icon
            ContextMenu menu = new ContextMenu();
            MenuItem openItem = new MenuItem("Mo tdevbing", (s, e) => OpenAppWindow());
            openItem.DefaultItem = true;
            menu.MenuItems.Add(openItem);

            menu.MenuItems.Add(new MenuItem("Khoi dong lai (Restart)", (s, e) => RestartServers()));
            menu.MenuItems.Add("-");
            menu.MenuItems.Add(new MenuItem("Thoat ung dung (Exit)", (s, e) => ExitApp()));

            trayIcon.ContextMenu = menu;
            trayIcon.Visible = true;
            trayIcon.DoubleClick += (s, e) => OpenAppWindow();

            // Bat dau khoi chay he thong
            StartAll();

            // Vong lap su kien Windows Forms
            Application.Run();
        }

        private static void StartAll()
        {
            KillPorts();
            StartServers();

            Thread worker = new Thread(() =>
            {
                WaitForPort(5173, 15000);
                Thread.Sleep(500);
                OpenAppWindow();
            });
            worker.IsBackground = true;
            worker.Start();
        }

        private static void StartServers()
        {
            try
            {
                ProcessStartInfo bInfo = new ProcessStartInfo("cmd.exe", "/c node server.js");
                bInfo.WorkingDirectory = Path.Combine(appDir, "backend");
                bInfo.CreateNoWindow = true;
                bInfo.UseShellExecute = false;
                Process.Start(bInfo);

                ProcessStartInfo fInfo = new ProcessStartInfo("cmd.exe", "/c npm.cmd run dev");
                fInfo.WorkingDirectory = Path.Combine(appDir, "frontend");
                fInfo.CreateNoWindow = true;
                fInfo.UseShellExecute = false;
                Process.Start(fInfo);
            }
            catch (Exception ex)
            {
                MessageBox.Show("Khong the khoi dong Server: " + ex.Message, "tdevbing Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private static void OpenAppWindow()
        {
            try
            {
                if (!string.IsNullOrEmpty(browserPath))
                {
                    ProcessStartInfo p = new ProcessStartInfo(browserPath, "--app=http://localhost:5173 --window-size=1360,860");
                    Process.Start(p);
                }
                else
                {
                    Process.Start("http://localhost:5173");
                }
            }
            catch {}
        }

        private static void RestartServers()
        {
            KillPorts();
            Thread.Sleep(1000);
            StartAll();
        }

        private static void ExitApp()
        {
            if (trayIcon != null)
            {
                trayIcon.Visible = false;
                trayIcon.Dispose();
            }
            KillPorts();
            Application.Exit();
            Environment.Exit(0);
        }

        private static void KillPorts()
        {
            try
            {
                ProcessStartInfo psi = new ProcessStartInfo("powershell.exe",
                    "-NoProfile -Command \"Get-NetTCPConnection -LocalPort 5000, 5173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }\"");
                psi.CreateNoWindow = true;
                psi.UseShellExecute = false;
                Process p = Process.Start(psi);
                p.WaitForExit(3000);
            }
            catch {}
        }

        private static bool WaitForPort(int port, int timeoutMs)
        {
            int elapsed = 0;
            while (elapsed < timeoutMs)
            {
                try
                {
                    using (TcpClient client = new TcpClient())
                    {
                        var result = client.BeginConnect("127.0.0.1", port, null, null);
                        bool success = result.AsyncWaitHandle.WaitOne(300);
                        if (success && client.Connected)
                        {
                            client.EndConnect(result);
                            return true;
                        }
                    }
                }
                catch {}
                Thread.Sleep(500);
                elapsed += 500;
            }
            return false;
        }

        private static string FindBrowser()
        {
            string[] paths = new string[]
            {
                @"C:\Program Files\Google\Chrome\Application\chrome.exe",
                @"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Google\Chrome\Application\chrome.exe"),
                @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
                @"C:\Program Files\Microsoft\Edge\Application\msedge.exe"
            };

            foreach (string p in paths)
            {
                if (File.Exists(p)) return p;
            }
            return null;
        }
    }
}
