VERSIONS=$(npm view solc versions)

declare -p arr=($VERSIONS)

## This loop npm installs all versions of solc
for i in "${arr[@]}"
do
    if [ $i == "]" ] || [ $i == "[" ]
    then
        continue
    else
        VERSION=$(echo "$i" | tr -d \' | tr -d ,)
        npm install solc-${VERSION}@npm:solc@${VERSION}
    fi
done
