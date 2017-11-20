/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Google Inc.
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
 * @fileoverview A class that manages a surface for dragging blocks.  When a
 * block drag is started, we move the block (and children) to a separate dom
 * element that we move around using translate3d. At the end of the drag, the
 * blocks are put back in into the svg they came from. This helps performance by
 * avoiding repainting the entire svg on every mouse move while dragging blocks.
 * @author picklesrus
 */

'use strict';

goog.provide('Blockly.BlockSelectSurfaceSvg');
goog.require('Blockly.utils');
goog.require('goog.asserts');
goog.require('goog.math.Coordinate');


/**
 * Class for a drag surface for the currently dragged block. This is a separate
 * SVG that contains only the currently moving block, or nothing.
 * @param {!Element} container Containing element.
 * @constructor
 */
Blockly.BlockSelectSurfaceSvg = function(container) {
  /**
   * @type {!Element}
   * @private
   */
  this.container_ = container;
  this.createDom();
};

/**
 * The SVG drag surface. Set once by Blockly.BlockSelectSurfaceSvg.createDom.
 * @type {Element}
 * @private
 */
Blockly.BlockSelectSurfaceSvg.prototype.SVG_ = null;

/**
 * This is where blocks live while they are being dragged if the drag surface
 * is enabled.
 * @type {Element}
 * @private
 */
Blockly.BlockSelectSurfaceSvg.prototype.selectGroup_ = null;

/**
 * Containing HTML element; parent of the workspace and the drag surface.
 * @type {Element}
 * @private
 */
Blockly.BlockSelectSurfaceSvg.prototype.container_ = null;

/**
 * Cached value for the scale of the drag surface.
 * Used to set/get the correct translation during and after a drag.
 * @type {number}
 * @private
 */
Blockly.BlockSelectSurfaceSvg.prototype.scale_ = 1;

/**
 * Cached value for the translation of the drag surface.
 * This translation is in pixel units, because the scale is applied to the
 * drag group rather than the top-level SVG.
 * @type {goog.math.Coordinate}
 * @private
 */
Blockly.BlockSelectSurfaceSvg.prototype.surfaceXY_ = null;

/**
 * ID for the drag shadow filter, set in createDom.
 * @type {string}
 * @private
 */
Blockly.BlockSelectSurfaceSvg.prototype.dragShadowFilterId_ = '';

/**
 * Standard deviation for gaussian blur on drag shadow, in px.
 * @type {number}
 * @const
 */
Blockly.BlockSelectSurfaceSvg.SHADOW_STD_DEVIATION = 6;

/**
 * Create the drag surface and inject it into the container.
 */
Blockly.BlockSelectSurfaceSvg.prototype.createDom = function() {
  if (this.SVG_) {
    return;  // Already created.
  }
  this.SVG_ = Blockly.utils.createSvgElement('svg', {
    'xmlns': Blockly.SVG_NS,
    'xmlns:html': Blockly.HTML_NS,
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1',
    'class': 'blocklyBlocksOutlineSurface'
  }, this.container_);
  var defs = Blockly.utils.createSvgElement('defs', {}, this.SVG_);
  this.selectFilterId_ = this.createOutlineDom_(defs);
  this.selectGroup_ = Blockly.utils.createSvgElement('g', {}, this.SVG_);
  this.selectGroup_.setAttribute('filter', 'url(#' + this.selectFilterId_ + ')');
};

/**
 * Scratch-specific: Create the SVG def for the drop shadow.
 * @param {Element} defs Defs element to insert the shadow filter definition
 * @return {string} ID for the filter element
 */
Blockly.BlockSelectSurfaceSvg.prototype.createOutlineDom_ = function(defs) {
  var rnd = String(Math.random()).substring(2);
  // Adjust these width/height, x/y properties to prevent the shadow from clipping
  var selectFilter = Blockly.utils.createSvgElement('filter',
    {'id': 'blocklySelectFilter' + rnd, 'height': '140%', 'width': '140%', y: '-20%', x: '-20%'}, defs);
  
  //Blockly.utils.createSvgElement('feGaussianBlur',
  //  {'in': 'SourceAlpha', 'stdDeviation': Blockly.BlockSelectSurfaceSvg.SHADOW_STD_DEVIATION}, selectFilter);
  

  Blockly.utils.createSvgElement('feMorphology',
    {'operator': 'dilate', 'radius': '4', 'result': 'border'}, selectFilter);
  Blockly.utils.createSvgElement('feFlood',
    {'flood-color': '#ff0000'}, selectFilter);
  Blockly.utils.createSvgElement('feComposite',
      {'in2': 'border', 'operator': 'in', 'result': 'border'}, selectFilter);
      
      
  var componentTransfer = Blockly.utils.createSvgElement('feComponentTransfer',
    {'result': 'offsetBlur'}, selectFilter);
  // Shadow opacity is specified in the adjustable colour library,
  // since the darkness of the shadow largely depends on the workspace colour.
  Blockly.utils.createSvgElement('feFuncA',
    {'type': 'linear', 'slope': Blockly.Colours.dragShadowOpacity}, componentTransfer);
  Blockly.utils.createSvgElement('feComposite',
    {'in': 'SourceGraphic', 'in2': 'offsetBlur', 'operator': 'over'}, selectFilter);
  return selectFilter.id;
};

// /**
//  * Set the SVG blocks on the drag surface's group and show the surface.
//  * Only one block group should be on the drag surface at a time.
//  * @param {!Element} blocks Block or group of blocks to place on the drag
//  * surface.
//  */
// //Blockly.BlockSelectSurfaceSvg.prototype.setBlocksAndShow = function(blocks) {
// Blockly.BlockSelectSurfaceSvg.prototype.setBlocksAndShow = function(topBlock, translateXY) {
//   //goog.asserts.assert(this.selectGroup_.childNodes.length == 0,
//   //  'Already selecting a block.');
//   // appendChild removes the blocks from the previous parent

//   var svgBlocks = topBlock.getSvgRoot();

//   console.log("Set blocks and show:");
//   console.log(topBlock.type);
//   // console.log("\thierarchy:");
//   // console.log(svgBlocks);
//   var prevBlock = topBlock.getParent();
//   var prevSvg;

//   if(prevBlock) {
//     console.log("Parent block is " + prevBlock.type);
//     console.log(prevBlock);
    
//     prevSvg = prevBlock.getSvgRoot().parentNode;
//   } else {
//     console.log("No previous block :(");    

//     prevSvg = topBlock.getSvgRoot().parentNode;
//   }

//   // Find first block that is NOT selected
//   var curBlock = topBlock;
//   while (curBlock != null && curBlock.isChosen_) {
//     curBlock = curBlock.getNextBlock();
//   }

//   var x = 0, y = 0;
//   if(curBlock) {
//     console.log("First non-selected block: " + curBlock.type);

//     var element = curBlock.getSvgRoot();
//     if (element) {
//       do {
//         console.log("Check element:");
//         console.log(element);
//         // Loop through this block and every parent.
//         var xy = Blockly.utils.getRelativeXY(element);
//         x += xy.x;
//         y += xy.y;

//         console.log("\trelative: " + xy.x + " " + xy.y);
//         console.log("\ttotal: " + x + " " + y);

//         element = element.parentNode;
//       } while (element && element != curBlock.workspace.getCanvas() /*&& element != selectSurfaceGroup*/);
//     }
    
//     // curBlock.clearTransformAttributes_();
//     // curBlock.translate(xy.x, xy.y);
//   }

//   // move top block and all SVG sub-blocks to select surface
//   this.selectGroup_.appendChild(topBlock.getSvgRoot());


//   console.log("BASE relative: " + translateXY.x + " " + translateXY.y);
//   if(curBlock) {
//     console.log("----> Append blocks to svg node:");
//     console.log(prevSvg);

//     prevSvg.appendChild(curBlock.getSvgRoot());

//     var translateX = 0, translateY = 0;
    
//     //curBlock.clearTransformAttributes_();
//     if(prevBlock) {
//       translateX = x;
//       translateY = y;
//     }
//     else {
//       translateX = translateXY.x + x;
//       translateY = translateXY.y + y;
//     }
//     curBlock.translate(translateX, translateY);

//     console.log("### Final: " + (translateX) + " " + (translateY));
//   }
  


// /*
//   var blocks = [];
//   var curBlock = topBlock;
//   while (curBlock != null && curBlock.isChosen_) {
//     blocks.push(curBlock)
//     curBlock = curBlock.getNextBlock();
//   }

//   console.log("Blocks to show:");
//   console.log(blocks);

//   console.log("Move to SVG select surface:");
//   var numBlocks = blocks.length;
//   //for(var i = numBlocks - 1; i >= 0; i--) {
//   for(var i = 0; i < numBlocks; i++) {
//     console.log("\t" + blocks[i].type);
//     console.log(blocks[i].getSvgRoot());

//     if(i == numBlocks - 1) {
//       if(blocks[i].getNextBlock() != null) {
//         prevSvg.appendChild(blocks[i].getNextBlock().getSvgRoot());
//       }
//     }
//     this.selectGroup_.appendChild(blocks[i].getSvgRoot());
//   }
// */


//   // //this.selectGroup_.appendChild(svgBlocks);
//   // this.SVG_.style.display = 'block';
//   // this.surfaceXY_ = new goog.math.Coordinate(0, 0);
//   // // This allows blocks to be dragged outside of the blockly svg space.
//   // // This should be reset to hidden at the end of the block drag.
//   // // Note that this behavior is different from blockly where block disappear
//   // // "under" the blockly area.
//   // var injectionDiv = document.getElementsByClassName('injectionDiv')[0];
//   // injectionDiv.style.overflow = 'visible';
//   this.show(translateXY);
// };
Blockly.BlockSelectSurfaceSvg.prototype.setBlocksAndShow = function(blocks) {
  goog.asserts.assert(this.selectGroup_.childNodes.length == 0,
    'Already dragging a block.');
  // appendChild removes the blocks from the previous parent
  this.selectGroup_.appendChild(blocks);
  this.show();
};

Blockly.BlockSelectSurfaceSvg.prototype.show = function(translateXY) {
  console.log("Show this guy");
  this.SVG_.style.display = 'block';
  this.surfaceXY_ = new goog.math.Coordinate(0, 0);
  // This allows blocks to be dragged outside of the blockly svg space.
  // This should be reset to hidden at the end of the block drag.
  // Note that this behavior is different from blockly where block disappear
  // "under" the blockly area.
  var injectionDiv = document.getElementsByClassName('injectionDiv')[0];
  injectionDiv.style.overflow = 'visible';
};

/**
 * Translate and scale the entire drag surface group to the given position, to
 * keep in sync with the workspace.
 * @param {number} x X translation in workspace coordinates.
 * @param {number} y Y translation in workspace coordinates.
 * @param {number} scale Scale of the group.
 */
Blockly.BlockSelectSurfaceSvg.prototype.translateAndScaleGroup = function(x, y, scale) {
  this.scale_ = scale;
  // This is a work-around to prevent a the blocks from rendering
  // fuzzy while they are being dragged on the drag surface.
  x = x.toFixed(0);
  y = y.toFixed(0);
  this.selectGroup_.setAttribute('transform', 'translate('+ x + ','+ y + ')' +
      ' scale(' + scale + ')');
};

/**
 * Translate the drag surface's SVG based on its internal state.
 * @private
 */
Blockly.BlockSelectSurfaceSvg.prototype.translateSurfaceInternal_ = function() {
  var x = this.surfaceXY_.x;
  var y = this.surfaceXY_.y;
  // This is a work-around to prevent a the blocks from rendering
  // fuzzy while they are being dragged on the drag surface.
  x = x.toFixed(0);
  y = y.toFixed(0);
  this.SVG_.style.display = 'block';

  Blockly.utils.setCssTransform(this.SVG_,
      'translate3d(' + x + 'px, ' + y + 'px, 0px)');
};

/**
 * Translate the entire drag surface during a drag.
 * We translate the drag surface instead of the blocks inside the surface
 * so that the browser avoids repainting the SVG.
 * Because of this, the drag coordinates must be adjusted by scale.
 * @param {number} x X translation for the entire surface.
 * @param {number} y Y translation for the entire surface.
 */
Blockly.BlockSelectSurfaceSvg.prototype.translateSurface = function(x, y) {
  this.surfaceXY_ = new goog.math.Coordinate(x * this.scale_, y * this.scale_);
  this.translateSurfaceInternal_();
};

/**
 * Reports the surface translation in scaled workspace coordinates.
 * Use this when finishing a drag to return blocks to the correct position.
 * @return {!goog.math.Coordinate} Current translation of the surface.
 */
Blockly.BlockSelectSurfaceSvg.prototype.getSurfaceTranslation = function() {
  var xy = Blockly.utils.getRelativeXY(this.SVG_);
  return new goog.math.Coordinate(xy.x / this.scale_, xy.y / this.scale_);
};

/**
 * Provide a reference to the drag group (primarily for
 * BlockSvg.getRelativeToSurfaceXY).
 * @return {Element} Drag surface group element.
 */
Blockly.BlockSelectSurfaceSvg.prototype.getGroup = function() {
  return this.selectGroup_;
};

/**
 * Get the current blocks on the drag surface, if any (primarily
 * for BlockSvg.getRelativeToSurfaceXY).
 * @return {!Element|undefined} Drag surface block DOM element, or undefined
 * if no blocks exist.
 */
Blockly.BlockSelectSurfaceSvg.prototype.getCurrentBlock = function() {
  return this.selectGroup_.firstChild;
};

/**
 * Clear the group and hide the surface; move the blocks off onto the provided
 * element.
 * If the block is being deleted it doesn't need to go back to the original
 * surface, since it would be removed immediately during dispose.
 * @param {Element} opt_newSurface Surface the dragging blocks should be moved
 *     to, or null if the blocks should be removed from this surface without
 *     being moved to a different surface.
 */
Blockly.BlockSelectSurfaceSvg.prototype.clearAndHide = function(opt_newSurface) {
  if (opt_newSurface) {
    // appendChild removes the node from this.selectGroup_
    opt_newSurface.appendChild(this.getCurrentBlock());
  } else {
    this.selectGroup_.removeChild(this.getCurrentBlock());
  }
  this.SVG_.style.display = 'none';
  goog.asserts.assert(this.selectGroup_.childNodes.length == 0,
    'Drag group was not cleared.');
  this.surfaceXY_ = null;

  // Reset the overflow property back to hidden so that nothing appears outside
  // of the blockly area.
  // Note that this behavior is different from blockly. See note in
  // setBlocksAndShow.
  var injectionDiv = document.getElementsByClassName('injectionDiv')[0];
  injectionDiv.style.overflow = 'hidden';
};


/**
 * Translate the layer so that it matches the workspace.
 */
Blockly.BlockSelectSurfaceSvg.prototype.translateLayer = function(x, y, scale) {
  // if (this.selectionRect_) {
  //   var translateX = x;
  //   var translateY = y;
  //   var translation = 'translate(' + translateX + ',' + translateY + ') ';
  //   this.selectionRect_.setAttribute('transform', translation);
  // }
};


