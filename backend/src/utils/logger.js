function info(message, meta = {}) {
  console.log('[INFO]', message, JSON.stringify(meta));
}

function error(message, meta = {}) {
  console.error('[ERROR]', message, JSON.stringify(meta));
}

export { info, error };
