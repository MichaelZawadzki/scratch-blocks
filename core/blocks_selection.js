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
 * @fileoverview Methods for dragging a workspace visually.
 * @author fenichel@google.com (Rachel Fenichel)
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

  /**
   * The workspace's metrics object at the beginning of the drag.  Contains size
   * and position metrics of a workspace.
   * Coordinate system: pixel coordinates.
   * @type {!Object}
   * @private
   */
  this.startDragMetrics_ = workspace.getMetrics();

  /**
   * The scroll position of the workspace at the beginning of the drag.
   * Coordinate system: pixel coordinates.
   * @type {!goog.math.Coordinate}
   * @private
   */
  this.startScrollXY_ = new goog.math.Coordinate(workspace.scrollX,
        workspace.scrollY);

  this.startSelectXY_ = null;

    console.log("**** Block selection created");
};

/**
 * Sever all links from this object.
 * @package
 */
Blockly.BlocksSelection.prototype.dispose = function() {
  this.workspace_ = null;
};

/**
 * Start dragging the workspace.
 * @package
 */
Blockly.BlocksSelection.prototype.startSelection = function(e, mouseDownXY) {
  this.startSelectXY_ = mouseDownXY;


  if(this.workspace_ && this.workspace_.blocksSelectionLayer) {
    var workspaceXY = this.workspace_.getOriginOffsetInPixels();
    console.log("WS x-y : " + workspaceXY.x + " " + workspaceXY.y);

    var boundingRect = this.workspace_.getInjectionDiv().getBoundingClientRect();
    console.log("Rect:");
    console.log(boundingRect);

    var selectX = this.startSelectXY_.x - boundingRect.x - workspaceXY.x; //this.startSelectXY_.x - workspaceXY.x - 60/0.75; // uh? // depends on scale?!
    var selectY = this.startSelectXY_.y - boundingRect.y - workspaceXY.y; //this.startSelectXY_.y - workspaceXY.y - 15; // uh?

    this.workspace_.blocksSelectionLayer.showRect(selectX, selectY);

    console.log(e);
    console.log("Start selection @ " + selectX + " " + selectY);
  }
};

/**
 * Finish dragging the workspace and put everything back where it belongs.
 * @param {!goog.math.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at the start of the drag, in pixel coordinates.
 * @package
 */
Blockly.BlocksSelection.prototype.endSelection = function(currentDragDeltaXY) {
  // Make sure everything is up to date.
};

/**
 * Move the workspace based on the most recent mouse movements.
 * @param {!goog.math.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at the start of the drag, in pixel coordinates.
 * @package
 */
Blockly.BlocksSelection.prototype.updateSelection = function(currentDragDeltaXY) {
  var metrics = this.startDragMetrics_;

  // var newXY = goog.math.Coordinate.sum(this.startScrollXY_, currentDragDeltaXY);

  // // Bound the new XY based on workspace bounds.
  // var x = Math.min(newXY.x, -metrics.contentLeft);
  // var y = Math.min(newXY.y, -metrics.contentTop);
  // x = Math.max(x, metrics.viewWidth - metrics.contentLeft -
  //              metrics.contentWidth);
  // y = Math.max(y, metrics.viewHeight - metrics.contentTop -
  //              metrics.contentHeight);

  // x = -x - metrics.contentLeft;
  // y = -y - metrics.contentTop;

  // this.updateScroll_(x, y);

  if(this.workspace_ && this.workspace_.blocksSelectionLayer) {
    this.workspace_.blocksSelectionLayer.resize(currentDragDeltaXY.x, currentDragDeltaXY.y);
  }

  console.log("\tdelta: " + currentDragDeltaXY.x + " " + currentDragDeltaXY.y);
};

// /**
//  * Move the scrollbars to drag the workspace.
//  * x and y are in pixels.
//  * @param {number} x The new x position to move the scrollbar to.
//  * @param {number} y The new y position to move the scrollbar to.
//  * @private
//  */
// Blockly.BlocksSelection.prototype.updateScroll_ = function(x, y) {
  
//   // [Amplify MMZ] - Option to disable hozizontal scrolling
//   if (this.workspace_.options.hideHorizontalScrollbar === true) {
//     x = undefined;
//   }

//   this.workspace_.scrollbar.set(x, y);
// };
