import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection } from 'mongoose';

export interface IMongoDbMock {
  mongodb: MongoMemoryServer;
  mongoConnection: Connection;
}

export const createMongoDbMock = async (): Promise<IMongoDbMock> => {
  const mongodb: MongoMemoryServer = await MongoMemoryServer.create();
  const uri = mongodb.getUri();
  const mongoConnection: Connection = (await connect(uri)).connection;

  return { mongodb, mongoConnection };
};

export const closeMongoDbMock = async (mongoDbMock: IMongoDbMock) => {
  await mongoDbMock.mongoConnection.dropDatabase();
  await mongoDbMock.mongoConnection.close();
  await mongoDbMock.mongodb.stop();
};

export const cleanMongoDbMockCollections = async (
  mongoDbMock: IMongoDbMock,
) => {
  const collections = await mongoDbMock.mongoConnection.db.collections();

  await Promise.all(
    collections.map(async (collection) => {
      await collection.deleteMany({});
    }),
  );
};
