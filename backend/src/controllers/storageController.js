import { streamToMongoDB } from 'stream-to-mongo-db';
import JSONStream from 'JSONStream';
import fs from 'fs';

export const storeJsonFs = (req, res) => {
  const { dbURL, collection, sourceFile } = req.query;
  let batchSize,
    parseString = null;
  let response = '';

  if (dbURL && collection && sourceFile) {
    if (req.query.batchSize) batchSize = req.query.batchSize;
    else batchSize = 1000;
    if (req.query.parseString) parseString = req.query.parseString;
    else parseString = '*.*';

    const outputDBConfig = { dbURL, collection, batchSize };

    const writableStream = streamToMongoDB(outputDBConfig);

    fs.createReadStream(sourceFile)
      .pipe(JSONStream.parse(parseString))
      .pipe(writableStream)
      .on('finish', () => {
        response += 'All documents stored in the collection!';
        res.send(response);
      })
      .on('error', (err) => {
        console.log('Hit error: ' + err);
        res.send(err);
      });
  } else {
    if (req.query.dbURL == null) response += 'A mandatory dbURL parameter is missed.\n';
    if (req.query.collection == null) response += 'A mandatory collection parameter is missed.\n';
    if (req.query.sourceFile == null) response += 'A mandatory sourceFile parameter is missed.\n';
    res.send(response);
  }
};
