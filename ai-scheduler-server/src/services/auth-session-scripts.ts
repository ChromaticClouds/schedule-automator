export const consumeHandoffScript = `
local value = redis.call('GET', KEYS[1])
if value then redis.call('DEL', KEYS[1]) end
return value
`;

export const rotateSessionScript = `
local current = redis.call('HGET', KEYS[1], 'refreshHash')
if not current then return {0} end
if current ~= ARGV[1] then
  redis.call('DEL', KEYS[1])
  return {-1}
end
local userId = redis.call('HGET', KEYS[1], 'userId')
redis.call('HSET', KEYS[1], 'refreshHash', ARGV[2])
redis.call('EXPIRE', KEYS[1], ARGV[3])
return {1, userId}
`;

export const revokeSessionScript = `
local current = redis.call('HGET', KEYS[1], 'refreshHash')
if not current or current ~= ARGV[1] then return 0 end
return redis.call('DEL', KEYS[1])
`;
