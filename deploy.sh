#!/usr/bin/env sh

# ssh ubuntu@42.194.163.139

# 服务器上执行 rm -rf Discuz-Q-Web

originFile="Discuz-Q-Web"

echo "生成 dits :)"

yarn generate

echo "删除 node_modules :("

rm -rf node_modules

cd ..

echo "删除成功，开始上传 :)"

scp -r "$originFile" ubuntu@42.194.163.139:~

echo "上传成功，重装依赖~"

cd "$originFile"

yarn install

echo "重装成功，请在服务器运行 discuz.sh"

ssh ubuntu@42.194.163.139

# 服务器端执行 sh discuz.sh



