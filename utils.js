const path = require('path');

const getContentType = (ext) => {
  switch (ext) {
    case '.css':
      return 'text/css';
    case '.js':
      return 'text/javascript';
    case '.json':
      return 'application/json';
    case '.jpg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.txt':
      return 'text/plain';
    default:
      return 'text/html';
  }
};

const getFilePath = (contentType, reqUrl, ext) => {
  let filePath;
  if (contentType === 'text/html' && reqUrl === '/') {
    filePath = path.join(__dirname, 'views', 'index.html');
  } else if (contentType === 'text/html' && reqUrl.slice(-1) === '/') {
    filePath = path.join(__dirname, 'views', reqUrl, 'index.html');
  } else if (contentType === 'text/html') {
    filePath = path.join(__dirname, 'views', reqUrl);
  } else {
    filePath = path.join(__dirname, reqUrl);
  }

  if (!ext && reqUrl.slice(-1) !== '/') filePath += '.html';

  return filePath;
};

exports.getContentType = getContentType;
exports.getFilePath = getFilePath;
