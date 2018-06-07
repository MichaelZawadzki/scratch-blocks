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
 * @fileoverview The class representing an in-progress gesture, usually a drag
 * or a tap.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.Gesture');

goog.require('Blockly.BlockAnimations');
goog.require('Blockly.BlockDragger');
goog.require('Blockly.BlocksSelection');
goog.require('Blockly.BubbleDragger');
goog.require('Blockly.constants');
goog.require('Blockly.Events.Ui');
goog.require('Blockly.FlyoutDragger');
goog.require('Blockly.scratchBlocksUtils');
goog.require('Blockly.Tooltip');
goog.require('Blockly.Touch');
goog.require('Blockly.WorkspaceDragger');

goog.require('goog.asserts');
goog.require('goog.math.Coordinate');


/*
 * Note: In this file "start" refers to touchstart, mousedown, and pointerstart
 * events.  "End" refers to touchend, mouseup, and pointerend events.
 */
// TODO: Consider touchcancel/pointercancel.


/**
 * Class for one gesture.
 * @param {!Event} e The event that kicked off this gesture.
 * @param {!Blockly.WorkspaceSvg} creatorWorkspace The workspace that created
 *     this gesture and has a reference to it.
 * @constructor
 */
Blockly.Gesture = function(e, creatorWorkspace) {

  /**
   * The position of the mouse when the gesture started.  Units are css pixels,
   * with (0, 0) at the top left of the browser window (mouseEvent clientX/Y).
   * @type {goog.math.Coordinate}
   */
  this.mouseDownXY_ = null;

  /**
   * How far the mouse has moved during this drag, in pixel units.
   * (0, 0) is at this.mouseDownXY_.
   * @type {goog.math.Coordinate}
   * @private
   */
  this.currentDragDeltaXY_ = null;

  /**
   * The bubble that the gesture started on, or null if it did not start on a
   * bubble.
   * @type {Blockly.Bubble}
   * @private
   */
  this.startBubble_ = null;

  /**
   * The field that the gesture started on, or null if it did not start on a
   * field.
   * @type {Blockly.Field}
   * @private
   */
  this.startField_ = null;

  /**
   * The block that the gesture started on, or null if it did not start on a
   * block.
   * @type {Blockly.BlockSvg}
   * @private
   */
  this.startBlock_ = null;

  /**
   * The block that this gesture targets.  If the gesture started on a
   * shadow block, this is the first non-shadow parent of the block.  If the
   * gesture started in the flyout, this is the root block of the block group
   * that was clicked or dragged.
   * @type {Blockly.BlockSvg}
   * @private
   */
  this.targetBlock_ = null;

  /**
   * The workspace that the gesture started on.  There may be multiple
   * workspaces on a page; this is more accurate than using
   * Blockly.getMainWorkspace().
   * @type {Blockly.WorkspaceSvg}
   * @private
   */
  this.startWorkspace_ = null;

  /**
   * The workspace that created this gesture.  This workspace keeps a reference
   * to the gesture, which will need to be cleared at deletion.
   * This may be different from the start workspace.  For instance, a flyout is
   * a workspace, but its parent workspace manages gestures for it.
   * @type {Blockly.WorkspaceSvg}
   * @private
   */
  this.creatorWorkspace_ = creatorWorkspace;

  /**
   * Whether the pointer has at any point moved out of the drag radius.
   * A gesture that exceeds the drag radius is a drag even if it ends exactly at
   * its start point.
   * @type {boolean}
   * @private
   */
  this.hasExceededDragRadius_ = false;

  /**
   * Whether the workspace is currently being dragged.
   * @type {boolean}
   * @private
   */
  this.isDraggingWorkspace_ = false;

  /**
   * Whether the block is currently being dragged.
   * @type {boolean}
   * @private
   */
  this.isDraggingBlock_ = false;
  
    /**
     * Whether the block selection box is active
     * @type {boolean}
     * @private
     */
    this.isSelectingBlocks_ = false;

  /**
   * Whether the bubble is currently being dragged.
   * @type {boolean}
   * @private
   */
  this.isDraggingBubble_ = false;

  /**
   * The event that most recently updated this gesture.
   * @type {!Event}
   * @private
   */
  this.mostRecentEvent_ = e;

  /**
   * A handle to use to unbind a mouse move listener at the end of a drag.
   * Opaque data returned from Blockly.bindEventWithChecks_.
   * @type {Array.<!Array>}
   * @private
   */
  this.onMoveWrapper_ = null;

  /**
   * A handle to use to unbind a mouse up listener at the end of a drag.
   * Opaque data returned from Blockly.bindEventWithChecks_.
   * @type {Array.<!Array>}
   * @private
   */
  this.onUpWrapper_ = null;

  /**
   * The object tracking a bubble drag, or null if none is in progress.
   * @type {Blockly.BubbleDragger}
   * @private
   */
  this.bubbleDragger_ = null;

  /**
   * The object tracking a block drag, or null if none is in progress.
   * @type {Blockly.BlockDragger}
   * @private
   */
  this.blockDragger_ = null;

  /**
   * The object tracking a workspace or flyout workspace drag, or null if none
   * is in progress.
   * @type {Blockly.WorkspaceDragger}
   * @private
   */
  this.workspaceDragger_ = null;

  /**
   * The object tracking a workspace selection, or null if none
   * is in progress.
   * @type {Blockly.BlocksSelection}
   * @private
   */
  this.blocksSelection_ = null;

  /**
   * The flyout a gesture started in, if any.
   * @type {Blockly.Flyout}
   * @private
   */
  this.flyout_ = null;

  /**
   * Boolean for sanity-checking that some code is only called once.
   * @type {boolean}
   * @private
   */
  this.calledUpdateIsDragging_ = false;

  /**
   * Boolean for sanity-checking that some code is only called once.
   * @type {boolean}
   * @private
   */
  this.hasStarted_ = false;

  /**
   * Boolean used internally to break a cycle in disposal.
   * @type {boolean}
   * @private
   */
  this.isEnding_ = false;

  /**
   * ID of current gesture. Useful for debugging multitouch
   * @type {integer}
   * @private
   */
  this.myID_ = Blockly.Gesture.ID++;

  /**
   * IDs of the touches relevant for this gesture.
   * Used to track gestures and multitouch, to prevent additional touches to mess with current gesture
   * @type {Array.<!Array>}
   * @private
   */
  this.touchIDs_ = [];
/**
   * True if dragging from the target block should duplicate the target block
   * and drag the duplicate instead.  This has a lot of side effects.
   * @type {boolean}
   * @private
   */
  this.shouldDuplicateOnDrag_ = false;

};

/**
 * Sever all links from this object.
 * @package
 */
Blockly.Gesture.prototype.dispose = function() {
  Blockly.Touch.clearTouchIdentifier();
  Blockly.Tooltip.unblock();
  // Clear the owner's reference to this gesture.
  this.creatorWorkspace_.clearGesture();

  if (this.onMoveWrapper_) {
    Blockly.unbindEvent_(this.onMoveWrapper_);
    this.onMoveWrapper_ = null;
  }
  if (this.onUpWrapper_) {
    Blockly.unbindEvent_(this.onUpWrapper_);
    this.onUpWrapper_ = null;
  }

  this.startField_ = null;
  this.startBlock_ = null;
  this.targetBlock_ = null;
  this.startWorkspace_ = null;
  this.flyout_ = null;
  this.touchIDs_ = [];

  if (this.blockDragger_) {
    this.blockDragger_.dispose();
    this.blockDragger_ = null;
  }
  if (this.workspaceDragger_) {
    this.workspaceDragger_.dispose();
    this.workspaceDragger_ = null;
  }
  if (this.blocksSelection_) {
    this.blocksSelection_.dispose();
    this.blocksSelection_ = null;
  }
  if (this.bubbleDragger_) {
    this.bubbleDragger_.dispose();
    this.bubbleDragger_ = null;
  }
};

/**
 * Update internal state based on an event.
 * @param {!Event} e The most recent mouse or touch event.
 * @private
 */
Blockly.Gesture.prototype.updateFromEvent_ = function(e) {
  // Overwrite clientX/Y with gesture's touch info if needed
  if(this.touchIDs_.length > 0) {
    Blockly.Touch.setClientFromTouchIDs(e, this.touchIDs_);
  }
  var currentXY = new goog.math.Coordinate(e.clientX, e.clientY);
  var changed = this.updateDragDelta_(currentXY);
  // Exceeded the drag radius for the first time.
  if (changed) {
    this.updateIsDragging_(e.isMultiTouch);
    Blockly.longStop_();
  }
  this.mostRecentEvent_ = e;
};

/**
 * DO MATH to set currentDragDeltaXY_ based on the most recent mouse position.
 * @param {!goog.math.Coordinate} currentXY The most recent mouse/pointer
 *     position, in pixel units, with (0, 0) at the window's top left corner.
 * @return {boolean} True if the drag just exceeded the drag radius for the
 *     first time.
 * @private
 */
Blockly.Gesture.prototype.updateDragDelta_ = function(currentXY) {
  this.currentDragDeltaXY_ = goog.math.Coordinate.difference(currentXY,
      this.mouseDownXY_);
  if (!this.hasExceededDragRadius_) {
    var currentDragDelta = goog.math.Coordinate.magnitude(
        this.currentDragDeltaXY_);
    // The flyout has a different drag radius from the rest of Blockly.
    var limitRadius = this.flyout_ ? Blockly.FLYOUT_DRAG_RADIUS :
        Blockly.DRAG_RADIUS;
    this.hasExceededDragRadius_ = currentDragDelta > limitRadius;
    return this.hasExceededDragRadius_;
  }
  return false;
};

/**
 * Update this gesture to record whether a block is being dragged from the
 * flyout.
 * This function should be called on a mouse/touch move event the first time the
 * drag radius is exceeded.  It should be called no more than once per gesture.
 * If a block should be dragged from the flyout this function creates the new
 * block on the main workspace and updates targetBlock_ and startWorkspace_.
 * @return {boolean} True if a block is being dragged from the flyout.
 * @private
 */
Blockly.Gesture.prototype.updateIsDraggingFromFlyout_ = function() {
  // Disabled blocks may not be dragged from the flyout.
  if (this.targetBlock_.disabled || !this.targetBlock_.movable_) {
    return false;
  }
  if (!this.flyout_.isScrollable() ||
      this.flyout_.isDragTowardWorkspace(this.currentDragDeltaXY_)) {
    this.startWorkspace_ = this.flyout_.targetWorkspace_;
    this.startWorkspace_.updateScreenCalculationsIfScrolled();
    // Start the event group now, so that the same event group is used for block
    // creation and block dragging.
    if (!Blockly.Events.getGroup()) {
      Blockly.Events.setGroup(true);
    }
    // The start block is no longer relevant, because this is a drag.
    this.startBlock_ = null;
    this.targetBlock_ = this.flyout_.createBlock(this.targetBlock_);
    this.targetBlock_.isFromFlyout_ = true;
    this.targetBlock_.select();
    return true;
  }
  return false;
};

/**
 * Update this gesture to record whether a bubble is being dragged.
 * This function should be called on a mouse/touch move event the first time the
 * drag radius is exceeded.  It should be called no more than once per gesture.
 * If a bubble should be dragged this function creates the necessary
 * BubbleDragger and starts the drag.
 * @return {boolean} true if a bubble is being dragged.
 * @private
 */
Blockly.Gesture.prototype.updateIsDraggingBubble_ = function() {
  if (!this.startBubble_) {
    return false;
  }

  this.isDraggingBubble_ = true;
  this.startDraggingBubble_();
  return true;
};

/**
 * Update this gesture to record whether a block is being dragged.
 * This function should be called on a mouse/touch move event the first time the
 * drag radius is exceeded.  It should be called no more than once per gesture.
 * If a block should be dragged, either from the flyout or in the workspace,
 * this function creates the necessary BlockDragger and starts the drag.
 * @return {boolean} true if a block is being dragged.
 * @private
 */
Blockly.Gesture.prototype.updateIsDraggingBlock_ = function() {
  if (!this.targetBlock_) {
    return false;
  }

  if (this.flyout_) {
    this.isDraggingBlock_ = this.updateIsDraggingFromFlyout_();
  } else if (this.targetBlock_.isMovable() || this.shouldDuplicateOnDrag_){
    this.isDraggingBlock_ = true;
  }

  if (this.isDraggingBlock_) {
    this.startDraggingBlock_();
    return true;
  }
  return false;
};

/**
 * Update this gesture to record whether a workspace is being dragged.
 * This function should be called on a mouse/touch move event the first time the
 * drag radius is exceeded.  It should be called no more than once per gesture.
 * If a workspace is being dragged this function creates the necessary
 * WorkspaceDragger or FlyoutDragger and starts the drag.
 * @private
 */
Blockly.Gesture.prototype.updateIsDraggingWorkspace_ = function(isMultiTouchDrag) {
  var wsMovable = this.flyout_ ? this.flyout_.isScrollable() :
      this.startWorkspace_ && this.startWorkspace_.isDraggable();

  if (!wsMovable) {
    return;
  }

  var workspace = Blockly.getMainWorkspace();
  var allowDragWorkspace =
    (isMultiTouchDrag === true && workspace.options.multiTouchScroll === true) || 
    (isMultiTouchDrag !== true && workspace.options.multiTouchScroll !== true);

  if(allowDragWorkspace)
  {
    if (this.flyout_) {
      this.workspaceDragger_ = new Blockly.FlyoutDragger(this.flyout_);
    }
    else {
     this.workspaceDragger_ = new Blockly.WorkspaceDragger(this.startWorkspace_);
    }
  }

  if(this.workspaceDragger_) {
    this.isDraggingWorkspace_ = true;
    this.workspaceDragger_.startDrag();
  }
};

Blockly.Gesture.prototype.updateIsSelectingBlocks_ = function() {
  this.startSelectingBlocks_();
};

Blockly.Gesture.prototype.startSelectingBlocks_ = function(e) {
  this.isSelectingBlocks_ = true;
  this.blocksSelection_ = new Blockly.BlocksSelection(this.startWorkspace_);
  this.blocksSelection_.startSelection(this.mostRecentEvent_, this.mouseDownXY_);
  this.blocksSelection_.updateSelection(this.currentDragDeltaXY_);
};

/**
 * Update this gesture to record whether anything is being dragged.
 * This function should be called on a mouse/touch move event the first time the
 * drag radius is exceeded.  It should be called no more than once per gesture.
 * @private
 */
Blockly.Gesture.prototype.updateIsDragging_ = function(multiTouch) {
  // Sanity check.
  goog.asserts.assert(!this.calledUpdateIsDragging_,
      'updateIsDragging_ should only be called once per gesture.');
  this.calledUpdateIsDragging_ = true;

  // First see if its a multi touch workspace drag
  if(multiTouch === true) {
    this.updateIsDraggingWorkspace_(true);
  }

  // Second, check if it was a bubble drag.  Bubbles always sit on top of blocks.
  if (this.updateIsDraggingBubble_()) {
    return;
  }

  // Then check if it was a block drag.
  if (multiTouch === false && this.updateIsDraggingBlock_()) {
    return;
  }
  // Finally check if it's a single touch workspace drag.
  if(multiTouch !== true) {
    this.updateIsDraggingWorkspace_(false);

    if(this.isDraggingWorkspace_ === false) {
      if(!this.startWorkspace_.locked){
        this.updateIsSelectingBlocks_();
      }
    }
  }
};

/**
 * Create a block dragger and start dragging the selected block.
 * @private
 */
Blockly.Gesture.prototype.startDraggingBlock_ = function() {
  if (this.shouldDuplicateOnDrag_) {
    this.duplicateOnDrag_();
  }
  Blockly.BlocksSelection.initBlockDragging();
  this.blockDragger_ = new Blockly.BlockDragger(this.targetBlock_,
      this.startWorkspace_);
  this.blockDragger_.startBlockDrag(this.currentDragDeltaXY_);
  this.blockDragger_.dragBlock(this.mostRecentEvent_,
      this.currentDragDeltaXY_);

  // OB [CSI-633] Don't fire 'start drag' even here, or else we don't know who the parent block is
  // and undo gets messed up. Do it earlier!
  // // OB: Add an event when a block is dragged
  // var eventsEnabled = Blockly.Events.isEnabled();
  // if (eventsEnabled) {
  //    var event = new Blockly.Events.StartDrag(this.targetBlock_);
  //    Blockly.Events.fire(event);
  // }
};

/**
 * Create a bubble dragger and start dragging the selected bubble.
 * TODO (fenichel): Possibly combine this and startDraggingBlock_.
 * @private
 */
Blockly.Gesture.prototype.startDraggingBubble_ = function() {
  this.bubbleDragger_ = new Blockly.BubbleDragger(this.startBubble_,
      this.startWorkspace_);
  this.bubbleDragger_.startBubbleDrag();
  this.bubbleDragger_.dragBubble(this.mostRecentEvent_,
      this.currentDragDeltaXY_);
};
/**
 * Start a gesture: update the workspace to indicate that a gesture is in
 * progress and bind mousemove and mouseup handlers.
 * @param {!Event} e A mouse down or touch start event.
 * @package
 */
Blockly.Gesture.prototype.doStart = function(e, multiTouch) {
  if (Blockly.utils.isTargetInput(e)) {
    this.cancel();
    return;
  }

  var wasStarted = this.hasStarted_;
  this.hasStarted_ = true;

  Blockly.BlockAnimations.disconnectUiStop();
  this.startWorkspace_.updateScreenCalculationsIfScrolled();
  if (this.startWorkspace_.isMutator) {
    // Mutator's coordinate system could be out of date because the bubble was
    // dragged, the block was moved, the parent workspace zoomed, etc.
    this.startWorkspace_.resize();
  }
  this.startWorkspace_.markFocused();
  this.mostRecentEvent_ = e;

  // Hide chaff also hides the flyout, so don't do it if the click is in a flyout.
  Blockly.hideChaff(!!this.flyout_);
  Blockly.Tooltip.block();

  if (this.targetBlock_) {
    this.targetBlock_.select();
  }

  if (Blockly.utils.isRightButton(e)) {
    this.handleRightClick(e);

    // CD: [CSI-340 + CSI-343]: Unselect the current block when right click, otherwise we don't get workspace events when dragging "selectedBlock"...
    if (Blockly.selected) {
      Blockly.selected.unselect();
    }
    return;
  }

  // OB: We don't use context menu when doing long-press
  // if (goog.string.caseInsensitiveEquals(e.type, 'touchstart')) {
  //   Blockly.longStart_(e, this);
  // }

  if(wasStarted === false) {
    this.mouseDownXY_ = new goog.math.Coordinate(e.clientX, e.clientY);
  }

  this.bindMouseEvents(e);
};

/**
 * Bind gesture events.
 * @param {!Event} e A mouse down or touch start event.
 * @package
 */
Blockly.Gesture.prototype.bindMouseEvents = function(e) {
  if(!this.onMoveWrapper_) {
    this.onMoveWrapper_ = Blockly.bindEventWithChecks_(
        document, 'mousemove', null, this.handleMove.bind(this));
  }
  if(!this.onUpWrapper_) {
    this.onUpWrapper_ = Blockly.bindEventWithChecks_(
        document, 'mouseup', null, this.handleUp.bind(this));
  }

  e.preventDefault();
  e.stopPropagation();
};

/**
 * Handle a mouse move or touch move event.
 * @param {!Event} e A mouse move or touch move event.
 * @package
 */
Blockly.Gesture.prototype.handleMove = function(e) {
  if(this.isEnding_) {
    console.warn("Should not be called, it ended!!");
    return;
  }

  var stopPropagation = true;

  var wasDraggingWorkspace = this.isDraggingWorkspace_;
  var wasDraggingBlock = this.isDraggingBlock_;
  var wasSelectingBlocks = this.isSelectingBlocks_;

  this.updateFromEvent_(e);
  if (this.isDraggingWorkspace_) {
    if(wasDraggingWorkspace === false) {
      // Set touch ID to for block drag gesture
      this.setWorkspaceDragTouchIDs(e);
    }
    this.workspaceDragger_.drag(this.currentDragDeltaXY_);
  } else if (this.isDraggingBlock_) {
    if(wasDraggingBlock === false) {
      // Set touch IDs to for workspace drag gesture
      this.setBlockDragTouchID(e);
    }

    // OB: Scroll when dragging a block while at edge of workspace
    if(this.startWorkspace_ && this.startWorkspace_.options.verticalScrollAtEdges === true) {
      var wsDelta = this.startWorkspace_.maybeScrollWorkspaceVertical(e, this.currentDragDeltaXY_.y < 0, this.currentDragDeltaXY_.y > 0, true);
      this.mouseDownXY_.x -= wsDelta.x;
      this.mouseDownXY_.y -= wsDelta.y;
      this.currentDragDeltaXY_.x += wsDelta.x;
      this.currentDragDeltaXY_.y += wsDelta.y;
    }

    if (this.blockDragger_.dragBlock(
      this.mostRecentEvent_, this.currentDragDeltaXY_)) {
      stopPropagation = false;
    }
  } else if (this.isSelectingBlocks_) {
    // OB: Scroll when moving block selection at edge of workspace
    if(this.startWorkspace_ && this.startWorkspace_.options.verticalScrollAtEdges === true) {
      // Right now, this only triggers when mouse is moved.
      // Find a way to call it every frame or every X seconds, until mouse is up again ?
      var wsDelta = this.startWorkspace_.maybeScrollWorkspaceVertical(e, this.currentDragDeltaXY_.y < 0, this.currentDragDeltaXY_.y > 0, false);
      this.mouseDownXY_.x -= wsDelta.x;
      this.mouseDownXY_.y -= wsDelta.y;
      this.currentDragDeltaXY_.x += wsDelta.x;
      this.currentDragDeltaXY_.y += wsDelta.y;
    }

    this.blocksSelection_.updateSelection(this.currentDragDeltaXY_);
  } else if (this.isDraggingBubble_) {
    this.bubbleDragger_.dragBubble(this.mostRecentEvent_,
        this.currentDragDeltaXY_);
  }

  if (stopPropagation) {
    e.preventDefault();
    e.stopPropagation();
  }
  
};

/**
 * Set the touch ID to associate with the block drag.
 * @param {!Event} e A mouse move or touch move event.
 */
Blockly.Gesture.prototype.setBlockDragTouchID = function(e) {
  if(e.changedTouches && e.changedTouches.length === 1) {
    this.touchIDs_ = [];
    this.touchIDs_.push(e.changedTouches[0].identifier);
  }
};

/**
 * Set the touch IDs to associate with the workspace drag.
 * @param {!Event} e A mouse move or touch move event.
 */
Blockly.Gesture.prototype.setWorkspaceDragTouchIDs = function(e) {
  if(e.touches && e.touches.length > 1) {
    this.touchIDs_ = [];
    // Get only the first 2 touches for drag
    for(var i = 0; i < 2; i++) {
      this.touchIDs_.push(e.touches[i].identifier);
    }
  }
};

/**
 * Handle a mouse up or touch end event.
 * @param {!Event} e A mouse up or touch end event.
 * @package
 */
Blockly.Gesture.prototype.handleUp = function(e) {
  this.updateFromEvent_(e);
  Blockly.longStop_();
  if (this.isEnding_) {
    console.log('Trying to end a gesture recursively.');
    return;
  }
  var shouldEndGesture = true;
  // OB MERGE: Should add a 'shouldEndBubbleDrag' function to start
  if (this.isDraggingBlock_) {
    shouldEndGesture = this.shouldEndBlockDrag(e);
  }
  else if (this.isDraggingWorkspace_) {
    shouldEndGesture = this.shouldEndWorkspaceDrag(e);
  }
  else if (this.isSelectingBlocks_) {
    shouldEndGesture = this.shouldEndSelectingBlocks(e);
  }
  // OB [CSI-811]: Outline this block when other blocks were outline, but there was no actual drag of anything performed
  else if(this.startBlock_) {
    if(Blockly.BlocksSelection.hasBlocks() && Blockly.BlocksSelection.getNumBlocks() > 1) {
      Blockly.BlocksSelection.clearChosenBlocks();
      // We need to explicitly uneselect the block, because it was already set as selected
      this.startBlock_.unselect();
      this.startBlock_.select();
    }
    //this.startBlock_.select();
  }
  this.isEnding_ = shouldEndGesture;

  if(this.isEnding_ === true) {
    // The ordering of these checks is important: drags have higher priority than
    // clicks.  Fields have higher priority than blocks; blocks have higher
    // priority than workspaces.
    if (this.isDraggingBubble_) {
      this.bubbleDragger_.endBubbleDrag(e, this.currentDragDeltaXY_);
    } else if (this.isDraggingBlock_) {
        this.blockDragger_.endBlockDrag(e, this.currentDragDeltaXY_);
    } else if (this.isDraggingWorkspace_) {
        this.workspaceDragger_.endDrag(this.currentDragDeltaXY_);
    } else if(this.isSelectingBlocks_) {
      this.blocksSelection_.endSelection(this.currentDragDeltaXY_);
    } else if (this.isBubbleClick_()) {
      // Bubbles are in front of all fields and blocks.
      this.doBubbleClick_();
    } else if (this.isFieldClick_()) {
      this.doFieldClick_();
    } else if (this.isBlockClick_()) {
      this.doBlockClick_();
    } else if (this.isWorkspaceClick_()) {
      this.doWorkspaceClick_();
    }
    // OB: [CSI-265]: Unselect the current block every time mouse is up
    if (Blockly.selected) {
      Blockly.selected.unselect();
    }

    e.preventDefault();
    e.stopPropagation();

    this.dispose();


    if (this.isDraggingBlock_ && Blockly.BlocksSelection.isDraggingChosenBlocks()) {
      Blockly.BlocksSelection.createOutline();
    }
  }
};

/**
 * Checks to see if a block drag should end.
 * Makes sure that the touch that was released is the touch associated with this gesture.
 * @param {!Event} e A mouse up or touch up event.
 */
Blockly.Gesture.prototype.shouldEndBlockDrag = function(e) {
  if(e.changedTouches) {
    var endedTouch = e.changedTouches[0];
    if(endedTouch.identifier !== this.touchIDs_[0]) {
      //console.log("A touch that wasn't part of the BLOCK DRAG gesture is up");
      return false;
    }
  }
  return true;
};

/**
 * Checks to see if a workspace drag should end.
 * Makes sure that one of the touches that was released is one of the touches associated with this gesture.
 * @param {!Event} e A mouse up or touch up event.
 */
Blockly.Gesture.prototype.shouldEndWorkspaceDrag = function (e) {
  if(e.changedTouches) {
    for(var i = 0; i < this.touchIDs_.length; i++) {
      if(Blockly.Touch.findTouchInChangedTouches(e, this.touchIDs_[i]) !== null) {
        //console.log("A touch that part of the WS DRAG gesture is up, so END IT");
        return true;
      }
    }
    return false;
  }
  return true;
};

Blockly.Gesture.prototype.shouldEndSelectingBlocks = function (e) {
  return true;
};

/**
 * Cancel an in-progress gesture.  If a workspace or block drag is in progress,
 * end the drag at the most recent location.
 * @package
 */
Blockly.Gesture.prototype.cancel = function() {
  // Disposing of a block cancels in-progress drags, but dragging to a delete
  // area disposes of a block and leads to recursive disposal. Break that cycle.
  if (this.isEnding_) {
    console.log('Trying to cancel a gesture recursively.');
    return;
  }
  this.isEnding_ = true;
  Blockly.longStop_();
  if (this.isDraggingBubble_) {
    this.bubbleDragger_.endBubbleDrag(this.mostRecentEvent_,
        this.currentDragDeltaXY_);
  } else if (this.isDraggingBlock_) {
    this.blockDragger_.endBlockDrag(this.mostRecentEvent_,
        this.currentDragDeltaXY_);
  } else if (this.isDraggingWorkspace_) {
    this.workspaceDragger_.endDrag(this.currentDragDeltaXY_);
  }

  this.dispose();
};

/**
 * Handle a real or faked right-click event by showing a context menu.
 * @param {!Event} e A mouse move or touch move event.
 * @package
 */
Blockly.Gesture.prototype.handleRightClick = function(e) {
  if (this.targetBlock_) {
    //this.bringBlockToFront_();
    Blockly.hideChaff(this.flyout_);
    // OB: Don't show context menu on right click
    //this.targetBlock_.showContextMenu_(e);
  } else if (this.startBubble_) {
    // OB: Don't show context menu on right click
    //this.startBubble_.showContextMenu_(e);
  } else if (this.startWorkspace_ && !this.flyout_) {
    Blockly.hideChaff();
    //this.startWorkspace_.showContextMenu_(e);
  }

  // TODO: Handle right-click on a bubble.
  e.preventDefault();
  e.stopPropagation();

  this.dispose();
};

/**
 * Handle a mousedown/touchstart event on a workspace.
 * @param {!Event} e A mouse down or touch start event.
 * @param {!Blockly.Workspace} ws The workspace the event hit.
 * @param {boolean=} multiTouch Is this a multi touch...err touch [OB]
 * @package
 */
Blockly.Gesture.prototype.handleWsStart = function(e, ws, multiTouch) {
  // OB: We can now have a started gesture with multi touch
  // goog.asserts.assert(!this.hasStarted_,
  //    'Tried to call gesture.handleWsStart, but the gesture had already been ' +
  //    'started.');

  // OB: This is not needed anymore! Looks like using touch IDs in gestures takes care of this case
  // // OB: If already dragging a block, ignore interactions that could be started by new touch
  // if(this.isDraggingBlock_ && multiTouch === true) {
  //   return;
  // }
  
  // OB: 'handleWsStart' is called even if touch is started on a block;
  // Only clear selected blocks if the workspace start was NOT called after starting on block
  if(!this.targetBlock_) {
    Blockly.BlocksSelection.clearChosenBlocks();
  }
  this.setStartWorkspace_(ws);
  this.mostRecentEvent_ = e;
  this.doStart(e, multiTouch);
};

/**
 * Handle a mousedown/touchstart event on a flyout.
 * @param {!Event} e A mouse down or touch start event.
 * @param {!Blockly.Flyout} flyout The flyout the event hit.
 * @package
 */
Blockly.Gesture.prototype.handleFlyoutStart = function(e, flyout) {
  goog.asserts.assert(!this.hasStarted_,
      'Tried to call gesture.handleFlyoutStart, but the gesture had already been ' +
      'started.');

  Blockly.BlocksSelection.clearChosenBlocks();
  this.setStartFlyout_(flyout);
  this.handleWsStart(e, flyout.getWorkspace());
};

/**
 * Handle a mousedown/touchstart event on a block.
 * @param {!Event} e A mouse down or touch start event.
 * @param {!Blockly.BlockSvg} block The block the event hit.
 * @package
 */
Blockly.Gesture.prototype.handleBlockStart = function(e, block) {
  goog.asserts.assert(!this.hasStarted_,
      'Tried to call gesture.handleBlockStart, but the gesture had already ' +
      'been started.');
  this.setStartBlock(block);

  if(block && block == this.targetBlock_ && block.isChosen_ !== true) {
    Blockly.BlocksSelection.clearChosenBlocks();
  }

  this.mostRecentEvent_ = e;
};

/**
 * Handle a mousedown/touchstart event on a bubble.
 * @param {!Event} e A mouse down or touch start event.
 * @param {!Blockly.Bubble} bubble The bubble the event hit.
 * @package
 */
Blockly.Gesture.prototype.handleBubbleStart = function(e, bubble) {
  goog.asserts.assert(!this.hasStarted_,
      'Tried to call gesture.handleBubbleStart, but the gesture had already ' +
      'been started.');
  this.setStartBubble(bubble);
  this.mostRecentEvent_ = e;
};

/* Begin functions defining what actions to take to execute clicks on each type
 * of target.  Any developer wanting to add behaviour on clicks should modify
 * only this code. */

/**
 * Execute a bubble click.
 * @private
 */
Blockly.Gesture.prototype.doBubbleClick_ = function() {
  // TODO (github.com/google/blockly/issues/1673): Consistent handling of single
  // clicks.
  this.startBubble_.setFocus && this.startBubble_.setFocus();
  this.startBubble_.select && this.startBubble_.select();
};

/**
 * Execute a field click.
 * @private
 */
Blockly.Gesture.prototype.doFieldClick_ = function() {
  this.startField_.showEditor_();
  this.bringBlockToFront_();
};

/**
 * Execute a block click.
 * @private
 */
Blockly.Gesture.prototype.doBlockClick_ = function() {
  // Block click in an autoclosing flyout.
  if (this.flyout_ && this.flyout_.autoClose) {
    if (!this.targetBlock_.disabled) {
      if (!Blockly.Events.getGroup()) {
        Blockly.Events.setGroup(true);
      }
      var newBlock = this.flyout_.createBlock(this.targetBlock_);
      newBlock.scheduleSnapAndBump();
    }
  } else {
    // A field is being edited if either the WidgetDiv or DropDownDiv is currently open.
    // If a field is being edited, don't fire any click events.
    var fieldEditing = Blockly.WidgetDiv.isVisible() || Blockly.DropDownDiv.isVisible();
    if (!fieldEditing) {
      Blockly.Events.fire(
          new Blockly.Events.Ui(this.startBlock_, 'click', undefined, undefined));
      // Scratch-specific: also fire a "stack click" event for this stack.
      // This is used to toggle the stack when any block in the stack is clicked.
      var rootBlock = this.startBlock_.getRootBlock();
      Blockly.Events.fire(
          new Blockly.Events.Ui(rootBlock, 'stackclick', undefined, undefined));
    }
  }
  this.bringBlockToFront_();
  Blockly.Events.setGroup(false);
};

/**
 * Execute a workspace click.
 * @private
 */
Blockly.Gesture.prototype.doWorkspaceClick_ = function() {
  if (Blockly.selected) {
    Blockly.selected.unselect();
  }
};

/* End functions defining what actions to take to execute clicks on each type
 * of target. */

// TODO (fenichel): Move bubbles to the front.
/**
 * Move the dragged/clicked block to the front of the workspace so that it is
 * not occluded by other blocks.
 * @private
 */
Blockly.Gesture.prototype.bringBlockToFront_ = function() {
  // Blocks in the flyout don't overlap, so skip the work.
  if (this.targetBlock_ && !this.flyout_) {
    this.targetBlock_.bringToFront();
  }
};

/* Begin functions for populating a gesture at mouse down. */

/**
 * Record the field that a gesture started on.
 * @param {Blockly.Field} field The field the gesture started on.
 * @package
 */
Blockly.Gesture.prototype.setStartField = function(field) {
  goog.asserts.assert(!this.hasStarted_,
      'Tried to call gesture.setStartField, but the gesture had already been ' +
      'started.');
  if (!this.startField_) {
    this.startField_ = field;
  }
};

/**
 * Record the bubble that a gesture started on
 * @param {Blockly.Bubble} bubble The bubble the gesture started on.
 * @package
 */
Blockly.Gesture.prototype.setStartBubble = function(bubble) {
  if (!this.startBubble_) {
    this.startBubble_ = bubble;
  }
};

/**
 * Record the block that a gesture started on, and set the target block
 * appropriately.
 * @param {Blockly.BlockSvg} block The block the gesture started on.
 * @package
 */
Blockly.Gesture.prototype.setStartBlock = function(block) {
  // If the gesture already went through a bubble, don't set the start block.
  if (!this.startBlock_ && !this.startBubble_) {
    this.startBlock_ = block;
    this.shouldDuplicateOnDrag_ =
        Blockly.scratchBlocksUtils.isShadowArgumentReporter(block);
    if (block.isInFlyout && block != block.getRootBlock()) {
      this.setTargetBlock_(block.getRootBlock());
    } else {
      this.setTargetBlock_(block);
    }
  }
};

/**
 * Record the block that a gesture targets, meaning the block that will be
 * dragged if this turns into a drag.  If this block is a shadow, that will be
 * its first non-shadow parent.
 * @param {Blockly.BlockSvg} block The block the gesture targets.
 * @private
 */
Blockly.Gesture.prototype.setTargetBlock_ = function(block) {
  if (block.isShadow() && !this.shouldDuplicateOnDrag_) {
    this.setTargetBlock_(block.getParent());
  } else {
    this.targetBlock_ = block;
  }
};

/**
 * Record the workspace that a gesture started on.
 * @param {Blockly.WorkspaceSvg} ws The workspace the gesture started on.
 * @private
 */
Blockly.Gesture.prototype.setStartWorkspace_ = function(ws) {
  if (!this.startWorkspace_) {
    this.startWorkspace_ = ws;
  }
};

/**
 * Record the flyout that a gesture started on.
 * @param {Blockly.Flyout} flyout The flyout the gesture started on.
 * @private
 */
Blockly.Gesture.prototype.setStartFlyout_ = function(flyout) {
  if (!this.flyout_) {
    this.flyout_ = flyout;
  }
};

/* End functions for populating a gesture at mouse down. */

/* Begin helper functions defining types of clicks.  Any developer wanting
 * to change the definition of a click should modify only this code. */

/**
 * Whether this gesture is a click on a bubble.  This should only be called when
 * ending a gesture (mouse up, touch end).
 * @return {boolean} whether this gesture was a click on a bubble.
 * @private
 */
Blockly.Gesture.prototype.isBubbleClick_ = function() {
  // A bubble click starts on a bubble and never escapes the drag radius.
  var hasStartBubble = !!this.startBubble_;
  return hasStartBubble && !this.hasExceededDragRadius_;
};

/**
 * Whether this gesture is a click on a block.  This should only be called when
 * ending a gesture (mouse up, touch end).
 * @return {boolean} whether this gesture was a click on a block.
 * @private
 */
Blockly.Gesture.prototype.isBlockClick_ = function() {
  // A block click starts on a block, never escapes the drag radius, and is not
  // a field click.
  var hasStartBlock = !!this.startBlock_;
  return hasStartBlock && !this.hasExceededDragRadius_ && !this.isFieldClick_();
};

/**
 * Whether this gesture is a click on a field.  This should only be called when
 * ending a gesture (mouse up, touch end).
 * @return {boolean} whether this gesture was a click on a field.
 * @private
 */
Blockly.Gesture.prototype.isFieldClick_ = function() {
  var fieldEditable = this.startField_ ?
      this.startField_.isCurrentlyEditable() : false;
  return fieldEditable && !this.hasExceededDragRadius_;
};

/**
 * Whether this gesture is a click on a workspace.  This should only be called
 * when ending a gesture (mouse up, touch end).
 * @return {boolean} whether this gesture was a click on a workspace.
 * @private
 */
Blockly.Gesture.prototype.isWorkspaceClick_ = function() {
  var onlyTouchedWorkspace = !this.startBlock_ && !this.startBubble_ &&
      !this.startField_;
  return onlyTouchedWorkspace && !this.hasExceededDragRadius_;
};

/* End helper functions defining types of clicks. */

/**
 * Whether this gesture is a drag of either a workspace or block.
 * This function is called externally to block actions that cannot be taken
 * mid-drag (e.g. using the keyboard to delete the selected blocks).
 * @return {boolean} true if this gesture is a drag of a workspace or block.
 * @package
 */
Blockly.Gesture.prototype.isDragging = function() {
  return this.isDraggingWorkspace_ || this.isDraggingBlock_ ||
      this.isDraggingBubble_;
};

/**
 * Whether this gesture has already been started.  In theory every mouse down
 * has a corresponding mouse up, but in reality it is possible to lose a
 * mouse up, leaving an in-process gesture hanging.
 * @return {boolean} whether this gesture was a click on a workspace.
 * @package
 */
Blockly.Gesture.prototype.hasStarted = function() {
  return this.hasStarted_;
};

/* Scratch-specific */

/**
 * Don't even think about using this function before talking to rachel-fenichel.
 *
 * Force a drag to start without clicking and dragging the block itself.  Used
 * to attach duplicated blocks to the mouse pointer.
 * @param {!Object} fakeEvent An object with the properties needed to start a
 *     drag, including clientX and clientY.
 * @param {!Blockly.BlockSvg} block The block to start dragging.
 * @package
 */
Blockly.Gesture.prototype.forceStartBlockDrag = function(fakeEvent, block) {
  this.handleBlockStart(fakeEvent, block);
  this.handleWsStart(fakeEvent, block.workspace);
  this.isDraggingBlock_ = true;
  this.hasExceededDragRadius_ = true;
  this.startDraggingBlock_();
};

/**
 * Duplicate the target block and start dragging the duplicated block.
 * This should be done once we are sure that it is a block drag, and no earlier.
 * Specifically for argument reporters in custom block defintions.
 * @private
 */
Blockly.Gesture.prototype.duplicateOnDrag_ = function() {
  var newBlock = null;
  Blockly.Events.disable();
  try {
    // Note: targetBlock_ should have no children.  If it has children we would
    // need to update shadow block IDs to avoid problems in the VM.
    // Resizes will be reenabled at the end of the drag.
    this.startWorkspace_.setResizesEnabled(false);
    var xmlBlock = Blockly.Xml.blockToDom(this.targetBlock_);
    newBlock = Blockly.Xml.domToBlock(xmlBlock, this.startWorkspace_);

    // Move the duplicate to original position.
    var xy = this.targetBlock_.getRelativeToSurfaceXY();
    newBlock.moveBy(xy.x, xy.y);
    newBlock.setShadow(false);
  } finally {
    Blockly.Events.enable();
  }
  if (!newBlock) {
    // Something went wrong.
    console.error('Something went wrong while duplicating a block.');
    return;
  }
  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.BlockCreate(newBlock));
  }
  newBlock.select();
  this.targetBlock_ = newBlock;
};

Blockly.Gesture.ID = 0;
