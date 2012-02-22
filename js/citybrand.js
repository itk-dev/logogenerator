/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

//Create a new Citybrand object
var citybrand = new Object();

citybrand.progressSlogan = "Danish for progress";

/**
 * Initializes the citybrand object
 */
citybrand.init = function(canvasElement, fontSize, scaled, showProgress, lockProgress) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext("2d");
    this.bgColor = "rgb(0, 190, 223)";
    this.textColor = "rgb(128,28,125)";
    this.specialColor = "rgb(255,255,255)";
    this.width = canvasElement.width;
    this.height = canvasElement.height;
    this.lineHeight = 1;
    this.allDrag = false;
    this.text = "";
    //this.font = "900 %size%em HelveticaNeueW01-85Heav";
    this.font = "%size%em %style%";
    this.fontStyle = "HelveticaNeueW01-85Heav, Tahoma, sans-serif";
    this.specialStyle = "HelveticaNeueW01-75Bold, Tahoma, sans-serif";
    this.fontSize = fontSize;
    this.showProgress = showProgress;
    this.specialLetterSpacing = -0.0625;
    this.letterSpacing = -0.25;
    this.lockProgress = lockProgress;
    
    this.lines = new Array();

    var testElement = jQuery("<div id=\"emToPixels\" style=\"width: 1em; margin: 0; padding 0; background: red; visibility: hidden\"></div>");
    jQuery("body").append(testElement);

    canvasElement.onmouseout = myUp;
    
    canvasElement.onmousedown = myDown;

    canvasElement.onmouseup = myUp;

    canvasElement.onmousemove = myMove;

    canvasElement.ontouchstart = myDown;

    canvasElement.ontouchend = myUp;

    canvasElement.ontouchmove = myMove;
    
    var parameters = getUrlVars();
    
    if(parameters["load"]) {
        this.loaded = true;
        
        var index = 0;
        
        this.lines = new Array();

        while(true) {
            var line = parameters["l"+index];
            
            if(!line) {
                break;
            }
            
            var split = line.split(":", 100);
            
            this.lines[index] = new Line(split[2], parseFloat(split[0]), parseFloat(split[1]));
            
            if(index > 0) {
                citybrand.text += "\n";
            }
            citybrand.text += split[2];
            
            index++;
        }

        line = parameters["p"];
        split = line.split(":", 100);
        this.progress = new Line(split[2], parseFloat(split[0]), parseFloat(split[1]));
        this.progress.useSpecial = true;

        this.updateColors(parameters["b"], parameters["t"], parameters["s"]);
        
    } else {
        this.loaded = false;
        this.updateText("experience\nwith\nAarhus");
        
        if(!scaled) {
            this.lines[0].x = 152;
            this.lines[0].y = 143;

            this.lines[1].x = 312;
            this.lines[1].y = 195;

            this.lines[2].x = 282;
            this.lines[2].y = 245;

            this.progress.x = 399;
            this.progress.y = 310;
        }
    }
}

citybrand.getFont = function(size, style) {
    if(!style) {
        style = this.fontStyle;
    }
    var newFont = citybrand.font.replace("%size%", ""+size);
    newFont = newFont.replace("%style%", ""+style);
    
    return newFont;
}

/**
 * Updates the text of the brand to the given text
 */
citybrand.updateText = function(text) {
    var splitText = text.split("\n", 100);

    citybrand.text = text;

    citybrand.ctx.font = citybrand.getFont(citybrand.fontSize);
    citybrand.ctx.textBaseline = "middle";
    citybrand.ctx.textAlign = "left";
    
    var textHeight = Math.round(this.lineHeight * this.ctx.measureText("M").width);

    var diff = Math.max(0,this.lines.length - splitText.length);

    for(var i = 0; i<diff; i++) {
        this.lines.pop();
    }

    for(index in splitText) {
        var line = splitText[index];
        
        if(this.lines[index] == null) {
            this.lines[index] = new Line(line, 0, textHeight*index);
        } else {
            this.lines[index].updateText(line);
        }
    }

    if(this.progress == null) {
        this.progress = new Line(citybrand.progressSlogan, 0, textHeight*splitText.length);
        this.progress.useSpecial = true;
    }

    this.render();
}

/**
 * Updates the colors of the brand
 */
citybrand.updateColors = function(bg, text, special) {
    this.bgColor = bg;
    this.textColor = text;
    this.specialColor = special;

    this.render();
}

/**
 * Saves the image as PNG and redirects the browser
 */
citybrand.saveImage = function() {
    var width = this.width;
    var height = this.height;
    
    var imageData = this.ctx.getImageData(0,0,width,height);
    var pixels = imageData.data;
    
    var bgColor = jQuery.Color(this.bgColor);
    
    var xMin = width;
    var xMax = 0;
    var yMin = height;
    var yMax = 0;
    
    for(var x = 0; x<width; x++) {
        for(var y = 0; y<height; y++) {
            var index = (x + y * width) * 4;
            
            if(bgColor.red() != pixels[index] || bgColor.green() != pixels[index+1] || bgColor.blue() != pixels[index+2]) {
                xMin = Math.min(x, xMin);
                yMin = Math.min(y, yMin);
                xMax = Math.max(x, xMax);
                yMax = Math.max(y, yMax);
            }
        }
    }

    var croppedImageData = this.ctx.getImageData(xMin,yMin,xMax-xMin,yMax-yMin);
    
    citybrand.ctx.font = citybrand.getFont(citybrand.fontSize);
    citybrand.ctx.textBaseline = "middle";
    citybrand.ctx.textAlign = "left";
    
    var respectDistance = this.ctx.measureText("A").width;
    
    var newCanvas = document.createElement("canvas");
    newCanvas.width = (xMax - xMin) + 2 * respectDistance;
    newCanvas.height = (yMax - yMin) + 2 * respectDistance;
    
    var newContext = newCanvas.getContext("2d");
    newContext.fillStyle = this.bgColor;
    newContext.fillRect(0,0,newCanvas.width,newCanvas.height);
    newContext.putImageData(croppedImageData, respectDistance, respectDistance);

    var imageData = newCanvas.toDataURL("image/png");
    
    return imageData;
}

/**
 * Render the brand
 */
citybrand.render = function() {
    ctx = this.ctx;
    
    ctx.clearRect ( 0 , 0 , this.width, this.height);

    ctx.fillStyle = citybrand.bgColor;
    ctx.fillRect(0,0,this.width, this.height);

    for(index in this.lines) {
        var line = this.lines[index];
        line.render();
    }

    if(this.progress != null && this.showProgress) {
        
        if(this.lockProgress) {
            var lastLine = this.lines[this.lines.length-1];
            this.progress.y = lastLine.y+lastLine.getHeight()*0.88;
            this.progress.x = lastLine.x+lastLine.getWidth()-this.progress.getWidth() - getLetterSpacingInPixels(0.125);
        }
        
        this.progress.render();
    }
}

citybrand.createURL = function() {
    var url = "http://"+document.location.hostname+document.location.pathname+"?load=true";
    
    url += "&b="+escape(citybrand.bgColor);
    url += "&t="+escape(citybrand.textColor);
    url += "&s="+escape(citybrand.specialColor);
    
    for(index in this.lines) {
        var line = this.lines[index];
        url += "&l"+index+"="+escape(line.x+":"+line.y+":"+line.text);
    }
    
    line = citybrand.progress;
    url += "&p="+escape(line.x+":"+line.y+":"+line.text);

    url += "&size="+this.fontSize;
    url += "&width="+this.width;
    url += "&showProgress="+this.showProgress;
    url += "&lockProgress="+this.lockProgress;

    return url;
}

citybrand.getColors = function() {
    var colors = new Array();
    colors["bg"] = this.bgColor;
    colors["text"] = this.textColor;
    colors["special"] = this.specialColor;
    
    return colors;
}

/**
 * Create a new Line
 */
function Line(text, x, y) {
    this.text = text;
    this.x = x;
    this.y = y;
    
    this.dragging = false;
    
    this.render = function() {
        var ctx = citybrand.ctx;
        
        var fontSize = citybrand.fontSize;
        var fontStyle = citybrand.fontStyle;
        
        if(this.useSpecial) {
            fontSize = getSpecialFontSize(fontSize);
            fontStyle = citybrand.specialStyle;
        }
        
        ctx.font = citybrand.getFont(fontSize, fontStyle);
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";

        var textHeight = this.getHeight();
    
        var ma = this.text.match(/^(.*)(Aarh)(us)(.*)$/i);
    
        if(ma != null) {
            ctx.fillStyle = citybrand.textColor;
            preWidth = this.drawLetterSpacedLine(ctx, ma[1], this.x, this.y+textHeight/2);
        
            ctx.fillStyle = citybrand.specialColor;
            specialWidth = this.drawLetterSpacedLine(ctx, ma[2], this.x+preWidth, this.y+textHeight/2);

            ctx.fillStyle = citybrand.textColor;
            postWidth = this.drawLetterSpacedLine(ctx, ma[3], this.x+specialWidth+preWidth, this.y+textHeight/2);
            this.drawLetterSpacedLine(ctx, ma[4], this.x+specialWidth+preWidth+postWidth, this.y+textHeight/2);
        } else {
            if(this.useSpecial) {
                ctx.fillStyle = citybrand.specialColor;
            } else {
                ctx.fillStyle = citybrand.textColor;
            }
            
            //console.log("Drawing ["+this.text+"] at ("+this.x+", "+Math.round(this.y+textHeight/2)+")")
            
            this.drawLetterSpacedLine(ctx, this.text, this.x, Math.round(this.y+textHeight/2));
        }
    }

    this.drawLetterSpacedLine = function(ctx, text, x, y) {
        var chars = text.split("");

        var spacing = getLetterSpacingInPixels(citybrand.letterSpacing);
        if(this.useSpecial) {
            spacing = getLetterSpacingInPixels(citybrand.specialLetterSpacing);
        }
        var width = 0;

        for(index in chars) {
            ctx.fillText(chars[index], x+width, y);
            width += ctx.measureText(chars[index]).width + spacing;
        }
        
        return width;
    }

    this.updateText = function(text) {
        this.text = text;
    }

    this.getWidth = function() {
        var fontSize = citybrand.fontSize;
        var fontStyle = citybrand.fontStyle;
        
        if(this.useSpecial) {
            fontSize = getSpecialFontSize(fontSize);
            fontStyle = citybrand.specialStyle;
        }
        
        citybrand.ctx.font = citybrand.getFont(fontSize, fontStyle);
        citybrand.ctx.textBaseline = "middle";
        citybrand.ctx.textAlign = "left";

        var chars = this.text.split("");

        var spacing = getLetterSpacingInPixels(citybrand.letterSpacing);
        if(this.useSpecial) {
            spacing = getLetterSpacingInPixels(citybrand.specialLetterSpacing);
        }
        var width = 0;

        for(index in chars) {
            width += citybrand.ctx.measureText(chars[index]).width + spacing;
        }
        
        return width;
    }

    this.getHeight = function() {
        var fontSize = citybrand.fontSize;
        var fontStyle = citybrand.fontStyle;
        
        if(this.useSpecial) {
            fontSize = getSpecialFontSize(fontSize);
            fontStyle = citybrand.specialStyle;
        }
        
        citybrand.ctx.font = citybrand.getFont(fontSize, fontStyle);
        citybrand.ctx.textBaseline = "middle";
        citybrand.ctx.textAlign = "left";

        return citybrand.ctx.measureText("M").width * citybrand.lineHeight;
    }

    this.useSpecial = false;
}

/**
 * Handle mouseup and touchend events
 */
function myUp(e) {
    for(index in citybrand.lines) {
        var line = citybrand.lines[index];
        line.dragging = false;
    }
    
    citybrand.progress.dragging = false;
    
    citybrand.allDrag = false;
    
    citybrand.render();
}

/**
 * Handle mousedown and touchstart events
 */
function myDown(e) {
    
    e.preventDefault();

    var x = 0;
    var y = 0;
    
    var canvasOffset = jQuery("#canvasArea").offset();

    if(e.offsetX) {
        x = e.offsetX;
        y = e.offsetY;
    } else if(e.pageX) {
        x = e.pageX - canvasOffset.left;
        y = e.pageY - canvasOffset.top;
    } else if(e.touches) {
        var touch = e.touches[0];
        
        x = touch.pageX - canvasOffset.left;
        y = touch.pageY - canvasOffset.top;
    } else {
        console.log("No avaliable position variables found.");
        console.log(e);
    }
    
    citybrand.lastX = x;
    citybrand.lastY = y;
   
    var foundItem = false;
   
    for(index in citybrand.lines) {
        var line = citybrand.lines[index];
        
        var fontSize = citybrand.fontSize;
        var fontStyle = citybrand.fontStyle;
        
        if(line.useSpecial) {
            fontSize = getSpecialFontSize(fontSize);
            fontStyle = citybrand.specialStyle;
        }
        
        citybrand.ctx.font = citybrand.getFont(fontSize, fontStyle);

        var width = line.getWidth();
        var height = line.getHeight();
        
        if(x > line.x && x < line.x+width) {
            if(y > line.y && y < line.y+height) {
                line.dragging = true;
                foundItem = true;
                break;
            }
        }
    }
    
    if(!foundItem) {
        line = citybrand.progress;

        fontSize = citybrand.fontSize;
        fontStyle = citybrand.fontStyle;

        if(line.useSpecial) {
            fontSize = getSpecialFontSize(fontSize);
            fontStyle = citybrand.specialStyle;
        }
        
        citybrand.ctx.font = citybrand.getFont(fontSize, fontStyle);

        width = citybrand.ctx.measureText(line.text).width;
        height = citybrand.lineHeight * citybrand.ctx.measureText("M").width;

        if(x > line.x && x < line.x+width) {
            if(y > line.y && y < line.y+height) {
                line.dragging = true;
                foundItem = true;
            }
        }
    }
    
    if(!foundItem) {
        citybrand.allDrag = true;
    }
    
    citybrand.render();
}

/**
 * Handle mousemove and touchmove evenst
 */
function myMove(e) {
    
    e.preventDefault();

    var x = 0;
    var y = 0;
    
    var canvasOffset = jQuery("#canvasArea").offset();

    if(e.offsetX) {
        x = e.offsetX;
        y = e.offsetY;
    } else if(e.pageX) {
        x = e.pageX - canvasOffset.left;
        y = e.pageY - canvasOffset.top;
    } else if(e.touches) {
        var touch = e.touches[0];
        
        x = touch.pageX - canvasOffset.left;
        y = touch.pageY - canvasOffset.top;
    } else {
        console.log("No avaliable position variables found.");
        console.log(e);
    }

    var deltaX = x - citybrand.lastX;
    var deltaY = y - citybrand.lastY;
    
    for(index in citybrand.lines) {
        var line = citybrand.lines[index];
        if(line.dragging) {
            
            if(line.x + line.getWidth() + deltaX <= citybrand.width && line.x + deltaX >= 0) {
                line.x += deltaX;
            }
            if(line.y + line.getHeight() + deltaY <= citybrand.height && line.y + deltaY >= 0) {
                line.y += deltaY;
            }
        }
    }
    
    if(citybrand.progress.dragging) {
        var line = citybrand.progress;
        if(line.x + line.getWidth() + deltaX <= citybrand.width && line.x + deltaX >= 0) {
            line.x += deltaX;
        }
        if(line.y + deltaY >= 0 && line.y + line.getHeight() + deltaY <= citybrand.height) {
            line.y += deltaY;
        }
    }
    
    if(citybrand.allDrag) {
        var okX = true;
        var okY = true;
        for(index in citybrand.lines) {
            line = citybrand.lines[index];
            if(line.x + line.getWidth() + deltaX > citybrand.width || line.x + deltaX < 0) {
                okX = false;
            }
            if(line.y + line.getHeight() + deltaY > citybrand.height || line.y + deltaY < 0) {
                okY = false;
            }
        }

        line = citybrand.progress;
        if(line.x + line.getWidth() + deltaX > citybrand.width || line.x + deltaX < 0) {
            okX = false;
        }
        if(line.y + line.getHeight() + deltaY > citybrand.height || line.y + deltaY < 0) {
            okY = false;
        }
        
        for(index in citybrand.lines) {
            line = citybrand.lines[index];
            if(okX) {
                line.x += deltaX;
            }
            if(okY) {
                line.y += deltaY;
            }
        }

        line = citybrand.progress;
        if(okX) {
            line.x += deltaX;
        }
        if(okY) {
            line.y += deltaY;
        }
    }
    
    citybrand.lastX = x;
    citybrand.lastY = y;

    citybrand.render();
}

// Read a page's GET URL variables and return them as an associative array.
function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = unescape(hash[1]);
    }
    return vars;
}

function rgbToHex( c ) {
    var m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec( c );
    var hex = m ? '#' + ( m[1] << 16 | m[2] << 8 | m[3] ).toString(16) : c;
    
    return hex;
}

function getLetterSpacingInPixels(letterSpacingInEM) {
    var emToPixels = jQuery("#emToPixels").width();
    
    var pixels = letterSpacingInEM * emToPixels;
    
    return pixels;
}

function getSpecialFontSize(fontSize) {
    return fontSize *= 0.291;
}