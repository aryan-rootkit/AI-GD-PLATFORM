const { sanitizeForLog } = require('./safeLogging');

function scrubArgs(args) {
  return args.map((a) => {
    if (a instanceof Error) return a;
    if (a != null && typeof a === 'object') return sanitizeForLog(a);
    return a;
  });
}

function info(...args) {
  console.log('[info]', ...scrubArgs(args));
}

function warn(...args) {
  console.warn('[warn]', ...scrubArgs(args));
}

function error(...args) {
  console.error('[error]', ...scrubArgs(args));
}

module.exports = { info, warn, error };
