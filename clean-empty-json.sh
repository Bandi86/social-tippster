#!/usr/bin/env bash
# Script: clean-empty-json.sh
# Purpose: Törli az összes olyan .json fájlt a projektben, amelynek tartalma pontosan "" (idézőjelek között semmi)

find ./tests -type f -name '*.json' | while read -r file; do
    if [ "$(cat "$file")" = '""' ]; then
        echo "Törlés: $file"
        rm "$file"
    fi
done

echo "Kész: minden üres (\"\") tartalmú .json törölve a tests/ mappából."
