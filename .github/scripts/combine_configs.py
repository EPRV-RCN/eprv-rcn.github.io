#!/usr/bin/env python3

import json
import os
import sys
import tomllib

def combine_configs(input_dir, output_file):
    data = []
    for filename in os.listdir(input_dir):
        if not filename.endswith(".toml"):
            continue
        path = os.path.join(input_dir, filename)
        with open(path, "rb") as f:
            data.append(tomllib.load(f))
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print(f"Wrote {output_file} with {len(data)} TOML files.")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: combine_configs <input_dir> <output_file>")
        sys.exit(1)
    combine_configs(sys.argv[1], sys.argv[2])

