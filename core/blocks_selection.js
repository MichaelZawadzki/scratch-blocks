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
};

/**
 * Sever all links from this object.
 * @package
 */
Blockly.BlocksSelection.prototype.dispose = function() {
  this.workspace_.blocksSelectionLayer.hideRect();
  this.workspace_ = null;
  this.currentSelectXY_ = null;
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
    //console.log("Set rect @ " + this.currentSelectXY_.x + " " + this.currentSelectXY_.y);
    this.workspace_.blocksSelectionLayer.showRect(this.currentSelectXY_.x, this.currentSelectXY_.y);
  }
};

/**
 * Finish the selection.
 * @param {!goog.math.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at the start of the selection, in pixel coordinates.
 * @package
 */
Blockly.BlocksSelection.prototype.endSelection = function(currentDragDeltaXY) {
  // Make sure everything is up to date.
  this.updateSelection(currentDragDeltaXY);
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

    this.workspace_.blocksSelectionLayer.resize(selectWidth, selectHeight);
    if(currentX !== this.currentSelectXY_.x || currentY !== this.currentSelectXY_.y) {
      this.workspace_.blocksSelectionLayer.setPosition(currentX, currentY);
    }
  }
};
