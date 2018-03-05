// Do not edit this file; automatically generated by build.py.
'use strict';

goog.provide("Blockly.Generator");
goog.provide("Blockly.JavaScript");goog.require("Blockly.Generator");Blockly.JavaScript=new Blockly.Generator("JavaScript");
Blockly.JavaScript.addReservedWords("Blockly,"+"break,case,catch,continue,debugger,default,delete,do,else,finally,for,function,if,in,instanceof,new,return,switch,this,throw,try,typeof,var,void,while,with,"+"class,enum,export,extends,import,super,implements,interface,let,package,private,protected,public,static,yield,"+"const,null,true,false,"+"Array,ArrayBuffer,Boolean,Date,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,Error,eval,EvalError,Float32Array,Float64Array,Function,Infinity,Int16Array,Int32Array,Int8Array,isFinite,isNaN,Iterator,JSON,Math,NaN,Number,Object,parseFloat,parseInt,RangeError,ReferenceError,RegExp,StopIteration,String,SyntaxError,TypeError,Uint16Array,Uint32Array,Uint8Array,Uint8ClampedArray,undefined,uneval,URIError,"+"applicationCache,closed,Components,content,_content,controllers,crypto,defaultStatus,dialogArguments,directories,document,frameElement,frames,fullScreen,globalStorage,history,innerHeight,innerWidth,length,location,locationbar,localStorage,menubar,messageManager,mozAnimationStartTime,mozInnerScreenX,mozInnerScreenY,mozPaintCount,name,navigator,opener,outerHeight,outerWidth,pageXOffset,pageYOffset,parent,performance,personalbar,pkcs11,returnValue,screen,screenX,screenY,scrollbars,scrollMaxX,scrollMaxY,scrollX,scrollY,self,sessionStorage,sidebar,status,statusbar,toolbar,top,URL,window,"+
"addEventListener,alert,atob,back,blur,btoa,captureEvents,clearImmediate,clearInterval,clearTimeout,close,confirm,disableExternalCapture,dispatchEvent,dump,enableExternalCapture,escape,find,focus,forward,GeckoActiveXObject,getAttention,getAttentionWithCycleCount,getComputedStyle,getSelection,home,matchMedia,maximize,minimize,moveBy,moveTo,mozRequestAnimationFrame,open,openDialog,postMessage,print,prompt,QueryInterface,releaseEvents,removeEventListener,resizeBy,resizeTo,restore,routeEvent,scroll,scrollBy,scrollByLines,scrollByPages,scrollTo,setCursor,setImmediate,setInterval,setResizable,setTimeout,showModalDialog,sizeToContent,stop,unescape,updateCommands,XPCNativeWrapper,XPCSafeJSObjectWrapper,"+
"onabort,onbeforeunload,onblur,onchange,onclick,onclose,oncontextmenu,ondevicemotion,ondeviceorientation,ondragdrop,onerror,onfocus,onhashchange,onkeydown,onkeypress,onkeyup,onload,onmousedown,onmousemove,onmouseout,onmouseover,onmouseup,onmozbeforepaint,onpaint,onpopstate,onreset,onresize,onscroll,onselect,onsubmit,onunload,onpageshow,onpagehide,"+"Image,Option,Worker,"+"Event,Range,File,FileReader,Blob,BlobBuilder,"+"Attr,CDATASection,CharacterData,Comment,console,DocumentFragment,DocumentType,DomConfiguration,DOMError,DOMErrorHandler,DOMException,DOMImplementation,DOMImplementationList,DOMImplementationRegistry,DOMImplementationSource,DOMLocator,DOMObject,DOMString,DOMStringList,DOMTimeStamp,DOMUserData,Entity,EntityReference,MediaQueryList,MediaQueryListListener,NameList,NamedNodeMap,Node,NodeFilter,NodeIterator,NodeList,Notation,Plugin,PluginArray,ProcessingInstruction,SharedWorker,Text,TimeRanges,Treewalker,TypeInfo,UserDataHandler,Worker,WorkerGlobalScope,"+
"HTMLDocument,HTMLElement,HTMLAnchorElement,HTMLAppletElement,HTMLAudioElement,HTMLAreaElement,HTMLBaseElement,HTMLBaseFontElement,HTMLBodyElement,HTMLBRElement,HTMLButtonElement,HTMLCanvasElement,HTMLDirectoryElement,HTMLDivElement,HTMLDListElement,HTMLEmbedElement,HTMLFieldSetElement,HTMLFontElement,HTMLFormElement,HTMLFrameElement,HTMLFrameSetElement,HTMLHeadElement,HTMLHeadingElement,HTMLHtmlElement,HTMLHRElement,HTMLIFrameElement,HTMLImageElement,HTMLInputElement,HTMLKeygenElement,HTMLLabelElement,HTMLLIElement,HTMLLinkElement,HTMLMapElement,HTMLMenuElement,HTMLMetaElement,HTMLModElement,HTMLObjectElement,HTMLOListElement,HTMLOptGroupElement,HTMLOptionElement,HTMLOutputElement,HTMLParagraphElement,HTMLParamElement,HTMLPreElement,HTMLQuoteElement,HTMLScriptElement,HTMLSelectElement,HTMLSourceElement,HTMLSpanElement,HTMLStyleElement,HTMLTableElement,HTMLTableCaptionElement,HTMLTableCellElement,HTMLTableDataCellElement,HTMLTableHeaderCellElement,HTMLTableColElement,HTMLTableRowElement,HTMLTableSectionElement,HTMLTextAreaElement,HTMLTimeElement,HTMLTitleElement,HTMLTrackElement,HTMLUListElement,HTMLUnknownElement,HTMLVideoElement,"+
"HTMLCanvasElement,CanvasRenderingContext2D,CanvasGradient,CanvasPattern,TextMetrics,ImageData,CanvasPixelArray,HTMLAudioElement,HTMLVideoElement,NotifyAudioAvailableEvent,HTMLCollection,HTMLAllCollection,HTMLFormControlsCollection,HTMLOptionsCollection,HTMLPropertiesCollection,DOMTokenList,DOMSettableTokenList,DOMStringMap,RadioNodeList,"+"SVGDocument,SVGElement,SVGAElement,SVGAltGlyphElement,SVGAltGlyphDefElement,SVGAltGlyphItemElement,SVGAnimationElement,SVGAnimateElement,SVGAnimateColorElement,SVGAnimateMotionElement,SVGAnimateTransformElement,SVGSetElement,SVGCircleElement,SVGClipPathElement,SVGColorProfileElement,SVGCursorElement,SVGDefsElement,SVGDescElement,SVGEllipseElement,SVGFilterElement,SVGFilterPrimitiveStandardAttributes,SVGFEBlendElement,SVGFEColorMatrixElement,SVGFEComponentTransferElement,SVGFECompositeElement,SVGFEConvolveMatrixElement,SVGFEDiffuseLightingElement,SVGFEDisplacementMapElement,SVGFEDistantLightElement,SVGFEFloodElement,SVGFEGaussianBlurElement,SVGFEImageElement,SVGFEMergeElement,SVGFEMergeNodeElement,SVGFEMorphologyElement,SVGFEOffsetElement,SVGFEPointLightElement,SVGFESpecularLightingElement,SVGFESpotLightElement,SVGFETileElement,SVGFETurbulenceElement,SVGComponentTransferFunctionElement,SVGFEFuncRElement,SVGFEFuncGElement,SVGFEFuncBElement,SVGFEFuncAElement,SVGFontElement,SVGFontFaceElement,SVGFontFaceFormatElement,SVGFontFaceNameElement,SVGFontFaceSrcElement,SVGFontFaceUriElement,SVGForeignObjectElement,SVGGElement,SVGGlyphElement,SVGGlyphRefElement,SVGGradientElement,SVGLinearGradientElement,SVGRadialGradientElement,SVGHKernElement,SVGImageElement,SVGLineElement,SVGMarkerElement,SVGMaskElement,SVGMetadataElement,SVGMissingGlyphElement,SVGMPathElement,SVGPathElement,SVGPatternElement,SVGPolylineElement,SVGPolygonElement,SVGRectElement,SVGScriptElement,SVGStopElement,SVGStyleElement,SVGSVGElement,SVGSwitchElement,SVGSymbolElement,SVGTextElement,SVGTextPathElement,SVGTitleElement,SVGTRefElement,SVGTSpanElement,SVGUseElement,SVGViewElement,SVGVKernElement,"+
"SVGAngle,SVGColor,SVGICCColor,SVGElementInstance,SVGElementInstanceList,SVGLength,SVGLengthList,SVGMatrix,SVGNumber,SVGNumberList,SVGPaint,SVGPoint,SVGPointList,SVGPreserveAspectRatio,SVGRect,SVGStringList,SVGTransform,SVGTransformList,"+"SVGAnimatedAngle,SVGAnimatedBoolean,SVGAnimatedEnumeration,SVGAnimatedInteger,SVGAnimatedLength,SVGAnimatedLengthList,SVGAnimatedNumber,SVGAnimatedNumberList,SVGAnimatedPreserveAspectRatio,SVGAnimatedRect,SVGAnimatedString,SVGAnimatedTransformList,"+"SVGPathSegList,SVGPathSeg,SVGPathSegArcAbs,SVGPathSegArcRel,SVGPathSegClosePath,SVGPathSegCurvetoCubicAbs,SVGPathSegCurvetoCubicRel,SVGPathSegCurvetoCubicSmoothAbs,SVGPathSegCurvetoCubicSmoothRel,SVGPathSegCurvetoQuadraticAbs,SVGPathSegCurvetoQuadraticRel,SVGPathSegCurvetoQuadraticSmoothAbs,SVGPathSegCurvetoQuadraticSmoothRel,SVGPathSegLinetoAbs,SVGPathSegLinetoHorizontalAbs,SVGPathSegLinetoHorizontalRel,SVGPathSegLinetoRel,SVGPathSegLinetoVerticalAbs,SVGPathSegLinetoVerticalRel,SVGPathSegMovetoAbs,SVGPathSegMovetoRel,ElementTimeControl,TimeEvent,SVGAnimatedPathData,"+
"SVGAnimatedPoints,SVGColorProfileRule,SVGCSSRule,SVGExternalResourcesRequired,SVGFitToViewBox,SVGLangSpace,SVGLocatable,SVGRenderingIntent,SVGStylable,SVGTests,SVGTextContentElement,SVGTextPositioningElement,SVGTransformable,SVGUnitTypes,SVGURIReference,SVGViewSpec,SVGZoomAndPan");Blockly.JavaScript.ORDER_ATOMIC=0;Blockly.JavaScript.ORDER_NEW=1.1;Blockly.JavaScript.ORDER_MEMBER=1.2;Blockly.JavaScript.ORDER_FUNCTION_CALL=2;Blockly.JavaScript.ORDER_INCREMENT=3;Blockly.JavaScript.ORDER_DECREMENT=3;
Blockly.JavaScript.ORDER_BITWISE_NOT=4.1;Blockly.JavaScript.ORDER_UNARY_PLUS=4.2;Blockly.JavaScript.ORDER_UNARY_NEGATION=4.3;Blockly.JavaScript.ORDER_LOGICAL_NOT=4.4;Blockly.JavaScript.ORDER_TYPEOF=4.5;Blockly.JavaScript.ORDER_VOID=4.6;Blockly.JavaScript.ORDER_DELETE=4.7;Blockly.JavaScript.ORDER_DIVISION=5.1;Blockly.JavaScript.ORDER_MULTIPLICATION=5.2;Blockly.JavaScript.ORDER_MODULUS=5.3;Blockly.JavaScript.ORDER_SUBTRACTION=6.1;Blockly.JavaScript.ORDER_ADDITION=6.2;
Blockly.JavaScript.ORDER_BITWISE_SHIFT=7;Blockly.JavaScript.ORDER_RELATIONAL=8;Blockly.JavaScript.ORDER_IN=8;Blockly.JavaScript.ORDER_INSTANCEOF=8;Blockly.JavaScript.ORDER_EQUALITY=9;Blockly.JavaScript.ORDER_BITWISE_AND=10;Blockly.JavaScript.ORDER_BITWISE_XOR=11;Blockly.JavaScript.ORDER_BITWISE_OR=12;Blockly.JavaScript.ORDER_LOGICAL_AND=13;Blockly.JavaScript.ORDER_LOGICAL_OR=14;Blockly.JavaScript.ORDER_CONDITIONAL=15;Blockly.JavaScript.ORDER_ASSIGNMENT=16;Blockly.JavaScript.ORDER_COMMA=17;
Blockly.JavaScript.ORDER_NONE=99;
Blockly.JavaScript.ORDER_OVERRIDES=[[Blockly.JavaScript.ORDER_FUNCTION_CALL,Blockly.JavaScript.ORDER_MEMBER],[Blockly.JavaScript.ORDER_FUNCTION_CALL,Blockly.JavaScript.ORDER_FUNCTION_CALL],[Blockly.JavaScript.ORDER_MEMBER,Blockly.JavaScript.ORDER_MEMBER],[Blockly.JavaScript.ORDER_MEMBER,Blockly.JavaScript.ORDER_FUNCTION_CALL],[Blockly.JavaScript.ORDER_LOGICAL_NOT,Blockly.JavaScript.ORDER_LOGICAL_NOT],[Blockly.JavaScript.ORDER_MULTIPLICATION,Blockly.JavaScript.ORDER_MULTIPLICATION],[Blockly.JavaScript.ORDER_ADDITION,
Blockly.JavaScript.ORDER_ADDITION],[Blockly.JavaScript.ORDER_LOGICAL_AND,Blockly.JavaScript.ORDER_LOGICAL_AND],[Blockly.JavaScript.ORDER_LOGICAL_OR,Blockly.JavaScript.ORDER_LOGICAL_OR]];
Blockly.JavaScript.init=function(workspace){Blockly.JavaScript.definitions_=Object.create(null);Blockly.JavaScript.functionNames_=Object.create(null);if(!Blockly.JavaScript.variableDB_)Blockly.JavaScript.variableDB_=new Blockly.Names(Blockly.JavaScript.RESERVED_WORDS_);else Blockly.JavaScript.variableDB_.reset();Blockly.JavaScript.variableDB_.setVariableMap(workspace.getVariableMap());var defvars=[];var variables=workspace.getAllVariables();for(var i=0;i<variables.length;i++)defvars[i]=Blockly.JavaScript.variableDB_.getName(variables[i].getId(),
Blockly.Variables.NAME_TYPE);var devVarList=Blockly.Variables.allDeveloperVariables(workspace);for(var i=0;i<devVarList.length;i++)defvars.push(Blockly.JavaScript.variableDB_.getName(devVarList[i],Blockly.Names.DEVELOPER_VARIABLE_TYPE));if(defvars.length)Blockly.JavaScript.definitions_["variables"]="var "+defvars.join(", ")+";"};
Blockly.JavaScript.finish=function(code){var definitions=[];for(var name in Blockly.JavaScript.definitions_)definitions.push(Blockly.JavaScript.definitions_[name]);delete Blockly.JavaScript.definitions_;delete Blockly.JavaScript.functionNames_;Blockly.JavaScript.variableDB_.reset();return definitions.join("\n\n")+"\n\n\n"+code};Blockly.JavaScript.scrubNakedValue=function(line){return line+";\n"};
Blockly.JavaScript.quote_=function(string){string=string.replace(/\\/g,"\\\\").replace(/\n/g,"\\\n").replace(/'/g,"\\'");return"'"+string+"'"};
Blockly.JavaScript.scrub_=function(block,code){var commentCode="";if(!block.outputConnection||!block.outputConnection.targetConnection){var comment=block.getCommentText();comment=Blockly.utils.wrap(comment,Blockly.JavaScript.COMMENT_WRAP-3);if(comment)if(block.getProcedureDef)commentCode+="/**\n"+Blockly.JavaScript.prefixLines(comment+"\n"," * ")+" */\n";else commentCode+=Blockly.JavaScript.prefixLines(comment+"\n","// ");for(var i=0;i<block.inputList.length;i++)if(block.inputList[i].type==Blockly.INPUT_VALUE){var childBlock=
block.inputList[i].connection.targetBlock();if(childBlock){var comment=Blockly.JavaScript.allNestedComments(childBlock);if(comment)commentCode+=Blockly.JavaScript.prefixLines(comment,"// ")}}}var nextBlock=block.nextConnection&&block.nextConnection.targetBlock();var nextCode=Blockly.JavaScript.blockToCode(nextBlock);return commentCode+code+nextCode};
Blockly.JavaScript.getAdjusted=function(block,atId,opt_delta,opt_negate,opt_order){var delta=opt_delta||0;var order=opt_order||Blockly.JavaScript.ORDER_NONE;if(block.workspace.options.oneBasedIndex)delta--;var defaultAtIndex=block.workspace.options.oneBasedIndex?"1":"0";if(delta>0)var at=Blockly.JavaScript.valueToCode(block,atId,Blockly.JavaScript.ORDER_ADDITION)||defaultAtIndex;else if(delta<0)var at=Blockly.JavaScript.valueToCode(block,atId,Blockly.JavaScript.ORDER_SUBTRACTION)||defaultAtIndex;
else if(opt_negate)var at=Blockly.JavaScript.valueToCode(block,atId,Blockly.JavaScript.ORDER_UNARY_NEGATION)||defaultAtIndex;else var at=Blockly.JavaScript.valueToCode(block,atId,order)||defaultAtIndex;if(Blockly.isNumber(at)){at=parseFloat(at)+delta;if(opt_negate)at=-at}else{if(delta>0){at=at+" + "+delta;var innerOrder=Blockly.JavaScript.ORDER_ADDITION}else if(delta<0){at=at+" - "+-delta;var innerOrder=Blockly.JavaScript.ORDER_SUBTRACTION}if(opt_negate){if(delta)at="-("+at+")";else at="-"+at;var innerOrder=
Blockly.JavaScript.ORDER_UNARY_NEGATION}innerOrder=Math.floor(innerOrder);order=Math.floor(order);if(innerOrder&&order>=innerOrder)at="("+at+")"}return at};goog.provide("Blockly.JavaScript.colour");goog.require("Blockly.JavaScript");goog.provide("Blockly.JavaScript.control");goog.require("Blockly.JavaScript");Blockly.JavaScript["control_forever"]=function(block){var branch=Blockly.JavaScript.statementToCode(block,"SUBSTACK");branch=Blockly.JavaScript.addLoopTrap(branch,block.id);var code="";var loopVar=Blockly.JavaScript.variableDB_.getDistinctName("count",Blockly.Variables.NAME_TYPE);code+="while (true) {\n"+branch+"}\n";return code};
Blockly.JavaScript["control_repeat"]=function(block){var repeats=Blockly.JavaScript.valueToCode(block,"TIMES",Blockly.JavaScript.ORDER_ASSIGNMENT)||"0";var branch=Blockly.JavaScript.statementToCode(block,"SUBSTACK");branch=Blockly.JavaScript.addLoopTrap(branch,block.id);var code="";var loopVar=Blockly.JavaScript.variableDB_.getDistinctName("count",Blockly.Variables.NAME_TYPE);code+="for (var "+loopVar+" = 0; "+loopVar+" < "+repeats+"; "+loopVar+"++) {\n"+branch+"}\n";return code};
Blockly.JavaScript["control_repeat_until"]=function(block){var argument=Blockly.JavaScript.valueToCode(block,"CONDITION",Blockly.JavaScript.ORDER_NONE)||"false";var branch=Blockly.JavaScript.statementToCode(block,"SUBSTACK");branch=Blockly.JavaScript.addLoopTrap(branch,block.id);var code=code="while ( ("+argument+") == false) {\n"+branch+"}\n";return code};
Blockly.JavaScript["control_if"]=function(block){var argument=Blockly.JavaScript.valueToCode(block,"CONDITION",Blockly.JavaScript.ORDER_NONE)||"false";var branch=Blockly.JavaScript.statementToCode(block,"SUBSTACK");var code="if ("+argument+") {\n"+branch+"}";return code+"\n"};
Blockly.JavaScript["control_if_else"]=function(block){var argument=Blockly.JavaScript.valueToCode(block,"CONDITION",Blockly.JavaScript.ORDER_NONE)||"false";var branchIf=Blockly.JavaScript.statementToCode(block,"SUBSTACK");var branchElse=Blockly.JavaScript.statementToCode(block,"SUBSTACK2");var code="if ("+argument+") {\n"+branchIf+"} else {\n"+branchElse+"}";return code+"\n"};
goog.provide("Blockly.JavaScript.event");goog.require("Blockly.JavaScript");Blockly.JavaScript["event_whenflagclicked"]=function(block){var code="flagClicked();\n";return code};Blockly.JavaScript["event_whenflagclicked_animate"]=function(block){var branch=Blockly.JavaScript.statementToCode(block,"SUBSTACK");var code="flagClicked();\n{\n"+branch+"}\n";return code};goog.provide("Blockly.JavaScript.lists");goog.require("Blockly.JavaScript");goog.provide("Blockly.JavaScript.looks");goog.require("Blockly.JavaScript");Blockly.JavaScript["looks_say"]=function(block){var message=Blockly.JavaScript.valueToCode(block,"MESSAGE",Blockly.JavaScript.ORDER_ASSIGNMENT)||"0";var code="";var loopVar=Blockly.JavaScript.variableDB_.getDistinctName("message",Blockly.Variables.NAME_TYPE);code+="alert("+message+");\n";return code};goog.provide("Blockly.JavaScript.math");goog.require("Blockly.JavaScript");Blockly.JavaScript["math_number"]=function(block){var code=parseFloat(block.getFieldValue("NUM"));return[code,Blockly.JavaScript.ORDER_ATOMIC]};Blockly.JavaScript["math_integer"]=Blockly.JavaScript["math_number"];Blockly.JavaScript["math_whole_number"]=Blockly.JavaScript["math_number"];Blockly.JavaScript["math_positive_number"]=Blockly.JavaScript["math_number"];Blockly.JavaScript["math_angle"]=Blockly.JavaScript["math_number"];goog.provide("Blockly.JavaScript.motion");goog.require("Blockly.JavaScript");goog.provide("Blockly.JavaScript.operators");goog.require("Blockly.JavaScript");Blockly.JavaScript["operator_add"]=function(block){var num1=Blockly.JavaScript.valueToCode(block,"NUM1",Blockly.JavaScript.ORDER_ADDITION)||"0";var num2=Blockly.JavaScript.valueToCode(block,"NUM2",Blockly.JavaScript.ORDER_ADDITION)||"0";var code=""+num1+" + "+num2;return[code,Blockly.JavaScript.ORDER_ADDITION]};
Blockly.JavaScript["operator_subtract"]=function(block){var num1=Blockly.JavaScript.valueToCode(block,"NUM1",Blockly.JavaScript.ORDER_SUBTRACTION)||"0";var num2=Blockly.JavaScript.valueToCode(block,"NUM2",Blockly.JavaScript.ORDER_SUBTRACTION)||"0";var code=""+num1+" - "+num2;return[code,Blockly.JavaScript.ORDER_SUBTRACTION]};
Blockly.JavaScript["operator_multiply"]=function(block){var num1=Blockly.JavaScript.valueToCode(block,"NUM1",Blockly.JavaScript.ORDER_MULTIPLICATION)||"0";var num2=Blockly.JavaScript.valueToCode(block,"NUM2",Blockly.JavaScript.ORDER_MULTIPLICATION)||"0";var code=""+num1+" * "+num2;return[code,Blockly.JavaScript.ORDER_MULTIPLICATION]};
Blockly.JavaScript["operator_divide"]=function(block){var num1=Blockly.JavaScript.valueToCode(block,"NUM1",Blockly.JavaScript.ORDER_DIVISION)||"0";var num2=Blockly.JavaScript.valueToCode(block,"NUM2",Blockly.JavaScript.ORDER_DIVISION)||"0";var code=""+num1+" / "+num2;return[code,Blockly.JavaScript.ORDER_DIVISION]};
Blockly.JavaScript["operator_divide"]=function(block){var num1=Blockly.JavaScript.valueToCode(block,"NUM1",Blockly.JavaScript.ORDER_DIVISION)||"0";var num2=Blockly.JavaScript.valueToCode(block,"NUM2",Blockly.JavaScript.ORDER_DIVISION)||"0";var code=""+num1+" / "+num2;return[code,Blockly.JavaScript.ORDER_DIVISION]};
Blockly.JavaScript["operator_lt"]=function(block){var op1=Blockly.JavaScript.valueToCode(block,"OPERAND1",Blockly.JavaScript.ORDER_RELATIONAL)||"0";var op2=Blockly.JavaScript.valueToCode(block,"OPERAND2",Blockly.JavaScript.ORDER_RELATIONAL)||"0";var n1=Number(op1.substring(1,op1.length-1));var n2=Number(op2.substring(1,op2.length-1));if(isNaN(n1)||isNaN(n2)){n1=op1;n2=op2}var code=""+n1+" < "+n2;return[code,Blockly.JavaScript.ORDER_RELATIONAL]};
Blockly.JavaScript["operator_equals"]=function(block){var op1=Blockly.JavaScript.valueToCode(block,"OPERAND1",Blockly.JavaScript.ORDER_EQUALITY)||"0";var op2=Blockly.JavaScript.valueToCode(block,"OPERAND2",Blockly.JavaScript.ORDER_EQUALITY)||"0";var n1=Number(op1.substring(1,op1.length-1));var n2=Number(op2.substring(1,op2.length-1));if(isNaN(n1)||isNaN(n2)){n1=op1;n2=op2}var code=""+n1+" == "+n2;return[code,Blockly.JavaScript.ORDER_EQUALITY]};
Blockly.JavaScript["operator_gt"]=function(block){var op1=Blockly.JavaScript.valueToCode(block,"OPERAND1",Blockly.JavaScript.ORDER_RELATIONAL)||"0";var op2=Blockly.JavaScript.valueToCode(block,"OPERAND2",Blockly.JavaScript.ORDER_RELATIONAL)||"0";var n1=Number(op1.substring(1,op1.length-1));var n2=Number(op2.substring(1,op2.length-1));if(isNaN(n1)||isNaN(n2)){n1=op1;n2=op2}var code=""+n1+" > "+n2;return[code,Blockly.JavaScript.ORDER_RELATIONAL]};
Blockly.JavaScript["operator_and"]=function(block){var bool1=Blockly.JavaScript.valueToCode(block,"OPERAND1",Blockly.JavaScript.ORDER_LOGICAL_AND)||"false";var bool2=Blockly.JavaScript.valueToCode(block,"OPERAND2",Blockly.JavaScript.ORDER_LOGICAL_AND)||"false";var code=""+bool1+" && "+bool2;return[code,Blockly.JavaScript.ORDER_LOGICAL_AND]};
Blockly.JavaScript["operator_or"]=function(block){var bool1=Blockly.JavaScript.valueToCode(block,"OPERAND1",Blockly.JavaScript.ORDER_LOGICAL_OR)||"false";var bool2=Blockly.JavaScript.valueToCode(block,"OPERAND2",Blockly.JavaScript.ORDER_LOGICAL_OR)||"false";var code=""+bool1+" || "+bool2;return[code,Blockly.JavaScript.ORDER_LOGICAL_OR]};goog.provide("Blockly.JavaScript.procedures");goog.require("Blockly.JavaScript");
Blockly.JavaScript["procedures_defreturn"]=function(block){var funcName=Blockly.JavaScript.variableDB_.getName(block.getFieldValue("NAME"),Blockly.Procedures.NAME_TYPE);var branch=Blockly.JavaScript.statementToCode(block,"STACK");if(Blockly.JavaScript.STATEMENT_PREFIX)branch=Blockly.JavaScript.prefixLines(Blockly.JavaScript.STATEMENT_PREFIX.replace(/%1/g,"'"+block.id+"'"),Blockly.JavaScript.INDENT)+branch;if(Blockly.JavaScript.INFINITE_LOOP_TRAP)branch=Blockly.JavaScript.INFINITE_LOOP_TRAP.replace(/%1/g,
"'"+block.id+"'")+branch;var returnValue=Blockly.JavaScript.valueToCode(block,"RETURN",Blockly.JavaScript.ORDER_NONE)||"";if(returnValue)returnValue="  return "+returnValue+";\n";var args=[];for(var x=0;x<block.arguments_.length;x++)args[x]=Blockly.JavaScript.variableDB_.getName(block.arguments_[x],Blockly.Variables.NAME_TYPE);var code="function "+funcName+"("+args.join(", ")+") {\n"+branch+returnValue+"}";code=Blockly.JavaScript.scrub_(block,code);Blockly.JavaScript.definitions_[funcName]=code;return null};
Blockly.JavaScript["procedures_defnoreturn"]=Blockly.JavaScript["procedures_defreturn"];Blockly.JavaScript["procedures_callreturn"]=function(block){var funcName=Blockly.JavaScript.variableDB_.getName(block.getFieldValue("NAME"),Blockly.Procedures.NAME_TYPE);var args=[];for(var x=0;x<block.arguments_.length;x++)args[x]=Blockly.JavaScript.valueToCode(block,"ARG"+x,Blockly.JavaScript.ORDER_COMMA)||"null";var code=funcName+"("+args.join(", ")+")";return[code,Blockly.JavaScript.ORDER_FUNCTION_CALL]};
Blockly.JavaScript["procedures_callnoreturn"]=function(block){var funcName=Blockly.JavaScript.variableDB_.getName(block.getFieldValue("NAME"),Blockly.Procedures.NAME_TYPE);var args=[];for(var x=0;x<block.arguments_.length;x++)args[x]=Blockly.JavaScript.valueToCode(block,"ARG"+x,Blockly.JavaScript.ORDER_COMMA)||"null";var code=funcName+"("+args.join(", ")+");\n";return code};
Blockly.JavaScript["procedures_ifreturn"]=function(block){var condition=Blockly.JavaScript.valueToCode(block,"CONDITION",Blockly.JavaScript.ORDER_NONE)||"false";var code="if ("+condition+") {\n";if(block.hasReturnValue_){var value=Blockly.JavaScript.valueToCode(block,"VALUE",Blockly.JavaScript.ORDER_NONE)||"null";code+="  return "+value+";\n"}else code+="  return;\n";code+="}\n";return code};goog.provide("Blockly.JavaScript.texts");goog.require("Blockly.JavaScript");Blockly.JavaScript["text"]=function(block){var code=Blockly.JavaScript.quote_(block.getFieldValue("TEXT"));return[code,Blockly.JavaScript.ORDER_ATOMIC]};goog.provide("Blockly.JavaScript.variables");goog.require("Blockly.JavaScript");Blockly.JavaScript["data_variablemenu"]=function(block){var varName=Blockly.JavaScript.variableDB_.getName(block.getFieldValue("VARIABLE"),Blockly.Variables.NAME_TYPE);return[varName,Blockly.JavaScript.ORDER_ATOMIC]};Blockly.JavaScript["data_variable"]=function(block){var varName=Blockly.JavaScript.variableDB_.getName(block.getFieldValue("VARIABLE"),Blockly.Variables.NAME_TYPE);return[varName,Blockly.JavaScript.ORDER_ATOMIC]};
Blockly.JavaScript["data_setvariableto"]=function(block){var varName=Blockly.JavaScript.variableDB_.getName(block.getFieldValue("VARIABLE"),Blockly.Variables.NAME_TYPE);var value=Blockly.JavaScript.valueToCode(block,"VALUE",Blockly.JavaScript.ORDER_ASSIGNMENT)||"0";var num=value.substring(1,value.length-1);if(isNaN(num))num=value;return varName+" = "+num+";\n"};
Blockly.JavaScript["data_changevariableby"]=function(block){var varName=Blockly.JavaScript.variableDB_.getName(block.getFieldValue("VARIABLE"),Blockly.Variables.NAME_TYPE);var value=Blockly.JavaScript.valueToCode(block,"VALUE",Blockly.JavaScript.ORDER_ASSIGNMENT)||"0";var num=value.substring(1,value.length-1);if(isNaN(num))num=value;return varName+" += "+num+";\n"};
Blockly.JavaScript["data_showvariable"]=function(block){var varName=Blockly.JavaScript.valueToCode(block,"VARIABLE",Blockly.JavaScript.ORDER_NONE);return"// TODO: Show variable: "+varName+"\n"};Blockly.JavaScript["data_hidevariable"]=function(block){var varName=Blockly.JavaScript.valueToCode(block,"VARIABLE",Blockly.JavaScript.ORDER_NONE);return"// TODO: Hide variable: "+varName+"\n"};