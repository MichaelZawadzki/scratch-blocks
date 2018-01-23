/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2017 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Methods for selecting and outlining blocks
 * @author obrassard@amplify.com
 */
'use strict';

goog.provide('Blockly.BlocksSelection');

goog.require('goog.math.Coordinate');
goog.require('goog.asserts');

/**
 * Class for a workspace block selection.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace to drag.
 * @constructor
 */
Blockly.BlocksSelection = function(workspace) {
  /**
   * @type {!Blockly.WorkspaceSvg}
   * @private
   */
  this.workspace_ = workspace;

  // /**
  //  * The workspace's metrics object at the beginning of the drag.  Contains size
  //  * and position metrics of a workspace.
  //  * Coordinate system: pixel coordinates.
  //  * @type {!Object}
  //  * @private
  //  */
  // this.startDragMetrics_ = workspace.getMetrics();

  /**
   * Where the selection was started.
   * @type {!goog.math.Coordinate} the XY coordinate.
   */
  this.startSelectXY_ = null;

  /**
   * The current XY position of the selection tool (aka touch/mouse).
   * @type {!goog.math.Coordinate} the XY coordinate.
   */
  this.currentSelectXY_ = null;

  this.rect = null;

  Blockly.BlocksSelection.instance = this;
};

/**
 * Sever all links from this object.
 * @package
 */
Blockly.BlocksSelection.prototype.dispose = function() {
  if(this.workspace_ && this.workspace_.blocksSelectionLayer) {
    this.workspace_.blocksSelectionLayer.hideRect();
  }
  this.workspace_ = null;
  this.startSelectXY_ = null;
  this.currentSelectXY_ = null;
  this.rect = null;

  Blockly.BlocksSelection.blockSelectionInstance = null;
};

/**
 * Start the selection rect.
 * @package
 */
Blockly.BlocksSelection.prototype.startSelection = function(e, mouseDownXY) {
  this.startSelectXY_ = mouseDownXY;
  if(this.workspace_ && this.workspace_.blocksSelectionLayer) {
    // Finds the position of the injection div on the page
    var boundingRect = this.workspace_.getInjectionDiv().getBoundingClientRect();
    // Get x/y of bounding rect;
    // On iPad (safari?), rect is left/top instead of x/y
    var boundingX = boundingRect.x ? boundingRect.x : boundingRect.left;
    var boundingY = boundingRect.y ? boundingRect.y : boundingRect.top;
    // Finds the workspace x/y offests relative to injection div
    var workspaceXY = this.workspace_.getOriginOffsetInPixels();
    var selectX = (this.startSelectXY_.x - boundingX - workspaceXY.x);
    var selectY = (this.startSelectXY_.y - boundingY - workspaceXY.y);
    this.currentSelectXY_ = new goog.math.Coordinate(selectX, selectY);

    this.rect = {};
    this.updateRectPosition(this.currentSelectXY_.x, this.currentSelectXY_.y);
    this.updateRectSize(0, 0);

    //console.log("Set rect @ " + this.currentSelectXY_.x + " " + this.currentSelectXY_.y);
    this.workspace_.blocksSelectionLayer.showRect(this.currentSelectXY_.x, this.currentSelectXY_.y);

    Blockly.BlocksSelection.clearChosenBlocks();
  }
};

/**
 * Finish the selection.
 * @param {!goog.math.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at the start of the selection, in pixel coordinates.
 * @package
 */
Blockly.BlocksSelection.prototype.endSelection = function(currentDragDeltaXY) {
  var doCallback = false;
  if(this.workspace_ && this.workspace_.blocksSelectionLayer) {
    // Make sure everything is up to date.
    this.updateSelection(currentDragDeltaXY);
    // Find blocks that are intersecting the selection rect
    var intersectedBlocks = this.getSelectionIntersection();
    if(intersectedBlocks && intersectedBlocks.length > 0) {
      var topBlocks = Blockly.BlocksSelection.getTopBlocksInList(intersectedBlocks);
      if(topBlocks && topBlocks.length > 0) {
        Blockly.BlocksSelection.addToChosenBlocksUsingTopBlocks(topBlocks[0], intersectedBlocks, true);
      }
      else {
        Blockly.BlocksSelection.addMultipleToChosenBlocks(intersectedBlocks);
      }
      doCallback = true;

      Blockly.BlocksSelection.createOutline();
    }
  }

  if(doCallback && Blockly.BlocksSelection.onAddChosenBlocksCallback) {
    Blockly.BlocksSelection.onAddChosenBlocksCallback();
  }
};

/**
 * Resize the selection rectangle based on how much the mouse has moved
 * compared to the initial touch.
 * @param {!goog.math.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at the start of the selection, in pixel coordinates.
 * @package
 */
Blockly.BlocksSelection.prototype.updateSelection = function(currentDragDeltaXY) {
  //var metrics = this.startDragMetrics_;
  if(this.workspace_ && this.workspace_.blocksSelectionLayer) {
    var selectWidth = currentDragDeltaXY.x;
    var selectHeight = currentDragDeltaXY.y;
    var currentX = this.currentSelectXY_.x;
    var currentY = this.currentSelectXY_.y;
    if(selectWidth < 0) {
      currentX = this.currentSelectXY_.x + selectWidth;
      selectWidth = -selectWidth;
    }
    if(selectHeight < 0) {
      currentY = this.currentSelectXY_.y + selectHeight;
      selectHeight = -selectHeight;
    }
    this.updateRectSize(selectWidth, selectHeight);
    this.workspace_.blocksSelectionLayer.resize(selectWidth, selectHeight);
    if(currentX !== this.currentSelectXY_.x || currentY !== this.currentSelectXY_.y) {
      this.updateRectPosition(currentX, currentY);
      this.workspace_.blocksSelectionLayer.setPosition(currentX, currentY);
    }
  }
};

/**
 * Updates the position of the selection rectangle, 
 * so we always have it tracked with no calculations needed
 * @param {!element} newX, the x position of the rectangle.
 * @param {!element} newY, the y position of the rectangle.
 */
Blockly.BlocksSelection.prototype.updateRectPosition = function (newX, newY) {
  if(newX !== null) {
    this.rect.x = newX;
  }
  if(newY !== null) {
    this.rect.y = newY;
  }
};

/**
 * Updates the size of the selection rectangle, 
 * so we always have it tracked with no calculations needed.
 * @param {!element} newW, the width rectangle.
 * @param {!element} newW, the height rectangle.
 */
Blockly.BlocksSelection.prototype.updateRectSize = function (newW, newH) {
  if(newW !== null) {
    this.rect.width = newW;
  }
  if(newH !== null) {
    this.rect.height = newH;
  }
};

Blockly.BlocksSelection.prototype.getSelectionIntersection = function() {
  var startTime = Date.now();

  var intersectedBlocks = this.getSelectionIntersectionWorkspaceBlocks();

  var deltaTime = Date.now() - startTime;
  //console.log("TOTAL Selection time: " + deltaTime + " ms");

  return intersectedBlocks;
};

/**
 * Find the intersection of workspace blocks and selection rectangle.
 * The library call to detect the intersection with SVG paths is expensive. To reduce its cost,
 * we first check which blocks are bounding-box intersecting with the selection,
 * and then use the SVG intersection detection on this reduced set ob blocks.
 */
Blockly.BlocksSelection.prototype.getSelectionIntersectionWorkspaceBlocks = function() {
  var wsBlocks = this.workspace_.getAllBlocks();
  var selectedBlocks = [];

  selectedBlocks = selectedBlocks.concat(this.getIntersectedBlocks_lib(this.getIntersectedBlocks_boundingBox(wsBlocks, true), true));
  selectedBlocks = selectedBlocks.concat(this.getEnclosedBlocks(wsBlocks, true));

  // selectedBlocks = selectedBlocks.concat(this.getIntersectedBlocks_lib(this.getIntersectedBlocks_boundingBox(wsBlocks, true), true));
  // selectedBlocks = selectedBlocks.concat(this.getEnclosedBlocks(wsBlocks, true));
  // // OB TEMP: find top blocks of multiple stacks
  // var topBlocks = Blockly.BlocksSelection.getTopBlocksInList(selectedBlocks);
  // if(topBlocks && topBlocks.length > 0) {
  //   Blockly.BlocksSelection.addToChosenBlocksUsingTopBlocks(topBlocks[0], selectedBlocks, true);
  // }

  return selectedBlocks;
};

Blockly.BlocksSelection.prototype.getEnclosedBlocks = function(blockList, removeShadow) {
  if(!blockList || blockList.length === 0) {
    return;
  }
  var resultBlocks = [];
  var baseSvg = this.workspace_.blocksSelectionLayer.SVG_;
  var divXY = Blockly.utils.getInjectionDivXY_(this.workspace_.blocksSelectionLayer.selectionRect_);
  var currentBlock = null;
  for(var i = 0; i < blockList.length; i++) {
    currentBlock = blockList[i];
    if(currentBlock)
    {
      if(currentBlock.canChoose() === false || removeShadow && currentBlock.isShadow())
        continue;
      if(Blockly.BlocksSelection.isInChosenBlocks(currentBlock) === false) {
        var rect = baseSvg.createSVGRect();
        rect.x = divXY.x;
        rect.y = divXY.y;
        rect.width = this.rect.width;
        rect.height = this.rect.height;

        var enclosed = baseSvg.checkEnclosure(currentBlock.svgPath_, rect);
        if(enclosed) {
          resultBlocks.push(currentBlock);
        }
      }
    }
  }
  return resultBlocks;
};

/**
 * Find the blocks that are intersecting the selection rectangle using the bounding box of the blocks.
 */
Blockly.BlocksSelection.prototype.getIntersectedBlocks_boundingBox = function(blockList, removeShadow) {
  if(!blockList || blockList.length === 0) {
    return;
  }
  var resultBlocks = [];
  var baseSvg = this.workspace_.blocksSelectionLayer.SVG_;
  var divXY = Blockly.utils.getInjectionDivXY_(this.workspace_.blocksSelectionLayer.selectionRect_);
  var currentBlock = null;
  for(var i = 0; i < blockList.length; i++) {
    currentBlock = blockList[i];
    if(currentBlock) {
      if(currentBlock.canChoose() === false || removeShadow && currentBlock.isShadow())
        continue;
      var rect = baseSvg.createSVGRect();
      rect.x = divXY.x;
      rect.y = divXY.y;
      rect.width = this.rect.width;
      rect.height = this.rect.height;

      var intersects = baseSvg.checkIntersection(currentBlock.svgPath_, rect);
      if(intersects) {
        resultBlocks.push(currentBlock);
      }
    }
  }
  return resultBlocks;
};

Blockly.BlocksSelection.prototype.getIntersectedBlocks_lib = function(blockList, removeShadow) {
  if(!blockList || blockList.length === 0) {
    return;
  }
  var resultBlocks = [];
  // Create selection rectangle shape get find its transform matrix
  var rectangleShape = IntersectionParams.newShape("rect", {x: this.rect.x, y: this.rect.y, width: this.rect.width, height: this.rect.height});
  var rectangleMatrix = this.workspace_.blocksSelectionLayer.selectionRect_.getCTM();

  // Check all blocks to see if they intersect
  var currentBlock = null;
  for(var i = 0; i < blockList.length; i++) {
    currentBlock = blockList[i];
    if(currentBlock) {
      if(currentBlock.canChoose() === false || removeShadow && currentBlock.isShadow())
        continue;
      // Create path shape
      var blockPath = currentBlock.svgPath_;
      var pathDefinition = blockPath.getAttribute("d");
      var pathShape = IntersectionParams.newShape("path", {d: pathDefinition});
      var pathMatrix = blockPath.getCTM();
      // Find intersection between select shape and block shape
      var intersections = intersect(
        rectangleShape,
        pathShape, 
        new Matrix2D(rectangleMatrix.a, rectangleMatrix.b, rectangleMatrix.c, rectangleMatrix.d, rectangleMatrix.e, rectangleMatrix.f),
        new Matrix2D(pathMatrix.a, pathMatrix.b, pathMatrix.c, pathMatrix.d, pathMatrix.e, pathMatrix.f),
      );
      // Add block to 'chosen' if it intersects
      var intersects = (intersections != null && intersections.points.length > 0);
      if(currentBlock && intersects) {
        resultBlocks.push(currentBlock);
      }
    }
  }
  return resultBlocks;
};

// x,y,width,height format
Blockly.BlocksSelection.isIntersecting = function (rectA, rectB) {
  return ! ( rectB.x > (rectA.x + rectA.width)
    || (rectB.x + rectB.width) < rectA.x
    || rectB.y > (rectA.y + rectA.height)
    || (rectB.y + rectB.height) < rectA.y
    );
};


/**
 * OB: Array of selected blocks
 * @type {!Array.<!Blockly.Block>}
 */
Blockly.BlocksSelection.blocks = null;

/**
 * OB: Callback for when chosen blocks are cleared
 */
Blockly.BlocksSelection.onClearChosenBlocksCallback = null;

/**
 * OB: Callback for when blocks are added to chosen blocks
 */
Blockly.BlocksSelection.onAddChosenBlocksCallback = null;

/**
 * OB: Function to set the callback for when blocks are cleared
 */
Blockly.BlocksSelection.setOnclearChosenBlocksCallback = function (_fn) {
  Blockly.BlocksSelection.onClearChosenBlocksCallback = _fn;
};

/**
 * OB: Function to set the callback for when blocks are added
 */
Blockly.BlocksSelection.setOnAddChosenBlocksCallback = function (_fn) {
  Blockly.BlocksSelection.onAddChosenBlocksCallback = _fn;
};

/**
 * OB: Choose and outline just one block at a time.
 * Used when clicking on a block.
 * @param {!Blockly.Block} block The block to add.
 */
Blockly.BlocksSelection.selectOneBlock = function (_block) {
  Blockly.BlocksSelection.addToChosenBlocks(_block, true);
  Blockly.BlocksSelection.createOutline();

  if(Blockly.BlocksSelection.onAddChosenBlocksCallback) {
    Blockly.BlocksSelection.onAddChosenBlocksCallback();
  }
};

/**
 * Are there any selected blocks
 */
Blockly.BlocksSelection.hasBlocks = function () {
  if(Blockly.BlocksSelection.blocks != null && Blockly.BlocksSelection.blocks.length > 0) {
    return true;
  }
  return false;
};

/**
 * OB: Clear the array of selected blocks, and set those blocks as 'not chosen'
 */
Blockly.BlocksSelection.clearChosenBlocks = function () {
  var doCallback = false;
  if(Blockly.BlocksSelection.blocks && Blockly.BlocksSelection.blocks.length > 0) {
    Blockly.BlocksSelection.removeOutline();
    for(var i = 0; i < Blockly.BlocksSelection.blocks.length; i++) {
      if(Blockly.BlocksSelection.blocks[i]) {
        Blockly.BlocksSelection.blocks[i].setChosen(false);
      }
    }
    doCallback = true;
  }
  Blockly.BlocksSelection.blocks = null;

  if(doCallback && Blockly.BlocksSelection.onClearChosenBlocksCallback) {
    Blockly.BlocksSelection.onClearChosenBlocksCallback();
  }
};

/**
 * OB: Add the given block to 'chosen blocks' array, and set this block as 'chosen'
 * @param {!Blockly.Block} block The block to add and update.
 */
Blockly.BlocksSelection.addToChosenBlocks = function (block, addInputBlocks) {
  if(!Blockly.BlocksSelection.blocks) {
    Blockly.BlocksSelection.blocks = [];
  }
  if(block && !block.isShadow()) {
    block.setChosen(true);
    if(Blockly.BlocksSelection.blocks.indexOf(block) < 0) {
      Blockly.BlocksSelection.blocks.push(block);
    }
    // OB [CSI-702]: Add input blocks if user clicked on a block with input slots
    if(addInputBlocks === true) {
      for(var i = 0; i < block.inputList.length; i++) {
        var input = block.inputList[i];
        if (input && input.type === Blockly.INPUT_VALUE) {
          if(input.connection && input.connection.targetConnection && input.connection.targetConnection.sourceBlock_) {
            Blockly.BlocksSelection.addToChosenBlocks(input.connection.targetConnection.sourceBlock_, true);
          }
        }
      }
    }
  }
};

Blockly.BlocksSelection.addMultipleToChosenBlocks = function (blockList) {
  if(!blockList || blockList.length === 0) {
    return;
  }
  if(!Blockly.BlocksSelection.blocks) {
    Blockly.BlocksSelection.blocks = [];
  }
  for(var i = 0; i < blockList.length; i++) {
    Blockly.BlocksSelection.addToChosenBlocks(blockList[i]);
  }
}

/**
 * Starting for the top block of a stack, sets sub-blocks of stack to 'chosen' if they were
 * in the list of selected blocks.
 */
Blockly.BlocksSelection.addToChosenBlocksUsingTopBlocks = function (topBlock, blockList, addChildrenStack) {
  if(!topBlock || !blockList || blockList.length === 0) {
    return;
  }
  var currentBlock = topBlock;
  while(currentBlock && blockList.includes(currentBlock)) {
    // Add current block
    Blockly.BlocksSelection.addToChosenBlocks(currentBlock);
    // Add any sub-stack blocks (in C or E blocks, for example)
    if(addChildrenStack === true) {
      Blockly.BlocksSelection.addSubstackBlocks(currentBlock);
    }
    // Get next block in sequence
    currentBlock = currentBlock.getNextBlock();
  }
};

/**
 * Adds the all sub-blocks nested under the current block.
 * Goes through the current block, and then all sub-blocks of current block so we get all
 * the blocks at all sub-levels. 
 */
Blockly.BlocksSelection.addSubstackBlocks = function (block) {
  var childrenStack = block.getChildrenStack(true);
  if(childrenStack && childrenStack.length > 0) {
    Blockly.BlocksSelection.addMultipleToChosenBlocks(childrenStack);
    for(var i = 0; i < childrenStack.length; i++) {
      Blockly.BlocksSelection.addSubstackBlocks(childrenStack[i]);
    }
  }
};


/**
 * OB: Add the given block to 'chosen blocks' array, and set this block as 'chosen'
 * @param {!Blockly.Block} block The block to add and update.
 */
Blockly.BlocksSelection.isInChosenBlocks = function (block) {
  if(Blockly.BlocksSelection.blocks && Blockly.BlocksSelection.blocks.length > 0) {
    for(var i = 0; i < Blockly.BlocksSelection.blocks.length; i++) {
      if(Blockly.BlocksSelection.blocks[i] === block) {
        return true;
      }
    }
  }
  return false;
};

/*
 * Removes a block and its inputs from the list of chosen blocks.
 * @param {!Blockly.Block} block The block to remove.
 */
Blockly.BlocksSelection.removeFromChosenBlocks = function (block) {
  if(Blockly.BlocksSelection.blocks && block) {
    // Remove block's input blocks
    var input = null;
    for(var i = 0; i < block.inputList.length; i++) {
      input = block.inputList[i];
      if(input && input.connection && input.connection.targetConnection && input.connection.targetConnection.sourceBlock_) {
        //Blockly.BlocksSelection.removeBlock(input.connection.targetConnection.sourceBlock_);
        Blockly.BlocksSelection.removeFromChosenBlocks(input.connection.targetConnection.sourceBlock_);
      }
    }
    // Remove actual block
    Blockly.BlocksSelection.removeBlock(block);
  }
};

/**
 * Removes just one specific block from the list of chosen blocks. Also unsets the chosen state of this blocks.
 * @param {!Blockly.Block} block The block to remove and update.
 */
Blockly.BlocksSelection.removeBlock = function (block) {
  if(Blockly.BlocksSelection.blocks && block) {
    block.setChosen(false);
    for (var i = 0; i < Blockly.BlocksSelection.blocks.length; i++) {
      if (Blockly.BlocksSelection.blocks[i] === block) {
        Blockly.BlocksSelection.blocks.splice(i, 1);
        break;
      }
    }
  }
};

/**
 * OB: Instance of block selection
 */
Blockly.BlocksSelection.blockSelectionInstance = null;

/**
 * OB: Return instance of block selection
 */
Blockly.BlocksSelection.getBlockSelectionInstance = function () {
  return Blockly.BlocksSelection.blockSelectionInstance;
};

/**
 * OB TODO
 * Need a better way to determine this. If a selection rectangle intersects only one block,
 * it will not pass this test.
 */
Blockly.BlocksSelection.isDraggingChosenBlocks = function () {
  return (Blockly.BlocksSelection.hasBlocks() === true && Blockly.BlocksSelection.blocks.length > 0);
};





Blockly.BlocksSelection.initBlockDragging = function() {
  Blockly.BlocksSelection.removeOutline();
};

/**
 * Disconnects chosen blocks from previous/next un-chosen blocks
 */
Blockly.BlocksSelection.unplugBlocks = function(opt_healStack, opt_saveConnections) {

  if(Blockly.BlocksSelection.blocks && Blockly.BlocksSelection.blocks.length > 0) {
    var blocksToUnplug = Blockly.BlocksSelection.blocks.slice(0, Blockly.BlocksSelection.blocks.length);
  
    var prevTarget = null;
    var nextTarget = null;
    var currentBlock = null;
    for(var i = 0; i < blocksToUnplug.length; i++) {
      currentBlock = blocksToUnplug[i];
      if(currentBlock) {
        // 1- Find block atop this one that is not 'chosen'; disconnect
        var lastChosenAbove = currentBlock;
        var prevBlock = lastChosenAbove.getPreviousBlock();
        while(lastChosenAbove && prevBlock && prevBlock.isChosen_) {
          lastChosenAbove = prevBlock;
          prevBlock = lastChosenAbove.getPreviousBlock();
        }

        if(lastChosenAbove) {
          if(lastChosenAbove.previousConnection && lastChosenAbove.previousConnection.isConnected()) {
            prevTarget = lastChosenAbove.previousConnection.targetConnection;
            lastChosenAbove.previousConnection.disconnect();
          }
        }

        // 2- Find block below this one that is not 'chosen'; disconnect
        var lastChosenBelow = currentBlock;
        var nextBlock = lastChosenBelow.getNextBlock();
        while(lastChosenBelow && nextBlock && nextBlock.isChosen_) {
          lastChosenBelow = nextBlock;
          nextBlock = lastChosenBelow.getNextBlock();
        }

        if(lastChosenBelow) {
          if(lastChosenBelow.nextConnection && lastChosenBelow.nextConnection.isConnected()) {
            nextTarget = lastChosenBelow.nextConnection.targetConnection;
            lastChosenBelow.nextConnection.disconnect();
          }
        }
      }
    }

    if(opt_healStack && prevTarget && nextTarget) {
      prevTarget.connect(nextTarget);
    }
  }
};

/**
 * Gets the top-most block in a stack of blocks
 * OB: Assumptions:
 * - contiguous blocks
 * - only one stack of blocks
 * - if a C or E blocks is selected, ALL of its content is selected
 */ 
Blockly.BlocksSelection.getTopChosenBlock = function () {
  var lastChosenAbove = null; 
  if(Blockly.BlocksSelection.blocks && Blockly.BlocksSelection.blocks.length > 0) {
    var currentBlock = null;
    for(var i = 0; i < Blockly.BlocksSelection.blocks.length; i++) {
      currentBlock = Blockly.BlocksSelection.blocks[i];
      if(currentBlock) {
        lastChosenAbove = currentBlock;
        var prevBlock = lastChosenAbove.getPreviousBlock();
        while(lastChosenAbove && prevBlock && prevBlock.isChosen_) {
          lastChosenAbove = prevBlock;
          prevBlock = lastChosenAbove.getPreviousBlock();
        }
      }
      if(lastChosenAbove) {
        return lastChosenAbove;
      }
    }
  }
  // No block found
  return null;
};

/**
 * Gets the bottom-most block in a stack of blocks
 * OB: Assumptions:
 * - contiguous blocks
 * - only one stack of blocks
 * - if a C or E blocks is selected, ALL of its content is selected
 */ 
Blockly.BlocksSelection.getBottomChosenBlock = function () {
  var lastChosenBelow = null;
  if(Blockly.BlocksSelection.blocks && Blockly.BlocksSelection.blocks.length > 0) {
    var currentBlock = null;
    for(var i = 0; i < Blockly.BlocksSelection.blocks.length; i++) {
      currentBlock = Blockly.BlocksSelection.blocks[i];
      if(currentBlock) {
        lastChosenBelow = currentBlock;
        while(currentBlock != null && currentBlock.isChosen_) {
          lastChosenBelow = currentBlock;
          currentBlock = currentBlock.getNextBlock();
        }
      }

      if(lastChosenBelow) {
        return lastChosenBelow;
      }
    } 
  }
  // No block found
  return null;
};


/**
 * Finds all the top-of-stack blocks from a bunch of blocks.
 * Goes through every block and follows the 'previous block' link to find the top block
 * that is in the list of currently selected blocks.
 * TODO: Optimize by marking blocks as 'seen' so we don't process them again
 */
Blockly.BlocksSelection.getTopBlocksInList = function (_blockList) {
  var topBlocks = [];
  if(_blockList && _blockList.length > 0) {
    var currentBlock = null;
    for(var i = 0; i < _blockList.length; i++) {
      currentBlock = _blockList[i];
      var lastChosenAbove = null;
      if(currentBlock) {
        lastChosenAbove = currentBlock;
        var prevBlock = lastChosenAbove.getPreviousBlock();
        while(lastChosenAbove && prevBlock && _blockList.includes(prevBlock)) {
          lastChosenAbove = prevBlock;
          prevBlock = lastChosenAbove.getPreviousBlock();
        }
      }
      if(lastChosenAbove) {
        if(topBlocks.includes(lastChosenAbove) === false) {
          topBlocks.push(lastChosenAbove);
        }
      }
    }
  }
  return topBlocks;
};

/**
 * Start the outlining process
 */
Blockly.BlocksSelection.createOutline = function() {
  Blockly.BlocksSelection.changeSvgHierarchy();
};

Blockly.BlocksSelection.removeOutline = function() {
  Blockly.BlocksSelection.restoreSvgHierarchy();
};


// Temp
Blockly.BlocksSelection.workspace = null;



/**
 * --- START - OUTLINING USING 'CHANGE SVG TREE' ---
 */

Blockly.BlocksSelection.relToParentBlock = null;
Blockly.BlocksSelection.relToEnclosing = null;
Blockly.BlocksSelection.surfaceTranslate = null;

/**
 * Change the svg hierarchy of the workspace so that blocks that need to be outlined
 * are moved to the outline surface
 */
Blockly.BlocksSelection.changeSvgHierarchy = function () {
  // OB TODO: Cache top and bottom blocks once selection is made 
  var topBlock = Blockly.BlocksSelection.getTopChosenBlock();
  var bottomBlock = Blockly.BlocksSelection.getBottomChosenBlock();

  var blockCanvasSvg = null;
  var topSvg = null;
  var topParentSvg = null;
  if(topBlock) {
    Blockly.BlocksSelection.workspace = topBlock.workspace;
    blockCanvasSvg = Blockly.BlocksSelection.workspace.getCanvas();
    topSvg = topBlock.getSvgRoot();
    topParentSvg = topSvg.parentNode;

    // 1- Move non-chosen children out of chosen hierarchy
    Blockly.BlocksSelection.changeChildrenSubstackHierarchy(topBlock, topParentSvg);
    // 2- Move post chosen stack out of chosen hierarchy
    Blockly.BlocksSelection.changeAfterBottomHierarchy(bottomBlock, topParentSvg);
    // 3- Move chosen blocks to outline surface
    var xyToCanvas = topBlock.getRelativeToElementXY(blockCanvasSvg);
    var xyToParent = topBlock.getRelativeToElementXY(topParentSvg);
    Blockly.BlocksSelection.workspace.blocksOutlineSurface.setBlocksAndShow(topSvg);
    // OB: Don't translate the outline surface; instead, translate the top block inside the surface
    // Translating the surface was causing issues
    //Blockly.BlocksSelection.workspace.blocksOutlineSurface.translateSurface(xyToCanvas.x - xyToParent.x, xyToCanvas.y - xyToParent.y);
    Blockly.BlocksSelection.surfaceTranslate = new goog.math.Coordinate(xyToCanvas.x - xyToParent.x, xyToCanvas.y - xyToParent.y);
    topBlock.translateBy(Blockly.BlocksSelection.surfaceTranslate.x, Blockly.BlocksSelection.surfaceTranslate.y);
  }
};

/**
 * Go through chosen blocks and check if there are children blocks nested under them.
 * If there are, check to see if they are chosen:
 *  - if YES, keep them in SVG hierarchy;
 *  - if NO, move them out and nest them under the top parent.
 * @param {!Blockly.Block} topBlock The first block in the stack of chosen blocks.
 * @param {Blockly.BlockSvg} topParentSvg The svg of the element under which the top block is nested.
 */
Blockly.BlocksSelection.changeChildrenSubstackHierarchy = function (topBlock, topParentSvg) {
  if(!topBlock || !topParentSvg) {
    return;
  }
  var curBlock = topBlock;
  var childrenBlocks = null;
  Blockly.BlocksSelection.relToEnclosing = [];
  // For each block, check if it has children
  while(curBlock) {
    var childrenBlocks = curBlock.getChildren();
    var curChildBlock = null;
    if(childrenBlocks && childrenBlocks.length > 0) {
      for(var i = 0; i < childrenBlocks.length; i++) {
        curChildBlock = childrenBlocks[i];
        if(curChildBlock && !curChildBlock.isShadow() && curBlock.getNextBlock() != curChildBlock && !Blockly.BlocksSelection.isInChosenBlocks(curChildBlock)) {
          // Find and remember x/y relative to parent block
          // Is there a way to just re-calculate this instead of remembering it?
          var xyToEnclosingBlock = curChildBlock.getRelativeToElementXY(curBlock.getSvgRoot());
          Blockly.BlocksSelection.relToEnclosing.unshift(xyToEnclosingBlock);
          // Nest and translate child block under parent of top block
          var xy = curChildBlock.getRelativeToElementXY(topParentSvg);
          topParentSvg.appendChild(curChildBlock.getSvgRoot());
          curChildBlock.translate(xy.x, xy.y);
        }
      }
    }
    curBlock = curBlock.getNextBlock();
  }
};

/**
 * Take the first block after the chosen sub-stack and move it out of the SVG hierarchy;
 * nest it under the parent element of the first chosen block in the substack.
 * @param {!Blockly.Block} bottomBlock The last block in the stack of chosen blocks.
 * @param {Blockly.BlockSvg} topParentSvg The svg of the element under which the top chosen block is nested.
 */
Blockly.BlocksSelection.changeAfterBottomHierarchy = function (bottomBlock, topParentSvg) {
  if(!bottomBlock || !topParentSvg) {
    return;
  }
  if(bottomBlock.getNextBlock()) {
    var xyToBottomBlock = bottomBlock.detachNextBlockSvg(topParentSvg, true);
    Blockly.BlocksSelection.relToParentBlock = xyToBottomBlock;
  }
};

/**
 * Restore the svg hierarchy of the workspace so that blocks that were outlined
 * are moved back to the workspace hierarchy, in the proper order and nested under the proper parent
 */
Blockly.BlocksSelection.restoreSvgHierarchy = function () {
  if(Blockly.BlocksSelection.blocks && Blockly.BlocksSelection.blocks.length > 0) {
    if(Blockly.BlocksSelection.workspace && Blockly.BlocksSelection.workspace.blocksOutlineSurface.hasBlocks_) {
      var topBlock = Blockly.BlocksSelection.getTopChosenBlock();
      var bottomBlock = Blockly.BlocksSelection.getBottomChosenBlock();
      var parentBlock = topBlock.getParent();
      var parentSvg = null;
      if(parentBlock) {
        parentSvg = parentBlock.getSvgRoot();
      }
      else {
        parentSvg = Blockly.BlocksSelection.workspace.getCanvas();
      }

      // Un-translate top block
      topBlock.translateBy(-Blockly.BlocksSelection.surfaceTranslate.x, -Blockly.BlocksSelection.surfaceTranslate.y);
      // 1- Move chosen blocks back to main svg hierarchy
      var outlineSvg = Blockly.BlocksSelection.workspace.blocksOutlineSurface.getCurrentBlock();
      Blockly.BlocksSelection.workspace.blocksOutlineSurface.clearAndHide();
      parentSvg.appendChild(outlineSvg);
      // 2- Restore post chosen stack in main hierarchy
      Blockly.BlocksSelection.restoreAfterBottomHierarchy(bottomBlock);
      // 3- Restore non-chosen children in their enclosing block's hierarchy
      Blockly.BlocksSelection.restoreChildrenSubstackHierarchy(topBlock);
    }
  }
};

/**
 * Go through chosen blocks and check if there are children blocks nested under them.
 * If there are, check to see if they are chosen:
 *  - if YES, do nothing, they are on the outline surface and will be moved back to main svg hierachy normally
 *  - if NO, move them to the outline surface, so that they can later be moved back to main svg hierachy.
 * @param {!Blockly.Block} topBlock The first block in the stack of chosen blocks.
 */
Blockly.BlocksSelection.restoreChildrenSubstackHierarchy = function (topBlock) {
  var curBlock = topBlock;
  var childrenBlocks = null;
  while(curBlock) {
    var childrenBlocks = curBlock.getChildren();
    var curChildBlock = null;
    if(childrenBlocks && childrenBlocks.length > 0) {
      for(var i = 0; i < childrenBlocks.length; i++) {
        curChildBlock = childrenBlocks[i];
        if(curChildBlock && curChildBlock.isShadow() === false && curBlock.getNextBlock() != curChildBlock && Blockly.BlocksSelection.isInChosenBlocks(curChildBlock) === false) {
          curChildBlock.clearTransformAttributes_();
          curBlock.getSvgRoot().appendChild(curChildBlock.getSvgRoot());
          var relXY = Blockly.BlocksSelection.relToEnclosing.pop();
          curChildBlock.translate(relXY.x, relXY.y);
        }
      }
    }
    curBlock = curBlock.getNextBlock();
  }
  Blockly.BlocksSelection.relToEnclosing = null;

};

/**
 * Restore the svg of the first block after the chosen sub-stack under the last chosen block
 * @param {!Blockly.Block} bottomBlock The last block in the stack of chosen blocks.
 */
Blockly.BlocksSelection.restoreAfterBottomHierarchy = function (bottomBlock) {
  if(!bottomBlock) {
    return;
  }
  bottomBlock.reatachNextBlockSvg(Blockly.BlocksSelection.relToParentBlock);
  Blockly.BlocksSelection.relToParentBlock = null;
};

/**
 * --- END - OUTLINING USING 'CHANGE SVG TREE' ---
 */


/**
 * Duplicate currently chosen blocks.
 */
Blockly.BlocksSelection.duplicateBlocks = function () {
  if(Blockly.BlocksSelection.hasBlocks() === true) {
    var topBlock = Blockly.BlocksSelection.getTopChosenBlock();
    var duplicatedTopBlock = null;
    var newBlocksList = null;
    if(topBlock) {
      duplicatedTopBlock = Blockly.duplicate_(topBlock, true);
      if(duplicatedTopBlock) {
        Blockly.BlocksSelection.clearChosenBlocks();
        // We only have the block. Need to get all descendants of the top block.
        newBlocksList = duplicatedTopBlock.getDescendants(false);
        if(newBlocksList) {
          // Add all blocks to chosen block list; the adding function will take care of not adding shadow blocks.
          Blockly.BlocksSelection.addMultipleToChosenBlocks(newBlocksList);
          // Create outline on new chosen block list
          Blockly.BlocksSelection.createOutline();
        }
      }
      
      if(Blockly.BlocksSelection.onAddChosenBlocksCallback) {
        Blockly.BlocksSelection.onAddChosenBlocksCallback();
      }
    }
  }
};