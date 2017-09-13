# Amplify Science's Fork of Scratch Blocks

# scratch-blocks
#### Scratch Blocks is a library for building creative computing interfaces.
[![Build Status](https://travis-ci.org/LLK/scratch-blocks.svg?branch=develop)](https://travis-ci.org/LLK/scratch-blocks)
[![Dependency Status](https://david-dm.org/LLK/scratch-blocks.svg)](https://david-dm.org/LLK/scratch-blocks)
[![devDependency Status](https://david-dm.org/LLK/scratch-blocks/dev-status.svg)](https://david-dm.org/LLK/scratch-blocks#info=devDependencies)

![](https://cloud.githubusercontent.com/assets/747641/15227351/c37c09da-1854-11e6-8dc7-9a298f2b1f01.jpg)

## Introduction
Scratch Blocks is a fork of Google's [Blockly](https://github.com/google/blockly) project that provides a design specification and codebase for building creative computing interfaces. Together with the [Scratch Virtual Machine (VM)](https://github.com/LLK/scratch-vm) this codebase allows for the rapid design and development of visual programming interfaces.

*This project is in active development and should be considered a "developer preview" at this time.*

## Two Types of Blocks

![](https://cloud.githubusercontent.com/assets/747641/15255731/dad4d028-190b-11e6-9c16-8df7445adc96.png)

Scratch Blocks brings together two different programming "grammars" that the Scratch Team has designed and continued to refine over the past decade. The standard [Scratch](https://scratch.mit.edu) grammar uses blocks that snap together vertically, much like LEGO bricks. For our [ScratchJr](https://scratchjr.org) software, intended for younger children, we developed blocks that are labelled with icons rather than words, and snap together horizontally rather than vertically. We have found that the horizontal grammar is not only friendlier for beginning programmers but also better suited for devices with small screens.

## Documentation
The "getting started" guide including [FAQ](https://scratch.mit.edu/developers#faq) and [design documentation](https://github.com/LLK/scratch-blocks/wiki/Design) can be found in the [wiki](https://github.com/LLK/scratch-blocks/wiki).

## Donate
We provide [Scratch](https://scratch.mit.edu) free of charge, and want to keep it that way! Please consider making a [donation](https://secure.donationpay.org/scratchfoundation/) to support our continued engineering, design, community, and resource development efforts. Donations of any size are appreciated. Thank you!


## Using uncompressed files in a project

We want to be able to use scratch-blocks' in other projects, so that debugging is easier and the workflow is not as invasive as when we need to compile the library, commit it to git, and then pull the updated library in the project.

#### In scratch-blocks

Uncompressed files need to be copied over to the project's directory. The 'moveUncompressedFiles' bash script takes care of this. To use the script, make a local copy of it, and rename its extension to '.sh'. You then need to edit the script so it points to the proper project folder.

Once the script is ready, you need to make sure that there is a current "blockly_vertical_uncompressed.js"; if not, run 'build.py' to generate one.

Finally, run the 'moveUncompressedFiles' script, and the files will be copied to their destination!

#### In your project

You need to make sure that the destination folder you are copying the files to is at the same level as your index file, so that it can be served properly.

You need the closure library in your project, since scratch-blocks' uncompressed files make use of it. The library folder needs to be at the same level as your project's scratch-blocks folder, where the uncompressed files are copied (and so, also at the same level as your index).

Your index.html needs to use the uncompressed versions of scratch-blocks. Remove the reference to the compressed library, and instead use the same references as in scratch-blocks' 'test/vertical_playground.html'.

Once the uncompressed files have been copied over to your project, refresh your browser, and you should see your changes!
