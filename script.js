const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const features = [
  {
    id: 'health',
    title: 'Product Health Card',
    desc: 'Check product condition, health score and status.',
    emoji: '📱💚',
    tone: 'green',
    checks: [
      'Enter product details',
      'View health score',
      'See condition status',
      'Get recommendations'
    ]
  },
  {
    id: 'repair',
    title: 'Repair vs Replace',
    desc: 'Compare repair cost with replacement cost.',
    emoji: '🔧💻',
    tone: 'blue',
    checks: [
      'Compare both costs',
      'See savings estimate',
      'Get a clear recommendation'
    ]
  },
  {
    id: 'eco',
    title: 'Eco Impact Score',
    desc: 'View environmental impact and sustainability score.',
    emoji: '🌍🌱',
    tone: 'lime',
    checks: [
      'Estimate product life impact',
      'Review reuse opportunities',
      'Get greener suggestions'
    ]
  },
  {
    id: 'risk',
    title: 'Failure Risk Analysis',
    desc: 'See possible failure risks and maintenance advice.',
    emoji: '⚠️⚙️',
    tone: 'pink',
    checks: [
      'Review product age',
      'Estimate risk level',
      'Get maintenance advice'
    ]
  },
  {
    id: 'chat',
    title: 'Product Lifecycle Chatbot',
    desc: 'Ask questions about repair, maintenance and reuse.',
    emoji: '🤖💬',
    tone: 'purple',
    checks: [
      'Ask product questions',
      'Get maintenance tips',
      'Explore reuse and recycling'
    ]
  },
  {
    id: 'language',
    title: 'Language Selection',
    desc: 'Choose English, Tamil or Hindi for the interface.',
    emoji: '🔤🗣️',
    tone: 'teal',
    checks: [
      'English interface',
      'தமிழ் உதவி',
      'हिंदी सहायता'
    ]
  },
  {
    id: 'reports',
    title: 'Reports & History',
    desc: 'View previous assessments and reports.',
    emoji: '📊🕒',
    tone: 'yellow',
    checks: [
      'Review saved results',
      'Export a report',
      'Clear local history'
    ]
  },
  {
    id: 'qr',
    title: 'QR Product Passport',
    desc: 'Create a QR-style passport for product information.',
    emoji: '▦📲',
    tone: 'violet',
    checks: [
      'Enter product information',
      'Generate passport code',
      'Print or save details'
    ]
  },
  {
    id: 'upload',
    title: 'Product Image Upload',
    desc: 'Upload a product image and preview it for assessment.',
    emoji: '🖼️⬆️',
    tone: 'sky',
    checks: [
      'Choose an image',
      'Preview selected photo',
      'Add product notes'
    ]
  },
  {
    id: 'login',
    title: 'Login & Account',
    desc: 'Manage your session and access your PLDS workspace.',
    emoji: '👤🔐',
    tone: 'login',
    checks: [
      'Sign in to workspace',
      'Show or hide password',
      'Log out securely'
    ]
  },
  {
    id: 'about',
    title: 'About PLDS',
    desc: 'Learn about the purpose and capabilities of PLDS.',
    emoji: '🌱ℹ️',
    tone: 'teal',
    checks: [
      'Product lifecycle decision support',
      'Repair, reuse and recycling awareness',
      'Educational demo with local browser storage'
    ]
  }
];

let history = JSON.parse(
  localStorage.getItem('pldsHistory') || '[]'
);

let currentUser = '';
let toastTimer;

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');

  clearTimeout(toastTimer);

  toastTimer = setTimeout(
    () => t.classList.remove('show'),
    2600
  );
}

function saveHistory(item) {
  history.unshift({
    ...item,
    time: new Date().toLocaleString()
  });

  history = history.slice(0, 50);

  localStorage.setItem(
    'pldsHistory',
    JSON.stringify(history)
  );
}

function showApp() {
  $('#loginScreen').classList.add('hidden');
  $('#appShell').classList.remove('hidden');

  $('#userName').textContent =
    (currentUser.split('@')[0] || 'Guest').slice(0, 18);

  $('#headerLogin').classList.toggle(
    'hidden',
    !!currentUser
  );

  $('#profileBtn').classList.toggle(
    'hidden',
    !currentUser
  );

  $('#logoutBtn').classList.toggle(
    'hidden',
    !currentUser
  );

  $('#todayLabel').textContent =
    new Date().toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

  renderCards();
  showView('dashboard');
}

function showLogin() {
  $('#appShell').classList.add('hidden');
  $('#loginScreen').classList.remove('hidden');
}

function setTopActive(id) {
  $$('.top-feature-link').forEach(button => {
    button.classList.toggle(
      'active',
      (id === 'dashboard' || id === 'home')
        ? button.hasAttribute('data-home')
        : button.dataset.open === id
    );
  });
}

$('#headerLogin').addEventListener(
  'click',
  showLogin
);

$('#backHome').addEventListener(
  'click',
  showApp
);

$('#topFeatureNav').addEventListener('click', event => {
  const home = event.target.closest('[data-home]');

  if (home) {
    event.stopPropagation();
    showView('dashboard');
    return;
  }

  const button = event.target.closest('[data-open]');

  if (button) {
    event.stopPropagation();
    openFeature(button.dataset.open);
  }
});

$('#loginForm').addEventListener('submit', event => {
  event.preventDefault();

  const email = $('#loginEmail').value.trim();
  const password = $('#loginPassword').value;

  if (!email || password.length < 4) {
    $('#loginError').textContent =
      'Enter a valid email and a password with at least 4 characters.';
    return;
  }

  currentUser = email;

  localStorage.setItem('pldsUser', email);

  if ($('#remember').checked) {
    localStorage.setItem('pldsRemember', '1');
  }

  $('#loginError').textContent = '';

  showApp();

  toast(
    'Welcome to PLDS, ' + email.split('@')[0] + '!'
  );
});

$('#togglePassword').addEventListener('click', () => {
  const password = $('#loginPassword');

  password.type =
    password.type === 'password'
      ? 'text'
      : 'password';

  $('#togglePassword').textContent =
    password.type === 'password' ? '👁' : '🙈';
});

$('#forgotLink').addEventListener('click', event => {
  event.preventDefault();

  toast(
    'Demo mode: use an email and password with 4+ characters to sign in.'
  );
});

$('#logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('pldsUser');
  localStorage.removeItem('pldsRemember');

  currentUser = '';

  showLogin();

  toast('You have logged out. Sign in to continue.');
});

$('#profileBtn').addEventListener('click', () => {
  toast('Signed in as ' + currentUser);
});

$('#notifyBtn').addEventListener('click', () => {
  toast('You are all caught up!');
});

function renderCards() {
  $('#featureGrid').innerHTML =
    features
      .filter(feature => feature.id !== 'login')
      .map(feature => `
        <button
          class="feature-card tone-${feature.tone}"
          data-open="${feature.id}"
        >
          <div class="feature-illustration">
            ${feature.emoji}
          </div>
          <h3>${feature.title}</h3>
          <p>${feature.desc}</p>
          <span class="card-arrow">→</span>
        </button>
      `)
      .join('') +
    `
      <button
        class="feature-card tone-login"
        data-open="login"
      >
        <div class="feature-illustration">👤🔐</div>
        <h3>Login & Account</h3>
        <p>Manage your account and access your data securely.</p>
        <span class="card-arrow">→</span>
      </button>
    `;

  $('#featureDetail').innerHTML =
    detailMarkup(features[0]);
}

function detailMarkup(feature) {
  return `
    <div class="detail-hero tone-${feature.tone}">
      <div class="big-emoji">${feature.emoji}</div>
      <h2>${feature.title}</h2>
      <p>${feature.desc}</p>
    </div>

    <h3>What you can do:</h3>

    <ul class="check-list">
      ${feature.checks.map(item => `<li>${item}</li>`).join('')}
    </ul>
  `;
}

function showView(view) {
  $('#dashboardView').classList.toggle(
    'hidden',
    view !== 'dashboard'
  );

  $('#workspaceView').classList.toggle(
    'hidden',
    view === 'dashboard'
  );

  $$('.nav-item[data-view]').forEach(button => {
    button.classList.toggle(
      'active',
      button.dataset.view === view
    );
  });

  if (view === 'dashboard') {
    $('#pageTitle').textContent =
      'Home — Explore Our Features';

    $('#pageSubtitle').textContent =
      'Choose a feature from the top menu or a colourful card. Each feature opens on its own.';

    setTopActive('dashboard');
    return;
  }

  if (view === 'features') {
    showView('dashboard');
    return;
  }

  if (view === 'reports') {
    renderWorkspace('reports');
    return;
  }

  if (view === 'settings') {
    renderWorkspace('settings');
    return;
  }
}

$('#sideNav').addEventListener('click', event => {
  const button = event.target.closest('[data-view]');

  if (button) {
    showView(button.dataset.view);
  }
});

document.addEventListener('click', event => {
  const home = event.target.closest('[data-home]');

  if (home) {
    showView('dashboard');
    return;
  }

  const button = event.target.closest('[data-open]');

  if (button) {
    openFeature(button.dataset.open);
  }
});

function openFeature(id) {
  if (id === 'login') {
    showLogin();
    return;
  }

  if (id === 'reports') {
    showView('reports');
    setTopActive('reports');
    return;
  }

  if (id === 'settings') {
    showView('settings');
    setTopActive('settings');
    return;
  }

  const feature = features.find(item => item.id === id);

  if (!feature) return;

  $('#dashboardView').classList.add('hidden');
  $('#workspaceView').classList.remove('hidden');

  $$('.nav-item').forEach(button => {
    button.classList.remove('active');
  });

  setTopActive(id);

  $('#pageTitle').textContent = feature.title;
  $('#pageSubtitle').textContent = feature.desc;

  renderWorkspace(id);
}

function renderWorkspace(id) {
  const workspace = $('#workspaceView');

  $('#dashboardView').classList.add('hidden');
  workspace.classList.remove('hidden');

  setTopActive(id);

  let title = '';
  let html = '';

  if (id === 'reports') {
    title = 'Reports & History';

    html = `
      <h2>Assessment history</h2>
      <p>Assessments saved in this browser appear here.</p>

      ${
        history.length
          ? `
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Summary</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  ${history.map(item => `
                    <tr>
                      <td>${esc(item.feature)}</td>
                      <td>${esc(item.summary)}</td>
                      <td>${esc(item.time)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `
          : `
            <div class="empty-state">
              📂
              <h3>No saved assessments yet</h3>
              <p>Run a feature assessment to start building your history.</p>
            </div>
          `
      }

      <div class="form-actions">
        <button class="secondary" id="exportHistory">Export CSV</button>
        <button class="secondary" id="clearHistory">Clear history</button>
        <button class="secondary" data-open="health">New assessment</button>
      </div>
    `;
  } else if (id === 'settings') {
    title = 'Settings & Account';

    html = `
      <div class="workspace-grid">
        <div class="form-card">
          <h3>Account</h3>
          <p>Signed in as <b>${esc(currentUser || 'Guest')}</b></p>

          <label>Display name</label>
          <input
            id="displayName"
            value="${esc(currentUser.split('@')[0] || 'User')}"
          >

          <div class="form-actions">
            <button class="primary" id="saveProfile">Save profile</button>
            <button class="secondary" id="settingsLogout">Logout</button>
          </div>
        </div>

        <div class="form-card">
          <h3>Preferences</h3>
          <p>PLDS demo preferences are stored locally in this browser.</p>

          <label>Interface language</label>
          <select id="settingsLanguage">
            <option>English</option>
            <option>தமிழ் (Tamil)</option>
            <option>हिंदी (Hindi)</option>
          </select>

          <label>
            <input type="checkbox" id="notificationsPref" checked style="width:auto">
            Enable notifications
          </label>

          <div class="form-actions">
            <button class="primary" id="saveSettings">Save preferences</button>
          </div>
        </div>
      </div>
    `;
  } else if (id === 'about') {
    title = 'About PLDS';

    html = `
      <div class="about-hero tone-teal">
        <div class="feature-illustration">🌿♻️</div>
        <p class="eyebrow">SMARTER DECISIONS · LONGER LIFE</p>
        <h2>About Product Lifecycle Decision Support</h2>
        <p>
          PLDS is an educational demo designed to help people think
          through a product’s condition, repair options, environmental
          impact and responsible end-of-life choices.
        </p>
      </div>

      <div class="workspace-grid">
        <div class="form-card">
          <h3>🎯 Our goal</h3>
          <p>
            Encourage informed decisions that can extend useful
            product life, reduce avoidable waste and make maintenance
            and reuse easier to consider.
          </p>
        </div>

        <div class="form-card">
          <h3>✨ What PLDS includes</h3>
          <ul class="check-list">
            <li>Product health and failure-risk estimates</li>
            <li>Repair-versus-replace cost comparison</li>
            <li>Eco impact guidance and lifecycle chatbot</li>
            <li>Assessment history, image preview and product passport demo</li>
          </ul>
        </div>

        <div class="form-card">
          <h3>🛠️ About this demo</h3>
          <p>
            PLDS runs locally in your browser. Assessment scores are
            illustrative rule-based estimates, chatbot replies are
            built-in examples, and uploaded images are previewed rather
            than automatically diagnosed.
          </p>
        </div>

        <div class="form-card">
          <h3>🔐 Privacy note</h3>
          <p>
            Assessment history and preferences are stored in this
            browser’s local storage. This sample login is for
            demonstration only and is not secure production authentication.
          </p>
        </div>
      </div>

      <div class="form-actions">
        <button class="primary" data-home>← Back to Home</button>
      </div>
    `;
  } else if (id === 'health') {
    title = 'Product Health Card';

    html = `
      <div class="workspace-grid">
        <div class="form-card">
          <h3>🩺 Assess product health</h3>
          <p>Enter basic details to create a simple rule-based demo score.</p>

          <label>Product name</label>
          <input id="productName" placeholder="e.g. Laptop" required>

          <label>Product category</label>
          <select id="productCategory">
            <option>Electronics</option>
            <option>Home appliance</option>
            <option>Vehicle</option>
            <option>Other</option>
          </select>

          <label>Product age (years)</label>
          <input id="productAge" type="number" min="0" max="100" value="2">

          <label>Condition</label>
          <select id="productCondition">
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>

          <label>Working status</label>
          <select id="productWorking">
            <option value="yes">Working</option>
            <option value="partial">Partly working</option>
            <option value="no">Not working</option>
          </select>

          <button class="primary full" id="assessHealth">Calculate health score</button>
        </div>

        <div class="form-card">
          <h3>Result</h3>
          <div id="healthResult" class="empty-state">
            📱
            <p>Complete the form and calculate a product health score.</p>
          </div>
        </div>
      </div>
    `;
  } else if (id === 'repair') {
    title = 'Repair vs Replace';

    html = `
      <div class="workspace-grid">
        <div class="form-card">
          <h3>🔧 Compare costs</h3>

          <label>Product name</label>
          <input id="rrName" placeholder="e.g. Washing machine">

          <label>Estimated repair cost (₹)</label>
          <input id="repairCost" type="number" min="0" value="2500">

          <label>Replacement cost (₹)</label>
          <input id="replaceCost" type="number" min="0" value="12000">

          <label>Expected extra life after repair (years)</label>
          <input id="repairLife" type="number" min="0" value="2">

          <button class="primary full" id="compareCosts">Compare options</button>
        </div>

        <div class="form-card">
          <h3>Recommendation</h3>
          <div id="repairResult" class="empty-state">
            🛠️
            <p>Enter costs to compare your options.</p>
          </div>
        </div>
      </div>
    `;
  } else if (id === 'eco') {
    title = 'Eco Impact Score';

    html = `
      <div class="workspace-grid">
        <div class="form-card">
          <h3>🌍 Sustainability estimate</h3>

          <label>Product name</label>
          <input id="ecoName" placeholder="e.g. Smartphone">

          <label>Product age (years)</label>
          <input id="ecoAge" type="number" min="0" value="2">

          <label>Can it be repaired?</label>
          <select id="ecoRepair">
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>

          <label>End-of-life plan</label>
          <select id="ecoPlan">
            <option value="reuse">Reuse or donate</option>
            <option value="recycle">Recycle responsibly</option>
            <option value="trash">General waste</option>
          </select>

          <button class="primary full" id="calcEco">Calculate eco score</button>
        </div>

        <div class="form-card">
          <h3>Eco result</h3>
          <div id="ecoResult" class="empty-state">
            🌱
            <p>Fill in product details to see an illustrative sustainability score.</p>
          </div>
        </div>
      </div>
    `;
  } else if (id === 'risk') {
    title = 'Failure Risk Analysis';

    html = `
      <div class="workspace-grid">
        <div class="form-card">
          <h3>⚠️ Estimate maintenance risk</h3>

          <label>Product name</label>
          <input id="riskName" placeholder="e.g. Air conditioner">

          <label>Age (years)</label>
          <input id="riskAge" type="number" min="0" value="3">

          <label>Usage intensity</label>
          <select id="riskUsage">
            <option value="1">Light</option>
            <option value="2" selected>Moderate</option>
            <option value="3">Heavy</option>
          </select>

          <label>Maintenance frequency</label>
          <select id="riskMaint">
            <option value="0">Regular</option>
            <option value="1" selected>Sometimes</option>
            <option value="2">Rarely / never</option>
          </select>

          <button class="primary full" id="calcRisk">Analyze risk</button>
        </div>

        <div class="form-card">
          <h3>Risk result</h3>
          <div id="riskResult" class="empty-state">
            🛡️
            <p>Enter usage details to view a simple risk estimate.</p>
          </div>
        </div>
      </div>
    `;
  } else if (id === 'chat') {
    title = 'Product Lifecycle Chatbot';

    html = `
      <div class="form-card">
        <h3>🤖 Ask PLDS assistant</h3>
        <p>
          This built-in demo chatbot answers common product lifecycle
          questions. It does not use a live AI service.
        </p>

        <div id="chatLog" class="chat-log">
          <div class="chat-bubble bot">
            Hi! Ask me about repair, maintenance, reuse, recycling or product health.
          </div>
        </div>

        <form id="chatForm">
          <label>Your question</label>
          <input id="chatInput" placeholder="How can I extend my laptop life?" required>

          <div class="form-actions">
            <button class="primary">Send message →</button>
            <button class="secondary" type="button" id="clearChat">Clear chat</button>
          </div>
        </form>
      </div>
    `;
  } else if (id === 'language') {
    title = 'Language Selection';

    html = `
      <div class="form-card">
        <h3>🌐 Choose your language</h3>
        <p>
          Select the language you prefer. This demo updates key navigation
          and page labels; some feature-specific text remains in English.
        </p>

        <div class="workspace-grid">
          <button class="secondary" data-lang="en">🇬🇧 English</button>
          <button class="secondary" data-lang="ta">🇮🇳 தமிழ் (Tamil)</button>
          <button class="secondary" data-lang="hi">🇮🇳 हिंदी (Hindi)</button>
        </div>

        <div id="languageResult" class="result-box">Current language: English</div>
      </div>
    `;
  } else if (id === 'qr') {
    title = 'QR Product Passport';

    html = `
      <div class="workspace-grid">
        <div class="form-card">
          <h3>▦ Create product passport</h3>

          <label>Product name</label>
          <input id="qrName" placeholder="e.g. Laptop" required>

          <label>Model</label>
          <input id="qrModel" placeholder="Model number">

          <label>Serial / asset ID</label>
          <input id="qrSerial" placeholder="Optional ID">

          <label>Condition</label>
          <select id="qrCondition">
            <option>Good</option>
            <option>Fair</option>
            <option>Poor</option>
          </select>

          <button class="primary full" id="makePassport">Generate passport</button>
        </div>

        <div class="form-card">
          <h3>Product passport</h3>
          <div id="qrResult" class="empty-state">
            📲
            <p>Enter product information to create a printable passport card.</p>
          </div>
        </div>
      </div>
    `;
  } else if (id === 'upload') {
    title = 'Product Image Upload';

    html = `
      <div class="workspace-grid">
        <div class="form-card">
          <h3>🖼️ Upload a product image</h3>

          <label>Select image</label>
          <input type="file" id="imageFile" accept="image/*">

          <label>Product name</label>
          <input id="imageProductName" placeholder="e.g. Headphones">

          <label>Notes</label>
          <textarea id="imageNotes" rows="3" placeholder="Describe condition or visible issue"></textarea>

          <div class="form-actions">
            <button class="primary" id="saveImageNote">Save assessment note</button>
          </div>

          <p class="login-note">
            Image preview only; automated visual diagnosis is not connected in this demo.
          </p>
        </div>

        <div class="form-card">
          <h3>Image preview</h3>
          <div id="imagePreview" class="empty-state">
            🖼️
            <p>Your selected image will appear here.</p>
          </div>
        </div>
      </div>
    `;
  } else {
    title = 'Feature';
    html = '<p>Select a feature from the dashboard.</p>';
  }

  $('#pageTitle').textContent = title;
  $('#pageSubtitle').textContent =
    'Use this workspace to explore the selected PLDS feature.';

  w.innerHTML = html;
  wireWorkspace(id);
}

function result(id, markup) {
  $(id).innerHTML = `<div class="result-box">${markup}</div>`;
}

function money(n) {
  return Number(n || 0).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

function wireWorkspace(id) {
  if (id === 'health') {
    $('#assessHealth').onclick = () => {
      let name = $('#productName').value.trim();

      if (!name) {
        toast('Please enter a product name.');
        return;
      }

      let score =
        100
        - Math.min(30, Number($('#productAge').value || 0) * 4)
        - ({
          good: 0,
          fair: 15,
          poor: 30
        }[$('#productCondition').value])
        - ({
          yes: 0,
          partial: 15,
          no: 35
        }[$('#productWorking').value]);

      score = Math.max(5, Math.min(100, score));

      let condition =
        score >= 75 ? 'Good' :
        score >= 45 ? 'Fair' : 'Poor';

      let status =
        $('#productWorking').value === 'yes'
          ? 'Functional'
          : $('#productWorking').value === 'partial'
            ? 'Partly functional'
            : 'Not working';

      result('#healthResult', `
        <strong class="big">${score}/100</strong>
        <h3>${esc(name)} — ${condition}</h3>
        <p>Status: <b>${status}</b></p>
        <p>
          ${
            score >= 75
              ? 'Keep up regular maintenance.'
              : score >= 45
                ? 'Consider a service check and compare repair costs.'
                : 'Get a professional inspection and compare repair versus replacement.'
          }
        </p>
      `);

      $('#overviewScore').textContent = score;
      $('#overviewCondition').textContent = condition;
      $('#overviewStatus').textContent = status;

      saveHistory({
        feature: 'Product Health Card',
        summary: `${name}: ${score}/100, ${condition}`
      });

      toast('Health assessment saved to history.');
    };
  }

  if (id === 'repair') {
    $('#compareCosts').onclick = () => {
      let n = $('#rrName').value.trim() || 'Product';
      let r = Number($('#repairCost').value);
      let v = Number($('#replaceCost').value);
      let life = Number($('#repairLife').value);

      let rec =
        r < v * 0.5 && life > 0
          ? 'Repair is likely the more economical option.'
          : 'Compare product age, reliability and warranty before deciding.';

      result('#repairResult', `
        <strong class="big">
          ${r < v ? 'Repair may save ' + money(v - r) : 'Replacement may be worth considering'}
        </strong>
        <p>Repair: <b>${money(r)}</b></p>
        <p>Replacement: <b>${money(v)}</b></p>
        <p>${rec}</p>
        <p class="login-note">
          Illustrative comparison only; check actual quotes and safety.
        </p>
      `);

      saveHistory({
        feature: 'Repair vs Replace',
        summary: `${n}: repair ${money(r)}, replace ${money(v)}`
      });

      toast('Cost comparison saved.');
    };
  }

  if (id === 'eco') {
    $('#calcEco').onclick = () => {
      let n = $('#ecoName').value.trim() || 'Product';
      let age = Number($('#ecoAge').value);
      let repair = $('#ecoRepair').value;
      let plan = $('#ecoPlan').value;

      let score = Math.max(
        10,
        Math.min(
          100,
          55 + age * 4
          + (repair === 'yes' ? 15 : 0)
          + ({ reuse: 20, recycle: 10, trash: -25 }[plan])
        )
      );

      result('#ecoResult', `
        <strong class="big">${score}/100</strong>
        <h3>
          ${
            score >= 75
              ? '🌿 Greener choice potential'
              : score >= 50
                ? '🌱 Moderate impact'
                : '♻️ Improvement needed'
          }
        </h3>
        <p>
          ${esc(n)}:
          ${
            repair === 'yes'
              ? 'repairability can extend its useful life.'
              : 'consider safe replacement or responsible recycling.'
          }
        </p>
        <p>
          ${
            plan === 'reuse'
              ? 'Reuse or donation can extend product life.'
              : plan === 'recycle'
                ? 'Use an authorized recycling facility.'
                : 'Avoid general waste when e-waste collection is available.'
          }
        </p>
        <p class="login-note">
          Illustrative score, not a verified carbon-footprint calculation.
        </p>
      `);

      saveHistory({
        feature: 'Eco Impact Score',
        summary: `${n}: illustrative score ${score}/100`
      });

      toast('Eco score saved.');
    };
  }

  if (id === 'risk') {
    $('#calcRisk').onclick = () => {
      let n = $('#riskName').value.trim() || 'Product';

      let risk =
        Number($('#riskAge').value) * 7
        + Number($('#riskUsage').value) * 12
        + Number($('#riskMaint').value) * 14;

      risk = Math.max(5, Math.min(95, risk));

      let level =
        risk < 35 ? 'Low' :
        risk < 65 ? 'Moderate' : 'High';

      result('#riskResult', `
        <strong class="big">${risk}%</strong>
        <h3>${level} estimated risk</h3>
        <p>Product: ${esc(n)}</p>
        <p>
          ${
            level === 'Low'
              ? 'Continue routine care and follow manufacturer guidance.'
              : level === 'Moderate'
                ? 'Schedule preventive maintenance and monitor unusual behaviour.'
                : 'Arrange a professional inspection before continued heavy use.'
          }
        </p>
        <p class="login-note">
          Rule-based demonstration only; not a calibrated failure prediction.
        </p>
      `);

      saveHistory({
        feature: 'Failure Risk Analysis',
        summary: `${n}: ${level} (${risk}%)`
      });

      toast('Risk analysis saved.');
    };
  }

  if (id === 'chat') {
    const log = $('#chatLog');

    $('#chatForm').onsubmit = event => {
      event.preventDefault();

      let q = $('#chatInput').value.trim();
      if (!q) return;

      log.innerHTML += `
        <div class="chat-bubble user">${esc(q)}</div>
        <div class="chat-bubble bot">${esc(chatAnswer(q))}</div>
      `;

      $('#chatInput').value = '';
      log.scrollTop = log.scrollHeight;
    };

    $('#clearChat').onclick = () => {
      log.innerHTML =
        '<div class="chat-bubble bot">Chat cleared. What product question can I help with?</div>';
    };
  }

  if (id === 'language') {
    $$('[data-lang]').forEach(button => {
      button.onclick = () => {
        const lang = button.dataset.lang;

        const labels = {
          en: 'English',
          ta: 'தமிழ்',
          hi: 'हिंदी'
        };

        localStorage.setItem('pldsLanguage', lang);

        $('#languageResult').textContent =
          'Selected language: ' + labels[lang] +
          '. Dashboard navigation updates when you return.';

        if (lang === 'ta') {
          $$('.nav-item span').forEach((el, i) => {
            el.textContent = [
              'முகப்பு',
              'அம்சங்கள்',
              'அறிக்கைகள்',
              'அமைப்புகள்',
              'வெளியேறு'
            ][i] || el.textContent;
          });
        } else if (lang === 'hi') {
          $$('.nav-item span').forEach((el, i) => {
            el.textContent = [
              'डैशबोर्ड',
              'विशेषताएँ',
              'रिपोर्ट',
              'सेटिंग्स',
              'लॉग आउट'
            ][i] || el.textContent;
          });
        } else {
          $$('.nav-item span').forEach((el, i) => {
            el.textContent = [
              'Dashboard',
              'Features',
              'Reports & History',
              'Settings',
              'Logout'
            ][i] || el.textContent;
          });
        }

        toast('Language preference saved.');
      };
    });
  }

  if (id === 'qr') {
    $('#makePassport').onclick = () => {
      let name = $('#qrName').value.trim();

      if (!name) {
        toast('Please enter a product name.');
        return;
      }

      const data = {
        name,
        model: $('#qrModel').value,
        serial: $('#qrSerial').value,
        condition: $('#qrCondition').value
      };

      result('#qrResult', `
        <div class="passport-code">
          ${qrPattern(data.name + data.model + data.serial)}
        </div>
        <h3>${esc(name)}</h3>
        <p>Model: ${esc(data.model || 'Not provided')}</p>
        <p>Asset ID: ${esc(data.serial || 'Not provided')}</p>
        <p>Condition: <b>${esc(data.condition)}</b></p>
        <p class="login-note">
          Decorative QR-style code for this demo; it does not encode a scannable URL.
        </p>
        <button class="secondary" onclick="window.print()">Print passport</button>
      `);

      saveHistory({
        feature: 'QR Product Passport',
        summary: `Generated passport for ${name}`
      });

      toast('Passport created.');
    };
  }

  if (id === 'upload') {
    let imageData = '';

    $('#imageFile').onchange = event => {
      const file = event.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        toast('Please select an image file.');
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        imageData = reader.result;

        $('#imagePreview').innerHTML = `
          <img
            src="${imageData}"
            alt="Selected product"
            style="max-width:100%;max-height:280px;object-fit:contain;border-radius:12px"
          >
          <p>${esc(file.name)}</p>
        `;
      };

      reader.readAsDataURL(file);
    };

    $('#saveImageNote').onclick = () => {
      let name =
        $('#imageProductName').value.trim() || 'Unnamed product';

      saveHistory({
        feature: 'Product Image Upload',
        summary: `${name}: ${
          $('#imageNotes').value.trim() || 'Image preview saved'
        }${imageData ? ' (image selected)' : ''}`
      });

      toast('Assessment note saved to history.');
    };
  }

  if (id === 'reports') {
    const exportButton = $('#exportHistory');

    if (exportButton) {
      exportButton.onclick = () => {
        const rows = [
          ['Feature', 'Summary', 'Date'],
          ...history.map(h => [h.feature, h.summary, h.time])
        ];

        const csv = rows
          .map(row =>
            row.map(value =>
              '"' + String(value).replace(/"/g, '""') + '"'
            ).join(',')
          )
          .join('\n');

        const a = document.createElement('a');

        a.href = URL.createObjectURL(
          new Blob([csv], { type: 'text/csv' })
        );

        a.download = 'plds-history.csv';
        a.click();

        URL.revokeObjectURL(a.href);
      };
    }

    const clearButton = $('#clearHistory');

    if (clearButton) {
      clearButton.onclick = () => {
        if (confirm('Clear all saved assessment history from this browser?')) {
          history = [];
          localStorage.removeItem('pldsHistory');
          renderWorkspace('reports');
          toast('History cleared.');
        }
      };
    }
  }

  if (id === 'settings') {
    $('#saveProfile').onclick = () => {
      const name = $('#displayName').value.trim();

      if (name) {
        $('#userName').textContent = name;
        toast('Display name updated for this session.');
      }
    };

    $('#settingsLogout').onclick = () => {
      $('#logoutBtn').click();
    };

    $('#saveSettings').onclick = () => {
      localStorage.setItem(
        'pldsLanguage',
        $('#settingsLanguage').value
      );

      localStorage.setItem(
        'pldsNotifications',
        $('#notificationsPref').checked ? '1' : '0'
      );

      toast('Preferences saved in this browser.');
    };
  }
}

function chatAnswer(question) {
  const q = question.toLowerCase();

  if (/repair|replace|cost|expensive/.test(q)) {
    return 'Compare a repair quote with the cost of a reliable replacement, warranty, safety and expected extra years of use. If repair costs are high relative to replacement, get a second opinion.';
  }

  if (/recycl|dispose|ewaste|e-waste|trash/.test(q)) {
    return 'Use an authorized e-waste collection or recycling point. Remove personal data from electronics and follow local rules; do not put batteries or electronics in ordinary waste.';
  }

  if (/maintain|care|life|last|extend/.test(q)) {
    return 'Follow the manufacturer’s maintenance schedule, keep vents clean, avoid heat and moisture, update software when relevant, and repair small issues early.';
  }

  if (/health|condition|score|risk/.test(q)) {
    return 'Use the Product Health Card and Failure Risk Analysis forms for an illustrative estimate. These demo scores are rule-based and are not a professional diagnosis.';
  }

  if (/reuse|donate|second hand/.test(q)) {
    return 'If the product is safe and works, consider reuse, donation or resale. Remove personal information and include chargers or manuals when available.';
  }

  return 'I can help with repair-versus-replace decisions, maintenance, product health, reuse and recycling. Try asking one of those questions.';
}

function qrPattern(text) {
  let seed = 0;

  for (let i = 0; i < text.length; i++) {
    seed = (seed * 31 + text.charCodeAt(i)) >>> 0;
  }

  let output = '<div class="qr-grid">';

  for (let i = 0; i < 121; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;

    const on = (seed >>> 29) & 1;

    output += `<i class="${on ? 'on' : ''}"></i>`;
  }

  return output + '</div>';
}

// Feature detail cards open their related workspace.
$('#featureGrid').addEventListener('click', event => {
  const button = event.target.closest('[data-open]');

  if (button) {
    const feature = features.find(
      item => item.id === button.dataset.open
    );

    if (feature) {
      $('#featureDetail').innerHTML = detailMarkup(feature);
    }
  }
});

if (localStorage.getItem('pldsRemember') === '1') {
  $('#remember').checked = true;
}

showLogin();
