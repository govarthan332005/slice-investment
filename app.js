// ============================================================
//  SLICE INVEST — Enhanced App v2.1
//  Fixed: Daily Bonus, Responsiveness, New Plans, UPI Deposit
// ============================================================

// ─── SPLASH SCREEN ──────────────────────────────────────────
(function handleSplash() {
  setTimeout(() => {
    const splash = document.getElementById("splashScreen");
    if (!splash) return;
    splash.style.opacity = "0";
    splash.style.transition = "opacity 0.6s ease";
    setTimeout(() => {
      splash.classList.add("hidden");
      document.getElementById("loginPage").classList.remove("hidden");
    }, 600);
  }, 2200);
})();

// ─── TAB SWITCHING (Login) ──────────────────────────────────
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".login-form").forEach(f => f.classList.remove("active"));
    btn.classList.add("active");
    const formId = btn.dataset.tab + "LoginForm";
    const form = document.getElementById(formId);
    if (form) form.classList.add("active");
  });
});

window.switchToSignup = (e) => {
  if (e) e.preventDefault();
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".login-form").forEach(f => f.classList.remove("active"));
  const signupTab = document.querySelector('.tab-btn[data-tab="signup"]');
  const signupForm = document.getElementById("signupLoginForm");
  if (signupTab) signupTab.classList.add("active");
  if (signupForm) signupForm.classList.add("active");
};

window.switchToLogin = (e) => {
  if (e) e.preventDefault();
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".login-form").forEach(f => f.classList.remove("active"));
  const userTab = document.querySelector('.tab-btn[data-tab="user"]');
  const userForm = document.getElementById("userLoginForm");
  if (userTab) userTab.classList.add("active");
  if (userForm) userForm.classList.add("active");
};

// ─── MODAL CLOSE ON OVERLAY CLICK ──────────────────────────
document.querySelectorAll(".modal-overlay").forEach(overlay => {
  overlay.addEventListener("click", e => {
    if (e.target === overlay) overlay.classList.add("hidden");
  });
});

// ─── TOGGLE PASSWORD ────────────────────────────────────────
window.togglePass = (id, btn) => {
  const el = document.getElementById(id);
  if (!el) return;
  if (el.type === "password") {
    el.type = "text";
    btn.innerHTML = '<i class="fas fa-eye-slash"></i>';
  } else {
    el.type = "password";
    btn.innerHTML = '<i class="fas fa-eye"></i>';
  }
};

// ─── MODAL helpers ──────────────────────────────────────────
window.openModal  = id => { const m = document.getElementById(id); if(m) m.classList.remove("hidden"); };
window.closeModal = id => { const m = document.getElementById(id); if(m) m.classList.add("hidden"); };

// ─── WITHDRAW BANK SELECT TOGGLE ────────────────────────────
document.getElementById("withdrawBankSelect")?.addEventListener("change", function() {
  const newFields = document.getElementById("newAccountFields");
  if (this.value === "new" || this.value === "") {
    newFields?.classList.toggle("hidden", this.value !== "new");
  } else {
    newFields?.classList.add("hidden");
  }
});

// ─── BANK TYPE SWITCH ───────────────────────────────────────
window.switchBankType = (type, btn) => {
  document.querySelectorAll(".bt-tab").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("bankFields")?.classList.toggle("hidden", type !== "bank");
  document.getElementById("upiFields")?.classList.toggle("hidden", type !== "upi");
};

// ─── SCREENSHOT UPLOAD HANDLING ─────────────────────────────
let uploadedScreenshot = null;

window.handleScreenshotUpload = (event) => {
  event.stopPropagation();
  const file = event.target.files[0];
  if (!file) return;

  // Validate file
  if (!file.type.startsWith('image/')) {
    if (window._showToast) window._showToast("Please upload an image file.", "error");
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    if (window._showToast) window._showToast("File too large. Max 5MB.", "error");
    return;
  }

  uploadedScreenshot = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    const placeholder = document.getElementById("screenshotPlaceholder");
    const preview = document.getElementById("screenshotPreview");
    const previewImg = document.getElementById("screenshotPreviewImg");

    if (placeholder) placeholder.classList.add("hidden");
    if (preview) preview.classList.remove("hidden");
    if (previewImg) previewImg.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

window.removeScreenshot = (event) => {
  event.stopPropagation();
  uploadedScreenshot = null;

  const placeholder = document.getElementById("screenshotPlaceholder");
  const preview = document.getElementById("screenshotPreview");
  const previewImg = document.getElementById("screenshotPreviewImg");
  const input = document.getElementById("screenshotInput");

  if (placeholder) placeholder.classList.remove("hidden");
  if (preview) preview.classList.add("hidden");
  if (previewImg) previewImg.src = "";
  if (input) input.value = "";
};

window.copyDepositUpi = () => {
  const upiId = document.getElementById("depositUpiId")?.textContent;
  if (!upiId) return;
  navigator.clipboard.writeText(upiId).then(() => {
    if (window._showToast) window._showToast("UPI ID copied! 📋", "success");
  }).catch(() => {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = upiId;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    if (window._showToast) window._showToast("UPI ID copied! 📋", "success");
  });
};

// ═══════════════════════════════════════════════════════════════
//  MAIN APP — Initialized after backend is ready
// ═══════════════════════════════════════════════════════════════

(async () => {
  let backend;
  try {
    backend = await (window.SliceInvestBackendReady || Promise.reject(new Error("Backend missing.")));
  } catch (e) {
    console.error("Backend failed:", e);
    showToast("Failed to connect. Please reload.", "error");
    return;
  }

  const {
    db, auth, backendMode,
    collection, doc,
    getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
    query, where, orderBy, limit, onSnapshot,
    serverTimestamp, Timestamp,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
  } = backend;

  // ─── INVESTMENT PLANS (3 New Plans) ───────────────────────────
  const PLANS = [
    {
      id: "basic", name: "Basic Plan", amount: 500, dailyReturnFixed: 100, duration: 0,
      icon: "fas fa-rocket", badge: "basic", badgeClass: "badge-basic",
      features: [
        "₹500 Investment",
        "₹100 Daily Returns",
        "Daily Withdraw Available",
        "No Lock Period",
        "Lifetime Earnings"
      ]
    },
    {
      id: "standard", name: "Standard Plan", amount: 1000, dailyReturnFixed: 300, duration: 0,
      icon: "fas fa-gem", badge: "standard", badgeClass: "badge-standard",
      features: [
        "₹1,000 Investment",
        "₹300 Daily Returns",
        "Daily Withdraw Available",
        "No Lock Period",
        "Lifetime Earnings"
      ]
    },
    {
      id: "premium", name: "Premium Plan", amount: 2500, dailyReturnFixed: 800, duration: 0,
      icon: "fas fa-crown", badge: "premium", badgeClass: "badge-premium",
      features: [
        "₹2,500 Investment",
        "₹800 Daily Returns",
        "Daily Withdraw Available",
        "No Lock Period",
        "Lifetime Earnings"
      ]
    }
  ];

  // ─── STATE ────────────────────────────────────────────────────
  let currentUser      = null;
  let currentUserData  = null;
  let selectedPlan     = null;
  let bankAccounts     = [];
  let allTransactions  = [];
  let portfolioChart   = null;
  let isInvestProcessing = false;  // Guard against double-click on invest
  let isWithdrawProcessing = false; // Guard against double-click on withdraw
  const MAX_REWARD_STREAK = 7;     // Daily reward cycle limit
  const DEFAULT_PLATFORM_CONFIG = {
    minDeposit: 100,
    minWithdraw: 100,
    referralBonus: 50,
    baseReward: 10,
    streakBonus: 2,
    maxReward: 50
  };
  let runtimePlatformConfig = { ...DEFAULT_PLATFORM_CONFIG };
  let runtimeUpiConfig = { upiId: "sliceinvest@ybl", displayName: "SliceInvest Official" };
  let runtimeDepositConfig = { enableUpi: true, enableQr: false, enableBank: false, qrCodeImage: '', bankAccountName: '', bankAccountNumber: '', bankIfsc: '', bankName: '' };
  let runtimeLinksConfig = { telegramLink: '', customerCareLink: '' };
  let runtimeWithdrawConfig = { apiWithdrawEnabled: true };
  let runtimeConfigLoaded = false;

  // ─── UTILITY FUNCTIONS ────────────────────────────────────────
  function showToast(msg, type = "info") {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.className = `toast show ${type}`;
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.className = "toast"; }, 3500);
  }
  window._showToast = showToast;

  function fmt(n) {
    return "₹" + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function fmtDate(ts) {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
  }

  function fmtDateTime(ts) {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-IN", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
  }

  function sortDocsByCreatedAt(docs, limitCount = null) {
    const sorted = [...docs].sort((a, b) => {
      const aData = a.data();
      const bData = b.data();
      const aTime = aData?.createdAt?.toDate ? aData.createdAt.toDate().getTime() : new Date(aData?.createdAt || 0).getTime();
      const bTime = bData?.createdAt?.toDate ? bData.createdAt.toDate().getTime() : new Date(bData?.createdAt || 0).getTime();
      return bTime - aTime;
    });
    return typeof limitCount === "number" ? sorted.slice(0, limitCount) : sorted;
  }

  function generateReferralCode(name) {
    const prefix = (name || "USER").replace(/\s+/g, "").toUpperCase().slice(0, 4);
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    return prefix + suffix;
  }

  // Helper: get today's date string (local)
  function getTodayString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function applyRuntimeConfigToUI() {
    const upiEl = document.getElementById("depositUpiId");
    if (upiEl) upiEl.textContent = runtimeUpiConfig.upiId || DEFAULT_PLATFORM_CONFIG.upiId || "sliceinvest@ybl";

    const depositAmountInput = document.getElementById("depositAmount");
    if (depositAmountInput) depositAmountInput.min = String(runtimePlatformConfig.minDeposit || DEFAULT_PLATFORM_CONFIG.minDeposit);

    const withdrawAmountInput = document.getElementById("withdrawAmount");
    if (withdrawAmountInput) withdrawAmountInput.min = String(runtimePlatformConfig.minWithdraw || DEFAULT_PLATFORM_CONFIG.minWithdraw);

    // Apply deposit method config
    applyDepositMethodsUI();

    // Apply Telegram & Customer Care links visibility
    const telegramItem = document.getElementById('settingsTelegramItem');
    const ccItem = document.getElementById('settingsCustomerCareItem');
    if (telegramItem) telegramItem.style.display = runtimeLinksConfig.telegramLink ? 'flex' : 'none';
    if (ccItem) ccItem.style.display = runtimeLinksConfig.customerCareLink ? 'flex' : 'none';
  }

  function applyDepositMethodsUI() {
    const cfg = runtimeDepositConfig;
    const tabsContainer = document.getElementById('depositMethodTabs');
    const upiSection = document.getElementById('depositUpiSection');
    const qrSection = document.getElementById('depositQrSection');
    const bankSection = document.getElementById('depositBankSection');

    const methods = [];
    if (cfg.enableUpi) methods.push('upi');
    if (cfg.enableQr && cfg.qrCodeImage) methods.push('qr');
    if (cfg.enableBank && cfg.bankAccountNumber) methods.push('bank');

    if (methods.length <= 1) {
      if (tabsContainer) tabsContainer.innerHTML = '';
    } else {
      if (tabsContainer) {
        let tabsHtml = '';
        if (cfg.enableUpi) tabsHtml += '<button class="deposit-method-tab active" onclick="switchDepositMethod(\'upi\', this)"><i class="fas fa-mobile-screen"></i>UPI</button>';
        if (cfg.enableQr && cfg.qrCodeImage) tabsHtml += '<button class="deposit-method-tab' + (!cfg.enableUpi ? ' active' : '') + '" onclick="switchDepositMethod(\'qr\', this)"><i class="fas fa-qrcode"></i>QR Code</button>';
        if (cfg.enableBank && cfg.bankAccountNumber) tabsHtml += '<button class="deposit-method-tab' + (!cfg.enableUpi && !(cfg.enableQr && cfg.qrCodeImage) ? ' active' : '') + '" onclick="switchDepositMethod(\'bank\', this)"><i class="fas fa-building-columns"></i>Bank</button>';
        tabsContainer.innerHTML = tabsHtml;
      }
    }

    if (upiSection) upiSection.classList.toggle('hidden', !cfg.enableUpi);
    if (qrSection) qrSection.classList.add('hidden');
    if (bankSection) bankSection.classList.add('hidden');

    if (!cfg.enableUpi && methods.length > 0) {
      if (methods[0] === 'qr' && qrSection) qrSection.classList.remove('hidden');
      if (methods[0] === 'bank' && bankSection) bankSection.classList.remove('hidden');
    }

    if (cfg.qrCodeImage) {
      const qrImg = document.getElementById('depositQrImage');
      if (qrImg) qrImg.src = cfg.qrCodeImage;
    }

    if (cfg.bankAccountNumber) {
      const bankContainer = document.getElementById('depositBankDetails');
      if (bankContainer) {
        bankContainer.innerHTML = `
          <div class="deposit-bank-row">
            <span class="dbr-label">Bank Name</span>
            <span class="dbr-value">${cfg.bankName || '\u2014'}</span>
            <button class="deposit-bank-copy" onclick="copyToClipboard('${(cfg.bankName || '').replace(/'/g, "\\'")}')"><i class="fas fa-copy"></i></button>
          </div>
          <div class="deposit-bank-row">
            <span class="dbr-label">Account Name</span>
            <span class="dbr-value">${cfg.bankAccountName || '\u2014'}</span>
            <button class="deposit-bank-copy" onclick="copyToClipboard('${(cfg.bankAccountName || '').replace(/'/g, "\\'")}')"><i class="fas fa-copy"></i></button>
          </div>
          <div class="deposit-bank-row">
            <span class="dbr-label">Account No.</span>
            <span class="dbr-value">${cfg.bankAccountNumber || '\u2014'}</span>
            <button class="deposit-bank-copy" onclick="copyToClipboard('${(cfg.bankAccountNumber || '').replace(/'/g, "\\'")}')"><i class="fas fa-copy"></i></button>
          </div>
          <div class="deposit-bank-row">
            <span class="dbr-label">IFSC Code</span>
            <span class="dbr-value">${cfg.bankIfsc || '\u2014'}</span>
            <button class="deposit-bank-copy" onclick="copyToClipboard('${(cfg.bankIfsc || '').replace(/'/g, "\\'")}')"><i class="fas fa-copy"></i></button>
          </div>
        `;
      }
    }
  }

  window.switchDepositMethod = (method, btn) => {
    document.querySelectorAll('.deposit-method-tab').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const upiSection = document.getElementById('depositUpiSection');
    const qrSection = document.getElementById('depositQrSection');
    const bankSection = document.getElementById('depositBankSection');
    if (upiSection) upiSection.classList.toggle('hidden', method !== 'upi');
    if (qrSection) qrSection.classList.toggle('hidden', method !== 'qr');
    if (bankSection) bankSection.classList.toggle('hidden', method !== 'bank');
  };

  async function loadRuntimeConfig(force = false) {
    if (runtimeConfigLoaded && !force) {
      applyRuntimeConfigToUI();
      return { platform: runtimePlatformConfig, upi: runtimeUpiConfig };
    }

    try {
      const [platformSnap, upiSnap, depositSnap, linksSnap, withdrawSnap] = await Promise.all([
        getDoc(doc(db, "config", "platform")),
        getDoc(doc(db, "config", "upi")),
        getDoc(doc(db, "config", "deposit")),
        getDoc(doc(db, "config", "links")),
        getDoc(doc(db, "config", "withdraw"))
      ]);

      runtimePlatformConfig = {
        ...DEFAULT_PLATFORM_CONFIG,
        ...(platformSnap.exists() ? platformSnap.data() : {})
      };

      runtimeUpiConfig = {
        upiId: "sliceinvest@ybl",
        displayName: "SliceInvest Official",
        ...(upiSnap.exists() ? upiSnap.data() : {})
      };

      if (depositSnap.exists()) {
        runtimeDepositConfig = { ...runtimeDepositConfig, ...depositSnap.data() };
      }
      if (linksSnap.exists()) {
        runtimeLinksConfig = { ...runtimeLinksConfig, ...linksSnap.data() };
      }
      if (withdrawSnap.exists()) {
        runtimeWithdrawConfig = { ...runtimeWithdrawConfig, ...withdrawSnap.data() };
      }
    } catch (err) {
      console.warn("Runtime config load failed:", err);
      runtimePlatformConfig = { ...DEFAULT_PLATFORM_CONFIG };
      runtimeUpiConfig = { upiId: "sliceinvest@ybl", displayName: "SliceInvest Official" };
    }

    runtimeConfigLoaded = true;
    applyRuntimeConfigToUI();
    return { platform: runtimePlatformConfig, upi: runtimeUpiConfig };
  }

  async function ensureRuntimeConfigLoaded() {
    return loadRuntimeConfig(false);
  }

  // ─── PAGE MANAGEMENT ──────────────────────────────────────────
  function showPage(pageId) {
    ["loginPage", "userDashboard"].forEach(id => {
      document.getElementById(id)?.classList.add("hidden");
    });
    document.getElementById(pageId)?.classList.remove("hidden");
  }

  // Show demo mode toast
  if (backendMode === "local") {
    const demoInterval = setInterval(() => {
      const loginPage = document.getElementById("loginPage");
      if (loginPage && !loginPage.classList.contains("hidden")) {
        showToast("Demo mode • User: +919876543210 / 123456", "warning");
        clearInterval(demoInterval);
      }
    }, 500);
    setTimeout(() => clearInterval(demoInterval), 10000);
  }

  // ─── USER SIGNUP ──────────────────────────────────────────────
  window.userSignup = async () => {
    const name       = document.getElementById("signupName").value.trim();
    const phone      = document.getElementById("signupPhone").value.trim();
    const pass       = document.getElementById("signupPassword").value.trim();
    const confirmPass = document.getElementById("signupConfirmPassword").value.trim();
    const referral   = document.getElementById("signupReferral")?.value.trim() || "";

    if (!name)                          return showToast("Please enter your full name.", "error");
    if (name.length < 2)                return showToast("Name must be at least 2 characters.", "error");
    if (!phone)                         return showToast("Please enter your phone number.", "error");
    if (!/^\+?[0-9]{10,13}$/.test(phone.replace(/\s/g, ""))) return showToast("Please enter a valid phone number.", "error");
    if (!pass)                          return showToast("Please enter a password.", "error");
    if (pass.length < 6)                return showToast("Password must be at least 6 characters.", "error");
    if (pass !== confirmPass)           return showToast("Passwords do not match.", "error");

    const cleanPhone = phone.replace(/\s/g, "");

    showToast("Creating your account…", "info");
    try {
      await ensureRuntimeConfigLoaded();
      const usersRef = collection(db, "users");
      const q        = query(usersRef, where("phone", "==", cleanPhone));
      const snap     = await getDocs(q);
      if (!snap.empty) return showToast("Account already exists. Please login.", "error");

      const refCode = generateReferralCode(name);

      const newUserRef = await addDoc(collection(db, "users"), {
        name, phone: cleanPhone, password: pass,
        balance: 0, totalInvested: 0, totalReturns: 0, activePlans: 0,
        withdrawPassword: null, disabled: false,
        referralCode: refCode, referredBy: referral || null,
        dailyRewardStreak: 0, lastRewardDate: null, rewardHistory: [],
        darkMode: false, notificationsEnabled: true,
        createdAt: serverTimestamp()
      });

      // Handle referral bonus
      const referralBonus = Number(runtimePlatformConfig.referralBonus || DEFAULT_PLATFORM_CONFIG.referralBonus);
      if (referral) {
        const refQ = query(usersRef, where("referralCode", "==", referral));
        const refSnap = await getDocs(refQ);
        if (!refSnap.empty) {
          const referrerDoc = refSnap.docs[0];
          const referrerData = referrerDoc.data();
          await updateDoc(doc(db, "users", referrerDoc.id), {
            balance: (referrerData.balance || 0) + referralBonus
          });
          await addDoc(collection(db, "notifications"), {
            userId: referrerDoc.id,
            message: `🎉 ${name} joined using your referral! ${fmt(referralBonus)} credited to your wallet.`,
            type: "success", read: false, createdAt: serverTimestamp()
          });
          await updateDoc(doc(db, "users", newUserRef.id), { balance: referralBonus });
        }
      }

      await addDoc(collection(db, "notifications"), {
        userId: newUserRef.id,
        message: "Welcome to SliceInvest! 🎉 Start by making a deposit to begin investing.",
        type: "success", read: false, createdAt: serverTimestamp()
      });

      ["signupName", "signupPhone", "signupPassword", "signupConfirmPassword", "signupReferral"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
      });

      showToast("Account created! 🎉 Logging you in…", "success");

      currentUser = newUserRef.id;
      currentUserData = {
        id: newUserRef.id, name, phone: cleanPhone,
        balance: referral ? Number(runtimePlatformConfig.referralBonus || DEFAULT_PLATFORM_CONFIG.referralBonus) : 0, totalInvested: 0, totalReturns: 0, activePlans: 0,
        withdrawPassword: null, referralCode: refCode,
        dailyRewardStreak: 0, lastRewardDate: null, rewardHistory: []
      };

      setTimeout(() => { showPage("userDashboard"); initUserDashboard(); }, 800);
    } catch (err) {
      console.error("Signup error:", err);
      showToast("Registration failed: " + err.message, "error");
    }
  };

  // ─── USER LOGIN ───────────────────────────────────────────────
  window.userLogin = async () => {
    const phone = document.getElementById("userPhone").value.trim();
    const pass  = document.getElementById("userPassword").value.trim();
    if (!phone || !pass) return showToast("Please fill all fields.", "error");

    showToast("Logging in…", "info");
    try {
      const usersRef = collection(db, "users");
      const q        = query(usersRef, where("phone", "==", phone));
      const snap     = await getDocs(q);
      if (snap.empty) return showToast("No account found.", "error");

      const userDoc  = snap.docs[0];
      const userData = userDoc.data();

      if (userData.password !== pass) return showToast("Incorrect password.", "error");
      if (userData.disabled) return showToast("Account disabled.", "error");

      currentUser     = userDoc.id;
      currentUserData = { id: userDoc.id, ...userData };

      // Apply saved preferences
      if (userData.darkMode) {
        document.body.classList.add("dark-mode");
        const toggle = document.getElementById("darkModeToggle");
        if (toggle) toggle.checked = true;
      }

      showToast("Welcome back, " + userData.name + "! 👋", "success");
      showPage("userDashboard");
      initUserDashboard();
    } catch(err) {
      console.error(err);
      showToast("Login failed: " + err.message, "error");
    }
  };

  // ─── LOGOUT ───────────────────────────────────────────────────
  window.logout = () => {
    currentUser     = null;
    currentUserData = null;
    bankAccounts    = [];
    allTransactions = [];
    uploadedScreenshot = null;
    ["userPhone","userPassword","signupName","signupPhone","signupPassword","signupConfirmPassword","signupReferral"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    document.querySelectorAll(".bottom-nav .nav-item").forEach(b => b.classList.remove("active"));
    const homeBtn = document.querySelector('.bottom-nav .nav-item[data-page="home"]');
    if (homeBtn) homeBtn.classList.add("active");
    document.body.classList.remove("dark-mode");
    showPage("loginPage");
    showToast("Logged out successfully.", "info");
  };

  // ═══════════════════════════════════════════════════════════════
  //  USER DASHBOARD
  // ═══════════════════════════════════════════════════════════════

  function initUserDashboard() {
    loadRuntimeConfig();
    renderPlans();
    loadUserData();
    loadMyInvestments();
    loadTransactions();
    loadNotifications();
    loadBankAccounts();
    loadDailyRewardStatus();
    renderDailyCalendar();
    switchUserTab("home", document.querySelector('.nav-item[data-page="home"]'));
  }

  async function loadUserData() {
    try {
      const snap = await getDoc(doc(db, "users", currentUser));
      if (!snap.exists()) return;
      currentUserData = { id: snap.id, ...snap.data() };

      const name = currentUserData.name || "Investor";
      document.getElementById("userNameDisplay").textContent = name;
      document.getElementById("walletBalance").textContent   = fmt(currentUserData.balance || 0);
      document.getElementById("walletBalance2").textContent  = fmt(currentUserData.balance || 0);
      document.getElementById("totalInvested").textContent   = fmt(currentUserData.totalInvested || 0);
      document.getElementById("totalReturns").textContent    = fmt(currentUserData.totalReturns || 0);
      document.getElementById("activePlans").textContent     = currentUserData.activePlans || 0;

      // Referral code
      const refCodeEl = document.getElementById("referralCode");
      if (refCodeEl) {
        refCodeEl.textContent = currentUserData.referralCode || generateReferralCode(name);
        if (!currentUserData.referralCode) {
          await updateDoc(doc(db, "users", currentUser), { referralCode: refCodeEl.textContent });
        }
      }

      // Settings page
      document.getElementById("settingsUserName").textContent  = name;
      document.getElementById("settingsUserPhone").textContent = currentUserData.phone || "";

      // Profile completion
      let completion = 20;
      if (currentUserData.name) completion += 20;
      if (currentUserData.email) completion += 15;
      if (currentUserData.withdrawPassword) completion += 20;
      if (bankAccounts.length > 0) completion += 15;
      if (currentUserData.totalInvested > 0) completion += 10;
      completion = Math.min(100, completion);
      const pcFill = document.getElementById("pcFill");
      const pcText = document.querySelector(".pc-text");
      if (pcFill) pcFill.style.width = completion + "%";
      if (pcText) pcText.textContent = completion + "% Complete";

      // Avatar initials
      const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2);
      ["headerAvatar", "settingsAvatar"].forEach(elId => {
        const el = document.getElementById(elId);
        if (el) el.textContent = initials;
      });

      // Render portfolio
      renderPortfolioChart();
    } catch(err) { console.error("loadUserData:", err); }
  }

  // ─── Render Plans ─────────────────────────────────────────────
  function renderPlans() {
    const grid = document.getElementById("plansGrid");
    if (!grid) return;
    grid.innerHTML = PLANS.map(p => `
      <div class="plan-card ${p.badge}">
        <span class="plan-badge ${p.badgeClass}">${p.badge}</span>
        <div class="plan-icon"><i class="${p.icon}"></i></div>
        <div class="plan-name">${p.name}</div>
        <div class="plan-amount">${fmt(p.amount).replace(".00","")}</div>
        <div class="plan-features">
          ${p.features.map(f => `<div class="plan-feature"><i class="fas fa-check-circle"></i>${f}</div>`).join("")}
        </div>
        <button class="plan-invest-btn" onclick="openInvestModal('${p.id}')">
          <i class="fas fa-seedling"></i> Invest Now
        </button>
      </div>
    `).join("");
  }

  // ─── Invest ───────────────────────────────────────────────────
  window.openInvestModal = (planId) => {
    selectedPlan = PLANS.find(p => p.id === planId);
    if (!selectedPlan) return;
    document.getElementById("selectedPlanPreview").innerHTML = `
      <div class="spp-name">${selectedPlan.name}</div>
      <div class="spp-amount">${fmt(selectedPlan.amount)}</div>
      <div class="spp-detail"><i class="fas fa-coins"></i> ₹${selectedPlan.dailyReturnFixed} Daily Returns</div>
      <div class="spp-detail"><i class="fas fa-arrow-right-arrow-left"></i> Daily Withdraw Available</div>
      <div class="spp-detail"><i class="fas fa-lock-open"></i> No Lock Period</div>
      <div class="spp-detail"><i class="fas fa-infinity"></i> Lifetime Earnings</div>
    `;
    openModal("investModal");
  };

  window.confirmInvest = async () => {
    if (!selectedPlan) return;

    // ═══ FIX: Prevent double-click / duplicate purchase ═══
    if (isInvestProcessing) {
      return showToast("Processing your investment, please wait...", "warning");
    }
    isInvestProcessing = true;

    try {
      // Re-read latest balance from DB to avoid stale data
      const freshSnap = await getDoc(doc(db, "users", currentUser));
      if (!freshSnap.exists()) {
        isInvestProcessing = false;
        return showToast("User not found. Please re-login.", "error");
      }
      const freshData = freshSnap.data();
      const balance = freshData.balance || 0;

      if (balance < selectedPlan.amount) {
        isInvestProcessing = false;
        return showToast("Insufficient balance. Deposit first.", "error");
      }

      const newBalance    = balance - selectedPlan.amount;
      const totalInvested = (freshData.totalInvested || 0) + selectedPlan.amount;
      const activePlans   = (freshData.activePlans   || 0) + 1;

      await updateDoc(doc(db, "users", currentUser), { balance: newBalance, totalInvested, activePlans });

      await addDoc(collection(db, "investments"), {
        userId: currentUser, planId: selectedPlan.id, planName: selectedPlan.name,
        amount: selectedPlan.amount, dailyReturnFixed: selectedPlan.dailyReturnFixed,
        duration: 0, startDate: serverTimestamp(),
        endDate: null, status: "active", createdAt: serverTimestamp()
      });

      await addDoc(collection(db, "transactions"), {
        userId: currentUser, type: "invest", amount: selectedPlan.amount,
        plan: selectedPlan.name, status: "approved", createdAt: serverTimestamp()
      });

      currentUserData.balance       = newBalance;
      currentUserData.totalInvested = totalInvested;
      currentUserData.activePlans   = activePlans;

      closeModal("investModal");
      loadUserData();
      loadMyInvestments();
      loadTransactions();
      showToast(`Invested ${fmt(selectedPlan.amount)} in ${selectedPlan.name}! 🎉`, "success");
    } catch(err) {
      console.error(err);
      showToast("Investment failed: " + err.message, "error");
    } finally {
      isInvestProcessing = false;
    }
  };

  // ─── Deposit (Updated with UPI + Screenshot) ─────────────────
  window.setDepositAmount = (val) => { document.getElementById("depositAmount").value = val; };

  window.submitDeposit = async () => {
    await ensureRuntimeConfigLoaded();
    const amount = parseFloat(document.getElementById("depositAmount").value);
    const utr    = document.getElementById("depositUTR").value.trim();
    const minDeposit = Number(runtimePlatformConfig.minDeposit || DEFAULT_PLATFORM_CONFIG.minDeposit);

    if (!amount || amount < minDeposit) return showToast(`Minimum deposit is ${fmt(minDeposit)}.`, "error");
    if (!uploadedScreenshot) return showToast("Please upload payment screenshot.", "error");
    if (!utr) return showToast("Please enter UTR / Transaction ID.", "error");
    if (utr.length < 6) return showToast("Please enter a valid UTR number.", "error");

    try {
      // Convert screenshot to base64 for storage
      const screenshotData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(uploadedScreenshot);
      });

      await addDoc(collection(db, "requests"), {
        userId: currentUser, userName: currentUserData.name, userPhone: currentUserData.phone,
        type: "deposit", amount, method: "upi",
        reference: utr,
        screenshot: screenshotData, // ✅ FIXED: Store full base64 image data
        screenshotName: uploadedScreenshot.name,
        hasScreenshot: true,
        status: "pending", createdAt: serverTimestamp()
      });
      await addDoc(collection(db, "transactions"), {
        userId: currentUser, type: "deposit", amount, method: "upi",
        reference: utr, hasScreenshot: true,
        status: "pending", createdAt: serverTimestamp()
      });

      closeModal("depositModal");
      // Reset deposit form
      document.getElementById("depositAmount").value = "";
      document.getElementById("depositUTR").value = "";
      uploadedScreenshot = null;
      const placeholder = document.getElementById("screenshotPlaceholder");
      const preview = document.getElementById("screenshotPreview");
      const previewImg = document.getElementById("screenshotPreviewImg");
      const input = document.getElementById("screenshotInput");
      if (placeholder) placeholder.classList.remove("hidden");
      if (preview) preview.classList.add("hidden");
      if (previewImg) previewImg.src = "";
      if (input) input.value = "";

      loadTransactions();
      showToast("Deposit request submitted! 📤 Will be verified shortly.", "success");
    } catch(err) {
      console.error(err);
      showToast("Failed: " + err.message, "error");
    }
  };

  // ─── Withdraw ─────────────────────────────────────────────────
  window.setWithdrawAmount = (val) => { document.getElementById("withdrawAmount").value = val; };

  window.submitWithdrawal = async () => {
    await ensureRuntimeConfigLoaded();

    // Check if withdrawals are disabled by admin
    if (!runtimeWithdrawConfig.apiWithdrawEnabled) {
      return showToast("Withdrawals are currently disabled by admin. Please try again later.", "error");
    }

    const amount  = parseFloat(document.getElementById("withdrawAmount").value);
    const bankSel = document.getElementById("withdrawBankSelect").value;
    const newAcc  = document.getElementById("withdrawAccount")?.value.trim() || "";
    const wPass   = document.getElementById("withdrawPassword").value.trim();
    const minWithdraw = Number(runtimePlatformConfig.minWithdraw || DEFAULT_PLATFORM_CONFIG.minWithdraw);

    if (!amount || amount < minWithdraw) return showToast(`Minimum withdrawal is ${fmt(minWithdraw)}.`, "error");
    if (!wPass) return showToast("Withdraw password required.", "error");

    const storedWP = currentUserData?.withdrawPassword;
    if (!storedWP) return showToast("Set a withdraw password first in Settings.", "warning");
    if (storedWP !== wPass) return showToast("Incorrect withdraw password.", "error");

    // ═══ FIX: Prevent double-click ═══
    if (isWithdrawProcessing) {
      return showToast("Processing your withdrawal, please wait...", "warning");
    }
    isWithdrawProcessing = true;

    try {
      // ═══ FIX: Re-read fresh balance from DB to avoid stale data ═══
      const freshSnap = await getDoc(doc(db, "users", currentUser));
      if (!freshSnap.exists()) {
        isWithdrawProcessing = false;
        return showToast("User not found. Please re-login.", "error");
      }
      const freshData = freshSnap.data();
      const balance = freshData.balance || 0;
      if (balance < amount) {
        isWithdrawProcessing = false;
        return showToast("Insufficient balance.", "error");
      }

      let account = "";
      let bankDetails = null;
      if (bankSel && bankSel !== "new" && bankSel !== "") {
        const bank = bankAccounts.find(b => b.id === bankSel);
        if (bank) {
          if (bank.type === "upi") {
            account = `UPI: ${bank.upiId}`;
            bankDetails = { type: "upi", upiId: bank.upiId, displayName: bank.displayName || "" };
          } else {
            account = `${bank.bankName} | ${bank.accountNumber} | ${bank.ifsc || ""} | ${bank.holderName}`;
            bankDetails = {
              type: "bank",
              bankName: bank.bankName || "",
              accountNumber: bank.accountNumber || "",
              ifsc: bank.ifsc || "",
              holderName: bank.holderName || ""
            };
          }
        }
      } else if (bankSel === "new") {
        account = newAcc;
      }

      if (!account) {
        isWithdrawProcessing = false;
        return showToast("Please select or enter account details.", "error");
      }

      // ═══ FIX: Deduct balance IMMEDIATELY when user requests withdrawal ═══
      const newBalance = balance - amount;
      await updateDoc(doc(db, "users", currentUser), { balance: newBalance });
      currentUserData.balance = newBalance;

      const withdrawRequest = {
        userId: currentUser, userName: currentUserData.name, userPhone: currentUserData.phone,
        type: "withdraw", amount, account, status: "pending",
        balanceDeducted: true, // Flag: balance already deducted
        createdAt: serverTimestamp()
      };
      // Store structured bank details for admin visibility
      if (bankDetails) {
        withdrawRequest.bankDetails = bankDetails;
      }
      await addDoc(collection(db, "requests"), withdrawRequest);
      await addDoc(collection(db, "transactions"), {
        userId: currentUser, type: "withdraw", amount, account,
        status: "pending", createdAt: serverTimestamp()
      });

      closeModal("withdrawModal");
      document.getElementById("withdrawAmount").value   = "";
      if (document.getElementById("withdrawAccount")) document.getElementById("withdrawAccount").value  = "";
      document.getElementById("withdrawPassword").value = "";
      loadUserData();
      loadTransactions();
      showToast("Withdrawal request submitted! Amount held from balance. 📨", "success");
    } catch(err) {
      console.error(err);
      showToast("Failed: " + err.message, "error");
    } finally {
      isWithdrawProcessing = false;
    }
  };

  // ─── Withdraw Password ────────────────────────────────────────
  window.setWithdrawPassword = async () => {
    const curr    = document.getElementById("currentWithdrawPass").value.trim();
    const newPass = document.getElementById("newWithdrawPass").value.trim();
    const confirmVal = document.getElementById("confirmWithdrawPass").value.trim();

    if (!newPass)               return showToast("New password cannot be empty.", "error");
    if (newPass !== confirmVal) return showToast("Passwords do not match.", "error");
    if (newPass.length < 4)     return showToast("Minimum 4 characters.", "error");

    if (currentUserData?.withdrawPassword && curr !== currentUserData.withdrawPassword) {
      return showToast("Current password is incorrect.", "error");
    }

    try {
      await updateDoc(doc(db, "users", currentUser), { withdrawPassword: newPass });
      currentUserData.withdrawPassword = newPass;
      ["currentWithdrawPass","newWithdrawPass","confirmWithdrawPass"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
      });
      closeModal("withdrawPassModal");
      showToast("Withdraw password saved! 🔐", "success");
      loadUserData();
    } catch(err) {
      showToast("Failed: " + err.message, "error");
    }
  };

  // ─── Change Login Password ────────────────────────────────────
  window.changeLoginPassword = async () => {
    const curr    = document.getElementById("currLoginPass").value.trim();
    const newPass = document.getElementById("newLoginPass").value.trim();
    const confirm = document.getElementById("confirmLoginPass").value.trim();

    if (!curr) return showToast("Enter current password.", "error");
    if (curr !== currentUserData?.password) return showToast("Current password incorrect.", "error");
    if (!newPass || newPass.length < 6) return showToast("New password min 6 chars.", "error");
    if (newPass !== confirm) return showToast("Passwords don't match.", "error");

    try {
      await updateDoc(doc(db, "users", currentUser), { password: newPass });
      currentUserData.password = newPass;
      ["currLoginPass","newLoginPass","confirmLoginPass"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
      });
      closeModal("changePasswordModal");
      showToast("Password updated! ✅", "success");
    } catch(err) {
      showToast("Failed: " + err.message, "error");
    }
  };

  // ─── Edit Profile ─────────────────────────────────────────────
  window.saveProfile = async () => {
    const name  = document.getElementById("editName").value.trim();
    const email = document.getElementById("editEmail").value.trim();

    if (!name || name.length < 2) return showToast("Name too short.", "error");

    try {
      await updateDoc(doc(db, "users", currentUser), { name, email });
      currentUserData.name = name;
      currentUserData.email = email;
      closeModal("editProfileModal");
      loadUserData();
      showToast("Profile updated! ✅", "success");
    } catch(err) {
      showToast("Failed: " + err.message, "error");
    }
  };

  // ─── BANK ACCOUNTS ───────────────────────────────────────────
  async function loadBankAccounts() {
    try {
      const q    = query(collection(db, "bankAccounts"), where("userId","==",currentUser));
      const snap = await getDocs(q);
      bankAccounts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderBankAccounts();
      updateBankSelect();
      const countEl = document.getElementById("bankAccountCount");
      if (countEl) countEl.textContent = bankAccounts.length;
    } catch(err) { console.error("loadBankAccounts:", err); bankAccounts = []; }
  }

  function renderBankAccounts() {
    const container = document.getElementById("bankAccountsList");
    if (!container) return;
    if (!bankAccounts.length) {
      container.innerHTML = `<div class="empty-state"><i class="fas fa-credit-card"></i><p>No saved accounts</p></div>`;
      return;
    }
    container.innerHTML = bankAccounts.map(b => {
      const isUPI = b.type === "upi";
      const icon  = isUPI ? "fa-mobile-screen" : "fa-building-columns";
      const title = isUPI ? b.upiId : `${b.bankName || "Bank"} ****${(b.accountNumber || "").slice(-4)}`;
      const sub   = isUPI ? (b.displayName || "UPI") : (b.holderName || "—");
      return `
        <div class="bank-account-item">
          <div class="ba-icon"><i class="fas ${icon}"></i></div>
          <div class="ba-info">
            <div class="ba-name">${title}</div>
            <div class="ba-detail">${sub}</div>
          </div>
          <button class="ba-delete" onclick="deleteBankAccount('${b.id}')"><i class="fas fa-trash"></i></button>
        </div>
      `;
    }).join("");
  }

  function updateBankSelect() {
    const sel = document.getElementById("withdrawBankSelect");
    if (!sel) return;
    sel.innerHTML = '<option value="">— Select saved account —</option>';
    bankAccounts.forEach(b => {
      const isUPI = b.type === "upi";
      const label = isUPI ? `UPI: ${b.upiId}` : `${b.bankName} ****${(b.accountNumber || "").slice(-4)}`;
      sel.innerHTML += `<option value="${b.id}">${label}</option>`;
    });
    sel.innerHTML += '<option value="new">+ Enter new account</option>';
  }

  window.saveBankAccount = async () => {
    const activeBankTab = document.querySelector(".bt-tab.active");
    const isUPI = activeBankTab?.textContent?.includes("UPI");

    try {
      if (isUPI) {
        const upiId = document.getElementById("upiId").value.trim();
        const name  = document.getElementById("upiDisplayName").value.trim();
        if (!upiId) return showToast("Enter UPI ID.", "error");

        await addDoc(collection(db, "bankAccounts"), {
          userId: currentUser, type: "upi", upiId, displayName: name,
          createdAt: serverTimestamp()
        });
      } else {
        const holder  = document.getElementById("bankHolderName").value.trim();
        const bank    = document.getElementById("bankName").value.trim();
        const accNum  = document.getElementById("bankAccountNumber").value.trim();
        const accConf = document.getElementById("bankAccountConfirm").value.trim();
        const ifsc    = document.getElementById("bankIFSC").value.trim();

        if (!holder || !bank || !accNum || !ifsc) return showToast("Fill all bank fields.", "error");
        if (accNum !== accConf) return showToast("Account numbers don't match.", "error");

        await addDoc(collection(db, "bankAccounts"), {
          userId: currentUser, type: "bank",
          holderName: holder, bankName: bank, accountNumber: accNum, ifsc,
          createdAt: serverTimestamp()
        });
      }

      closeModal("addBankModal");
      ["bankHolderName","bankName","bankAccountNumber","bankAccountConfirm","bankIFSC","upiId","upiDisplayName"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
      });
      await loadBankAccounts();
      loadUserData();
      showToast("Bank account saved! 🏦", "success");
    } catch(err) {
      showToast("Failed: " + err.message, "error");
    }
  };

  window.deleteBankAccount = async (accountId) => {
    if (!confirm("Delete this bank account?")) return;
    try {
      await deleteDoc(doc(db, "bankAccounts", accountId));
      await loadBankAccounts();
      showToast("Account removed.", "info");
    } catch(err) {
      showToast("Failed: " + err.message, "error");
    }
  };

  // ─── Load My Investments ──────────────────────────────────────
  window.loadMyInvestments = async () => {
    const container = document.getElementById("investmentsList");
    if (!container) return;
    try {
      const q    = query(collection(db, "investments"), where("userId","==", currentUser));
      const snap = await getDocs(q);
      const docs = sortDocsByCreatedAt(snap.docs, 10);
      if (!docs.length) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-inbox"></i><p>No investments yet</p></div>`;
        return;
      }
      container.innerHTML = docs.map(d => {
        const inv = d.data();
        const plan = PLANS.find(p => p.id === inv.planId) || {};
        const dailyReturn = inv.dailyReturnFixed || (plan.dailyReturnFixed || 0);
        return `
          <div class="investment-item">
            <div class="inv-icon"><i class="${plan.icon || 'fas fa-chart-line'}"></i></div>
            <div class="inv-info">
              <div class="inv-name">${inv.planName}</div>
              <div class="inv-date">Started: ${fmtDate(inv.startDate)} • ₹${dailyReturn}/day</div>
              <span class="txn-status status-${inv.status}">${inv.status}</span>
            </div>
            <div class="inv-amount">${fmt(inv.amount)}</div>
          </div>
        `;
      }).join("");
    } catch(err) {
      console.error(err);
      container.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>${err.message}</p></div>`;
    }
  };

  // ─── Load Transactions ────────────────────────────────────────
  async function loadTransactions() {
    try {
      const q    = query(collection(db, "transactions"), where("userId","==",currentUser));
      const snap = await getDocs(q);
      allTransactions = sortDocsByCreatedAt(snap.docs, 50).map(d => ({ id: d.id, ...d.data() }));
      renderTransactions(allTransactions.slice(0, 10), "transactionsList");
      renderTransactions(allTransactions, "walletTransactionsList");
    } catch(err) { console.error(err); }
  }

  function renderTransactions(transactions, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!transactions.length) {
      container.innerHTML = `<div class="empty-state"><i class="fas fa-receipt"></i><p>No transactions yet</p></div>`;
      return;
    }
    container.innerHTML = transactions.map(t => {
      const isCredit = t.type === "deposit";
      const typeIcon = t.type === "deposit" ? "deposit" : t.type === "withdraw" ? "withdraw" : "invest";
      const iconClass= t.type === "deposit" ? "fa-arrow-down-to-line" : t.type === "withdraw" ? "fa-arrow-up-from-bracket" : "fa-seedling";
      const label    = t.type === "deposit" ? "Deposit" : t.type === "withdraw" ? "Withdrawal" : "Investment — " + (t.plan || "");
      return `
        <div class="txn-item">
          <div class="txn-icon ${typeIcon}"><i class="fas ${iconClass}"></i></div>
          <div class="txn-info">
            <div class="txn-type">${label}</div>
            <div class="txn-date">${fmtDateTime(t.createdAt)}</div>
            <span class="txn-status status-${t.status}">${t.status}</span>
          </div>
          <div>
            <div class="txn-amount ${isCredit ? 'credit':'debit'}">${isCredit?'+':'-'}${fmt(t.amount)}</div>
          </div>
        </div>
      `;
    }).join("");
  }

  window.filterTransactions = (type, btn) => {
    document.querySelectorAll(".txn-filter").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const filtered = type === "all" ? allTransactions : allTransactions.filter(t => t.type === type);
    renderTransactions(filtered, "walletTransactionsList");
  };

  // ─── Notifications ────────────────────────────────────────────
  async function loadNotifications() {
    try {
      const q    = query(collection(db, "notifications"), where("userId","==",currentUser));
      const snap = await getDocs(q);
      const docs = sortDocsByCreatedAt(snap.docs, 15);
      const badge = document.getElementById("notifBadge");
      if (!docs.length) {
        if (badge) badge.classList.add("hidden");
        document.getElementById("notificationsList").innerHTML = `<div class="empty-state"><i class="fas fa-bell-slash"></i><p>No notifications</p></div>`;
        return;
      }
      const unread = docs.filter(d => !d.data().read).length;
      if (badge) {
        if (unread > 0) { badge.textContent = unread; badge.classList.remove("hidden"); }
        else { badge.classList.add("hidden"); }
      }
      document.getElementById("notificationsList").innerHTML = docs.map(d => {
        const n = d.data();
        const color = n.type === "success" ? "dot-green" : n.type === "warning" ? "dot-orange" : "dot-blue";
        return `
          <div class="notif-item">
            <div class="notif-dot ${color}"></div>
            <div>
              <div class="notif-text">${n.message}</div>
              <div class="notif-time">${fmtDateTime(n.createdAt)}</div>
            </div>
          </div>
        `;
      }).join("");
    } catch(err) { console.error("Notifications:", err); }
  }

  window.showNotifications = () => {
    loadNotifications();
    openModal("notificationsModal");
  };

  // ─── Portfolio Chart ──────────────────────────────────────────
  async function renderPortfolioChart() {
    const canvas = document.getElementById("portfolioChart");
    const emptyEl = document.getElementById("portfolioEmpty");
    if (!canvas) return;

    try {
      const q    = query(collection(db, "investments"), where("userId","==",currentUser));
      const snap = await getDocs(q);

      if (snap.empty) {
        canvas.style.display = "none";
        if (emptyEl) emptyEl.classList.remove("hidden");
        return;
      }

      canvas.style.display = "block";
      if (emptyEl) emptyEl.classList.add("hidden");

      const planCounts = {};
      snap.docs.forEach(d => {
        const name = d.data().planName || "Unknown";
        planCounts[name] = (planCounts[name] || 0) + 1;
      });

      if (portfolioChart) portfolioChart.destroy();

      const colors = ["#00B894","#6C5CE7","#E17055","#00CEC9","#FD79A8","#FDCB6E","#74B9FF"];
      portfolioChart = new Chart(canvas.getContext("2d"), {
        type: "doughnut",
        data: {
          labels: Object.keys(planCounts),
          datasets: [{
            data: Object.values(planCounts),
            backgroundColor: colors.slice(0, Object.keys(planCounts).length),
            borderWidth: 0, hoverOffset: 8
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom", labels: { font: { family: "Poppins", size: 12, weight: "600" }, padding: 16 } }
          }
        }
      });
    } catch(err) { console.error("Portfolio chart:", err); }
  }

  // ─── Daily Reward (FIXED — Shows day count properly) ─────────
  function loadDailyRewardStatus() {
    let streak = currentUserData?.dailyRewardStreak || 0;
    // ═══ FIX: Show Day X of 7 format, cap display at MAX_REWARD_STREAK ═══
    if (streak > MAX_REWARD_STREAK) streak = MAX_REWARD_STREAK;
    const streakEl = document.getElementById("rewardStreak");
    if (streakEl) streakEl.textContent = `🔥 Day ${streak}/${MAX_REWARD_STREAK}`;

    const lastReward = currentUserData?.lastRewardDate;
    const today = new Date().toDateString();
    const banner = document.getElementById("dailyRewardBanner");
    const subtextEl = document.getElementById("dailyRewardSubtext");

    if (lastReward) {
      const lastDate = lastReward.toDate ? lastReward.toDate() : new Date(lastReward);
      if (lastDate.toDateString() === today) {
        // Already claimed today
        if (banner) banner.classList.add("claimed");
        if (subtextEl) subtextEl.textContent = "✅ Claimed today! Come back tomorrow.";
      } else {
        if (banner) banner.classList.remove("claimed");
        if (subtextEl) subtextEl.textContent = "Tap to claim your daily bonus!";
      }
    } else {
      if (banner) banner.classList.remove("claimed");
      if (subtextEl) subtextEl.textContent = "Tap to claim your first bonus!";
    }
  }

  window.claimDailyReward = async () => {
    await ensureRuntimeConfigLoaded();
    const lastReward = currentUserData?.lastRewardDate;
    const today = new Date().toDateString();

    if (lastReward) {
      const lastDate = lastReward.toDate ? lastReward.toDate() : new Date(lastReward);
      if (lastDate.toDateString() === today) {
        return showToast("Already claimed today! Come back tomorrow. 🕐", "warning");
      }

      // Check if streak is broken (more than 1 day gap)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastDate.toDateString() !== yesterday.toDateString()) {
        // Streak broken, reset
        currentUserData.dailyRewardStreak = 0;
      }
    }

    // ═══ FIX: Cap streak at MAX_REWARD_STREAK (7 days), then reset cycle ═══
    let currentStreak = currentUserData?.dailyRewardStreak || 0;
    if (currentStreak >= MAX_REWARD_STREAK) {
      // Completed 7-day cycle, reset to start new cycle
      currentStreak = 0;
    }
    const streak = currentStreak + 1;  // This will be 1-7 only

    const baseReward = Number(runtimePlatformConfig.baseReward || DEFAULT_PLATFORM_CONFIG.baseReward);
    const streakBonus = Number(runtimePlatformConfig.streakBonus || DEFAULT_PLATFORM_CONFIG.streakBonus);
    const maxReward = Number(runtimePlatformConfig.maxReward || DEFAULT_PLATFORM_CONFIG.maxReward);
    const bonus  = Math.min(baseReward + streak * streakBonus, maxReward);

    try {
      const newBalance = (currentUserData?.balance || 0) + bonus;

      // Store reward history
      const rewardHistory = currentUserData?.rewardHistory || [];
      rewardHistory.push(getTodayString());
      // Keep only last 30 days
      const recentHistory = rewardHistory.slice(-30);

      await updateDoc(doc(db, "users", currentUser), {
        balance: newBalance,
        dailyRewardStreak: streak,
        lastRewardDate: serverTimestamp(),
        rewardHistory: recentHistory
      });
      currentUserData.balance = newBalance;
      currentUserData.dailyRewardStreak = streak;
      currentUserData.rewardHistory = recentHistory;

      await addDoc(collection(db, "notifications"), {
        userId: currentUser,
        message: `🎁 Daily reward claimed! ₹${bonus} added. Day ${streak} of ${MAX_REWARD_STREAK}!`,
        type: "success", read: false, createdAt: serverTimestamp()
      });

      loadUserData();
      loadDailyRewardStatus();
      renderDailyCalendar();
      showToast(`🎁 ₹${bonus} bonus claimed! Day ${streak} of ${MAX_REWARD_STREAK}!`, "success");
    } catch(err) {
      showToast("Failed: " + err.message, "error");
    }
  };

  // ─── Daily Calendar (Shows Day 1-7 cycle) ─────────────────────
  // ═══ FIX: Show 7-day cycle (Day 1 to Day 7) instead of calendar dates ═══
  function renderDailyCalendar() {
    const container = document.getElementById("dailyCalendar");
    if (!container) return;

    const streak = currentUserData?.dailyRewardStreak || 0;
    const lastReward = currentUserData?.lastRewardDate;
    const today = new Date().toDateString();

    // Determine if today was already claimed
    let claimedToday = false;
    if (lastReward) {
      const lastDate = lastReward.toDate ? lastReward.toDate() : new Date(lastReward);
      claimedToday = lastDate.toDateString() === today;
    }

    // Current streak tells us how many days of the cycle are completed
    let completedDays = streak;
    if (completedDays > MAX_REWARD_STREAK) completedDays = 0; // Reset display for new cycle

    let html = "";
    for (let day = 1; day <= MAX_REWARD_STREAK; day++) {
      let classes = "daily-day";
      let icon = "";

      if (day < completedDays || (day === completedDays && claimedToday)) {
        // This day is completed (claimed)
        classes += " checked";
        icon = "✅";
      } else if (day === completedDays + 1 && !claimedToday && completedDays > 0) {
        // Next day to claim (today, not yet claimed) - continuing streak
        classes += " today";
        icon = "🎁";
      } else if (day === 1 && completedDays === 0 && !claimedToday) {
        // Fresh start or new cycle - Day 1 is available
        classes += " today";
        icon = "🎁";
      } else if (day === 1 && completedDays === 0 && claimedToday) {
        // Just started a new cycle and already claimed Day 1
        // Actually this case: streak was reset to 0 then +1, so completedDays=0 won't match
        // This is handled by the first condition above
        classes += " checked";
        icon = "✅";
      } else {
        // Future day, not yet reachable
        classes += " missed";
        icon = "⬜";
      }

      const baseReward = Number(runtimePlatformConfig.baseReward || DEFAULT_PLATFORM_CONFIG.baseReward);
      const streakBonusVal = Number(runtimePlatformConfig.streakBonus || DEFAULT_PLATFORM_CONFIG.streakBonus);
      const maxRewardVal = Number(runtimePlatformConfig.maxReward || DEFAULT_PLATFORM_CONFIG.maxReward);
      const dayReward = Math.min(baseReward + day * streakBonusVal, maxRewardVal);

      html += `
        <div class="${classes}">
          <span class="day-num">Day ${day}</span>
          <span class="day-icon">${icon}</span>
          <span class="day-num">₹${dayReward}</span>
        </div>
      `;
    }

    container.innerHTML = html;
  }

  // ─── Calculator ───────────────────────────────────────────────
  window.calculateReturns = () => {
    const amount = parseFloat(document.getElementById("calcAmount")?.value) || 0;
    const rate   = parseFloat(document.getElementById("calcRate")?.value) || 0;
    const days   = parseInt(document.getElementById("calcDays")?.value) || 0;

    const daily = amount * rate / 100;
    const total = daily * days;
    const final_ = amount + total;

    document.getElementById("crDaily").textContent = fmt(daily);
    document.getElementById("crTotal").textContent = fmt(total);
    document.getElementById("crFinal").textContent = fmt(final_);
  };

  // ─── Copy Referral ────────────────────────────────────────────
  window.copyReferral = () => {
    const code = document.getElementById("referralCode")?.textContent;
    if (!code || code === "—") return showToast("No referral code yet.", "warning");
    navigator.clipboard.writeText(code).then(() => {
      showToast("Referral code copied! 📋", "success");
    }).catch(() => {
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast("Referral code copied! 📋", "success");
    });
  };

  // ─── Dark Mode ────────────────────────────────────────────────
  window.toggleDarkMode = async () => {
    const isDark = document.getElementById("darkModeToggle")?.checked;
    document.body.classList.toggle("dark-mode", isDark);
    try {
      await updateDoc(doc(db, "users", currentUser), { darkMode: isDark });
    } catch(err) { console.error(err); }
  };

  window.toggleNotifications = async () => {
    const enabled = document.getElementById("notifToggle")?.checked;
    try {
      await updateDoc(doc(db, "users", currentUser), { notificationsEnabled: enabled });
      showToast(enabled ? "Notifications enabled" : "Notifications disabled", "info");
    } catch(err) { console.error(err); }
  };

  // ─── Edit Profile Modal Prefill ───────────────────────────────
  const origOpenModal = window.openModal;
  window.openModal = (id) => {
    origOpenModal(id);
    if (id === "editProfileModal") {
      document.getElementById("editName").value  = currentUserData?.name || "";
      document.getElementById("editEmail").value = currentUserData?.email || "";
      document.getElementById("editPhone").value = currentUserData?.phone || "";
    }
    if (id === "withdrawModal") {
      updateBankSelect();
      document.getElementById("newAccountFields")?.classList.add("hidden");
    }
    if (id === "depositModal") {
      // Reset deposit form when opening
      uploadedScreenshot = null;
      const placeholder = document.getElementById("screenshotPlaceholder");
      const preview = document.getElementById("screenshotPreview");
      if (placeholder) placeholder.classList.remove("hidden");
      if (preview) preview.classList.add("hidden");
    }
  };

  // ─── User Tab Switching ───────────────────────────────────────
  window.switchUserTab = (tab, btn) => {
    document.querySelectorAll(".bottom-nav .nav-item").forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");

    // Hide all sections
    ["homeSection","investSection","walletSection","settingsSection"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add("hidden");
    });

    // Show selected section
    const sectionMap = {
      home: "homeSection",
      invest: "investSection",
      wallet: "walletSection",
      settings: "settingsSection"
    };

    const sectionId = sectionMap[tab];
    if (sectionId) {
      document.getElementById(sectionId)?.classList.remove("hidden");
    }

    // Refresh data based on tab
    if (tab === "home")     { loadUserData(); renderDailyCalendar(); }
    if (tab === "invest")   { loadMyInvestments(); }
    if (tab === "wallet")   { loadTransactions(); }
    if (tab === "settings") { loadBankAccounts(); loadUserData(); loadRuntimeConfig(true); }
  };

  // ─── App Ready ────────────────────────────────────────────────
  // Pull to Refresh Handler
  window._refreshDashboard = async () => {
    await loadRuntimeConfig(true);
    await loadUserData();
    await loadMyInvestments();
    await loadTransactions();
    await loadNotifications();
    await loadBankAccounts();
    loadDailyRewardStatus();
    renderDailyCalendar();
  };

  // ─── Scroll-based refresh for Home Section ──────────────────
  (function setupScrollRefresh() {
    const mainEl = document.getElementById('userMainContent');
    if (!mainEl) return;
    let lastScrollY = 0;
    let scrollRefreshCooldown = false;
    let isRefreshing = false;
    mainEl.addEventListener('scroll', () => {
      const homeSection = document.getElementById('homeSection');
      if (!homeSection || homeSection.classList.contains('hidden')) return;
      if (isRefreshing || scrollRefreshCooldown) return;
      const scrollY = mainEl.scrollTop;
      if (scrollY > 100 && lastScrollY <= 50) {
        scrollRefreshCooldown = true;
        isRefreshing = true;
        const sections = homeSection.querySelectorAll('.wallet-section, .portfolio-section, .referral-section, .transactions-section');
        sections.forEach(s => s.classList.add('section-refreshing'));
        (async () => {
          try {
            await loadRuntimeConfig(true);
            await loadUserData();
            await loadTransactions();
            loadDailyRewardStatus();
            renderDailyCalendar();
          } catch(e) { console.warn('Scroll refresh error:', e); }
          sections.forEach(s => {
            s.classList.remove('section-refreshing');
            s.classList.add('home-fade-in');
            setTimeout(() => s.classList.remove('home-fade-in'), 500);
          });
          isRefreshing = false;
          setTimeout(() => { scrollRefreshCooldown = false; }, 5000);
        })();
      }
      lastScrollY = scrollY;
    });
  })();

  // ─── Withdraw Modal — Check if disabled ─────────────────────
  const origOpenModal2 = window.openModal;
  window.openModal = (id) => {
    origOpenModal2(id);
    if (id === 'withdrawModal') {
      if (!runtimeWithdrawConfig.apiWithdrawEnabled) {
        const modalBody = document.querySelector('#withdrawModal .modal-body');
        const modalFooter = document.querySelector('#withdrawModal .modal-footer');
        if (modalBody) {
          modalBody.innerHTML = `
            <div class="withdraw-disabled-banner">
              <i class="fas fa-ban"></i>
              <h4>Withdrawals Temporarily Disabled</h4>
              <p>Withdrawals are currently disabled by the administrator. Please check back later or contact support.</p>
            </div>
          `;
        }
        if (modalFooter) {
          modalFooter.innerHTML = '<button class="btn-secondary full" onclick="closeModal(\'withdrawModal\')">Close</button>';
        }
      }
    }
  };

  // Telegram & Customer Care
  window.openTelegramLink = () => {
    const link = runtimeLinksConfig.telegramLink;
    if (link) window.open(link, '_blank');
    else showToast('Telegram link not available.', 'warning');
  };
  window.openCustomerCareLink = () => {
    const link = runtimeLinksConfig.customerCareLink;
    if (link) window.open(link, '_blank');
    else showToast('Customer care link not available.', 'warning');
  };

  window.copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied! 📋', 'success');
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
      showToast('Copied! 📋', 'success');
    });
  };

  console.log(`SliceInvest v2.2 initialized (${backendMode} mode)`);
})();
