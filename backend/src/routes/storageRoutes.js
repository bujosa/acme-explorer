import { storeJsonFs } from '../controllers/storageController.js';

export const storageRoutes = (app) => {
  /**
   * Put a large json with documents from a file into a collection of mongoDB
   * @section storage
   * @type post
   * @url /v1/storage
   * @param {string} dbURL       //mandatory
   * @param {string} collection  //mandatory
   * @param {string} sourceFile   //mandatory
   * @param {string} batchSize   //optional
   * @param {string} parseString //optional
   */
  app.route('/v1/storage').post(storeJsonFs);
};
