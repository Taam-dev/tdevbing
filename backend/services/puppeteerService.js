const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { getRandomSearchKeyword } = require('./groqService');
const { updateAccount, getAccountById } = require('./dbService');

puppeteer.use(StealthPlugin());

const activeBrowsers = new Map();
const logsMap = new Map();

function addLog(accountId, message) {
  const timestamp = new Date().toLocaleTimeString();
  const entry = `[${timestamp}] ${message}`;
  console.log(`[Acc ${accountId}] ${entry}`);
  if (!logsMap.has(accountId)) {
    logsMap.set(accountId, []);
  }
  const logs = logsMap.get(accountId);
  logs.push(entry);
  if (logs.length > 50) logs.shift();
}

function getLogs(accountId) {
  return logsMap.get(Number(accountId)) || [];
}

function getProfileDir(accountId) {
  const profileDir = path.resolve(__dirname, '..', 'profiles', `acc_${accountId}`);
  if (!fs.existsSync(profileDir)) {
    fs.mkdirSync(profileDir, { recursive: true });
  }
  return profileDir;
}

function sleepRandom(minMs, maxMs) {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Trích xuất CHÍNH XÁC số điểm sở hữu thực tế,
 * TUYỆT ĐỐI KHÔNG lấy nhầm số điểm mục tiêu (Goal như 7500 pts).
 */
async function extractCurrentPoints(page) {
  try {
    const points = await page.evaluate(() => {
      // 1. Selector chuẩn xác nhất trên bing.com (#id_rc chỉ chứa số điểm sở hữu của user)
      const rc = document.querySelector('#id_rc, span#id_rc, a#id_rc');
      if (rc && rc.innerText) {
        const num = parseInt(rc.innerText.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(num) && num > 0) return num;
      }

      // 2. Selector rh_anim hoặc rh_meter trên bing.com
      const rh = document.querySelector('#rh_anim, #rh_meter_count, .id_rh');
      if (rh && rh.innerText) {
        const num = parseInt(rh.innerText.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(num) && num > 0) return num;
      }

      // 3. Header điểm trên rewards.bing.com (CHỈ lấy trong header hoặc thanh điều hướng trên cùng)
      // Loại trừ hoàn toàn mọi thẻ chứa chữ goal, progress, target, redeem (ngăn chặn nhầm với 7500)
      const headerPoint = document.querySelector('header mee-rewards-counter-animation, header [data-bi-id*="points-breakdown"], header .points-container');
      if (headerPoint && headerPoint.innerText) {
        if (!headerPoint.closest('[class*="goal"], [class*="progress"], [class*="target"], mee-goal-card')) {
          const num = parseInt(headerPoint.innerText.replace(/[^0-9]/g, ''), 10);
          if (!isNaN(num) && num > 0) return num;
        }
      }

      // 4. Tìm số điểm cạnh avatar trong header rewards
      const headerNumbers = document.querySelectorAll('header span, header a');
      for (const el of headerNumbers) {
        if (el.closest('[class*="goal"], [class*="progress"], [class*="target"], mee-goal-card')) {
          continue; // Bỏ qua mục tiêu đổi thưởng 7500!
        }
        const text = (el.innerText || '').trim();
        if (/^[\d,.]+$/.test(text)) {
          const num = parseInt(text.replace(/[^0-9]/g, ''), 10);
          if (num > 0 && num < 100000) return num;
        }
      }

      // 5. Số điểm góc trên bên phải dashboard rewards.bing.com hiện đại (gần avatar)
      const topNumbers = Array.from(document.querySelectorAll('div[class*="items-center"] > p, div[class*="items-center"] > span, header span, header p, [class*="points-container"]'));
      for (const el of topNumbers) {
        if (el.closest('[class*="goal"], [class*="progress"], [class*="target"], mee-goal-card')) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top < 100 && rect.right > 700) {
          const text = (el.innerText || '').trim();
          if (/^\d[\d,.]*$/.test(text)) {
            const num = parseInt(text.replace(/[^0-9]/g, ''), 10);
            if (num > 0 && num < 100000) return num;
          }
        }
      }

      return null;
    });

    return points;
  } catch (err) {
    return null;
  }
}

/**
 * Mở trình duyệt để người dùng tự do kiểm tra, lướt web, đổi quà (không dính dáng đến auto)
 */
async function openBrowser(accountId, targetUrl = 'https://rewards.bing.com/dashboard') {
  if (activeBrowsers.has(accountId)) {
    throw new Error('Trình duyệt cho tài khoản này đang được mở!');
  }

  const profilePath = getProfileDir(accountId);
  addLog(accountId, `Mở trình duyệt kiểm tra thủ công (Profile: acc_${accountId})`);

  updateAccount(accountId, { status: 'browsing' });

  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: profilePath,
    defaultViewport: null,
    args: [
      '--start-maximized',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-infobars',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-restore-session-state',
      '--disable-blink-features=AutomationControlled'
    ]
  });

  activeBrowsers.set(accountId, browser);

  const pages = await browser.pages();
  const page = pages.length > 0 ? pages[0] : await browser.newPage();

  // Đóng sạch mọi tab thừa ngay từ đầu
  for (let i = 1; i < pages.length; i++) {
    await pages[i].close().catch(() => {});
  }

  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  addLog(accountId, `Đã mở ${targetUrl}. Bạn có thể kiểm tra streak, đổi quà, duyệt web tự do.`);

  // Quét dọn dẹp tab about:blank nếu Chrome vừa sinh ra tab thừa
  try {
    const afterPages = await browser.pages();
    for (const p of afterPages) {
      if (p !== page && (p.url() === 'about:blank' || p.url() === '')) {
        await p.close().catch(() => {});
      }
    }
  } catch {}

  browser.on('disconnected', () => {
    activeBrowsers.delete(accountId);
    addLog(accountId, 'Đã đóng trình duyệt kiểm tra.');
    const current = getAccountById(accountId);
    if (current && (current.status === 'browsing' || current.status === 'logging_in')) {
      updateAccount(accountId, { status: 'idle' });
    }
  });

  return { message: 'Đã mở trình duyệt thành công' };
}

/**
 * Đăng nhập thủ công lần đầu
 */
async function openManualLogin(accountId) {
  updateAccount(accountId, { status: 'logging_in' });
  return openBrowser(accountId, 'https://rewards.bing.com/dashboard');
}

/**
 * Luồng Tự Động Hóa Toàn Diện (Daily Set Chuẩn Xác + Web Search + Image Search + Dọn Dẹp Chống Tracking)
 */
async function runAutomation(accountId) {
  if (activeBrowsers.has(accountId)) {
    throw new Error('Tài khoản này đang có trình duyệt hoạt động!');
  }

  const profilePath = getProfileDir(accountId);
  updateAccount(accountId, { status: 'running' });
  addLog(accountId, `=== BẮT ĐẦU AUTOMATION CHO TÀI KHOẢN #${accountId} ===`);

  let browser = null;

  try {
    browser = await puppeteer.launch({
      headless: false,
      userDataDir: profilePath,
      defaultViewport: null,
      args: [
        '--start-maximized',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-restore-session-state',
        '--disable-blink-features=AutomationControlled'
      ]
    });

    activeBrowsers.set(accountId, browser);

    browser.on('disconnected', () => {
      activeBrowsers.delete(accountId);
    });

    const pages = await browser.pages();
    const mainPage = pages.length > 0 ? pages[0] : await browser.newPage();
    await mainPage.setViewport({ width: 1280, height: 800 });

    // Đóng sạch mọi tab thừa lúc mới mở (đặc biệt là about:blank)
    for (let i = 1; i < pages.length; i++) {
      await pages[i].close().catch(() => {});
    }

    // Helper dọn dẹp tab trắng about:blank
    const closeBlankTabs = async () => {
      try {
        const tabs = await browser.pages();
        for (const tab of tabs) {
          if (tab !== mainPage && (tab.url() === 'about:blank' || tab.url() === '')) {
            await tab.close().catch(() => {});
          }
        }
      } catch {}
    };

    await closeBlankTabs();

    let startingPoints = null;
    let currentPoints = null;

    // -------------------------------------------------------------
    // BƯỚC 1: LÀM DAILY SET TRÊN REWARDS.BING.COM
    // -------------------------------------------------------------
    addLog(accountId, '[Bước 1/3] Đang truy cập rewards.bing.com/dashboard để làm Daily Set...');
    await mainPage.goto('https://rewards.bing.com/dashboard', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleepRandom(2500, 3500);

    // 1. Tự động đóng banner Cookie ("Accept")
    await mainPage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, a'));
      const acceptBtn = btns.find(b => (b.innerText || '').trim().toLowerCase() === 'accept');
      if (acceptBtn) {
        acceptBtn.click();
        acceptBtn.remove();
      }
      const banner = document.querySelector('#wcpConsentBannerCtrl, [class*="cookie"]');
      if (banner) banner.remove();
    }).catch(() => {});
    await sleepRandom(1000, 1500);

    // Helper: Cuộn trang mượt mà xuống chính giữa khu vực Daily set
    const scrollToDailySet = async () => {
      await mainPage.evaluate(() => {
        const all = Array.from(document.querySelectorAll('*'));
        const dailyHeading = all.find(el => el.children.length === 0 && /^Daily set/i.test((el.innerText || '').trim()));
        if (dailyHeading) {
          dailyHeading.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          window.scrollTo({ top: 550, behavior: 'smooth' });
        }
      });
      await sleepRandom(2000, 2500);
    };

    // Helper: Quét danh sách các thẻ Daily Set còn CHƯA HOÀN THÀNH
    const getUncompletedDailyCards = async () => {
      return await mainPage.evaluate(() => {
        const allLinks = Array.from(document.querySelectorAll('a'));
        const matches = allLinks.filter(a => {
          const text = (a.innerText || '').replace(/\s+/g, ' ');
          const href = a.href || '';
          const isDailyOffer = href.includes('DailySet') || 
                               href.includes('rnoreward=1') || 
                               href.includes('dsetqu') || 
                               href.includes('tgrew') ||
                               href.includes('REWARDSQUIZ');
          const isDone = text.toLowerCase().includes('completed') ||
                         Boolean(a.querySelector('.mee-icon-SkypeCircleCheck, [class*="check"], svg[class*="check"], [aria-label*="Completed"]'));
          const hasPoints = /\+\s*(10|5)/.test(text);
          return isDailyOffer && hasPoints && !isDone;
        });

        // Dự phòng nếu URL thay đổi nhẹ
        if (matches.length === 0) {
          const fallback = allLinks.filter(a => {
            const t = (a.innerText || '').replace(/\s+/g, ' ');
            const isDone = t.toLowerCase().includes('completed') ||
                           Boolean(a.querySelector('.mee-icon-SkypeCircleCheck, [class*="check"], svg[class*="check"], [aria-label*="Completed"]'));
            return /\+\s*(10|5)/.test(t) && a.href && a.href.includes('bing.com') && !isDone;
          });
          matches.push(...fallback);
        }

        return matches.map(a => {
          const lines = (a.innerText || '').split('\n').map(s => s.trim()).filter(Boolean);
          const title = lines.find(s => !/^\+?\d+$/.test(s) && !/Completed/i.test(s) && s.length > 3) || 'Thẻ Daily';
          return { title, href: a.href };
        });
      });
    };

    // 2. KÉO XUỐNG KHU VỰC "DAILY SET" TRỰC QUAN ĐỂ KIỂM TRA
    addLog(accountId, 'Đang cuộn trang xuống phần "Daily set" để kiểm tra...');
    await scrollToDailySet();

    // 3. Lấy điểm khởi đầu
    const pointsOnRewards = await extractCurrentPoints(mainPage);
    if (pointsOnRewards) {
      startingPoints = pointsOnRewards;
      currentPoints = pointsOnRewards;
      addLog(accountId, `Điểm Rewards ban đầu: ${startingPoints} pts`);
    }

    // 4. LẶP XỬ LÝ TỪNG THẺ CHƯA LÀM (CLICK -> ĐỢI 5S -> TẮT TAB -> QUAY LẠI KIỂM TRA ĐIỂM/DẤU HOÀN THÀNH)
    let dailyAttempts = 0;
    const MAX_DAILY_ATTEMPTS = 6;

    while (dailyAttempts < MAX_DAILY_ATTEMPTS) {
      dailyAttempts++;
      const pendingCards = await getUncompletedDailyCards();

      if (pendingCards.length === 0) {
        addLog(accountId, '✅ Kiểm tra xác nhận: Toàn bộ thẻ Daily Set đã được hoàn thành (có dấu Completed)!');
        break;
      }

      const card = pendingCards[0];
      addLog(accountId, `[Daily Set] Phát hiện thẻ chưa làm: "${card.title}" (+10 pts). Đang click mở thẻ...`);

      try {
        // Thiết lập listener đón tab mới mở ra TRƯỚC KHI click
        const targetCreatedPromise = new Promise(resolve => {
          const handler = async (target) => {
            try {
              const p = await target.page();
              if (p) {
                browser.off('targetcreated', handler);
                resolve(p);
              }
            } catch {
              // ignore
            }
          };
          browser.on('targetcreated', handler);
          setTimeout(() => {
            browser.off('targetcreated', handler);
            resolve(null);
          }, 7000);
        });

        // Click trực tiếp thẻ trên DOM
        await mainPage.evaluate((targetHref) => {
          const links = Array.from(document.querySelectorAll('a'));
          const a = links.find(el => el.href === targetHref || (el.href && targetHref && el.href.includes(targetHref.split('?')[0]) && el.innerText.includes('+')));
          if (a) {
            a.scrollIntoView({ behavior: 'smooth', block: 'center' });
            a.click();
            return true;
          }
          return false;
        }, card.href);

        let taskTab = await targetCreatedPromise;
        if (!taskTab) {
          const allPages = await browser.pages();
          taskTab = allPages.find(p => p !== mainPage && !p.url().includes('rewards.bing.com/dashboard'));
        }
        if (!taskTab) {
          taskTab = await browser.newPage();
          await taskTab.goto(card.href, { waitUntil: 'domcontentloaded', timeout: 35000 }).catch(() => {});
        }

        await sleepRandom(2500, 3000);

        // Tự động click 1 đáp án nếu là trang Quiz / Khảo sát để hoàn thành bài thi
        await taskTab.evaluate(() => {
          const startBtn = Array.from(document.querySelectorAll('input[type="button"], input[type="submit"], button, [role="button"]'))
            .find(b => /start|play|quiz|begin|bắt đầu/i.test(b.innerText || b.value || ''));
          if (startBtn) startBtn.click();

          const choices = Array.from(document.querySelectorAll('.rqOption, .btOption, div[class*="Option"], input[class*="Option"], [role="radio"], [role="button"][id*="choice"], .b_cards input, [data-option]'));
          if (choices.length > 0) {
            choices[Math.floor(Math.random() * choices.length)].click();
          }
        }).catch(() => {});

        addLog(accountId, `-> Đang giữ tab "${card.title}" trong 5s để hệ thống ghi nhận điểm...`);
        await sleepRandom(5000, 5500);
        await taskTab.close().catch(() => {});
        addLog(accountId, `-> Đã đóng tab "${card.title}".`);
        await closeBlankTabs();

        // Quay lại tab chính, tải lại trang để kiểm tra xem đã được điểm / Completed chưa
        await mainPage.bringToFront();
        addLog(accountId, '-> Quay lại Dashboard, tải lại trang kiểm tra điểm và thẻ tiếp theo...');
        await mainPage.reload({ waitUntil: 'domcontentloaded', timeout: 35000 });
        await sleepRandom(2000, 2500);

        // Cuộn lại xuống Daily Set để người dùng thấy rõ trạng thái cập nhật
        await scrollToDailySet();

        // Kiểm tra điểm số mới
        const checkPoints = await extractCurrentPoints(mainPage);
        if (checkPoints) {
          const diff = startingPoints ? (checkPoints - startingPoints) : 0;
          currentPoints = checkPoints;
          addLog(accountId, `-> Điểm sau khi làm thẻ: ${checkPoints} pts${diff > 0 ? ` (+${diff} pts từ Daily Set)` : ''}.`);
          updateAccount(accountId, { lastPoints: checkPoints });
        }
      } catch (errCard) {
        addLog(accountId, `Lỗi khi làm thẻ "${card.title}": ${errCard.message}. Thử thẻ tiếp theo.`);
      }
    }

    addLog(accountId, '================================================');
    addLog(accountId, '✅ ĐÃ XỬ LÝ XONG TOÀN BỘ DAILY SET!');
    addLog(accountId, 'BẮT ĐẦU CHUYỂN SANG BƯỚC TIẾP THEO: AUTO SEARCH...');
    addLog(accountId, '================================================');
    await sleepRandom(2500, 3000);

    // -------------------------------------------------------------
    // BƯỚC 2A: TÌM KIẾM WEB (BING WEB SEARCH)
    // -------------------------------------------------------------
    addLog(accountId, '[Bước 2/3] Truy cập https://www.bing.com/ bắt đầu Web Search...');
    await mainPage.goto('https://www.bing.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleepRandom(2000, 2500);

    // Lấy điểm chuẩn trên bing.com (#id_rc)
    const pointsOnBing = await extractCurrentPoints(mainPage);
    if (pointsOnBing) {
      if (!startingPoints) startingPoints = pointsOnBing;
      currentPoints = pointsOnBing;
      addLog(accountId, `Điểm Bing chuẩn xác: ${currentPoints} pts`);
    } else if (startingPoints && !currentPoints) {
      currentPoints = startingPoints;
    }

    let webConsecutiveNoIncrease = 0;
    let webSearchCount = 0;
    const MAX_WEB_SEARCHES = 35;

    while (webSearchCount < MAX_WEB_SEARCHES) {
      webSearchCount++;
      const prevPoints = currentPoints;

      const keyword = await getRandomSearchKeyword();
      addLog(accountId, `Web Search #${webSearchCount}: "${keyword}"`);

      await mainPage.waitForSelector('#sb_form_q', { timeout: 15000 });
      await mainPage.click('#sb_form_q', { clickCount: 3 });
      await mainPage.keyboard.press('Backspace');
      await sleepRandom(80, 150);

      // Gõ phím siêu tốc
      for (const char of keyword) {
        await mainPage.keyboard.type(char, { delay: Math.floor(Math.random() * 20 + 15) });
      }

      await sleepRandom(200, 350);
      await mainPage.keyboard.press('Enter');

      // Chờ 6 - 9s cộng điểm
      const waitTimeMs = Math.floor(Math.random() * (9000 - 6500 + 1)) + 6500;
      addLog(accountId, `Đã search. Chờ ${(waitTimeMs / 1000).toFixed(1)}s để Bing cộng điểm...`);
      await new Promise(r => setTimeout(r, waitTimeMs));

      const newPoints = await extractCurrentPoints(mainPage);
      if (newPoints !== null && prevPoints !== null) {
        currentPoints = newPoints;
        updateAccount(accountId, { lastPoints: newPoints });

        if (newPoints > prevPoints) {
          webConsecutiveNoIncrease = 0;
          addLog(accountId, `-> Web Search: Điểm TĂNG (+${newPoints - prevPoints} pts)! Tổng: ${newPoints} pts`);
        } else {
          webConsecutiveNoIncrease++;
          addLog(accountId, `-> Web Search: Điểm KHÔNG tăng (Lần ${webConsecutiveNoIncrease}/2).`);
        }
      } else {
        if (newPoints !== null) currentPoints = newPoints;
      }

      // Khi 2 lần liên tiếp không tăng -> chuyển sang Image Search
      if (webConsecutiveNoIncrease >= 2) {
        addLog(accountId, '>>> Web Search đã chạm giới hạn (2 lần không tăng điểm). Chuyển sang Image Search! <<<');
        break;
      }

      await sleepRandom(1000, 1600);
    }

    // -------------------------------------------------------------
    // BƯỚC 2B: TÌM KIẾM HÌNH ẢNH (BING IMAGE SEARCH)
    // -------------------------------------------------------------
    addLog(accountId, '[Chuyển hướng] Đang mở tab Hình ảnh (https://www.bing.com/images) để tìm kiếm thêm điểm...');
    await mainPage.goto('https://www.bing.com/images', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleepRandom(2000, 2500);

    let imgConsecutiveNoIncrease = 0;
    let imgSearchCount = 0;
    const MAX_IMG_SEARCHES = 15;

    while (imgSearchCount < MAX_IMG_SEARCHES) {
      imgSearchCount++;
      const prevPoints = currentPoints;

      const keyword = await getRandomSearchKeyword();
      addLog(accountId, `Image Search #${imgSearchCount}: "${keyword}"`);

      await mainPage.waitForSelector('#sb_form_q', { timeout: 15000 });
      await mainPage.click('#sb_form_q', { clickCount: 3 });
      await mainPage.keyboard.press('Backspace');
      await sleepRandom(80, 150);

      for (const char of keyword) {
        await mainPage.keyboard.type(char, { delay: Math.floor(Math.random() * 20 + 15) });
      }

      await sleepRandom(200, 350);
      await mainPage.keyboard.press('Enter');

      const waitTimeMs = Math.floor(Math.random() * (9000 - 6500 + 1)) + 6500;
      addLog(accountId, `Đã search ảnh. Chờ ${(waitTimeMs / 1000).toFixed(1)}s để kiểm tra điểm...`);
      await new Promise(r => setTimeout(r, waitTimeMs));

      const newPoints = await extractCurrentPoints(mainPage);
      if (newPoints !== null && prevPoints !== null) {
        currentPoints = newPoints;
        updateAccount(accountId, { lastPoints: newPoints });

        if (newPoints > prevPoints) {
          imgConsecutiveNoIncrease = 0;
          addLog(accountId, `-> Image Search: Điểm TĂNG (+${newPoints - prevPoints} pts)! Tổng: ${newPoints} pts`);
        } else {
          imgConsecutiveNoIncrease++;
          addLog(accountId, `-> Image Search: Điểm KHÔNG tăng (Lần ${imgConsecutiveNoIncrease}/2).`);
        }
      } else {
        if (newPoints !== null) currentPoints = newPoints;
      }

      // Nếu Image Search cũng 2 lần không tăng điểm -> Hoàn tất
      if (imgConsecutiveNoIncrease >= 2) {
        addLog(accountId, '>>> Image Search cũng không còn tăng điểm (Đã đạt max toàn bộ hôm nay). Dừng tìm kiếm! <<<');
        break;
      }

      await sleepRandom(1000, 1600);
    }

    // -------------------------------------------------------------
    // BƯỚC 3: XÓA DỮ LIỆU LỊCH SỬ & CACHE CHỐNG TRACKING
    // -------------------------------------------------------------
    addLog(accountId, '[Bước 3/3] Đang dọn dẹp bộ nhớ đệm (Cache) & lịch sử tìm kiếm tạm thời để chống tracking...');
    try {
      // 1. Xóa LocalStorage và SessionStorage tìm kiếm trên trang Bing
      await mainPage.evaluate(() => {
        try { localStorage.clear(); } catch (e) {}
        try { sessionStorage.clear(); } catch (e) {}
      });

      // 2. Xóa Cache mạng và Service Worker qua CDP (Vẫn giữ cookies đăng nhập an toàn)
      const cdp = await mainPage.target().createCDPSession();
      await cdp.send('Network.clearBrowserCache');
      await cdp.send('Storage.clearDataForStorageKey', {
        storageTypes: 'cache_storage,service_workers,websql'
      }).catch(() => {});

      addLog(accountId, 'Đã xóa sạch Cache & Lịch sử tìm kiếm tạm thời chống theo dõi.');
    } catch (cleanErr) {
      addLog(accountId, `Dọn dẹp phụ: ${cleanErr.message}`);
    }

    // -------------------------------------------------------------
    // KẾT THÚC & CẬP NHẬT TRẠNG THÁI
    // -------------------------------------------------------------
    await browser.close();
    activeBrowsers.delete(accountId);

    const finalPoints = currentPoints || startingPoints || 0;
    const earnedToday = (startingPoints && finalPoints >= startingPoints)
      ? (finalPoints - startingPoints)
      : (webSearchCount + imgSearchCount) * 3;

    const nowIso = new Date().toISOString();
    updateAccount(accountId, {
      status: 'completed',
      lastRun: nowIso,
      lastPoints: finalPoints,
      earnedToday: earnedToday
    });

    addLog(accountId, `=== HOÀN TẤT! ĐÃ NHẬN ĐƯỢC: +${earnedToday} PTS (TỔNG: ${finalPoints} PTS) ===`);
    return { success: true, earnedToday, totalPoints: finalPoints, totalSearches: webSearchCount + imgSearchCount };

  } catch (error) {
    addLog(accountId, `LỖI TRONG QUÁ TRÌNH CHẠY: ${error.message}`);
    updateAccount(accountId, { status: 'idle' });
    if (browser) {
      try {
        await browser.close();
      } catch (closeErr) {}
    }
    activeBrowsers.delete(accountId);
    throw error;
  }
}

async function stopBrowser(accountId) {
  if (activeBrowsers.has(accountId)) {
    const browser = activeBrowsers.get(accountId);
    await browser.close();
    activeBrowsers.delete(accountId);
    updateAccount(accountId, { status: 'idle' });
    addLog(accountId, 'Đã dừng trình duyệt.');
    return true;
  }
  return false;
}

module.exports = {
  openBrowser,
  openManualLogin,
  runAutomation,
  stopBrowser,
  getLogs
};
