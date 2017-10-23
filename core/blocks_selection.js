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
 * @fileoverview Methods for drawing a selection rectangle on the workspace
 * @author obrassard@amplify.com
 */
'use strict';

goog.provide('Blockly.BlocksSelection');

goog.require('goog.math.Coordinate');
goog.require('goog.asserts');


/**
 * Class for a workspace dragger.  It moves the workspace around when it is
 * being dragged by a mouse or touch.
 * Note that the workspace itself manages whether or not it has a drag surface
 * and how to do translations based on that.  This simply passes the right
 * commands based on events.
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

    this.clearChosenBlocks();
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
    this.getSelectionIntersection();
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
  this.getSelectionIntersection_boundingBox();
};

Blockly.BlocksSelection.prototype.getSelectionIntersection_boundingBox = function() {
  var baseSvg = this.workspace_.blocksSelectionLayer.SVG_;
  var divXY = Blockly.utils.getInjectionDivXY_(this.workspace_.blocksSelectionLayer.selectionRect_);
  var allBlocks = this.workspace_.getAllBlocks();
  var currentBlock = null;
  for(var i = 0; i < allBlocks.length; i++) {
    currentBlock = allBlocks[i];
    if(currentBlock) {
      var rect = baseSvg.createSVGRect();
      rect.x = divXY.x;
      rect.y = divXY.y;
      rect.width = this.rect.width;
      rect.height = this.rect.height;

      var intersects = baseSvg.checkIntersection(currentBlock.svgPath_, rect);
      //var enclosed = baseSvg.checkEnclosure(currentBlock.svgPath_, rect);
      if(intersects) {
        this.addToChosenBlocks(currentBlock);
      }
    }
  }
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
 * OB: Clear the array of selected blocks, and set those blocks as 'not chosen'
 */
Blockly.BlocksSelection.prototype.clearChosenBlocks = function () {
  //console.trace();
  if(Blockly.BlocksSelection.blocks && Blockly.BlocksSelection.blocks.length > 0) {
    for(var i = 0; i < Blockly.BlocksSelection.blocks.length; i++) {
      if(Blockly.BlocksSelection.blocks[i]) {
        Blockly.BlocksSelection.blocks[i].setChosen(false);
      }
    }
  }
  Blockly.BlocksSelection.blocks = null;
};

/**
 * OB: Add the given block to 'chosen blocks' array, and set this block as 'chosen'
 * @param {!Blockly.Block} block The block to add and update.
 */
Blockly.BlocksSelection.prototype.addToChosenBlocks = function (block) {
  if(!Blockly.BlocksSelection.blocks) {
    Blockly.BlocksSelection.blocks = [];
  }
  if(block) {
    block.setChosen(true);
    Blockly.BlocksSelection.blocks.push(block);
  }
};