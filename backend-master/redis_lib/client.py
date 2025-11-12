from redis import Redis

url = "redis://redis:6379/0"
redis_client: Redis = Redis.from_url(url)

