import net from 'node:net';
import mongoose from 'mongoose';

const mongoUrl = process.env.MONGO_URL;
const redisUrl = process.env.REDIS_URL;
const runId = `ci-${process.env.GITHUB_RUN_ID ?? 'local'}-${Date.now()}`;

if (!mongoUrl) {
  throw new Error('MONGO_URL is required for CI service validation.');
}

if (!redisUrl) {
  throw new Error('REDIS_URL is required for CI service validation.');
}

const pingRedis = () =>
  new Promise((resolve, reject) => {
    const url = new URL(redisUrl);
    const socket = net.createConnection(
      {
        host: url.hostname,
        port: Number(url.port || 6379),
      },
      () => {
        socket.write('*1\r\n$4\r\nPING\r\n');
      },
    );

    const timeout = setTimeout(() => {
      socket.destroy();
      reject(new Error('Redis ping timed out.'));
    }, 5000);

    socket.on('data', (chunk) => {
      clearTimeout(timeout);
      const response = chunk.toString('utf8');

      socket.end();

      if (!response.includes('PONG')) {
        reject(new Error(`Unexpected Redis response: ${response}`));
        return;
      }

      resolve();
    });

    socket.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });

const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const waitForRedis = async () => {
  let lastError;

  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      await pingRedis();
      return;
    } catch (error) {
      lastError = error;
      console.log(`Waiting for Redis... (${attempt}/30)`);
      await sleep(2000);
    }
  }

  throw new Error(
    `Redis was not ready in time: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`,
  );
};

let collection;

try {
  await mongoose.connect(mongoUrl, {
    serverSelectionTimeoutMS: 10000,
  });

  collection = mongoose.connection.collection('_ci_transactions');

  await mongoose.connection.transaction(async (session) => {
    await collection.insertOne(
      {
        runId,
        checked: false,
        createdAt: new Date(),
      },
      { session },
    );

    await collection.updateOne(
      { runId },
      {
        $set: {
          checked: true,
          updatedAt: new Date(),
        },
      },
      { session },
    );
  });

  const saved = await collection.findOne({ runId });

  if (!saved?.checked) {
    throw new Error('MongoDB transaction smoke check did not persist expected data.');
  }

  await waitForRedis();

  console.log('CI services are ready: MongoDB transaction and Redis ping succeeded.');
} finally {
  if (collection) {
    await collection.deleteMany({ runId }).catch(() => undefined);
  }

  await mongoose.disconnect().catch(() => undefined);
}
