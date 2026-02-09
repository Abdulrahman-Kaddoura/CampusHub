#!/bin/sh
# Wait until PostgreSQL is ready

host="postgres"
port=5432

echo "Waiting for PostgreSQL at $host:$port..."

until nc -z $host $port; do
  echo "Postgres is unavailable - sleeping"
  sleep 2
done

echo "Postgres is up - starting app"

exec "$@"
#!/bin/sh
# Wait until PostgreSQL is ready

host="postgres"
port=5432

echo "Waiting for PostgreSQL at $host:$port..."

until nc -z $host $port; do
  echo "Postgres is unavailable - sleeping"
  sleep 2
done

echo "Postgres is up - starting app"

exec "$@"
