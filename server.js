const http = require('http');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;

const { getContentType, getFilePath } = require('./utils');
const logEvents = require('./log-events');
const EventEmitter = require('events');

class Emitter extends EventEmitter {}

const myEmitter = new Emitter();
myEmitter.on('log', (msg, fileName) => logEvents(msg, fileName));
const PORT = process.env.PORT || 3000;

const serveFile = async (filePath, contentType, response) => {
  try {
    const rowData = await fsPromises.readFile(
      filePath,
      !contentType.includes('image') ? 'utf8' : ''
    );
    const isJson = contentType === 'application/json';
    const data = isJson ? JSON.parse(rowData) : rowData;

    response.writeHead(filePath.includes('404.html') ? 404 : 200, {
      'Content-Type': contentType,
    });

    response.end(isJson ? JSON.stringify(data) : data);
  } catch (error) {
    myEmitter.emit('log', `${error.name}:${error.message}`, 'err-log.txt');
    response.statusCode = 500;
    response.end();
  }
};

const server = http.createServer((req, res) => {
  console.log(req.url, req.method);
  myEmitter.emit('log', `${req.url}\t${req.method}`, 'req-log.txt');

  const extension = path.extname(req.url);
  let contentType = getContentType(extension);
  const filePath = getFilePath(contentType, req.url, extension);

  const fileExists = fs.existsSync(filePath);

  if (fileExists) {
    serveFile(filePath, contentType, res);
  } else {
    switch (path.parse(filePath).base) {
      case 'old-page.html':
        res.writeHead(301, { Location: 'new-page.html' });
        res.end();
        break;
      case 'www-page.html':
        res.writeHead(301, { Location: '/' });
        res.end();
        break;
      default:
        serveFile(path.join(__dirname, 'views', '404.html'), 'text/html', res);
    }
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
