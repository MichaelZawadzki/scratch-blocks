/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
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
 * @fileoverview Classes for all types of block events.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.Events.BlockBase');
goog.provide('Blockly.Events.BlockChange');
goog.provide('Blockly.Events.BlockCreate');
goog.provide('Blockly.Events.BlockDelete');
goog.provide('Blockly.Events.BlockMove');
goog.provide('Blockly.Events.Change');  // Deprecated.
goog.provide('Blockly.Events.Create');  // Deprecated.
goog.provide('Blockly.Events.Delete');  // Deprecated.
goog.provide('Blockly.Events.Move');  // Deprecated.

goog.require('Blockly.Events');
goog.require('Blockly.Events.Abstract');

goog.require('goog.array');
goog.require('goog.math.Coordinate');


/**
 * Abstract class for a block event.
 * @param {Blockly.Block} block The block this event corresponds to.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.BlockBase = function(block) {
  Blockly.Events.BlockBase.superClass_.constructor.call(this);

  /**
   * The block id for the block this event pertains to
   * @type {string}
   */
  this.blockId = block.id;
  this.workspaceId = block.workspace.id;
};
goog.inherits(Blockly.Events.BlockBase, Blockly.Events.Abstract);

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.BlockBase.prototype.toJson = function() {
  var json = Blockly.Events.BlockBase.superClass_.toJson.call(this);
  json['blockId'] = this.blockId;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.BlockBase.prototype.fromJson = function(json) {
  Blockly.Events.BlockBase.superClass_.toJson.call(this);
  this.blockId = json['blockId'];
};

/**
 * Class for a block change event.
 * @param {Blockly.Block} block The changed block.  Null for a blank event.
 * @param {string} element One of 'field', 'comment', 'disabled', etc.
 * @param {?string} name Name of input or field affected, or null.
 * @param {*} oldValue Previous value of element.
 * @param {*} newValue New value of element.
 * @extends {Blockly.Events.BlockBase}
 * @constructor
 */
Blockly.Events.Change = function(block, element, name, oldValue, newValue) {
  if (!block) {
    return;  // Blank event to be populated by fromJson.
  }
  Blockly.Events.Change.superClass_.constructor.call(this, block);
  this.element = element;
  this.name = name;
  this.oldValue = oldValue;
  this.newValue = newValue;
};
goog.inherits(Blockly.Events.Change, Blockly.Events.BlockBase);

/**
 * Class for a block change event.
 * @param {Blockly.Block} block The changed block.  Null for a blank event.
 * @param {string} element One of 'field', 'comment', 'disabled', etc.
 * @param {?string} name Name of input or field affected, or null.
 * @param {*} oldValue Previous value of element.
 * @param {*} newValue New value of element.
 * @extends {Blockly.Events.BlockBase}
 * @constructor
 */
Blockly.Events.BlockChange = Blockly.Events.Change;

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.Change.prototype.type = Blockly.Events.CHANGE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.Change.prototype.toJson = function() {
  var json = Blockly.Events.Change.superClass_.toJson.call(this);
  json['element'] = this.element;
  if (this.name) {
    json['name'] = this.name;
  }
  json['newValue'] = this.newValue;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.Change.prototype.fromJson = function(json) {
  Blockly.Events.Change.superClass_.fromJson.call(this, json);
  this.element = json['element'];
  this.name = json['name'];
  this.newValue = json['newValue'];
};

/**
 * Does this event record any change of state?
 * @return {boolean} False if something changed.
 */
Blockly.Events.Change.prototype.isNull = function() {
  return this.oldValue == this.newValue;
};

/**
 * Run a change event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.Change.prototype.run = function(forward) {
  var workspace = this.getEventWorkspace_();
  var block = workspace.getBlockById(this.blockId);
  if (!block) {
    console.warn("Can't change non-existent block: " + this.blockId);
    return;
  }
  if (block.mutator) {
    // Close the mutator (if open) since we don't want to update it.
    block.mutator.setVisible(false);
  }
  var value = forward ? this.newValue : this.oldValue;
  switch (this.element) {
    case 'field':
      var field = block.getField(this.name);
      if (field) {
        // Run the validator for any side-effects it may have.
        // The validator's opinion on validity is ignored.
        field.callValidator(value);
        field.setValue(value);
      } else {
        console.warn("Can't set non-existent field: " + this.name);
      }
      break;
    case 'comment':
      block.setCommentText(value || null);
      break;
    case 'collapsed':
      block.setCollapsed(value);
      break;
    case 'disabled':
      block.setDisabled(value);
      break;
    case 'inline':
      block.setInputsInline(value);
      break;
    case 'mutation':
      var oldMutation = '';
      if (block.mutationToDom) {
        var oldMutationDom = block.mutationToDom();
        oldMutation = oldMutationDom && Blockly.Xml.domToText(oldMutationDom);
      }
      if (block.domToMutation) {
        value = value || '<mutation></mutation>';
        var dom = Blockly.Xml.textToDom('<xml>' + value + '</xml>');
        block.domToMutation(dom.firstChild);
      }
      Blockly.Events.fire(new Blockly.Events.Change(
          block, 'mutation', null, oldMutation, value));
      break;
    default:
      console.warn('Unknown change type: ' + this.element);
  }
};

/**
 * Class for a block creation event.
 * @param {Blockly.Block} block The created block.  Null for a blank event.
 * @extends {Blockly.Events.BlockBase}
 * @constructor
 */
Blockly.Events.Create = function(block) {
  if (!block) {
    return;  // Blank event to be populated by fromJson.
  }
  Blockly.Events.Create.superClass_.constructor.call(this, block);

  if (block.workspace.rendered) {
    this.xml = Blockly.Xml.blockToDomWithXY(block);
  } else {
    this.xml = Blockly.Xml.blockToDom(block);
  }
  this.ids = Blockly.Events.getDescendantIds_(block);
};
goog.inherits(Blockly.Events.Create, Blockly.Events.BlockBase);

/**
 * Class for a block creation event.
 * @param {Blockly.Block} block The created block. Null for a blank event.
 * @extends {Blockly.Events.BlockBase}
 * @constructor
 */
Blockly.Events.BlockCreate = Blockly.Events.Create;

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.Create.prototype.type = Blockly.Events.CREATE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.Create.prototype.toJson = function() {
  var json = Blockly.Events.Create.superClass_.toJson.call(this);
  json['xml'] = Blockly.Xml.domToText(this.xml);
  json['ids'] = this.ids;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.Create.prototype.fromJson = function(json) {
  Blockly.Events.Create.superClass_.fromJson.call(this, json);
  this.xml = Blockly.Xml.textToDom('<xml>' + json['xml'] + '</xml>').firstChild;
  this.ids = json['ids'];
};

/**
 * Run a creation event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.Create.prototype.run = function(forward) {
  var workspace = this.getEventWorkspace_();
  if (forward) {
    var xml = goog.dom.createDom('xml');
    xml.appendChild(this.xml);
    Blockly.Xml.domToWorkspace(xml, workspace);
  } else {
    for (var i = 0, id; id = this.ids[i]; i++) {
      var block = workspace.getBlockById(id);
      if (block) {
        block.dispose(false, false);
      } else if (id == this.blockId) {
        // Only complain about root-level block.
        console.warn("Can't uncreate non-existent block: " + id);
      }
    }
  }
};

/**
 * Class for a block deletion event.
 * @param {Blockly.Block} block The deleted block.  Null for a blank event.
 * @extends {Blockly.Events.BlockBase}
 * @constructor
 */
Blockly.Events.Delete = function(block) {
  if (!block) {
    return;  // Blank event to be populated by fromJson.
  }
  if (block.getParent()) {
    throw 'Connected blocks cannot be deleted.';
  }
  Blockly.Events.Delete.superClass_.constructor.call(this, block);

  if (block.workspace.rendered) {
    this.oldXml = Blockly.Xml.blockToDomWithXY(block);
  } else {
    this.oldXml = Blockly.Xml.blockToDom(block);
  }
  this.ids = Blockly.Events.getDescendantIds_(block);
};
goog.inherits(Blockly.Events.Delete, Blockly.Events.BlockBase);

/**
 * Class for a block deletion event.
 * @param {Blockly.Block} block The deleted block.  Null for a blank event.
 * @extends {Blockly.Events.BlockBase}
 * @constructor
 */
Blockly.Events.BlockDelete = Blockly.Events.Delete;

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.Delete.prototype.type = Blockly.Events.DELETE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.Delete.prototype.toJson = function() {
  var json = Blockly.Events.Delete.superClass_.toJson.call(this);
  json['ids'] = this.ids;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.Delete.prototype.fromJson = function(json) {
  Blockly.Events.Delete.superClass_.fromJson.call(this, json);
  this.ids = json['ids'];
};

/**
 * Run a deletion event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.Delete.prototype.run = function(forward) {
  var workspace = this.getEventWorkspace_();
  if (forward) {
    for (var i = 0, id; id = this.ids[i]; i++) {
      var block = workspace.getBlockById(id);
      if (block) {
        block.dispose(false, false);
      } else if (id == this.blockId) {
        // Only complain about root-level block.
        console.warn("Can't delete non-existent block: " + id);
      }
    }
  } else {
    var xml = goog.dom.createDom('xml');
    xml.appendChild(this.oldXml);
    Blockly.Xml.domToWorkspace(xml, workspace);
  }
};

/**
 * Class for a block move event.  Created before the move.
 * @param {Blockly.Block} block The moved block.  Null for a blank event.
 * @extends {Blockly.Events.BlockBase}
 * @constructor
 */
Blockly.Events.Move = function(block) {
  if (!block) {
    return;  // Blank event to be populated by fromJson.
  }
  Blockly.Events.Move.superClass_.constructor.call(this, block);
  var location = this.currentLocation_();
  this.oldParentId = location.parentId;
  this.oldInputName = location.inputName;
  this.oldCoordinate = location.coordinate;
};
goog.inherits(Blockly.Events.Move, Blockly.Events.BlockBase);

/**
 * Class for a block move event.  Created before the move.
 * @param {Blockly.Block} block The moved block.  Null for a blank event.
 * @extends {Blockly.Events.BlockBase}
 * @constructor
 */
Blockly.Events.BlockMove = Blockly.Events.Move;

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.Move.prototype.type = Blockly.Events.MOVE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.Move.prototype.toJson = function() {
  var json = Blockly.Events.Move.superClass_.toJson.call(this);
  if (this.newParentId) {
    json['newParentId'] = this.newParentId;
  }
  if (this.newInputName) {
    json['newInputName'] = this.newInputName;
  }
  if (this.newCoordinate) {
    json['newCoordinate'] = Math.round(this.newCoordinate.x) + ',' +
        Math.round(this.newCoordinate.y);
  }
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.Move.prototype.fromJson = function(json) {
  Blockly.Events.Move.superClass_.fromJson.call(this, json);
  this.newParentId = json['newParentId'];
  this.newInputName = json['newInputName'];
  if (json['newCoordinate']) {
    var xy = json['newCoordinate'].split(',');
    this.newCoordinate =
        new goog.math.Coordinate(parseFloat(xy[0]), parseFloat(xy[1]));
  }
};

/**
 * Record the block's new location.  Called after the move.
 */
Blockly.Events.Move.prototype.recordNew = function() {
  var location = this.currentLocation_();
  this.newParentId = location.parentId;
  this.newInputName = location.inputName;
  this.newCoordinate = location.coordinate;
};

/**
 * Returns the parentId and input if the block is connected,
 *   or the XY location if disconnected.
 * @return {!Object} Collection of location info.
 * @private
 */
Blockly.Events.Move.prototype.currentLocation_ = function() {
  var workspace = Blockly.Workspace.getById(this.workspaceId);
  var block = workspace.getBlockById(this.blockId);
  var location = {};
  var parent = block.getParent();
  if (parent) {
    location.parentId = parent.id;
    var input = parent.getInputWithBlock(block);
    if (input) {
      location.inputName = input.name;
    }
  } else {
    location.coordinate = block.getRelativeToSurfaceXY();
  }
  return location;
};

/**
 * Does this event record any change of state?
 * @return {boolean} False if something changed.
 */
Blockly.Events.Move.prototype.isNull = function() {
  return this.oldParentId == this.newParentId &&
      this.oldInputName == this.newInputName &&
      goog.math.Coordinate.equals(this.oldCoordinate, this.newCoordinate);
};

/**
 * Run a move event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.Move.prototype.run = function(forward) {
  var workspace = this.getEventWorkspace_();
  var block = workspace.getBlockById(this.blockId);
  if (!block) {
    console.warn("Can't move non-existent block: " + this.blockId);
    return;
  }
  var parentId = forward ? this.newParentId : this.oldParentId;
  var inputName = forward ? this.newInputName : this.oldInputName;
  var coordinate = forward ? this.newCoordinate : this.oldCoordinate;
  var parentBlock = null;
  if (parentId) {
    parentBlock = workspace.getBlockById(parentId);
    if (!parentBlock) {
      console.warn("Can't connect to non-existent block: " + parentId);
      return;
    }
  }
  if (block.getParent()) {
    block.unplug();
  }
  if (coordinate) {
    var xy = block.getRelativeToSurfaceXY();
    block.moveBy(coordinate.x - xy.x, coordinate.y - xy.y);
  } else {
    var blockConnection = block.outputConnection || block.previousConnection;
    var parentConnection;
    if (inputName) {
      var input = parentBlock.getInput(inputName);
      if (input) {
        parentConnection = input.connection;
      }
    } else if (blockConnection.type == Blockly.PREVIOUS_STATEMENT) {
      parentConnection = parentBlock.nextConnection;
    }
    if (parentConnection) {
      blockConnection.connect(parentConnection);
    } else {
      console.warn("Can't connect to non-existent input: " + inputName);
    }
  }
};




/**
 * Class for a block drag event.
 * OB: This was created by us Amplify
 * Was added for a reason... why?! It replaces one of the MOVE even we get when dragging a block,
 * that we save for later.
 * @param {Blockly.Block} block The moved block.  Null for a blank event.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.StartDrag = function(block) {
  if (!block) {
    return;  // Blank event to be populated by fromJson.
  }
  Blockly.Events.StartDrag.superClass_.constructor.call(this, block);
  var location = this.currentLocation_();
  this.oldParentId = location.parentId;
  this.oldInputName = location.inputName;
  this.oldCoordinate = location.coordinate;
  this.fromFlyout = block.isFromFlyout_;
  //this.recordUndo = false;
};
//goog.inherits(Blockly.Events.StartDrag, Blockly.Events.Abstract);
goog.inherits(Blockly.Events.StartDrag, Blockly.Events.BlockBase);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.StartDrag.prototype.type = Blockly.Events.BLOCK_START_DRAG;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.StartDrag.prototype.toJson = function() {
  var json = Blockly.Events.StartDrag.superClass_.toJson.call(this);

  if (this.newParentId) {
    json['newParentId'] = this.newParentId;
  }
  if (this.newInputName) {
    json['newInputName'] = this.newInputName;
  }
  if (this.newCoordinate) {
    json['newCoordinate'] = Math.round(this.newCoordinate.x) + ',' +
        Math.round(this.newCoordinate.y);
  }
  if (this.fromFlyout) {
    json['fromFlyout'] = this.fromFlyout;
  }

  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.StartDrag.prototype.fromJson = function(json) {
  Blockly.Events.StartDrag.superClass_.fromJson.call(this, json);

  this.newParentId = json['newParentId'];
  this.newInputName = json['newInputName'];
  if (json['newCoordinate']) {
    var xy = json['newCoordinate'].split(',');
    this.newCoordinate =
        new goog.math.Coordinate(parseFloat(xy[0]), parseFloat(xy[1]));
  }
  this.fromFlyout = json['fromFlyout'];
};

Blockly.Events.StartDrag.prototype.currentLocation_ = function() {
  var workspace = Blockly.Workspace.getById(this.workspaceId);
  var block = workspace.getBlockById(this.blockId);
  var location = {};
  var parent = block.getParent();
  if (parent) {
    location.parentId = parent.id;
    var input = parent.getInputWithBlock(block);
    if (input) {
      location.inputName = input.name;
    }
  } else {
    location.coordinate = block.getRelativeToSurfaceXY();
  }
  return location;
};

/**
 * Run a start drag event.
 * OB: Same as move event... for CSI-633
 * Why don't we just run the normal MOVE event?
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.StartDrag.prototype.run = function(forward) {
  var workspace = this.getEventWorkspace_();
  var block = workspace.getBlockById(this.blockId);
  if (!block) {
    // OB [CSI-1105]
    // When dragging from toolbar, workspace can't find the block and it is OK;
    // In other cases, issue warning!
    if(!this.fromFlyout) {
      console.warn("Can't start drag non-existant block: " + this.blockId);
    }
    return;
  }
  var parentId = forward ? this.newParentId : this.oldParentId;
  var inputName = forward ? this.newInputName : this.oldInputName;
  var coordinate = forward ? this.newCoordinate : this.oldCoordinate;
  var parentBlock = null;
  if (parentId) {
    parentBlock = workspace.getBlockById(parentId);
    if (!parentBlock) {
      console.warn("Can't connect to non-existant block: " + parentId);
      return;
    }
  }
  if (block.getParent()) {
    block.unplug();
  }
  if (coordinate) {
    var xy = block.getRelativeToSurfaceXY();
    block.moveBy(coordinate.x - xy.x, coordinate.y - xy.y);
  } else {
    var blockConnection = block.outputConnection || block.previousConnection;
    var parentConnection;
    if (inputName) {
      var input = parentBlock.getInput(inputName);
      if (input) {
        parentConnection = input.connection;
      }
    } else if (blockConnection && blockConnection.type === Blockly.PREVIOUS_STATEMENT && parentBlock) {
      parentConnection = parentBlock.nextConnection;
    }
    if (parentConnection) {
      blockConnection.connect(parentConnection);
    } else {
      //Maxim: This is fine if moving an unconnected block to an non-connecting space
     // console.warn("Can't connect to non-existant input: " + inputName);
    }
  }
};

/**
 * Class for a block end drag event.
 * @param {Blockly.Block} block The moved block.  Null for a blank event.
 * @param {boolean} isOutside True if the moved block is outside of the
 *     blocks workspace.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.EndDrag = function(block, isOutside) {
  if (!block) {
    return;  // Blank event to be populated by fromJson.
  }
  Blockly.Events.EndDrag.superClass_.constructor.call(this, block);
  this.isOutside = isOutside;
  var location = this.currentLocation_();
  this.oldParentId = location.parentId;
  this.oldInputName = location.inputName;
  this.oldCoordinate = location.coordinate;
  // If drag ends outside the blocks workspace, send the block XML
  if (isOutside) {
    this.xml = Blockly.Xml.blockToDom(block, true /* opt_noId */);
  }
};
//goog.inherits(Blockly.Events.EndDrag, Blockly.Events.Abstract);
goog.inherits(Blockly.Events.EndDrag, Blockly.Events.BlockBase);

/**
 * Class for a block end drag event.
 * @param {Blockly.Block} block The moved block.  Null for a blank event.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.BlockEndDrag = Blockly.Events.EndDrag;

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.EndDrag.prototype.type = Blockly.Events.END_DRAG;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.EndDrag.prototype.toJson = function() {
  var json = Blockly.Events.EndDrag.superClass_.toJson.call(this);
  if (this.isOutside) {
    json['isOutside'] = this.isOutside;
  }
  if (this.xml) {
    json['xml'] = this.xml;
  }
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.EndDrag.prototype.fromJson = function(json) {
  Blockly.Events.EndDrag.superClass_.fromJson.call(this, json);
  this.isOutside = json['isOutside'];
  this.xml = json['xml'];
};

/**
 * Does this event record any change of state?
 * @return {boolean} True if something changed.
 */
Blockly.Events.EndDrag.prototype.isNull = function() {
  return false;
};

/**
 * Run an end drag event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.EndDrag.prototype.run = function(forward) {
  var workspace = this.getEventWorkspace_();
  var block = workspace.getBlockById(this.blockId);
  if (!block) {
    console.warn("Can't move non-existant block: " + this.blockId);
    return;
  }
  // MAXIM: Commented out code is copied from the ...Move.prototype.run function
  //        However it's not working as intended and is sometimes mixed
  //        with an actual Move.run event. We need to look deeper into 
  //        EVERY case where undo and run can be called and make sure each 
  //        event is doinf exactly what (and ONLY what) it needs to do. 
  // var parentId = forward ? this.newParentId : this.oldParentId;
  // var inputName = forward ? this.newInputName : this.oldInputName;
  var coordinate = forward ? this.newCoordinate : undefined;
  
  // var parentBlock = null;
  // if (parentId) {
  //   parentBlock = workspace.getBlockById(parentId);
  //   if (!parentBlock) {
  //     console.warn("Can't connect to non-existant block: " + parentId);
  //     return;
  //   }
  // }
  // if (block.getParent()) {
  //   block.unplug();
  // }

  if (coordinate) {
    var xy = block.getRelativeToSurfaceXY();
    block.moveBy(coordinate.x - xy.x, coordinate.y - xy.y);
  } 
  // else {
  //   var blockConnection = block.outputConnection || block.previousConnection;
  //   var parentConnection;
  //   if (inputName) {
  //     var input = parentBlock.getInput(inputName);
  //     if (input) {
  //       parentConnection = input.connection;
  //     }
  //   } else if (blockConnection && blockConnection.type === Blockly.PREVIOUS_STATEMENT && parentBlock) {
  //     parentConnection = parentBlock.nextConnection;
  //   }
  //   if (parentConnection) {
  //     blockConnection.connect(parentConnection);
  //   } else {
  //     //console.warn("Can't connect to non-existant input: " + inputName);
  //   }
  // }
};

/**
 * Returns the parentId and input if the block is connected,
 *   or the XY location if disconnected.
 * @return {!Object} Collection of location info.
 * @private
 */
Blockly.Events.EndDrag.prototype.currentLocation_ = function() {
  var workspace = Blockly.Workspace.getById(this.workspaceId);
  var block = workspace.getBlockById(this.blockId);
  var location = {};
  var parent = block.getParent();
  if (parent) {
    location.parentId = parent.id;
    var input = parent.getInputWithBlock(block);
    if (input) {
      location.inputName = input.name;
    }
  } else {
    location.coordinate = block.getRelativeToSurfaceXY();
  }
  return location;
};
