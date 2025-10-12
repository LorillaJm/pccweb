const redis = require('redis');

async function testRedis() {
  const client = redis.createClient({
    socket: {
      host: 'localhost',
      port: 6379
    }
  });

  try {
    await client.connect();
    console.log('✅ Redis connected successfully!');
    await client.set('test', 'Hello Redis');
    const value = await client.get('test');
    console.log('✅ Test value:', value);
    await client.quit();
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
  }
}

testRedis();
