const passwordInput = document.getElementById('password');
const toggleBtn = document.getElementById('toggleBtn');
const strengthLabel = document.getElementById('strengthLabel');
const scoreValue = document.getElementById('scoreValue');
const entropyValue = document.getElementById('entropyValue');
const meterBar = document.getElementById('meterBar');
const criteriaList = document.getElementById('criteriaList');
const suggestionsList = document.getElementById('suggestionsList');

const commonPatterns = [
  'password', '12345', '123456', 'qwerty', 'admin', 'welcome', 'letmein',
  'student', 'karatina', 'university'
];

function characterPoolSize(password) {
  let pool = 0;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/[0-9]/.test(password)) pool += 10;
  if (/[^A-Za-z0-9]/.test(password)) pool += 32;
  return pool;
}

function estimateEntropy(password) {
  const pool = characterPoolSize(password);
  if (!password || !pool) return 0;
  return Math.round(password.length * Math.log2(pool));
}

function repeatedPatternPenalty(password) {
  if (/(.)\1{2,}/.test(password)) return 12;
  if (/123|abc|qwe|password/i.test(password)) return 14;
  return 0;
}

function evaluate(password) {
  const checks = [
    { label: 'At least 8 characters', passed: password.length >= 8 },
    { label: 'At least 12 characters', passed: password.length >= 12 },
    { label: 'Contains lowercase letters', passed: /[a-z]/.test(password) },
    { label: 'Contains uppercase letters', passed: /[A-Z]/.test(password) },
    { label: 'Contains digits', passed: /[0-9]/.test(password) },
    { label: 'Contains special characters', passed: /[^A-Za-z0-9]/.test(password) },
    {
      label: 'Avoids common weak patterns',
      passed: !commonPatterns.some((pattern) => password.toLowerCase().includes(pattern))
    },
    { label: 'No repeated character streaks', passed: !/(.)\1{2,}/.test(password) }
  ];

  let score = 0;
  if (password.length >= 8) score += 15;
  if (password.length >= 12) score += 15;
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^A-Za-z0-9]/.test(password)) score += 15;
  if (new Set(password).size >= Math.max(6, Math.floor(password.length * 0.7))) score += 10;
  score += Math.min(15, Math.floor(estimateEntropy(password) / 6));
  score -= repeatedPatternPenalty(password);
  score = Math.max(0, Math.min(100, score));

  let strength = 'Weak';
  if (score >= 75) strength = 'Strong';
  else if (score >= 45) strength = 'Medium';

  const suggestions = [];
  if (password.length < 12) suggestions.push('Use 12 or more characters for better resistance to guessing attacks.');
  if (!/[A-Z]/.test(password)) suggestions.push('Add at least one uppercase letter.');
  if (!/[a-z]/.test(password)) suggestions.push('Add at least one lowercase letter.');
  if (!/[0-9]/.test(password)) suggestions.push('Include at least one number.');
  if (!/[^A-Za-z0-9]/.test(password)) suggestions.push('Include a symbol such as !, @, #, or $.');
  if (commonPatterns.some((pattern) => password.toLowerCase().includes(pattern))) {
    suggestions.push('Avoid obvious words or sequences such as password, qwerty, or 12345.');
  }
  if (/(.)\1{2,}/.test(password)) suggestions.push('Avoid repeating the same character many times.');
  if (!password) suggestions.push('Start typing to receive feedback.');
  if (suggestions.length === 0 && password) suggestions.push('Great job. This password shows strong length and complexity characteristics.');

  return { checks, score, strength, entropy: estimateEntropy(password), suggestions };
}

function updateUI() {
  const password = passwordInput.value;
  const result = evaluate(password);

  strengthLabel.textContent = result.strength;
  scoreValue.textContent = `${result.score} / 100`;
  entropyValue.textContent = `${result.entropy} bits`;
  meterBar.style.width = `${result.score}%`;

  const color = result.strength === 'Strong' ? 'var(--green)' : result.strength === 'Medium' ? 'var(--amber)' : 'var(--red)';
  meterBar.style.background = color;
  strengthLabel.style.color = color;

  criteriaList.innerHTML = result.checks
    .map((check) => `<li class="${check.passed ? 'good' : 'bad'}">${check.passed ? '✔' : '✖'} ${check.label}</li>`)
    .join('');

  suggestionsList.innerHTML = result.suggestions
    .map((tip) => `<li>${tip}</li>`)
    .join('');
}

toggleBtn.addEventListener('click', () => {
  const hidden = passwordInput.type === 'password';
  passwordInput.type = hidden ? 'text' : 'password';
  toggleBtn.textContent = hidden ? 'Hide' : 'Show';
});

passwordInput.addEventListener('input', updateUI);

const params = new URLSearchParams(window.location.search);
const samplePassword = params.get('sample');
if (samplePassword) {
  passwordInput.value = samplePassword;
}

updateUI();
