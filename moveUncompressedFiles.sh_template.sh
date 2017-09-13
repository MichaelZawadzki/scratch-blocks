#!/bin/bash

# Script to move scratch-blocks' uncompressed files to another project.
# Useful when we want to use uncompressed files for debugging;
# also, it requires no compilation, so we don't get booted out of closure-compiler :)

# If new files are added to scratch-blocks, you will need to run 'build.py' to re-generate 
# a proper 'blockly_vertical_uncompressed.js' file.
# If new directories containing code files are added, you will need to add those directories here
# to make sure the files are copied to the destination folder.

# Relative path to the project where you want the uncompressed files to be moved to
# The files need to live in the 'app' folder of your project so they can be served properly
# ---> CHANGE THIS SO IT MATCHES YOUR DIRECTORY STRUCTURE <---
RELATIVE_PATH_PROJECT="../csi/app/"

# The name of the destination folder
SCRATCH_BLOCKS_FOLDER_NAME="scratch-blocks"

# Various destination directories
BASE_DIR=$RELATIVE_PATH_PROJECT$SCRATCH_BLOCKS_FOLDER_NAME
MSG_DIR=$BASE_DIR/msg
VERTICAL_DIR=$BASE_DIR/blocks_vertical
COMMON_DIR=$BASE_DIR/blocks_common
GEN_DIR=$BASE_DIR/generators
GEN_JS_DIR=$BASE_DIR/generators/javascript
CORE_DIR=$BASE_DIR/core

# Make folders we need
rm -rf $BASE_DIR
mkdir -p $BASE_DIR
mkdir -p $MSG_DIR
mkdir -p $VERTICAL_DIR
mkdir -p $COMMON_DIR
mkdir -p $GEN_DIR
mkdir -p $GEN_JS_DIR
mkdir -p $CORE_DIR

# Copy files
cp blockly_uncompressed_vertical.js $BASE_DIR
cp msg/messages.js $MSG_DIR

BLOCKS_VERTICAL_FILES=blocks_vertical/*.js
for f in $BLOCKS_VERTICAL_FILES
do
	cp $f $VERTICAL_DIR
done

BLOCKS_COMMON_FILES=blocks_common/*.js
for f in $BLOCKS_COMMON_FILES
do
	cp $f $COMMON_DIR
done

GEN_JS_FILES=generators/javascript/*.js
for f in $GEN_JS_FILES
do
	cp $f $GEN_JS_DIR
done

cp generators/javascript.js $GEN_DIR/

CORE_JS_FILES=core/*.js
for f in $CORE_JS_FILES
do
	cp $f $CORE_DIR
done
