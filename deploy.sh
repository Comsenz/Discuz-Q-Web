# ssh ubuntu@42.194.163.139

# 服务器上执行 rm -rf Discuz-Q-Web

rm -rf node_modules

cd ..

scp -r Discuz-Q-Web ubuntu@42.194.163.139:~

ssh ubuntu@42.194.163.139

# 服务器端执行 sh discuz.sh
