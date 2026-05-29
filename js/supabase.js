// ═══════════════════════════════════════
// SUPABASE CLOUD SAVE SYSTEM
// ═══════════════════════════════════════

// TODO: Replace these with your own Supabase project credentials!
const SUPABASE_URL = 'https://zpubuupmajdbktxhuerd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwdWJ1dXBtYWpkYmt0eGh1ZXJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNTc5MzAsImV4cCI6MjA5NTYzMzkzMH0.-ifaP51bAOMlTTr8Do_wm7GelcqByCDcFy0GD_DZbUI';

let supabaseClient = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✓ Supabase Client initialized successfully');
  } catch (e) {
    console.error('Error initializing Supabase client:', e);
  }
} else {
  console.log('☁️ Supabase credentials not configured. Cloud saving is disabled.');
}

// Check if cloud saving is active and user is logged in
function isCloudActive() {
  if (!supabaseClient) return false;
  const session = supabaseClient.auth.session ? supabaseClient.auth.session() : null; // support old SDK structures just in case
  return true; // We will check actual user inside functions using auth.getUser()
}

// Update the Title Screen Cloud Save button text/style based on Auth State
async function updateCloudButtonUI() {
  const btn = document.getElementById('btn-cloud-sync');
  if (!btn) return;

  if (!supabaseClient) {
    btn.style.display = 'none';
    return;
  }

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (user) {
      btn.innerHTML = `☁️ ${user.email.split('@')[0]}`;
      btn.style.borderColor = 'var(--kh-gold)';
      btn.title = `Logged in as ${user.email}`;
    } else {
      btn.innerHTML = `☁️ Cloud Save`;
      btn.style.borderColor = '';
      btn.title = 'Log in to sync your progress';
    }
  } catch (e) {
    btn.innerHTML = `☁️ Cloud Save`;
    btn.style.borderColor = '';
  }
}

// Run on auth state changes
if (supabaseClient) {
  supabaseClient.auth.onAuthStateChange(() => {
    updateCloudButtonUI();
  });
}

// Show the cloud authentication / status modal
async function showCloudAuthModal() {
  if (!supabaseClient) {
    showEventOverlay({
      icon: '⚠️',
      title: 'Not Configured',
      body: 'Supabase URL and Anon Key are not set in js/supabase.js. Please configure them first.',
      reward: ''
    });
    return;
  }

  // Remove existing auth overlays
  document.querySelectorAll('.auth-overlay').forEach(el => el.remove());

  const { data: { user } } = await supabaseClient.auth.getUser();

  if (user) {
    // Show Session Status Modal
    showSessionStatusModal(user);
  } else {
    // Show Login/Register Modal
    showLoginRegisterModal();
  }
}

// Render the Login / Registration modal
function showLoginRegisterModal(isRegisterMode = false) {
  document.querySelectorAll('.auth-overlay').forEach(el => el.remove());

  const ov = document.createElement('div');
  ov.className = 'event-overlay auth-overlay';

  ov.innerHTML = `
    <div class="event-card">
      <span class="event-icon">☁️</span>
      <div class="event-title">${isRegisterMode ? 'CREATE ACCOUNT' : 'CLOUD SYNC'}</div>
      <div class="event-body">${isRegisterMode ? 'Sign up to sync your progress across devices.' : 'Log in to backup your saves and achievements.'}</div>
      
      <div class="auth-error-msg" id="auth-error">Error message here</div>

      <div class="auth-input-group">
        <label class="auth-label">Email Address</label>
        <input type="email" id="auth-email" class="auth-input" placeholder="sora@destinyislands.com" />
      </div>

      <div class="auth-input-group" style="margin-bottom: 20px;">
        <label class="auth-label">Password</label>
        <input type="password" id="auth-password" class="auth-input" placeholder="••••••••" />
      </div>

      <div style="display:flex; flex-direction:column; gap:8px; width:100%;">
        <button class="btn primary" id="btn-auth-submit">${isRegisterMode ? 'Register' : 'Log In'}</button>
        <button class="btn small dark-btn" onclick="this.closest('.event-overlay').remove()">Cancel</button>
      </div>

      <div>
        <span class="auth-link" id="auth-mode-toggle">
          ${isRegisterMode ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
        </span>
      </div>
    </div>
  `;

  document.getElementById('game').appendChild(ov);

  // Focus email
  document.getElementById('auth-email').focus();

  // Toggle Mode listener
  document.getElementById('auth-mode-toggle').onclick = () => {
    showLoginRegisterModal(!isRegisterMode);
  };

  // Submit listener
  document.getElementById('btn-auth-submit').onclick = () => {
    handleAuthSubmit(isRegisterMode);
  };

  // Enter key press triggers submit
  const triggerSubmitOnEnter = (e) => {
    if (e.key === 'Enter') handleAuthSubmit(isRegisterMode);
  };
  document.getElementById('auth-email').addEventListener('keydown', triggerSubmitOnEnter);
  document.getElementById('auth-password').addEventListener('keydown', triggerSubmitOnEnter);
}

// Handle Form Submission
async function handleAuthSubmit(isRegisterMode) {
  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  const errorEl = document.getElementById('auth-error');

  if (!email || !password) {
    errorEl.textContent = 'Please fill out all fields.';
    errorEl.style.display = 'block';
    return;
  }

  errorEl.style.display = 'none';
  const submitBtn = document.getElementById('btn-auth-submit');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Processing...';

  try {
    if (isRegisterMode) {
      // Sign Up
      const { data, error } = await supabaseClient.auth.signUp({ email, password });
      if (error) throw error;

      showEventOverlay({
        icon: '✉️',
        title: 'Verification Sent',
        body: 'Check your email inbox to confirm your registration and enable cloud saving!',
        reward: '',
        onClose: () => {
          document.querySelectorAll('.auth-overlay').forEach(el => el.remove());
        }
      });
    } else {
      // Sign In
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Close auth modals
      document.querySelectorAll('.auth-overlay').forEach(el => el.remove());

      // Trigger cloud data fetch/sync check
      await checkCloudOnLogin();
    }
  } catch (e) {
    errorEl.textContent = e.message || 'An error occurred during authentication.';
    errorEl.style.display = 'block';
    submitBtn.disabled = false;
    submitBtn.textContent = isRegisterMode ? 'Register' : 'Log In';
  }
}

// Show Session Status / Sync controls
function showSessionStatusModal(user) {
  const ov = document.createElement('div');
  ov.className = 'event-overlay auth-overlay';

  ov.innerHTML = `
    <div class="event-card">
      <span class="event-icon">☁️</span>
      <div class="event-title">CLOUD SYNC ACTIVE</div>
      <div class="auth-status-indicator">
        <span style="color:var(--kh-gold);">●</span> Connected as <strong>${user.email}</strong>
      </div>
      <div class="event-body">Your progress is automatically saved to the cloud whenever you save locally.</div>
      
      <div style="display:flex; flex-direction:column; gap:8px; width:100%;">
        <button class="btn primary" id="btn-sync-now">Sync Progress Now</button>
        <button class="btn small dark-btn" id="btn-auth-logout">Log Out</button>
        <button class="btn small dark-btn" onclick="this.closest('.event-overlay').remove()">Close</button>
      </div>
    </div>
  `;

  document.getElementById('game').appendChild(ov);

  document.getElementById('btn-sync-now').onclick = async () => {
    const btn = document.getElementById('btn-sync-now');
    btn.disabled = true;
    btn.textContent = 'Syncing...';
    const success = await syncDataToCloud();
    btn.disabled = false;
    btn.textContent = 'Sync Progress Now';
    if (success) {
      ov.remove();
      showEventOverlay({
        icon: '✓',
        title: 'Synced!',
        body: 'Your local achievements and active saves have been updated in the cloud.',
        reward: ''
      });
    } else {
      showEventOverlay({
        icon: '❌',
        title: 'Sync Failed',
        body: 'Unable to connect to the cloud database. Please try again later.',
        reward: ''
      });
    }
  };

  document.getElementById('btn-auth-logout').onclick = async () => {
    await supabaseClient.auth.signOut();
    ov.remove();
    showEventOverlay({
      icon: '👋',
      title: 'Logged Out',
      body: 'You have logged out. Game saves will reside in local storage only.',
      reward: ''
    });
  };
}

// Upsert profile and game state data to the cloud
async function syncDataToCloud() {
  if (!supabaseClient) return false;

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return false;

    const savegameData = localStorage.getItem('khlike_savegame');
    const parsedSavegame = savegameData ? JSON.parse(savegameData) : null;

    const { error } = await supabaseClient
      .from('user_saves')
      .upsert({
        user_id: user.id,
        profile_data: profile,
        save_data: parsedSavegame,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error syncing save to Supabase:', error);
      return false;
    }
    console.log('✓ Game data synced successfully to Supabase');
    return true;
  } catch (e) {
    console.error('Exception syncing save to Supabase:', e);
    return false;
  }
}

// Handle cloud save checking on login (Conflict Resolution)
async function checkCloudOnLogin() {
  if (!supabaseClient) return;

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    // Fetch save from cloud
    const { data, error } = await supabaseClient
      .from('user_saves')
      .select('profile_data, save_data')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching cloud save on login:', error);
      return;
    }

    if (!data) {
      // No cloud data exists yet, upload current local data
      console.log('No cloud save found. Uploading current local data.');
      await syncDataToCloud();
      showEventOverlay({
        icon: '☁️',
        title: 'Cloud Setup Complete',
        body: 'Welcome! Your current browser progress has been uploaded as your cloud save.',
        reward: ''
      });
      return;
    }

    // Both cloud data and local data exist. Check if they have differences
    const hasLocalData = localStorage.getItem('khlike_savegame') || localStorage.getItem('khlike_profile');

    if (hasLocalData) {
      // Trigger Conflict Resolution Modal
      showConflictResolutionModal(data);
    } else {
      // Apply cloud save immediately
      applyCloudSave(data);
      showEventOverlay({
        icon: '☁️',
        title: 'Cloud Data Loaded',
        body: 'Your profile and active journey have been downloaded from the cloud.',
        reward: ''
      });
    }
  } catch (e) {
    console.error('Exception checking cloud saves on login:', e);
  }
}

// Render Conflict Resolution Modal
function showConflictResolutionModal(cloudData) {
  const ov = document.createElement('div');
  ov.className = 'event-overlay';
  ov.id = 'conflict-resolution-overlay';

  // Compare stats to show in modal
  const localAchievements = profile.unlockedAchievements ? profile.unlockedAchievements.length : 0;
  const cloudAchievements = cloudData.profile_data.unlockedAchievements ? cloudData.profile_data.unlockedAchievements.length : 0;

  const localLevel = profile.maxLevelReached || 1;
  const cloudLevel = cloudData.profile_data.maxLevelReached || 1;

  ov.innerHTML = `
    <div class="event-card" style="max-width: 480px;">
      <span class="event-icon">🔄</span>
      <div class="event-title">SYNC CONFLICT</div>
      <div class="event-body">We found saved progress in both the cloud and this browser. Which one do you want to keep?</div>
      
      <div style="display:flex; gap:16px; margin: 15px 0; justify-content:center; text-align:left;">
        <div style="flex:1; padding: 10px; border: 1px dashed var(--kh-border); border-radius: 8px; background:rgba(255,255,255,0.02)">
          <div style="font-family:'Cinzel',serif; color:var(--kh-gold2); font-size:11px; text-transform:uppercase; font-weight:bold; margin-bottom:4px; text-align:center;">💻 Browser Save</div>
          <div style="font-size:12px;">Level reached: <strong>LV ${localLevel}</strong></div>
          <div style="font-size:12px;">Achievements: <strong>${localAchievements}</strong></div>
        </div>
        
        <div style="flex:1; padding: 10px; border: 1px dashed var(--kh-gold); border-radius: 8px; background:rgba(201,168,76,0.03)">
          <div style="font-family:'Cinzel',serif; color:var(--kh-gold); font-size:11px; text-transform:uppercase; font-weight:bold; margin-bottom:4px; text-align:center;">☁️ Cloud Save</div>
          <div style="font-size:12px;">Level reached: <strong>LV ${cloudLevel}</strong></div>
          <div style="font-size:12px;">Achievements: <strong>${cloudAchievements}</strong></div>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:8px; width:100%;">
        <button class="btn primary" id="btn-keep-cloud">☁️ Download Cloud Save (Overwrites Browser)</button>
        <button class="btn primary" id="btn-keep-local" style="border-color:var(--kh-border);">💻 Keep Browser Save (Uploads to Cloud)</button>
      </div>
    </div>
  `;

  document.getElementById('game').appendChild(ov);

  document.getElementById('btn-keep-cloud').onclick = () => {
    applyCloudSave(cloudData);
    ov.remove();
    showEventOverlay({
      icon: '☁️',
      title: 'Cloud Save Applied',
      body: 'Browser progress has been replaced with your cloud save.',
      reward: ''
    });
  };

  document.getElementById('btn-keep-local').onclick = async () => {
    const success = await syncDataToCloud();
    ov.remove();
    if (success) {
      showEventOverlay({
        icon: '✓',
        title: 'Cloud Updated',
        body: 'Your local browser save has been uploaded and set as your master cloud save.',
        reward: ''
      });
    } else {
      showEventOverlay({
        icon: '⚠️',
        title: 'Upload Failed',
        body: 'Unable to overwrite cloud data. Local save remains active in your browser.',
        reward: ''
      });
    }
  };
}

// Apply fetched cloud data to browser memory & storage
function applyCloudSave(cloudData) {
  // Apply profile
  profile = cloudData.profile_data;
  localStorage.setItem('khlike_profile', JSON.stringify(profile));

  // Apply active save game
  if (cloudData.save_data) {
    localStorage.setItem('khlike_savegame', JSON.stringify(cloudData.save_data));
    // If the player is currently on a screen, we need to refresh the continue button
    if (typeof updateTitleScreenContinueButton === 'function') {
      updateTitleScreenContinueButton();
    }
  } else {
    localStorage.removeItem('khlike_savegame');
    if (typeof updateTitleScreenContinueButton === 'function') {
      updateTitleScreenContinueButton();
    }
  }

  // Reload views if active
  if (typeof renderAchievements === 'function') renderAchievements();
  if (typeof renderJournalList === 'function') renderJournalList();
}
