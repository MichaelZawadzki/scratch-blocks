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
 * @fileoverview Methods for dragging a block visually.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.BlockDragger');

goog.require('Blockly.InsertionMarkerManager');

goog.require('goog.math.Coordinate');
goog.require('goog.asserts');


/**
 * Class for a block dragger.  It moves blocks around the workspace when they
 * are being dragged by a mouse or touch.
 * @param {!Blockly.Block} block The block to drag.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace to drag on.
 * @constructor
 */
Blockly.BlockDragger = function(block, workspace) {
  /**
   * The top block in the stack that is being dragged.
   * @type {!Blockly.BlockSvg}
   * @private
   */
  this.draggingBlock_ = block;


   /**
   * The parent of the top block in the stack that is being dragged when drag starts.
   * @type {!Blockly.BlockSvg}
   * @private
   */
  this.initialDragParent_ = null;

  /**
   * The workspace on which the block is being dragged.
   * @type {!Blockly.WorkspaceSvg}
   * @private
   */
  this.workspace_ = workspace;

  /**
   * Object that keeps track of connections on dragged blocks.
   * @type {!Blockly.InsertionMarkerManager}
   * @private
   */
  // OB: Gets created once the drag actually starts; this is because we don't know which block we will use for the insertion manager
  this.draggedConnectionManager_ = null; //new Blockly.InsertionMarkerManager(this.draggingBlock_);

  /**
   * Which delete area the mouse pointer is over, if any.
   * One of {@link Blockly.DELETE_AREA_TRASH},
   * {@link Blockly.DELETE_AREA_TOOLBOX}, or {@link Blockly.DELETE_AREA_NONE}.
   * @type {?number}
   * @private
   */
  this.deleteArea_ = null;

  /**
   * Whether the block would be deleted if dropped immediately.
   * @type {boolean}
   * @private
   */
  this.wouldDeleteBlock_ = false;

  /**
   * The location of the top left corner of the dragging block at the beginning
   * of the drag in workspace coordinates.
   * @type {!goog.math.Coordinate}
   * @private
   */
  this.startXY_ = this.draggingBlock_.getRelativeToSurfaceXY();

  /**
   * A list of all of the icons (comment, warning, and mutator) that are
   * on this block and its descendants.  Moving an icon moves the bubble that
   * extends from it if that bubble is open.
   * @type {Array.<!Object>}
   * @private
   */
  this.dragIconData_ = Blockly.BlockDragger.initIconData_(block);

  this.isDraggingChosenBlocks = false;
};

/**
 * Sever all links from this object.
 * @package
 */
Blockly.BlockDragger.prototype.dispose = function() {
  this.draggingBlock_ = null;
  this.workspace_ = null;
  this.startWorkspace_ = null;
  this.dragIconData_.length = 0;

  if (this.draggedConnectionManager_) {
    this.draggedConnectionManager_.dispose();
    this.draggedConnectionManager_ = null;
  }
};

/**
 * Make a list of all of the icons (comment, warning, and mutator) that are
 * on this block and its descendants.  Moving an icon moves the bubble that
 * extends from it if that bubble is open.
 * @param {!Blockly.BlockSvg} block The root block that is being dragged.
 * @return {!Array.<!Object>} The list of all icons and their locations.
 * @private
 */
Blockly.BlockDragger.initIconData_ = function(block) {
  // Build a list of icons that need to be moved and where they started.
  var dragIconData = [];
  var descendants = block.getDescendants();
  for (var i = 0, descendant; descendant = descendants[i]; i++) {
    var icons = descendant.getIcons();
    for (var j = 0; j < icons.length; j++) {
      var data = {
        // goog.math.Coordinate with x and y properties (workspace coordinates).
        location: icons[j].getIconLocation(),
        // Blockly.Icon
        icon: icons[j]
      };
      dragIconData.push(data);
    }
  }
  return dragIconData;
};

/**
 * Start dragging a block.  This includes moving it to the drag surface.
 * @param {!goog.math.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at mouse down, in pixel units.
 * @package
 */
Blockly.BlockDragger.prototype.startBlockDrag = function(currentDragDeltaXY) {
  if (!Blockly.Events.getGroup()) {
    Blockly.Events.setGroup(true);
  }
  // OB: Add an event when a block is dragged
  // OB [CSI-633] Make sure to fire the event BEFORE the disconnection has happened,
  // so we can know what block was the parent of this one (so UNDO works properly)
  var eventsEnabled = Blockly.Events.isEnabled();
  if (eventsEnabled) {
     var event = new Blockly.Events.StartDrag(this.draggingBlock_);
     Blockly.Events.fire(event);
  }

  this.workspace_.setResizesEnabled(false);
  Blockly.BlockSvg.disconnectUiStop_();

  // OB: If we only drag one chosen block at a time, do dragging like it used to be
  this.isDraggingChosenBlocks = (Blockly.BlocksSelection.isDraggingChosenBlocks() && Blockly.BlocksSelection.blocks.length > 1);

  // Drag block selection
  if(this.isDraggingChosenBlocks) {
    var reconnectStack = (this.workspace_.options.dragSingleBlock === true);
    var topBlock = Blockly.BlocksSelection.getTopChosenBlock();
    this.initialDragParent_ = topBlock.parentBlock_;
    Blockly.BlocksSelection.unplugBlocks(reconnectStack);

    var delta = this.pixelsToWorkspaceUnits_(currentDragDeltaXY);
    var newLoc = goog.math.Coordinate.sum(this.startXY_, delta);
    var relativeToTopXY = this.draggingBlock_.getRelativeToElementXY(topBlock.svgGroup_);
    topBlock.translate(newLoc.x, newLoc.y);
    topBlock.disconnectUiEffect();

    topBlock.setDragging(true);
    topBlock.moveToDragSurface_();

    if(this.draggingBlock_ != topBlock) {
      var dragSurface = this.draggingBlock_.workspace.blockDragSurface_;
      dragSurface.setSurfaceOffsetXY(goog.math.Coordinate.difference(new goog.math.Coordinate(0, 0), relativeToTopXY));
    }

    this.draggedConnectionManager_ = new Blockly.InsertionMarkerManager(topBlock);
  }
  // Regular dragging
  else 
  {
    this.initialDragParent_ = this.draggingBlock_.parentBlock_;
    
    var reconnectStack = (this.workspace_.options.dragSingleBlock === true);
    if (this.draggingBlock_.getParent() || reconnectStack) {
      this.draggingBlock_.unplug(reconnectStack);
      var delta = this.pixelsToWorkspaceUnits_(currentDragDeltaXY);
      var newLoc = goog.math.Coordinate.sum(this.startXY_, delta);
      
      this.draggingBlock_.translate(newLoc.x, newLoc.y);
      this.draggingBlock_.disconnectUiEffect();
    }

    this.draggingBlock_.setDragging(true);
    // For future consideration: we may be able to put moveToDragSurface inside
    // the block dragger, which would also let the block not track the block drag
    // surface.
    this.draggingBlock_.moveToDragSurface_();


    this.draggedConnectionManager_ = new Blockly.InsertionMarkerManager(this.draggingBlock_);
  }

  if (this.workspace_.toolbox_) {
    this.workspace_.toolbox_.addDeleteStyle();
  }

  this.workspace_.updateHighlightLayer();
};

/**
 * Execute a step of block dragging, based on the given event.  Update the
 * display accordingly.
 * @param {!Event} e The most recent move event.
 * @param {!goog.math.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at the start of the drag, in pixel units.
 * @package
 */
Blockly.BlockDragger.prototype.dragBlock = function(e, currentDragDeltaXY) {
  
  var delta = this.pixelsToWorkspaceUnits_(currentDragDeltaXY);
  var newLoc = goog.math.Coordinate.sum(this.startXY_, delta);

  this.draggingBlock_.moveDuringDrag(newLoc);
  this.dragIcons_(delta);

  this.deleteArea_ = this.workspace_.isDeleteArea(e);
  
  // // OB TEMP: Insertion marker is messing up the dragging, so disable it for now
  // if(this.isDraggingChosenBlocks === false)
  {
    this.draggedConnectionManager_.update(delta, this.deleteArea_);
  }

  this.updateCursorDuringBlockDrag_();
};

/**
 * Finish a block drag and put the block back on the workspace.
 * @param {!Event} e The mouseup/touchend event.
 * @param {!goog.math.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at the start of the drag, in pixel units.
 * @package
 */
Blockly.BlockDragger.prototype.endBlockDrag = function(e, currentDragDeltaXY) {
  // Make sure internal state is fresh.
  this.dragBlock(e, currentDragDeltaXY);
  this.dragIconData_ = [];

  Blockly.BlockSvg.disconnectUiStop_();

  var delta;
  var newLoc;

  // OB: [CSI-211] : snap a block back to the workspace marked as "non-deletable" and "always available"
  var snappedBack = this.maybeSnapBackBlock_(e);
  if(snappedBack) {
    Blockly.Events.disable();
    delta = new goog.math.Coordinate(0, 0);
    newLoc = this.startXY_;
  }
  else {
    delta = this.pixelsToWorkspaceUnits_(currentDragDeltaXY);
    newLoc = goog.math.Coordinate.sum(this.startXY_, delta);
  }

  var currentBlock;
  if(this.isDraggingChosenBlocks) {
    currentBlock = Blockly.BlocksSelection.getTopChosenBlock();
  }
  else {
    currentBlock = this.draggingBlock_;
  }

  // Scratch-specific: note possible illegal definition deletion for rollback below.
  // OB: When dragging multiple blocks, we night need to make sure we check all the blocks if they are procedures?
  var isDeletingProcDef = this.wouldDeleteBlock_ &&
      (this.draggingBlock_.type == Blockly.PROCEDURES_DEFINITION_BLOCK_TYPE);
  
  //this.draggingBlock_.moveOffDragSurface_(newLoc);
  currentBlock.moveOffDragSurface_(newLoc);
  
  var changedParent = false;
  var deleted = this.maybeDeleteBlock_();
  var deletedNewBlock = false;
  var isNewBlock = false;

  if (deleted) {
     //If we created a new block only to instantly delete it, dont save the Event
     if(this.workspace_.flyout_ && this.workspace_.flyout_.hasPendingNewBlock())
     {
        Blockly.Events.disable();
        deletedNewBlock = true;
     }
   }else{ //!deleted
    
    //If we have a new block from the flyout and we didn't delete it after dragging, create the 
    //undo/redo Event now. 
    if(this.workspace_.flyout_ && this.workspace_.flyout_.hasPendingNewBlock()){
        Blockly.Events.fire(new Blockly.Events.Create(this.workspace_.flyout_.getPendingNewBlock()));
        isNewBlock = true;
    }

    // These are expensive and don't need to be done if we're deleting.
    //this.draggingBlock_.moveConnections_(delta.x, delta.y);
    //this.draggingBlock_.setDragging(false);
    currentBlock.moveConnections_(delta.x, delta.y);
    currentBlock.setDragging(false);
    this.draggedConnectionManager_.applyConnections();

    //If we moved the block, but didnt change it's parent AND if it isnt a new block then we dont want to 
    //add the event to the undo/redo stack
    //var currentParent = this.draggingBlock_.parentBlock_;
    var currentParent = currentBlock.parentBlock_;
    changedParent = (currentParent !== this.initialDragParent_) || isNewBlock === true;
    if(!changedParent){
      Blockly.Events.recordUndo = false;
    }
    //Whether we record or not, we need to flush these out here. 
    Blockly.Events.fireSavedEvents();
    
    //this.draggingBlock_.render();
    currentBlock.render();
    this.fireMoveEvent_();
    //this.draggingBlock_.scheduleSnapAndBump();
    currentBlock.scheduleSnapAndBump();
  }

  this.workspace_.setResizesEnabled(true);

  //We have released the block, so if it's a NEW block from the flyout, let the flyout know. 
  if(this.workspace_.flyout_ && this.workspace_.flyout_.hasPendingNewBlock()){
    this.workspace_.flyout_.clearPendingNewBlock();
  }

  if(snappedBack || deletedNewBlock) {//(!changedParent && !deleted) {
   Blockly.Events.clearPendingUndo();
   Blockly.Events.enable();
  }

  if (this.workspace_.toolbox_) {
    this.workspace_.toolbox_.removeDeleteStyle();
  }
  Blockly.Events.setGroup(false);
  
  // Scratch-specific: roll back deletes that create call blocks with defines.
  // Have to wait for connections to be re-established, so put in setTimeout.
  // Only do this if we deleted a proc def.
  if (isDeletingProcDef) {
    var ws = this.workspace_;
    setTimeout(function() {
      var allBlocks = ws.getAllBlocks();
      for (var i = 0; i < allBlocks.length; i++) {
        var block = allBlocks[i];
        if (block.type == Blockly.PROCEDURES_CALL_BLOCK_TYPE) {
          var procCode = block.getProcCode();
          // Check for call blocks with no associated define block.
          if (!Blockly.Procedures.getDefineBlock(procCode, ws)) {
            // TODO:(#1151)
            alert('To delete a block definition, first remove all uses of the block');
            ws.undo();
            return; // There can only be one define deletion at a time.
          }
        }
      }
      // The proc deletion was valid, update the toolbox.
      ws.refreshToolboxSelection_();
    });
  }

  Blockly.Events.recordUndo = true;
};

/**
 * OB
 * Some blocks cannot be deleted. If the user tries to delete one of them, let the app know
 * (and eventually snap it back to its last position).
 * @param {!Event} e The mouseup/touchend event.
 * @package
 */
Blockly.BlockDragger.prototype.maybeSnapBackBlock_ = function(e) {
  var snapBack = false;
  if( this.draggingBlock_.isDeletable() === false && this.draggingBlock_.isAlwaysAvailable() === true ) {
    var deleteArea = this.workspace_.isDeleteArea(e);
    if( !this.draggingBlock_.getParent() && deleteArea === Blockly.DELETE_AREA_TOOLBOX ) {
      snapBack = true;
    }
  }
  return snapBack;
};

/**
 * Fire a move event at the end of a block drag.
 * @private
 */
Blockly.BlockDragger.prototype.fireMoveEvent_ = function() {
  var event = new Blockly.Events.BlockMove(this.draggingBlock_);
  event.oldCoordinate = this.startXY_;
  event.recordNew();
  Blockly.Events.fire(event);
};

/**
 * Shut the trash can and, if necessary, delete the dragging block.
 * Should be called at the end of a block drag.
 * @return {boolean} whether the block was deleted.
 * @private
 */
Blockly.BlockDragger.prototype.maybeDeleteBlock_ = function() {
  var trashcan = this.workspace_.trashcan;

  if (this.wouldDeleteBlock_) {
    if (trashcan) {
      goog.Timer.callOnce(trashcan.close, 100, trashcan);
    }
    // OB [CSI-664]:
    // Taking a block out of a sub-stack will create move events for the other blocks being repositioned.
    // However, the events are saved and are delayed to when the block is actually dropped.
    // This code path, where we delete a block, would end up never firing the saved events, and so
    // the undo/redo functions would get all messed up.
    // Fix: force a firing of the saved events. Hopefully nothing else breaks! Stupid events...
    Blockly.Events.fireSavedEvents();
    // Fire a move event, so we know where to go back to for an undo.
    this.fireMoveEvent_();
    var currentBlock;
    if(this.isDraggingChosenBlocks) {
      currentBlock = Blockly.BlocksSelection.getTopChosenBlock();
    }
    else {
      currentBlock = this.draggingBlock_;
    }
    currentBlock.dispose(false, true);
  } else if (trashcan) {
    // Make sure the trash can is closed.
    trashcan.close();
  }
  return this.wouldDeleteBlock_;
};

/**
 * Update the cursor (and possibly the trash can lid) to reflect whether the
 * dragging block would be deleted if released immediately.
 * @private
 */
Blockly.BlockDragger.prototype.updateCursorDuringBlockDrag_ = function() {
  this.wouldDeleteBlock_ = this.draggedConnectionManager_.wouldDeleteBlock();
  var trashcan = this.workspace_.trashcan;

  var currentBlock;
  // if(this.isDraggingChosenBlocks) {
  //   currentBlock = Blockly.BlocksSelection.getTopChosenBlock();
  // }
  // else 
  {
    currentBlock = this.draggingBlock_;
  }

  if (this.wouldDeleteBlock_) {
    //this.draggingBlock_.setDeleteStyle(true);
    currentBlock.setDeleteStyle(true);
    if (this.deleteArea_ == Blockly.DELETE_AREA_TRASH && trashcan) {
      trashcan.setOpen_(true);
    }
  } else {
    //this.draggingBlock_.setDeleteStyle(false);
    currentBlock.setDeleteStyle(false);
    if (trashcan) {
      trashcan.setOpen_(false);
    }
  }
};

/**
 * Convert a coordinate object from pixels to workspace units, including a
 * correction for mutator workspaces.
 * This function does not consider differing origins.  It simply scales the
 * input's x and y values.
 * @param {!goog.math.Coordinate} pixelCoord A coordinate with x and y values
 *     in css pixel units.
 * @return {!goog.math.Coordinate} The input coordinate divided by the workspace
 *     scale.
 * @private
 */
Blockly.BlockDragger.prototype.pixelsToWorkspaceUnits_ = function(pixelCoord) {
  var result = new goog.math.Coordinate(pixelCoord.x / this.workspace_.scale,
      pixelCoord.y / this.workspace_.scale);
  if (this.workspace_.isMutator) {
    // If we're in a mutator, its scale is always 1, purely because of some
    // oddities in our rendering optimizations.  The actual scale is the same as
    // the scale on the parent workspace.
    // Fix that for dragging.
    var mainScale = this.workspace_.options.parentWorkspace.scale;
    result = result.scale(1 / mainScale);
  }
  return result;
};

/**
 * Move all of the icons connected to this drag.
 * @param {!goog.math.Coordinate} dxy How far to move the icons from their
 *     original positions, in workspace units.
 * @private
 */
Blockly.BlockDragger.prototype.dragIcons_ = function(dxy) {
  // Moving icons moves their associated bubbles.
  for (var i = 0; i < this.dragIconData_.length; i++) {
    var data = this.dragIconData_[i];
    data.icon.setIconLocation(goog.math.Coordinate.sum(data.location, dxy));
  }
};
