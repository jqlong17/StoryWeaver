#!/bin/bash

echo "请输入剧情关键词："
read keyword
python3 main_story_gen.py "$keyword" 