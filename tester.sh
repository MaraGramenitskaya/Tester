#!/bin/bash

# # Установка MySQL и Node.js
# cd /home/administrator
# sudo apt update
# sudo apt install -y mysql-server nodejs
# cd -

# Установка программы (в примере используется архив с программой "tester")
sudo git clone https://github.com/MaraGramenitskaya/Tester.git
sudo chmod +777 Tester
cd Tester

while true; do
  read -p "Введите адрес для подключения к MQTT брокеру: " MQTT_HOST
  read -p "Введите пользователя для подключения к MQTT: " MQTT_USERNAME
  read -sp "Введите пароль для подключения к MQTT: " MQTT_PASSWORD
  echo
  read -p "Введите порт для подключения к Brilliant: " BRILLIANT_PORT
  read -p "Введите адрес для подключения к базе данных: " DB_HOST
  read -p "Введите название базы данных: " DB_NAME
  read -p "Введите имя пользователя для базы данных: " DB_USERNAME
  read -sp "Введите пароль для базы данных: " DB_PASSWORD
  echo
  read -p "Вы уверены? (y/n): " confirm
  if [ "$confirm" = "y" ]; then
    break
  fi
done

# Записываем данные в файл app.config
sudo touch app.config 
sudo chmod 666 app.config

echo "mqttHost="$MQTT_HOST"" > app.config
echo "mqttUsername="$MQTT_USERNAME"" >> app.config
echo "mqttPassword="$MQTT_PASSWORD"" >> app.config

echo "brilliantPort="$BRILLIANT_PORT"" >> app.config

echo "dbHost="$DB_HOST"" >> app.config
echo "dbName="$DB_NAME"" >> app.config
echo "dbUsername="$DB_USERNAME"" >> app.config
echo "dbPassword="$DB_PASSWORD"" >> app.config

echo "module.exports = {mqttHost, mqttUsername, mqttPassword, brilliantPort, dbHost, dbName, dbUsername, dbPassword};" >> app.config 

# Создание БД "mqtt" и таблицы "test"
sudo mysql -u root -e "CREATE DATABASE $DB_NAME"
sudo mysql -u root -e "USE $DB_NAME"
sudo mysql -u root $DB_NAME -e "CREATE TABLE test (
  timestamp datetime,
  Sample decimal(3,1),
  Max_temp decimal(3,1),
  Temp_1 decimal(3,1),
  Trigger_1 tinyint,
  Temp_2 decimal(3,1),
  Trigger_2 tinyint,
  Temp_3 decimal(3,1),
  Trigger_3 tinyint,
  Temp_4 decimal(3,1),
  Trigger_4 tinyint,
  Temp_5 decimal(3,1),
  Trigger_5 tinyint,
  Temp_6 decimal(3,1),
  Trigger_6 tinyint,
  Temp_7 decimal(3,1),
  Trigger_7 tinyint,
  session int
);"
sudo mysql -uroot -e "CREATE USER "$DB_USERNAME"@"$DB_HOST" IDENTIFIED BY "$DB_PASSWORD";"
sudo mysql -uroot -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO "$DB_USERNAME"@"$DB_HOST";"
sudo mysql -uroot -e "FLUSH PRIVILEGES;"

# Установка зависимостей для Node.js
npm install mysql2
npm install mqtt 
npm install express 
npm install path 
npm install body-parser

# Создание сервиса и его запуск
sudo tee /etc/systemd/system/tester.service <<EOF
[Unit]
Description=Tester

[Service]
ExecStart=/home/administrator/.nvm/versions/node/v20.6.0/bin/node index.js
WorkingDirectory=/opt/Tester
Restart=always
User=administrator

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable tester
sudo systemctl start tester