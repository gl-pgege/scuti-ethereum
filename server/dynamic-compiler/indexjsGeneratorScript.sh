VERSIONS=$(npm view solc versions)

declare -a arr=($VERSIONS)

# The following loop generates all the import statements for our index.js
for i in "${arr[@]}"
do
    if [ $i == "]" ] || [ $i == "[" ]
    then
        continue
    else
        VERSION=$(echo "$i" | tr -d \' | tr -d ,)
        VERSION_NO_DOTS=$(echo "$i" | tr -d \' | tr -d , | tr -d . | tr -d -)
        echo "const solc$VERSION_NO_DOTS = require('solc-$VERSION')"
    fi
done

echo "const solc = {"

for i in "${arr[@]}"
do
    if [ $i == "]" ] || [ $i == "[" ]
    then
        continue
    else
        VERSION_NO_DOTS=$(echo "$i" | tr -d \' | tr -d , | tr -d . | tr -d -)
        echo "'$VERSION_NO_DOTS' : solc$VERSION_NO_DOTS,"
    fi
done

echo "}"

echo "module.exports = solc"