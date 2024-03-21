#### Сервис для создания и отображения исторических трешхолдов в мониторинге. Backend.

Стек технологий: NestJS, ApolloGraphQL, MongoDB, Prisma, Grafana, Docker, InfluxDB, telegraf.

##### Запуск backend:

```
cd monitoring-historical-threshold-backend
npm i
docker-compose up -d
npm run start:dev
```

###### Файлы настроек для backend:
```
InfluxDB: influxv2.env
Grafana; host; port; database_url: .env
```

##### Адреса при запуске с настройками по умолчанию:

Grafana:
- localhost:3011 
(логин: 1, пароль: 1)

Backend, Apollo Server: 
- localhost:9001/graphql

InfluxDB:		
- localhost:8087 
(логин:username, пароль: password)

###### Остановка для docker:
```
docker compose stop
```

###### Повторный запуск docker:
```
docker compose start
```

###### При необходимости обновить dumb.bd:
```
docker exec <mongodb container> sh -c 'mongodump --authenticationDatabase admin -u admin -p admin --db thresholds --archive' > db.dump
mv mongo-initdb/db.dump mongo-initdb/db.dump_old
mv db.dump mongo-initdb
```

###### Запуск с новым db.dump или повторная сборка после docker compose down:
```
docker compose down
docker volume rm monitoring-historical-threshold-backend_mongodb-storage
docker compose up -d
```
