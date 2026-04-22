const { createClient } = require("redis");

const client = createClient({
  username: "default",
  password: "jDMSWTjTHYEvOoa7T1CopFnTHxM3562H",
  socket: {
    host: "redis-16008.crce182.ap-south-1-1.ec2.cloud.redislabs.com",
    port: 16008,
  },
});

// Handle errors (important)
client.on("error", (err) => {
  console.log("Redis Error:", err);
});

// Connect function (non-blocking for server)
const connectRedis = async () => {
  try {
    await client.connect();
    console.log("Redis Connected");
  } catch (err) {
    console.log("Redis failed but server will continue:", err.message);
  }
};

module.exports = {
  client,
  connectRedis,
};
