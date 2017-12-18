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
  if(this.workspace_ && this.workspace_.blocksSelectionLayer) {
    // Make sure everything is up to date.
    this.updateSelection(currentDragDeltaXY);
    // Find blocks that are intersecting the selection rect
    var intersectedBlocks = this.getSelectionIntersection();
    if(intersectedBlocks && intersectedBlocks.length > 0) {
      Blockly.BlocksSelection.addMultipleToChosenBlocks(intersectedBlocks);
      Blockly.BlocksSelection.createOutline();
    }
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

  selectedBlocks = selectedBlocks.concat(this.getIntersectedBlocks_lib(this.getIntersectedBlocks_boundingBox(wsBlocks)));
  selectedBlocks = selectedBlocks.concat(this.getEnclosedBlocks(wsBlocks));

  return selectedBlocks;

  // Blockly.BlocksSelection.addMultipleToChosenBlocks(selectedBlocks);
  // Blockly.BlocksSelection.createOutline();
}

/**
 * Find the intersection of workspace blocks and selection rectangle.
 * The library call to detect the intersection with SVG paths is expensive. To reduce its cost,
 * we first check which blocks are bounding-box intersecting with the selection,
 * and then use the SVG intersection detection on this reduced set ob blocks.
 */
Blockly.BlocksSelection.prototype.getEnclosedBlocks = function(blockList) {
  if(!blockList || blockList.length === 0) {
    return;
  }
  var resultBlocks = [];
  var baseSvg = this.workspace_.blocksSelectionLayer.SVG_;
  var divXY = Blockly.utils.getInjectionDivXY_(this.workspace_.blocksSelectionLayer.selectionRect_);
  var currentBlock = null;
  for(var i = 0; i < blockList.length; i++) {
    currentBlock = blockList[i];
    if(currentBlock && Blockly.BlocksSelection.isInChosenBlocks(currentBlock) === false) {
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
  return resultBlocks;
};

/**
 * Find the blocks that are intersecting the selection rectangle using the bounding box of the blocks.
 */
Blockly.BlocksSelection.prototype.getIntersectedBlocks_boundingBox = function(blockList) {
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

// Experimental function here!
Blockly.BlocksSelection.prototype.getIntersectedBlocks_lib = function(blockList) {
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
  if(Blockly.BlocksSelection.blocks && Blockly.BlocksSelection.blocks.length > 0) {
    Blockly.BlocksSelection.removeOutline();
    for(var i = 0; i < Blockly.BlocksSelection.blocks.length; i++) {
      if(Blockly.BlocksSelection.blocks[i]) {
        Blockly.BlocksSelection.blocks[i].setChosen(false);
      }
    }
  }
  //Blockly.BlocksSelection.removeOutline();

  Blockly.BlocksSelection.blocks = null;
};

/**
 * OB: Add the given block to 'chosen blocks' array, and set this block as 'chosen'
 * @param {!Blockly.Block} block The block to add and update.
 */
Blockly.BlocksSelection.addToChosenBlocks = function (block) {
  if(!Blockly.BlocksSelection.blocks) {
    Blockly.BlocksSelection.blocks = [];
  }
  if(block && !block.isShadow()) {
    block.setChosen(true);
    if(Blockly.BlocksSelection.blocks.indexOf(block) < 0) {
      Blockly.BlocksSelection.blocks.push(block);
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
 * Start the outlining process
 */
Blockly.BlocksSelection.createOutline = function() {
  Blockly.BlocksSelection.changeSvgHierarchy();
};

Blockly.BlocksSelection.removeOutline = function() {
  Blockly.BlocksSelection.restoreSvgHierarchy();
};

/**
 * --- START - OUTLINING USING 'REMEMBER CONNECTION / DISCONNECT' ---
 */

Blockly.BlocksSelection.disconnectAndMoveBlocks = function () {
  Blockly.BlocksSelection.unplugBlocks(false, true);
  var topBlock = Blockly.BlocksSelection.getTopChosenBlock();
  if(topBlock) {
    Blockly.BlocksSelection.workspace = topBlock.workspace;
    Blockly.BlocksSelection.workspace.blocksOutlineSurface.setBlocksAndShow(topBlock.svgGroup_);
  }
}

Blockly.BlocksSelection.removeOutlineReconnect = function() {
  if(Blockly.BlocksSelection.blocks && Blockly.BlocksSelection.blocks.length > 0) {
    if(Blockly.BlocksSelection.workspace) {
      var topBlockSvg = Blockly.BlocksSelection.workspace.blocksOutlineSurface.getCurrentBlock();
      Blockly.BlocksSelection.workspace.blocksOutlineSurface.clearAndHide();
      
      var canvas = Blockly.BlocksSelection.workspace.getCanvas();
      if(canvas && topBlockSvg) {
        canvas.appendChild(topBlockSvg);
      }
    }
    Blockly.BlocksSelection.clearSavedConnections();
  }
  Blockly.BlocksSelection.workspace = null;
};

Blockly.BlocksSelection.clearSavedConnections = function () {
  if(Blockly.BlocksSelection.blocks && Blockly.BlocksSelection.blocks.length > 0) {
    var curBlock;
    for(var i = 0; i < Blockly.BlocksSelection.blocks.length; i++) {
      curBlock = Blockly.BlocksSelection.blocks[i];
      if(curBlock) {
        if(curBlock.savedNextBlock != null) {
          console.log("\t*** restore connection of " + curBlock.type + " with next block " + curBlock.savedNextBlock.type);
          var target = curBlock.savedNextBlock;
          curBlock.restoreNextConnection();
          target.restorePreviousConnection();
        }
        if(curBlock.savedPreviousBlock != null) {
          console.log("\t*** restore connection of " + curBlock.type + " with prev block " + curBlock.savedPreviousBlock.type);
          var target = curBlock.savedPreviousBlock;
          curBlock.restorePreviousConnection();
          target.restoreNextConnection();
        }
      }
    }
  }
};

/**
 * --- END - OUTLINING USING 'REMEMBER CONNECTION / DISCONNECT' ---
 */


// Temp
Blockly.BlocksSelection.workspace = null;



/**
 * --- START - OUTLINING USING 'CHANGE SVG TREE' ---
 */

Blockly.BlocksSelection.changeSvgHierarchy = function () {
  // OB TODO: Cache top and bottom blocks once selection is made 
  var topBlock = Blockly.BlocksSelection.getTopChosenBlock();
  var bottomBlock = Blockly.BlocksSelection.getBottomChosenBlock();

  if(topBlock && bottomBlock) {
    Blockly.BlocksSelection.workspace = topBlock.workspace;

    var blockCanvasSvg = Blockly.BlocksSelection.workspace.getCanvas();
    var topSvg = topBlock.getSvgRoot();
    var topParentSvg = topSvg.parentNode;

    if(bottomBlock && bottomBlock.getNextBlock()) {
      var firstBottomNotChosenBlock = bottomBlock.getNextBlock();

      var xyToBottomBlock = firstBottomNotChosenBlock.getRelativeToElementXY(bottomBlock.getSvgRoot());
      Blockly.BlocksSelection.relToParent = xyToBottomBlock;

      var xy = firstBottomNotChosenBlock.getRelativeToElementXY(topParentSvg);
      topParentSvg.appendChild(firstBottomNotChosenBlock.getSvgRoot());
      firstBottomNotChosenBlock.translate(xy.x, xy.y);

    } else {
      //console.log("No last block");
    }

    var xyToCanvas = topBlock.getRelativeToElementXY(blockCanvasSvg);
    var xyToParent = topBlock.getRelativeToElementXY(topParentSvg);
    Blockly.BlocksSelection.workspace.blocksOutlineSurface.setBlocksAndShow(topSvg);
    Blockly.BlocksSelection.workspace.blocksOutlineSurface.translateSurface(xyToCanvas.x - xyToParent.x, xyToCanvas.y - xyToParent.y);

    var nextToBottomBlock = bottomBlock.getNextBlock();

  }
  else {
    //console.log("no top block selected....");
  }

  if(Blockly.BlocksSelection.workspace) {
  }
};

Blockly.BlocksSelection.relToParent = null;

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
      var outlineSvg = Blockly.BlocksSelection.workspace.blocksOutlineSurface.getCurrentBlock();
      Blockly.BlocksSelection.workspace.blocksOutlineSurface.clearAndHide();

      parentSvg.appendChild(outlineSvg);

      var nextBottomBlock = bottomBlock.getNextBlock();
      if(nextBottomBlock) {
        nextBottomBlock.clearTransformAttributes_();
        bottomBlock.getSvgRoot().appendChild(nextBottomBlock.getSvgRoot());
        nextBottomBlock.translate(Blockly.BlocksSelection.relToParent.x, Blockly.BlocksSelection.relToParent.y);
        Blockly.BlocksSelection.relToParent = null;
      }
    }
  }
}
/**
 * --- END - OUTLINING USING 'CHANGE SVG TREE' ---
 */