import chokidar from 'chokidar';

function watch(socket) {
  const watcher = chokidar.watch(['*.js'], {
    ignored: /node_modules/,
    ignoreInitial: true,
  });

  watcher.on('change', (path) => {
    socket.emit('agent:log', { message: `File changed: ${path}`, level: 'info' });
  });

  watcher.on('error', (error) => {
    socket.emit('agent:log', { message: `Watcher error: ${error.message}`, level: 'error' });
  });
}

export { watch };
