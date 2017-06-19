/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview Generating JavaScript for variable blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.JavaScript.variables');

goog.require('Blockly.JavaScript');


Blockly.JavaScript['data_variablemenu'] = function(block)
{
  var varName = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VARIABLE'), Blockly.Variables.NAME_TYPE);
  return [varName, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['data_variable'] = function(block)
{
  //var code = Blockly.JavaScript.valueToCode(block, 'VARIABLE', Blockly.JavaScript.ORDER_NONE)
  var varName = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VARIABLE'), Blockly.Variables.NAME_TYPE);
  return [varName, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['data_setvariableto'] = function(block)
{
  //var varName = Blockly.JavaScript.valueToCode(block, 'VARIABLE', Blockly.JavaScript.ORDER_NONE)
  var varName = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VARIABLE'), Blockly.Variables.NAME_TYPE);
  var value = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
  
  // Attempt to convert value to a number
  var num = value.substring(1, value.length-1)
  
  if (isNaN(num))
  {
    num = value;
  }
  
  return varName + ' = ' + num + ';\n';
};

Blockly.JavaScript['data_changevariableby'] = function(block)
{
  //var varName = Blockly.JavaScript.valueToCode(block, 'VARIABLE', Blockly.JavaScript.ORDER_NONE)
  var varName = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VARIABLE'), Blockly.Variables.NAME_TYPE);
  var value = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
  
  // Attempt to convert value to a number
  var num = value.substring(1, value.length-1)
  
  if (isNaN(num))
  {
    num = value;
  }
  
  return varName + ' += ' + num + ';\n';
};

Blockly.JavaScript['data_showvariable'] = function(block)
{
  var varName = Blockly.JavaScript.valueToCode(block, 'VARIABLE', Blockly.JavaScript.ORDER_NONE)
  return '// TODO: Show variable: ' + varName + '\n';
};

Blockly.JavaScript['data_hidevariable'] = function(block)
{
  var varName = Blockly.JavaScript.valueToCode(block, 'VARIABLE', Blockly.JavaScript.ORDER_NONE)
  return '// TODO: Hide variable: ' + varName + '\n';
};
